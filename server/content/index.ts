import type { ContentSource } from './types';
import { JsonContentSource } from './json-source';

// Phase 1: JSON. Phase 3 swaps this binding to DbContentSource.
let instance: ContentSource | null = null;
export function getContentSource(): ContentSource {
  if (!instance) instance = new JsonContentSource();
  return instance;
}
