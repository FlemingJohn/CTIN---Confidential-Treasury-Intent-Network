import { LayoutDashboard, ShieldCheck, Boxes, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavigationDestination {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navigationDestinations: NavigationDestination[] = [
  { href: '/institution', label: 'Institution', icon: LayoutDashboard },
  { href: '/auditor', label: 'Auditor', icon: ShieldCheck },
  { href: '/explorer', label: 'Explorer', icon: Boxes },
  { href: '/operator', label: 'Operator', icon: SlidersHorizontal },
];
