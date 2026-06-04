import type { ContentSource, SiteContent } from './types';
import data from '@/content/site.json';

export class JsonContentSource implements ContentSource {
  async getSiteContent(): Promise<SiteContent> {
    return data as unknown as SiteContent;
  }
}
