import { Link } from 'react-router-dom';
import { ATENDIMENTO, LOCAIS, HORARIO_ATENDIMENTO, telefoneHref } from '@/config/contact';
import {
  MapPin,
  Phone,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { SOCIAL_LINKS } from '@/config/site';
import { FacebookIcon, InstagramIcon, XIcon, YouTubeIcon } from '@/components/icons/social';

const quickLinks = [
  { label: 'Instituição', href: '/instituicao/sobre-conselho' },
  { label: 'Serviços', href: '/servicos/requerimentos' },
  { label: 'Legislação', href: '/legislacao' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Galeria de Fotos', href: '/imprensa/galeria-de-fotos' },
  { label: 'Acesso à Informação', href: '/acesso-a-informacao' },
  { label: 'Transparência', href: 'https://crf-al.implanta.net.br/portaltransparencia/' },
];

// Destinos internos existentes; não anunciar consultas sem URL oficial validada.
const serviceLinks = [
  { label: 'Requerimentos', href: '/servicos/requerimentos' },
  { label: 'Tutoriais', href: '/servicos/tutoriais' },
  { label: 'Manual do CRF AL em Casa', href: '/servicos/manual-crf-em-casa' },
  { label: 'Ouvidoria', href: '/servicos/ouvidoria' },
];

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  YouTube: YouTubeIcon,
  X: XIcon,
};

const socialLinks = SOCIAL_LINKS.map((social) => ({
  ...social,
  icon: SOCIAL_ICONS[social.label] ?? XIcon,
}));

export default function Footer() {
  return (
    <footer className="relative mt-6 overflow-hidden rounded-t-2xl bg-[#0B192C] text-white sm:mt-10 sm:rounded-t-3xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-crfal-blue-light rounded-full translate-x-1/2 -translate-y-1/2 opacity-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-crfal-blue-dark rounded-full -translate-x-1/2 translate-y-1/2 opacity-20" />

      <div className="relative z-10">
        <div className="container-crfal py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <div className="mb-6">
                <img
                  src="/images/logo-crf-azul.webp"
                  alt="CRFAL - Conselho Regional de Farmácia do Estado de Alagoas"
                  className="h-16 w-auto object-contain brightness-0 invert"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin aria-hidden="true" className="w-5 h-5 text-crfal-gold shrink-0 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium text-white">Sede</p>
                    <p>{LOCAIS[0].endereco}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin aria-hidden="true" className="w-5 h-5 text-crfal-gold shrink-0 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium text-white">Seccional</p>
                    <p>{LOCAIS[1].endereco}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock aria-hidden="true" className="w-5 h-5 text-crfal-gold shrink-0 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium text-white">Horário de Funcionamento</p>
                    <p>{HORARIO_ATENDIMENTO} (sem pausa para o almoço)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone aria-hidden="true" className="w-5 h-5 text-crfal-gold shrink-0 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium text-white">Canais de Atendimento</p>
                    <a
                      href={telefoneHref(ATENDIMENTO.telefone)}
                      className="flex min-h-11 items-center hover:text-white transition-colors"
                    >
                      {ATENDIMENTO.telefone}
                    </a>
                    <a
                      href={`mailto:${ATENDIMENTO.email}`}
                      className="flex min-h-11 items-center hover:text-white transition-colors"
                    >
                      {ATENDIMENTO.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-1 h-6 bg-crfal-gold rounded-full" />
                Links Rápidos
              </h2>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="group flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300"
                    >
                      <ChevronRight aria-hidden="true" className="w-4 h-4 text-crfal-blue-light opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-1 h-6 bg-crfal-gold rounded-full" />
                Serviços
              </h2>
              <ul className="space-y-3">
                {serviceLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="group flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300"
                    >
                      <ChevronRight aria-hidden="true" className="w-4 h-4 text-crfal-blue-light opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-1 h-6 bg-crfal-gold rounded-full" />
                Redes Sociais
              </h2>

              <div className="flex gap-3 mb-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-110"
                    >
                      <Icon aria-hidden="true" className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-crfal py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-white/60 text-center md:text-left">
                © {new Date().getFullYear()} CRFAL - Conselho Regional de Farmácia
                do Estado de Alagoas. Todos os direitos reservados.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                <Link to="/acessibilidade" className="hover:text-white transition-colors">Acessibilidade</Link>
                <Link to="/politica-de-privacidade" className="hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
                <span className="text-white/30">|</span>
                <Link to="/termos-de-uso" className="hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
