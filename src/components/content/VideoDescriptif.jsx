import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, ThumbsUp, Eye, Play, Loader2, Youtube } from "lucide-react";

function formatCount(n) {
  if (!n) return null;
  const num = parseInt(n);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
}

export default function VideoDescriptif({ content }) {
  const [channelVideos, setChannelVideos] = useState([]);
  const [similarVideos, setSimilarVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Extract metadata stored in personal_note
  const meta = (() => {
    try { return JSON.parse(content.personal_note || '{}'); } catch { return {}; }
  })();

  const videoId = meta.externalId || content.content_url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
  const channelName = content.author || '';

  useEffect(() => {
    if (!channelName) return;
    setLoading(true);
    // Search by same channel
    Promise.all([
      base44.functions.invoke('searchYoutube', { query: channelName, maxResults: 6 }),
      base44.functions.invoke('searchYoutube', { query: content.title?.split(' ').slice(0, 4).join(' ') || '', maxResults: 6 }),
    ]).then(([ch, sim]) => {
      setChannelVideos((ch.data?.items || []).filter(v => v.externalId !== videoId).slice(0, 4));
      setSimilarVideos((sim.data?.items || []).filter(v => v.externalId !== videoId && !ch.data?.items?.find(c => c.externalId === v.externalId)).slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [content.id]);

  const thumbnailUrl = content.cover_url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null);

  return (
    <div className="space-y-5">
      {/* Thumbnail + embed preview */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {videoId ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={content.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : thumbnailUrl ? (
          <img src={thumbnailUrl} alt={content.title} className="w-full aspect-video object-cover" />
        ) : null}
      </div>

      {/* Channel info + stats */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <Youtube className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base">{channelName || 'Chaîne YouTube'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Créateur de contenu</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {meta.viewCount && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3.5 h-3.5" /> {formatCount(meta.viewCount)} vues
                </span>
              )}
              {meta.likeCount && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="w-3.5 h-3.5" /> {formatCount(meta.likeCount)} likes
                </span>
              )}
              {content.total_duration && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Play className="w-3.5 h-3.5" /> {content.total_duration} min
                </span>
              )}
            </div>
          </div>
          {content.content_url && (
            <a href={content.content_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-red-500 hover:underline font-medium shrink-0">
              <Youtube className="w-4 h-4" /> Voir sur YouTube
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {content.summary && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-accent" /> Description
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">
            {content.summary}
          </p>
        </div>
      )}

      {/* Videos by same channel */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement des suggestions…
        </div>
      )}

      {channelVideos.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-bold text-base mb-4">📺 De la même chaîne</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {channelVideos.map(v => <VideoMiniCard key={v.externalId} video={v} />)}
          </div>
        </div>
      )}

      {similarVideos.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-bold text-base mb-4">🎯 Dans le même style</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similarVideos.map(v => <VideoMiniCard key={v.externalId} video={v} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function VideoMiniCard({ video }) {
  return (
    <a href={video.externalUrl} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-1.5">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary border border-border">
        {video.imageUrl
          ? <img src={video.imageUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center"><Play className="w-5 h-5 text-muted-foreground" /></div>
        }
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <p className="text-xs font-semibold line-clamp-2 leading-tight">{video.title}</p>
      <p className="text-xs text-muted-foreground truncate">{video.creator}</p>
    </a>
  );
}