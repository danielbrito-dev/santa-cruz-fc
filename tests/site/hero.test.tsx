import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/site/hero';

const content: any = { hero: { titleLine1:{pt:'Coral não',en:'Coral never'}, titleLine2:{pt:'recua.',en:'backs down.'}, tagline:{pt:'',en:''}, ctaLabel:{pt:'Garantir ingresso',en:'Get tickets'}, ctaUrl:'#', backdrop:'/images/torcida1.jpg' } };

describe('Hero', () => {
  it('renders the localized CTA (pt)', () => {
    render(<Hero content={content} locale="pt" />);
    expect(screen.getByText(/Garantir ingresso/)).toBeInTheDocument();
  });
  it('renders English CTA when locale is en', () => {
    render(<Hero content={content} locale="en" />);
    expect(screen.getByText(/Get tickets/)).toBeInTheDocument();
  });
  it('renders both title lines', () => {
    render(<Hero content={content} locale="pt" />);
    expect(screen.getByText('Coral não')).toBeInTheDocument();
    expect(screen.getByText('recua.')).toBeInTheDocument();
  });
});
