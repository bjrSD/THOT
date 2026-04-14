import React, { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { searchContent, importFromUrl, mapToContent, findDuplicate } from '@/lib/contentImportService';
import { X, Search, Link, Loader2, Plus, Play, Headphones, FileText, BookOpen, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TYPES = [
  { id: 'video', label: 'Vidéo', icon: Play, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'podcast', label: 'Podcast', icon: Headphones, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'article', label: 'Article', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'book', label: 'Livre', icon: BookOpen, color: 'text-green-500', bg: 'bg-green-500/10' },
];

function ResultCard({ item, onAdd, adding }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl hover:border-accent/40 transition-all">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-lg object-cover shrink-0 bg-secondary" />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-2 leading-tight">{item.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.creator || item.sourceName}</p>
        {item.publishedAt && (
          <p className="text-xs text-muted-foreground">{new Date(item.publishedAt).getFullYear()}</p>
        )}
      </div>
      <Button size="sm" onClick={() => onAdd(item)} disabled={adding}
        className="shrink-0 h-8 px-2 text-xs">
        {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
      </Button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl animate-pulse">
      <div className="w-14 h-14 rounded-lg bg-secondary shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-secondary rounded w-3/4" />
        <div className="h-2.5 bg-secondary rounded w-1/2" />
      </div>
    </div>
  );
}

export default function ContentImportModal({ onClose }) {
  const [mode, setMode] = useState('search'); // 'search' | 'url'
  const [selectedType, setSelectedType] = useState('video');
  const [query, setQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());
  const [addingId, setAddingId] = useState(null);
  const [urlPreview, setUrlPreview] = useState(null);
  const debounceRef = useRef(null);
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Content.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contents'] }),
  });

  const handleSearch = useCallback(async (q, type) => {
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    setLoading(true);
    setError(null);
    try {
      const items = await searchContent(type, q);
      setResults(items);
    } catch (e) {
      setError('Erreur lors de la recherche. Vérifiez votre connexion.');
      setResults([]);
    }
    setLoading(false);
  }, []);

  const onQueryChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val, selectedType), 600);
  };

  const onTypeChange = (type) => {
    setSelectedType(type);
    setResults([]);
    if (query.trim().length >= 2) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => handleSearch(query, type), 300);
    }
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    setError(null);
    setUrlPreview(null);
    try {
      const item = await importFromUrl(urlInput.trim());
      setUrlPreview(item);
    } catch (e) {
      setError('Impossible de récupérer les métadonnées. Vérifiez le lien.');
    }
    setLoading(false);
  };

  const handleAdd = async (item, status = 'to_consume') => {
    const itemId = item.externalId || item.externalUrl;
    setAddingId(itemId);
    try {
      const dup = await findDuplicate(item.externalId, item.type);
      if (dup) {
        setAddedIds(s => new Set([...s, itemId]));
        setAddingId(null);
        return;
      }
      const contentData = mapToContent(item);
      contentData.status = status;
      await createMutation.mutateAsync(contentData);
      setAddedIds(s => new Set([...s, itemId]));
    } catch (e) {
      setError('Erreur lors de l\'ajout.');
    }
    setAddingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-background w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="font-heading font-bold text-base">Ajouter un contenu</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 p-3 pb-0 shrink-0">
          <button onClick={() => setMode('search')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl transition-colors ${mode === 'search' ? 'bg-accent text-white' : 'bg-secondary text-muted-foreground'}`}>
            <Search className="w-3.5 h-3.5" /> Rechercher
          </button>
          <button onClick={() => setMode('url')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl transition-colors ${mode === 'url' ? 'bg-accent text-white' : 'bg-secondary text-muted-foreground'}`}>
            <Link className="w-3.5 h-3.5" /> Coller un lien
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {mode === 'search' ? (
            <>
              {/* Type selector */}
              <div className="grid grid-cols-4 gap-1.5">
                {TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => onTypeChange(t.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-xs font-medium ${selectedType === t.id ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-card text-muted-foreground hover:border-accent/40'}`}>
                      <div className={`w-7 h-7 rounded-lg ${t.bg} flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 ${t.color}`} style={{ width: 14, height: 14 }} />
                      </div>
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={query} onChange={e => onQueryChange(e.target.value)}
                  placeholder={`Rechercher ${TYPES.find(t => t.id === selectedType)?.label.toLowerCase()}...`}
                  className="pl-9 text-sm" autoFocus />
              </div>

              {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}

              {/* Results */}
              {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((item, i) => {
                    const itemId = item.externalId || item.externalUrl;
                    const added = addedIds.has(itemId);
                    return added ? (
                      <div key={i} className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        <p className="text-xs text-green-600 font-medium line-clamp-1">{item.title} — Ajouté ✓</p>
                      </div>
                    ) : (
                      <ResultCard key={i} item={item} adding={addingId === itemId}
                        onAdd={(it) => handleAdd(it)} />
                    );
                  })}
                </div>
              ) : query.length >= 2 && !loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Aucun résultat pour "{query}"</p>
                  <p className="text-xs mt-1">Essayez avec d'autres mots-clés</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Tapez au moins 2 caractères pour rechercher</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* URL mode */}
              <div className="flex gap-2">
                <Input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... ou article..."
                  className="flex-1 text-sm" onKeyDown={e => e.key === 'Enter' && handleFetchUrl()} />
                <Button onClick={handleFetchUrl} disabled={loading || !urlInput.trim()} size="sm" className="shrink-0">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyser'}
                </Button>
              </div>

              {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}

              {urlPreview && (() => {
                const itemId = urlPreview.externalId || urlPreview.externalUrl;
                const added = addedIds.has(itemId);
                return (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    {urlPreview.imageUrl && (
                      <img src={urlPreview.imageUrl} alt={urlPreview.title} className="w-full h-36 object-cover" />
                    )}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium capitalize">{urlPreview.type}</span>
                        {urlPreview.sourceProvider && (
                          <span className="text-xs text-muted-foreground">{urlPreview.sourceProvider}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm leading-tight">{urlPreview.title}</h3>
                      {urlPreview.creator && <p className="text-xs text-muted-foreground">{urlPreview.creator}</p>}
                      {urlPreview.description && (
                        <p className="text-xs text-muted-foreground line-clamp-3">{urlPreview.description}</p>
                      )}
                      <a href={urlPreview.externalUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-accent hover:underline">
                        <ExternalLink className="w-3 h-3" /> Voir la source
                      </a>
                      {added ? (
                        <div className="flex items-center gap-2 p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <p className="text-xs text-green-600 font-medium">Ajouté à votre bibliothèque ✓</p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAdd(urlPreview, 'to_consume')}
                            disabled={addingId === itemId} className="flex-1 text-xs">
                            {addingId === itemId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '+ Bibliothèque'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleAdd(urlPreview, 'in_progress')}
                            disabled={addingId === itemId} className="flex-1 text-xs">
                            Commencer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}