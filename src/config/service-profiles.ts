import { Building2, PillBottle, UserRound } from 'lucide-react';
import { TRANSPARENCIA_URL } from '@/config/site';

const individual = '/servicos/requerimentos?perfil=pessoa-fisica';
const corporate = '/servicos/requerimentos?perfil=pessoa-juridica';

export const serviceProfiles = [
  {
    id: 'empresas', label: 'Empresas', icon: Building2, href: corporate,
    action: 'Ver requerimentos',
    services: [
      { label: 'Registro de estabelecimentos', href: `${corporate}&categoria=registro-inicial` },
      { label: 'Responsabilidade técnica', href: `${corporate}&categoria=responsabilidade-tecnica` },
      { label: 'Horários e assistência farmacêutica', href: `${corporate}&categoria=horarios-assistencia` },
      { label: 'Transferências e alterações', href: `${corporate}&categoria=transferencias-alteracoes` },
      { label: 'Defesas e recursos', href: `${corporate}&categoria=fiscalizacao-recursos` },
    ],
  },
  {
    id: 'farmaceuticos', label: 'Farmacêuticos', icon: PillBottle, href: individual,
    action: 'Ver requerimentos',
    services: [
      { label: 'Inscrições profissionais', href: `${individual}&categoria=inscricoes-pf` },
      { label: 'Carteira profissional e certidões', href: `${individual}&categoria=carteira-certidoes-pf` },
      { label: 'Transferência e cancelamento', href: `${individual}&categoria=transferencia-cancelamento-pf` },
      { label: 'Comunicado de afastamento provisório', href: '/fiscalizacao/afastamento-provisorio' },
      { label: 'Tutoriais dos serviços online', href: '/servicos/tutoriais' },
    ],
  },
  {
    id: 'cidadao', label: 'Cidadão', icon: UserRound, href: '/servicos/ouvidoria',
    action: 'Acessar a Ouvidoria',
    services: [
      { label: 'Ouvidoria: manifestações e denúncias', href: '/servicos/ouvidoria' },
      { label: 'Transparência e acesso à informação', href: TRANSPARENCIA_URL },
      { label: 'Legislação e normas', href: '/legislacao' },
      { label: 'Atuação da fiscalização', href: '/fiscalizacao/papel-da-fiscalizacao' },
      { label: 'Fale com o CRF AL', href: '/contato' },
    ],
  },
];
