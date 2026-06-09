import type { ReactNode } from 'react';
import './globals.css';
import './internal.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
