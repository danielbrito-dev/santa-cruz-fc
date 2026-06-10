/**
 * Últimos vídeos da TV Coral via feed RSS público do YouTube (sem API key).
 * Cache de 30min (ISR) — falha de rede degrada para lista vazia (a página
 * mostra o link do canal).
 */

const TV_CORAL_CHANNEL_ID = 'UC6m5aQDz-FeTwV70nhhnpng'; // youtube.com/@tvcoraloficial
export const TV_CORAL_URL = 'https://www.youtube.com/@tvcoraloficial';

export interface YtVideo {
  id: string;
  title: string;
  published: string; // ISO
  thumb: string;
}

export async function fetchTvCoralVideos(): Promise<YtVideo[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${TV_CORAL_CHANNEL_ID}`,
      { next: { revalidate: 1800 } },
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const out: YtVideo[] = [];
    const entries = xml.split('<entry>').slice(1);
    for (const e of entries) {
      const id = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(e)?.[1];
      const title = /<media:title>([^<]*)<\/media:title>/.exec(e)?.[1];
      const published = /<published>([^<]+)<\/published>/.exec(e)?.[1];
      const thumb = /<media:thumbnail url="([^"]+)"/.exec(e)?.[1];
      if (id && title && published) {
        out.push({
          id,
          title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
          published,
          thumb: thumb || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}
