import type { ReactNode } from 'react';
import { SellerShell } from './seller-shell';

export default function SellerLayout({ children }: { children: ReactNode }) {
  return <SellerShell>{children}</SellerShell>;
}
