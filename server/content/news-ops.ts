/**
 * Pure (no I/O) helpers for news CRUD operations.
 * Kept separate from news-actions.ts so they can be imported by tests
 * without triggering 'use server' restrictions.
 */
import type { SiteContent, NewsItem, LocalizedText } from './types';

export interface NewsInput {
  slug: string;
  tag: LocalizedText;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  coverImage: string;
  photoCount: number;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string;
}

export function applyCreate(content: SiteContent, input: NewsInput): SiteContent {
  const maxPosition = content.news.reduce((m, n) => Math.max(m, n.position), -1);
  const id = `${input.slug}-${Date.now().toString(36)}`;
  const newItem: NewsItem = {
    id,
    slug: input.slug,
    tag: input.tag,
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    coverImage: input.coverImage,
    photoCount: input.photoCount,
    featured: input.featured,
    status: input.status,
    publishedAt: input.publishedAt,
    position: maxPosition + 1,
  };
  return { ...content, news: [...content.news, newItem] };
}

export function applyUpdate(
  content: SiteContent,
  id: string,
  input: NewsInput,
): SiteContent {
  const news = content.news.map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      slug: input.slug,
      tag: input.tag,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      coverImage: input.coverImage,
      photoCount: input.photoCount,
      featured: input.featured,
      status: input.status,
      publishedAt: input.publishedAt,
    };
  });
  return { ...content, news };
}

export function applyDelete(content: SiteContent, id: string): SiteContent {
  return { ...content, news: content.news.filter((n) => n.id !== id) };
}

export function applyStatus(
  content: SiteContent,
  id: string,
  status: 'draft' | 'published' | 'archived',
): SiteContent {
  const news = content.news.map((item) =>
    item.id !== id ? item : { ...item, status },
  );
  return { ...content, news };
}
