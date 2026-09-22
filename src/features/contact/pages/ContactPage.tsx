import { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Mail,
  Phone,
  User,
  Building2,
  MessageCircle,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';
import SEO from '@/components/SEO';

interface ContactInfo {
  id: number;
  setor: string;
  responsavel: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
  link?: string;
  linkLabel?: string;
}

const contacts: ContactInfo[] = [
  { id: 1, setor: 'Presidência', responsavel: 'João Batista dos Santos Neto', email: 'presidente@crf-al.org.br', telefone: '(82) 99603-9110' },
  { id: 2, setor: 'Vice-Presidência', responsavel: 'Lyvia Quintela Cavalcante Trajano', email: 'vicepresidente@crfal.org.br' },
  { id: 3, setor: 'Secretaria-Geral', responsavel: 'Ana Renata de Almeida Lima', email: 'secretaria@crf-al.org.br', telefone: '(82) 9 9971-0247' },
  { id: 4, setor: 'Tesouraria', responsavel: 'Isadora Lyra Cavalcanti', email: 'tesouraria@crf-al.org.br' },
  { id: 5, setor: 'Fiscalização', responsavel: 'Departamento de Fiscalização', email: 'fiscalizacao@crf-al.org.br', telefone: '(82) 99971-0247', whatsapp: '(82) 9999-8624' },
  { id: 6, setor: 'Secretaria', responsavel: 'Departamento de Secretaria', email: 'secretaria@crf-al.org.br', telefone: '(82) 8181-9050', whatsapp: '(82) 98181-9050' },
  { id: 7, setor: 'Tecnologia da Informação', responsavel: 'Departamento de TI', email: 'tecnologia@crf-al.org.br', telefone: '(82) 99355-8888' },
  { id: 8, setor: 'Comunicação', responsavel: 'Departamento de Comunicação', email: 'ascom@crf-al.org.br' },
  { id: 9, setor: 'Ouvidoria', responsavel: 'Atendimento ao Cidadão', email: 'ouvidoria@crf-al.org.br', link: '/servicos/ouvidoria', linkLabel: 'Portal da Ouvidoria' },
];

const ENDERECO =
  'Rua Oldemburgo da Silva Paranhos (antiga Rua Goiás), N° 290, Farol – CEP 57055-320 – Maceió/AL';
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Rua+Oldemburgo+da+Silva+Paranhos+290+Farol+Macei%C3%B3+AL';

function waLink(numero: string) {
  return `https://wa.me/55${numero.replace(/\D/g, '')}`;
}
function telLink(numero: string) {
  return `tel:+55${numero.replace(/\D/g, '')}`;
}

export default function ContactPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const fade =
    `transition-all duration-700 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`;
  const fadeDelay = (delay: number) =>
    ({ transitionDelay: isVisible ? `${delay}ms` : '0ms' }) as React.CSSProperties;

  return (
    <div className="min-h-screen bg-crfal-gray-50">
      <SEO
        title="Contato"
        description="Entre em contato com o CRFAL — Conselho Regional de Farmácia do Estado de Alagoas. Fale com nossos setores por e-mail, telefone ou WhatsApp."
        path="/contato"
      />

      {/* Hero — sobrio, institucional */}
      <div className="relative bg-crfal-blue pt-28 pb-14 lg:pt-44 md:pb-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <nav className="flex items-center gap-2 text-white/60 text-sm mb-4" aria-label="Navegação estrutural">
            <a href="/" className="hover:text-white transition-colors">
              Início
            </a>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
            <span className="text-white" aria-current="page">
              Fale Conosco
            </span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              Fale Conosco
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              Canais oficiais de comunicação do CRFAL. Escolha o setor, toque
              para ligar, enviar mensagem por WhatsApp ou e-mail.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-crfal-blue-light via-white/40 to-transparent" aria-hidden="true" />
      </div>

      <div className="container-crfal py-8 md:py-14" ref={sectionRef}>
        {/* Canais rápidos — cards clicáveis */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10 ${fade}`}
          style={fadeDelay(0)}
        >
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 bg-white rounded-xl p-4 md:p-5 border border-crfal-gray-200 hover:border-crfal-blue/30 hover:shadow-card-hover transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue/50"
          >
            <div className="w-10 h-10 bg-crfal-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-crfal-blue" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="flex items-center gap-1.5 font-semibold text-neutral-800 mb-1 text-sm md:text-base">
                Endereço
                <ExternalLink className="w-3.5 h-3.5 text-crfal-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-crfal-gray-600 leading-snug">{ENDERECO}</p>
              <p className="text-xs text-crfal-blue mt-1.5 font-medium">Ver no mapa</p>
            </div>
          </a>

          <a
            href={telLink('(82) 9 9971-0247')}
            className="group flex items-start gap-4 bg-white rounded-xl p-4 md:p-5 border border-crfal-gray-200 hover:border-crfal-blue/30 hover:shadow-card-hover transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue/50"
          >
            <div className="w-10 h-10 bg-crfal-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-crfal-blue" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-neutral-800 mb-1 text-sm md:text-base">Telefone</h3>
              <p className="text-sm text-crfal-gray-600 font-medium">(82) 9 9971-0247</p>
              <p className="flex items-center gap-1 text-xs text-crfal-gray-500 mt-1.5">
                <Clock className="w-3 h-3" />
                Seg–Sex, 09h às 17h
              </p>
            </div>
          </a>

          <a
            href="mailto:atendimento@crf-al.org.br"
            className="group flex items-start gap-4 bg-white rounded-xl p-4 md:p-5 border border-crfal-gray-200 hover:border-crfal-blue/30 hover:shadow-card-hover transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue/50"
          >
            <div className="w-10 h-10 bg-crfal-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-crfal-blue" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-neutral-800 mb-1 text-sm md:text-base">E-mail Geral</h3>
              <p className="text-sm text-crfal-gray-600 font-medium break-all">atendimento@crf-al.org.br</p>
              <p className="flex items-center gap-1 text-xs text-crfal-gray-500 mt-1.5">
                <Clock className="w-3 h-3" />
                Seg–Sex, 09h às 17h
              </p>
            </div>
          </a>

          <a
            href={waLink('(82) 9 9971-0247')}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 bg-white rounded-xl p-4 md:p-5 border border-crfal-gray-200 hover:border-green-600/30 hover:shadow-card-hover transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50"
          >
            <div className="w-10 h-10 bg-green-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-neutral-800 mb-1 text-sm md:text-base">
                WhatsApp – Atendimento Geral
              </h3>
              <p className="text-sm text-crfal-gray-600 font-medium">(82) 9 9971-0247</p>
              <p className="flex items-center gap-1 text-xs text-crfal-gray-500 mt-1.5">
                <Clock className="w-3 h-3" />
                Seg–Sex, 09h às 17h
              </p>
            </div>
          </a>
        </div>

        {/* Título da seção */}
        <div
          className={`mb-6 md:mb-8 ${fade}`}
          style={fadeDelay(100)}
        >
          <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-1">
            Contatos por Departamento
          </h2>
          <p className="text-sm md:text-base text-crfal-gray-600">
            Encontre o setor que você precisa e fale diretamente com ele.
          </p>
        </div>

        {/* MOBILE: lista compacta com ações diretas */}
        <ul
          className={`md:hidden mb-10 bg-white rounded-xl border border-crfal-gray-200 divide-y divide-crfal-gray-100 overflow-hidden ${fade}`}
          style={fadeDelay(150)}
        >
          {contacts.map((contact) => (
            <li key={contact.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-neutral-800 text-sm">{contact.setor}</h3>
                  <p className="text-xs text-crfal-gray-500 mt-0.5 truncate">{contact.responsavel}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {contact.link ? (
                    <a
                      href={contact.link}
                      aria-label={`Abrir ${contact.linkLabel}`}
                      className="w-8 h-8 rounded-lg border border-crfal-gray-200 flex items-center justify-center text-crfal-blue hover:bg-crfal-blue/5 active:bg-crfal-blue/10 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <a
                      href={`mailto:${contact.email}`}
                      aria-label={`Enviar e-mail para ${contact.setor}`}
                      className="w-8 h-8 rounded-lg border border-crfal-gray-200 flex items-center justify-center text-crfal-blue hover:bg-crfal-blue/5 active:bg-crfal-blue/10 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {contact.telefone && (
                    <a
                      href={telLink(contact.telefone)}
                      aria-label={`Ligar para ${contact.setor}`}
                      className="w-8 h-8 rounded-lg border border-crfal-gray-200 flex items-center justify-center text-crfal-blue hover:bg-crfal-blue/5 active:bg-crfal-blue/10 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {contact.whatsapp && (
                    <a
                      href={waLink(contact.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${contact.setor}`}
                      className="w-8 h-8 rounded-lg border border-green-600/30 bg-green-600/5 flex items-center justify-center text-green-600 active:bg-green-600/10 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* DESKTOP: cards com botões de ação */}
        <div className={`hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 ${fade}`} style={fadeDelay(200)}>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="group relative flex flex-col bg-white rounded-xl border border-crfal-gray-200 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-crfal-blue/25 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-crfal-blue/40"
            >
              <span className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-crfal-blue to-crfal-blue-light opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true" />

              <div className="p-5 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-crfal-blue/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-crfal-blue" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-neutral-800 text-base leading-tight">{contact.setor}</h3>
                    <p className="text-xs text-crfal-gray-500 mt-0.5 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {contact.responsavel}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href={contact.link ? contact.link : `mailto:${contact.email}`}
                    className="flex items-center gap-2 text-sm text-neutral-700 hover:text-crfal-blue transition-colors min-w-0 focus-visible:outline-none"
                  >
                    {contact.link ? (
                      <ExternalLink className="w-4 h-4 text-crfal-gray-400 flex-shrink-0" />
                    ) : (
                      <Mail className="w-4 h-4 text-crfal-gray-400 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {contact.link ? contact.linkLabel : contact.email}
                    </span>
                  </a>
                  {contact.telefone && (
                    <a
                      href={telLink(contact.telefone)}
                      className="flex items-center gap-2 text-sm text-neutral-700 hover:text-crfal-blue transition-colors focus-visible:outline-none"
                    >
                      <Phone className="w-4 h-4 text-crfal-gray-400 flex-shrink-0" />
                      {contact.telefone}
                    </a>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 mt-auto grid grid-cols-2 gap-2">
                {contact.link ? (
                  <a
                    href={contact.link}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-crfal-blue/30 text-crfal-blue text-sm font-medium py-2 px-3 hover:bg-crfal-blue hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue/50"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{contact.linkLabel}</span>
                  </a>
                ) : (
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-crfal-blue/30 text-crfal-blue text-sm font-medium py-2 px-3 hover:bg-crfal-blue hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue/50"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    E-mail
                  </a>
                )}
                  {contact.whatsapp && (
                    <a
                      href={waLink(contact.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-green-600/40 text-green-700 text-sm font-medium py-2 px-3 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50"
                    >
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      WhatsApp
                    </a>
                  )}
                </div>
            </div>
          ))}
        </div>

        {/* Ajuda */}
        <div
          className={`mt-10 bg-crfal-blue-lighter rounded-xl border border-crfal-blue/10 p-5 md:p-6 ${fade}`}
          style={fadeDelay(500)}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-crfal-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-crfal-blue" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-800 mb-1">Não encontrou o que procurava?</h4>
              <p className="text-sm text-crfal-gray-600 leading-relaxed">
                Acesse o{' '}
                <a
                  href="/servicos/ouvidoria"
                  className="text-crfal-blue hover:underline font-medium"
                >
                  Portal da Ouvidoria
                </a>{' '}
                ou entre em contato pelo e-mail geral{' '}
                <a
                  href="mailto:atendimento@crf-al.org.br"
                  className="text-crfal-blue hover:underline font-medium"
                >
                  atendimento@crf-al.org.br
                </a>
                . Retornaremos o mais breve possível.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
