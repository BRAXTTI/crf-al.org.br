import { Building2, Layers, PillBottle } from 'lucide-react';
import type { Tutorial } from '@/data/servicos';

export const PERFIS: Record<Tutorial['perfil'], { label: string; icon: typeof PillBottle }> = {
  'pessoa-fisica': { label: 'Farmacêuticos', icon: PillBottle },
  'pessoa-juridica': { label: 'Empresas', icon: Building2 },
  ambos: { label: 'Farmacêuticos e empresas', icon: Layers },
};

