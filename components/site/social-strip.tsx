import type { SectionProps } from './types';
import { SocialIcon } from './social-icons';

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function SocialStrip({ content }: SectionProps) {
  return (
    <section className="social-strip">
      <div className="row">
        {(content.social ?? []).map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={capitalize(link.network)}
          >
            <SocialIcon network={link.network} />
          </a>
        ))}
      </div>
    </section>
  );
}
