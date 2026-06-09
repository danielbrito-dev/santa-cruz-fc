/**
 * Pure (no I/O) CRUD helpers for gallery, documents and fan stories on SiteContent.
 */
import type { SiteContent, GalleryImage, DocItem, StoryItem } from './types';

const uid = (p: string) => `${p}-${Date.now().toString(36)}`;

// ── Galeria ──────────────────────────────────────────────────────────────────
export interface GalleryInput { src: string; alt: string; }
export function applyCreateImage(c: SiteContent, input: GalleryInput): SiteContent {
  const img: GalleryImage = { id: uid('g'), src: input.src, alt: input.alt };
  return { ...c, gallery: [...c.gallery, img] };
}
export function applyUpdateImage(c: SiteContent, id: string, input: GalleryInput): SiteContent {
  return { ...c, gallery: c.gallery.map((g) => (g.id !== id ? g : { ...g, src: input.src, alt: input.alt })) };
}
export function applyDeleteImage(c: SiteContent, id: string): SiteContent {
  return { ...c, gallery: c.gallery.filter((g) => g.id !== id) };
}

// ── Documentos ───────────────────────────────────────────────────────────────
export interface DocInput { page: string; title: string; kind: string; meta: string; href: string; }
export function applyCreateDoc(c: SiteContent, input: DocInput): SiteContent {
  const doc: DocItem = { id: uid('d'), ...input };
  return { ...c, documents: [...c.documents, doc] };
}
export function applyUpdateDoc(c: SiteContent, id: string, input: DocInput): SiteContent {
  return { ...c, documents: c.documents.map((d) => (d.id !== id ? d : { ...d, ...input })) };
}
export function applyDeleteDoc(c: SiteContent, id: string): SiteContent {
  return { ...c, documents: c.documents.filter((d) => d.id !== id) };
}

// ── Histórias Coral ──────────────────────────────────────────────────────────
export interface StoryInput {
  author: string; city: string; generation: string; excerpt: string;
  featured: boolean; status: StoryItem['status'];
}
export function applyCreateStory(c: SiteContent, input: StoryInput): SiteContent {
  const story: StoryItem = { id: uid('s'), ...input };
  return { ...c, stories: [...c.stories, story] };
}
export function applyUpdateStory(c: SiteContent, id: string, input: StoryInput): SiteContent {
  return { ...c, stories: c.stories.map((s) => (s.id !== id ? s : { ...s, ...input })) };
}
export function applyDeleteStory(c: SiteContent, id: string): SiteContent {
  return { ...c, stories: c.stories.filter((s) => s.id !== id) };
}
