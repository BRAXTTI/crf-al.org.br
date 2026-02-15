import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Mail, Phone, User, Building2, MessageCircle } from 'lucide-react';

interface Contato {
  id: number;
  setor: string;
  responsavel: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
}

const contatos: Contato[] = [
  {
    id: 1,
    setor: 'Presidência',
    responsavel: 'João Batista dos Santos Neto',
    email: 'presidente@crf-al.org.br',
    telefone: '(82) 2121-0001',
  },
  {
    id: 2,
    setor: 'Vice-Presidência',
    responsavel: 'Lyvia Quintela Cavalcante Trajano',
    email: 'vicepresidente@crfal.org.br',
    telefone: '(82) 2121-0002',
  },
  {
    id: 3,
    setor: 'Secretaria-Geral',
    responsavel: 'Ana Renata de Almeida Lima',
    email: 'secretaria@crf-al.org.br',
    telefone: '(82) 2121-0003',
  },
  {
    id: 4,
    setor: 'Tesouraria',
    responsavel: 'Isadora Lyra Cavalcanti',
    email: 'tesoureira@crf-al.org.br',
    telefone: '(82) 2121-0004',
  },
  {
    id: 5,
    setor: 'Fiscalização',
    responsavel: 'Departamento de Fiscalização',
    email: 'fiscalizacao@crf-al.org.br',
    telefone: '(82) 2121-0005',
    whatsapp: '(82) 99999-0005',
  },
  {
    id: 6,
    setor: 'Secretaria',
    responsavel: 'Departamento de Secretaria',
    email: 'secretaria@crf-al.org.br',
    telefone: '(82) 2121-0006',
  },
  {
    id: 7,
    setor: 'Tecnologia da Informação',
    responsavel: 'Departamento de TI',
    email: 'tecnologia@crf-al.org.br',
    telefone: '(82) 2121-0007',
  },
  {
    id: 8,
    setor: 'Comunicação',
    responsavel: 'Departamento de Comunicação',
    email: 'ascom@crf-al.org.br',
    telefone: '(82) 2121-0008',
    whatsapp: '(82) 99999-0008',
  },
  {
    id: 9,
    setor: 'Ouvidoria',
    responsavel: 'Atendimento ao Cidadão',
    email: 'ouvidoria@crfal.org.br',
    telefone: '(82) 2121-0009',
    whatsapp: '(82) 99999-0009',
  },
];

export default function Contato() {
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

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-white/60 text-xs sm:text-sm mb-4">
            <a href="/" className="hover:text-white transition-colors">Início</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Fale Conosco</span>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Fale Conosco
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Entre em contato com o CRFAL. Aqui você encontra os canais de
              comunicação de todos os departamentos e setores.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-crfal py-10 md:py-16" ref={sectionRef}>
        {/* Info Cards - Contato Geral */}
        <div
          className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="w-10 h-10 bg-crfal-blue/10 rounded-xl flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5 text-crfal-blue" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-1">Endereço</h3>
            <p className="text-sm text-neutral-600 break-words">
            Rua Oldemburgo da Silva Paranhos (antiga Rua Goiás) N° 290, Farol – CEP 57055-320 – Maceió-AL
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="w-10 h-10 bg-crfal-blue/10 rounded-xl flex items-center justify-center mb-3">
              <Phone className="w-5 h-5 text-crfal-blue" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-1">Telefone</h3>
            <p className="text-sm text-neutral-600">(82) 2121-0000</p>
            <p className="text-xs text-neutral-500 mt-1">Seg - Sex: 8h às 17h</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="w-10 h-10 bg-crfal-blue/10 rounded-xl flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-crfal-blue" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-1">E-mail Geral</h3>
            <p className="text-sm text-neutral-600 break-all">atendimento@crf-al.org.br</p>
            <p className="text-xs text-neutral-500 mt-1">Atendimento 24h* (Inteligencia Artificial)</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="w-10 h-10 bg-crfal-blue/10 rounded-xl flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5 text-crfal-blue" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-1">WhatsApp</h3>
            <p className="text-sm text-neutral-600">(82) 99999-0000</p>
            <p className="text-xs text-neutral-500 mt-1">Seg - Sex: 8h às 17h</p>
          </div>
        </div>

        {/* Section Title */}
        <div
          className={`mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
            Contatos por Departamento
          </h2>
          <p className="text-neutral-600">
            Encontre o responsável pelo setor que você precisa contactar.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contatos.map((contato, index) => (
            <div
              key={contato.id}
              className={`group bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-500 hover:shadow-card-hover hover:border-crfal-blue/20 hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: isVisible ? `${200 + index * 80}ms` : '0ms',
              }}
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-crfal-blue to-crfal-blue-dark p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">
                      {contato.setor}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Responsável */}
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-crfal-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Responsável</p>
                    <p className="text-sm font-medium text-neutral-800">{contato.responsavel}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-crfal-blue mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">E-mail</p>
                    <a
                      href={`mailto:${contato.email}`}
                      className="text-sm text-neutral-700 hover:text-crfal-blue transition-colors break-all"
                    >
                      {contato.email}
                    </a>
                  </div>
                </div>

                {/* Telefone */}
                {contato.telefone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-crfal-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">Telefone</p>
                      <a
                        href={`tel:${contato.telefone.replace(/\D/g, '')}`}
                        className="text-sm text-neutral-700 hover:text-crfal-blue transition-colors"
                      >
                        {contato.telefone}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {contato.whatsapp && (
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">WhatsApp</p>
                      <a
                        href={`https://wa.me/55${contato.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-neutral-700 hover:text-green-600 transition-colors"
                      >
                        {contato.whatsapp}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Notice */}
        <div
          className={`mt-10 bg-crfal-blue-lighter rounded-2xl border border-crfal-blue/10 p-6 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-crfal-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-crfal-blue" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-800 mb-1">
                Precisa de ajuda?
              </h4>
              <p className="text-sm text-neutral-600">
                Se não encontrou o contato que procura, entre em contato pelo nosso
                e-mail geral{' '}
                <a
                  href="mailto:atendimento@crf-al.org.br"
                  className="text-crfal-blue hover:underline font-medium"
                >
                  atendimento@crf-al.org.br
                </a>{' '}
                ou pelo telefone{' '}
                <a
                  href="tel:08221210000"
                  className="text-crfal-blue hover:underline font-medium"
                >
                  (82) 2121-0000
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
