import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { serviceProfiles } from '@/config/service-profiles';

export default function ServiceProfiles() {
  return (
    <section aria-labelledby="services-by-profile-title" className="py-10 sm:py-14">
      <div className="container-crfal">
        <h2 id="services-by-profile-title" className="sr-only">Serviços por perfil</h2>
        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          {serviceProfiles.map(profile => {
            const Icon = profile.icon;
            return (
              <nav key={profile.id} aria-labelledby={`services-${profile.id}`} className="flex flex-col rounded-xl bg-crfal-blue p-6 text-white sm:p-8">
                <div className="mb-6 flex items-center gap-4">
                  <Icon className="h-11 w-11 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-white/80">Serviços para</span>
                    <h3 id={`services-${profile.id}`} className="mt-1 text-2xl font-bold leading-tight">{profile.label}</h3>
                  </div>
                </div>
                <ul className="mb-7 divide-y divide-white/20 border-y border-white/20">
                  {profile.services.map(service => {
                    const external = service.href.startsWith('https:');
                    const className = 'group flex min-h-12 items-center justify-between gap-3 rounded-sm py-3 text-sm leading-relaxed transition-colors hover:bg-white/10 focus-visible:outline-white motion-reduce:transition-none';
                    const content = <><span>{service.label}</span>{external ? <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /> : <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />}{external && <span className="sr-only">Abre em uma nova aba.</span>}</>;
                    return <li key={service.href}>{external ? <a href={service.href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a> : <Link to={service.href} className={className}>{content}</Link>}</li>;
                  })}
                </ul>
                <Link to={profile.href} className="mt-auto inline-flex min-h-11 self-start items-center justify-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-white motion-reduce:transition-none">
                  {profile.action}<ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </nav>
            );
          })}
        </div>
      </div>
    </section>
  );
}
