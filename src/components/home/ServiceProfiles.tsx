import { Reveal } from '@/components/ui/reveal';
import { useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { serviceProfiles } from '@/config/service-profiles';

const STORAGE_KEY = 'crfal.perfilServico';

/** Perfil escolhido no celular, lembrado só neste aparelho (site sem SSR: lido já na primeira renderização). */
function usePerfilSalvo() {
  const [perfil, setPerfil] = useState(() => {
    try {
      const salvo = window.localStorage.getItem(STORAGE_KEY);
      if (serviceProfiles.some(profile => profile.id === salvo)) return salvo as string;
    } catch { /* armazenamento indisponível */ }
    return serviceProfiles[0].id;
  });
  const escolher = (id: string) => {
    setPerfil(id);
    try { window.localStorage.setItem(STORAGE_KEY, id); } catch { /* armazenamento indisponível */ }
  };
  return [perfil, escolher] as const;
}

export default function ServiceProfiles() {
  const [perfil, escolherPerfil] = usePerfilSalvo();
  const abas = useRef<(HTMLButtonElement | null)[]>([]);
  const navegarAbas = (event: KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const total = serviceProfiles.length;
    const destino = { ArrowRight: (indice + 1) % total, ArrowLeft: (indice - 1 + total) % total, Home: 0, End: total - 1 }[event.key];
    if (destino === undefined) return;
    event.preventDefault();
    escolherPerfil(serviceProfiles[destino].id);
    abas.current[destino]?.focus();
  };
  return (
    <section aria-labelledby="services-by-profile-title" className="py-2 sm:py-3">
      <div className="container-crfal">
        <Reveal className="section-panel">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]">Central de serviços</p>
            <h2 id="services-by-profile-title" className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[32px]">Como podemos ajudar você?</h2>
            <span aria-hidden="true" className="mt-3 block h-0.5 w-10 rounded-full bg-crfal-gold" />
          </div>
          <Link to="/servicos/requerimentos" className="group inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-crfal-blue rounded-md hover:text-crfal-blue-light focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4 sm:self-auto">
            Ver todos os requerimentos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
          </Link>
        </div>

        {/* Até 980px, um perfil por vez: as abas substituem os três painéis empilhados. */}
        <div role="tablist" aria-label="Serviços para" className="mb-4 grid grid-cols-3 gap-1 rounded-full bg-crfal-blue-lighter p-1 min-[981px]:hidden">
          {serviceProfiles.map((profile, indice) => {
            const ativo = profile.id === perfil;
            return (
              <button
                key={profile.id}
                ref={el => { abas.current[indice] = el; }}
                id={`services-tab-${profile.id}`}
                type="button"
                role="tab"
                aria-selected={ativo}
                aria-controls={`services-panel-${profile.id}`}
                tabIndex={ativo ? 0 : -1}
                onClick={() => escolherPerfil(profile.id)}
                onKeyDown={event => navegarAbas(event, indice)}
                className={`min-h-12 rounded-full px-2 text-[13px] font-semibold leading-tight transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2 motion-reduce:transition-none min-[400px]:text-[15px] ${ativo ? 'bg-crfal-blue text-white shadow-sm' : 'text-crfal-blue hover:bg-white/70'}`}
              >
                {profile.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 min-[981px]:grid-cols-3 min-[981px]:grid-rows-[auto_auto_1fr_auto] min-[981px]:gap-x-6 min-[981px]:gap-y-0">
          {serviceProfiles.map((profile, indice) => {
            const Icon = profile.icon;
            return (
              <Reveal
                key={profile.id}
                delay={indice * 80}
                id={`services-panel-${profile.id}`}
                role="tabpanel"
                aria-labelledby={`services-tab-${profile.id}`}
                style={{ backgroundImage: `linear-gradient(to top, rgb(11 25 44 / 0.55), rgb(11 25 44 / 0) 32%), url(/images/servicos-card-${profile.id}.webp)` }}
                className={`max-[980px]:[--reveal-delay:0ms]! relative isolate grid-rows-[auto_auto_auto_1fr] gap-0 overflow-hidden rounded-xl border-t-2 border-crfal-gold bg-crfal-blue-dark bg-cover bg-bottom bg-no-repeat p-6 text-white shadow-lg shadow-crfal-blue/10 sm:p-8 min-[981px]:row-span-4 min-[981px]:grid min-[981px]:grid-rows-subgrid ${profile.id === perfil ? 'grid' : 'hidden'}`}
              >
                <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-crfal-gold/40">
                      <Icon className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/82">Serviços para</span>
                      <h3 id={`services-${profile.id}`} className="mt-0.5 text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]">{profile.label}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/82">{profile.description}</p>

                  <ul className="mt-6 mb-6 self-start divide-y divide-white/15 border-y border-white/15">
                    {profile.services.map(service => {
                      const external = service.href.startsWith('https:');
                      const Arrow = external ? ArrowUpRight : ChevronRight;
                      const className = 'group -mx-3 flex min-h-12 items-center justify-between gap-3 rounded-md px-3 py-3 text-[15px] font-medium leading-snug transition-colors hover:bg-white/10 focus-visible:outline-white motion-reduce:transition-none';
                      const content = (
                        <>
                          <span>{service.label}</span>
                          <Arrow className="h-4 w-4 shrink-0 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-white motion-reduce:transition-none" aria-hidden="true" />
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

                <div className="self-end">
                  <Link
                    to={profile.href}
                    className="group inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#003366] shadow-sm transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-white motion-reduce:transition-none"
                  >
                    {profile.action}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
        </Reveal>
      </div>
    </section>
  );
}
