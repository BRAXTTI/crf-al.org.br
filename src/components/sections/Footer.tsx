import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const quickLinks = [
  { label: 'Institucional', href: '#instituicao' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Legislação', href: '#legislacao' },
  { label: 'Transparência', href: '#transparencia' },
];

const serviceLinks = [
  { label: 'Inscrição', href: '#inscricao' },
  { label: '2ª Via de Certidões', href: '#certidoes' },
  { label: 'Consultar Inscrição', href: '#consulta' },
  { label: 'Validar Documentos', href: '#validar' },
];

const socialLinks = [
  { icon: Facebook, href: '#facebook', label: 'Facebook' },
  { icon: Instagram, href: '#instagram', label: 'Instagram' },
  { icon: Twitter, href: '#twitter', label: 'Twitter' },
  { icon: Youtube, href: '#youtube', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-crfal-blue text-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-crfal-blue-light rounded-full translate-x-1/2 -translate-y-1/2 opacity-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-crfal-blue-dark rounded-full -translate-x-1/2 translate-y-1/2 opacity-20" />

      {/* Main Footer Content */}
      <div className="relative z-10">
        <div className="container-crfal py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {/* Column 1 - Logo & Contact */}
            <div className="col-span-2 md:col-span-2 lg:col-span-1">
              {/* Logo */}
              <div className="mb-5 sm:mb-6">
                <img
                  src="/images/logo-crf-azul.png"
                  alt="CRFAL - Conselho Regional de Farmácia de Alagoas"
                  className="h-12 sm:h-16 w-auto object-contain brightness-0 invert"
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-crfal-blue-light flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/80">
                    Rua Dr. Jorge de Lima, 113
                    <br />
                    Trapiche da Barra, Maceió - AL
                    <br />
                    CEP: 57010-300
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-crfal-blue-light flex-shrink-0" />
                  <a
                    href="tel:+558233333333"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    (82) 3333-3333
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-crfal-blue-light flex-shrink-0" />
                  <a
                    href="mailto:crfal@crfal.org.br"
                    className="text-sm text-white/80 hover:text-white transition-colors break-all"
                  >
                    crfal@crfal.org.br
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-crfal-blue-light flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium text-white">Horário de Funcionamento</p>
                    <p>Segunda a Sexta: 8h às 17h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5 flex items-center gap-2">
                <span className="w-1 h-5 sm:h-6 bg-crfal-blue-light rounded-full" />
                Links Rápidos
              </h3>
              <ul className="space-y-2.5 sm:space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 text-sm py-0.5"
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

            {/* Column 3 - Services */}
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5 flex items-center gap-2">
                <span className="w-1 h-5 sm:h-6 bg-crfal-blue-light rounded-full" />
                Serviços
              </h3>
              <ul className="space-y-2.5 sm:space-y-3">
                {serviceLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 text-sm py-0.5"
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

            {/* Column 4 - Social & Newsletter */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5 flex items-center gap-2">
                <span className="w-1 h-5 sm:h-6 bg-crfal-blue-light rounded-full" />
                Redes Sociais
              </h3>

              {/* Social Icons */}
              <div className="flex gap-3 mb-5 sm:mb-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>

              {/* Newsletter */}
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-2">
                  Assine nossa newsletter
                </h4>
                <p className="text-xs text-white/70 mb-3">
                  Receba as últimas notícias e atualizações
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    className="flex-1 min-w-0 px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm placeholder:text-white/50 focus:outline-none focus:border-crfal-blue-light transition-colors"
                  />
                  <button className="px-3 py-2.5 bg-crfal-blue-light hover:bg-crfal-blue-lighter text-crfal-blue rounded-lg transition-colors flex-shrink-0 active:scale-95">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container-crfal py-5 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <p className="text-xs sm:text-sm text-white/60 text-center sm:text-left">
                © {new Date().getFullYear()} CRFAL - Conselho Regional de Farmácia
                do Estado de Alagoas. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/60">
                <a href="#privacidade" className="hover:text-white transition-colors py-1">
                  Privacidade
                </a>
                <span className="text-white/20">|</span>
                <a href="#termos" className="hover:text-white transition-colors py-1">
                  Termos
                </a>
                <span className="text-white/20">|</span>
                <a href="#acessibilidade" className="hover:text-white transition-colors py-1">
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
