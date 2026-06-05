import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BannerStrip } from '@/components/site/banner-strip';

const content: any = { banners: [
  { id:'b1', eyebrow:{pt:'Sócio Coral',en:'Membership'}, title:{pt:'Sua paixão é tricolor.',en:'Your passion is tricolor.'}, image:'/images/torcida.jpg', ctaLabel:{pt:'Seja sócio',en:'Join'}, ctaUrl:'#', size:'normal', position:0 },
  { id:'b2', eyebrow:{pt:'Loja Oficial',en:'Official Store'}, title:{pt:'Camisa nova 26.',en:'New 26 kit.'}, image:'/images/loja.jpg', ctaLabel:{pt:'Comprar',en:'Shop'}, ctaUrl:'#', size:'normal', position:1 },
]};

describe('BannerStrip', () => {
  it('renders banner titles and CTAs', () => {
    render(<BannerStrip content={content} locale="pt" />);
    expect(screen.getByText(/Sua paixão é tricolor/)).toBeInTheDocument();
    expect(screen.getByText(/Seja sócio/)).toBeInTheDocument();
    expect(screen.getByText(/Camisa nova 26/)).toBeInTheDocument();
  });
  it('renders English content when locale is en', () => {
    render(<BannerStrip content={content} locale="en" />);
    expect(screen.getByText(/Your passion is tricolor/)).toBeInTheDocument();
  });
});
