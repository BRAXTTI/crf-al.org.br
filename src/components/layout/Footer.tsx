import {
  MapPin,
  Phone,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const quickLinks = [
  { label: 'Instituição', href: '/instituicao/sobre-conselho' },
  { label: 'Serviços', href: '/servicos/requerimentos' },
  { label: 'Legislação', href: '/legislacao' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Transparência', href: 'https://crf-al.implanta.net.br/portaltransparencia/#publico/inicio' },
];

const serviceLinks = [
  { label: 'Inscrição', href: '/servicos/tutoriais' },
  { label: '2ª Via de Certidões', href: '/servicos/tutoriais' },
  { label: 'Consultar Inscrição', href: '/servicos/tutoriais' },
  { label: 'Validar Documentos', href: '/servicos/tutoriais' },
];

const socialLinks = [
  { icon: Facebook, href: '#facebook', label: 'Facebook' },
  { icon: Instagram, href: '#instagram', label: 'Instagram' },
  { icon: Twitter, href: '#twitter', label: 'Twitter' },
  { icon: Youtube, href: '#youtube', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0B192C] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-crfal-blue-light rounded-full translate-x-1/2 -translate-y-1/2 opacity-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-crfal-blue-dark rounded-full -translate-x-1/2 translate-y-1/2 opacity-20" />

      <div className="relative z-10">
        <div className="container-crfal py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <div className="mb-6">
                <img
                  src="/images/logo-crf-azul.png"
                  alt="CRFAL - Conselho Regional de Farmácia de Alagoas"
                  className="h-16 w-auto object-contain brightness-0 invert"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C59B27] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium text-white">Sede</p>
                    <p>Rua Oldemburgo da Silva Paranhos, 290 - Farol, Maceió - AL, 57055-320</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C59B27] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium text-white">Seccional</p>
                    <p>Rua Delmiro Gouveia, 1382 - sala 01 - 1°andar - Sen. Teotônio Vilela, Arapiraca - AL, 57312-415</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#C59B27] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium text-white">Horário de Funcionamento</p>
                    <p>Segunda a Sexta: 09h às 17h (sem pausa para o almoço)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#C59B27] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium text-white">Canais de Atendimento</p>
                    <a
                      href="tel:+5582999710247"
                      className="block hover:text-white transition-colors"
                    >
                      82 9 9971-0247
                    </a>
                    <a
                      href="mailto:atendimento@crf-al.org.br"
                      className="block hover:text-white transition-colors"
                    >
                      atendimento@crf-al.org.br
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#C59B27] rounded-full" />
                Links Rápidos
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300"
                    >
                      <ChevronRight className="w-4 h-4 text-crfal-blue-light opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#C59B27] rounded-full" />
                Serviços
              </h3>
              <ul className="space-y-3">
                {serviceLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300"
                    >
                      <ChevronRight className="w-4 h-4 text-crfal-blue-light opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#C59B27] rounded-full" />
                Redes Sociais
              </h3>

              <div className="flex gap-3 mb-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-110"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-2">Assine nossa newsletter</h4>
                <p className="text-xs text-white/70 mb-3">
                  Receba as últimas notícias e atualizações
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm placeholder:text-white/50 focus:outline-none focus:border-crfal-blue-light"
                  />
                  <button className="px-3 py-2 bg-[#C59B27] hover:bg-[#A9821F] text-white rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
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
              <div className="flex items-center gap-4 text-sm text-white/60">
                <a href="/politica-de-privacidade" className="hover:text-white transition-colors">
                  Política de Privacidade
                </a>
                <span className="text-white/30">|</span>
                <a href="/termos-de-uso" className="hover:text-white transition-colors">
                  Termos de Uso
                </a>
                <span className="text-white/30">|</span>
                <a href="#acessibilidade" className="hover:text-white transition-colors">
                  Acessibilidade
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
