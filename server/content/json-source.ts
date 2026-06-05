import type { ContentSource, SiteContent } from './types';
import { readSiteContent } from './store';

export class JsonContentSource implements ContentSource {
  async getSiteContent(): Promise<SiteContent> {
    return readSiteContent();
  }
}
