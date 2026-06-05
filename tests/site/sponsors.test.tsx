import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sponsors } from '@/components/site/sponsors';

const content: any = { sponsors: [
  { id:'s1', name:'Bet da Sorte', logo:'/patrocinadores/betdasorte_master.png', url:'#', tier:'master', position:0 },
  { id:'s2', name:'Reebok', logo:'/patrocinadores/reebok_fornecedor.png', url:'#', tier:'fornecedor', position:1 },
  { id:'s3', name:'Iquine', logo:'/patrocinadores/iquine.png', url:'#', tier:'apoio', position:2 },
]};

describe('Sponsors', () => {
  it('renders master/fornecedor and grid sponsors with alt text', () => {
    render(<Sponsors content={content} locale="pt" />);
    expect(screen.getByAltText('Bet da Sorte')).toBeInTheDocument();
    expect(screen.getByAltText('Reebok')).toBeInTheDocument();
    expect(screen.getByAltText('Iquine')).toBeInTheDocument();
  });
});
