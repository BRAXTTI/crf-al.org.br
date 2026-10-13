import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { serviceProfiles } from '@/config/service-profiles';

export default function ServiceProfiles() {
  return (
    <section aria-labelledby="services-by-profile-title" className="border-t border-crfal-gray-200 bg-white py-10 sm:py-14">
      <div className="container-crfal">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]">Central de serviços</p>
            <h2 id="services-by-profile-title" className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[32px]">Como podemos ajudar você?</h2>
            <span aria-hidden="true" className="mt-3 block h-0.5 w-10 rounded-full bg-crfal-gold" />
          </div>
          <Link to="/servicos/requerimentos" className="group inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-crfal-blue hover:text-crfal-blue-light focus-visible:outline-crfal-blue sm:self-auto">
            Ver todos os requerimentos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          {serviceProfiles.map(profile => {
            const Icon = profile.icon;
            return (
              <nav
                key={profile.id}
                aria-labelledby={`services-${profile.id}`}
                className="relative isolate flex flex-col overflow-hidden rounded-xl border-t-2 border-crfal-gold bg-gradient-to-br from-crfal-blue to-crfal-blue-dark text-white shadow-lg shadow-crfal-blue/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-crfal-blue/20 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <Icon className="pointer-events-none absolute -bottom-8 -right-8 -z-10 h-44 w-44 text-white opacity-[0.06]" strokeWidth={1} aria-hidden="true" />

                <div className="p-6 pb-0 sm:p-8 sm:pb-0">
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-crfal-gold/40">
                      <Icon className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Serviços para</span>
                      <h3 id={`services-${profile.id}`} className="mt-0.5 text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]">{profile.label}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/75">{profile.description}</p>

                  <ul className="mt-6 mb-6 divide-y divide-white/15 border-y border-white/15">
                    {profile.services.map(service => {
                      const external = service.href.startsWith('https:');
                      const Arrow = external ? ArrowUpRight : ChevronRight;
                      const className = 'group -mx-3 flex min-h-12 items-center justify-between gap-3 rounded-md px-3 py-3 text-[15px] font-medium leading-snug transition-colors hover:bg-white/10 focus-visible:outline-white motion-reduce:transition-none';
                      const content = (
                        <>
                          <span>{service.label}</span>
                          <Arrow className="h-4 w-4 shrink-0 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-crfal-gold motion-reduce:transition-none" aria-hidden="true" />
                          {external && <span className="sr-only">Abre em uma nova aba.</span>}
                        </>
                      );
                      return (
                        <li key={service.href}>
                          {external
                            ? <a href={service.href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
                            : <Link to={service.href} className={className}>{content}</Link>}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-auto px-6 pb-6 sm:px-8 sm:pb-8">
                  <Link
                    to={profile.href}
                    className="group inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white hover:text-crfal-blue focus-visible:outline-white motion-reduce:transition-none"
                  >
                    {profile.action}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
                  </Link>
                </div>
              </nav>
            );
          })}
        </div>
      </div>
    </section>
  );
}
