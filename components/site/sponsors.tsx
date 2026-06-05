import type { SectionProps } from './types';

export function Sponsors({ content }: SectionProps) {
  const masterFornecedor = (content.sponsors ?? [])
    .filter((s) => s.tier === 'master' || s.tier === 'fornecedor')
    .sort((a, b) => a.position - b.position);

  const apoio = (content.sponsors ?? [])
    .filter((s) => s.tier === 'apoio')
    .sort((a, b) => a.position - b.position);

  return (
    <section className="sponsors-section" id="patrocinadores">
      <div className="container">
        <div className="sponsors-master">
          {masterFornecedor.map((s) => (
            <a
              key={s.id}
              className="item"
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={s.logo} alt={s.name} />
            </a>
          ))}
        </div>

        <div className="sponsors-grid">
          {apoio.map((s) => (
            <a
              key={s.id}
              className="item"
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={s.logo} alt={s.name} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
