import { useState, useEffect, useRef } from 'react';
import SEO from '@/components/SEO';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  FileText,
  HelpCircle,
  Send,
  User,
  Mail,
  Phone,
  CheckCircle,
  Shield,
  AlertCircle,
  Clock,
  Lock,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const manifestationTypes = [
  { id: 'denuncia', label: 'Denúncia', icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/25' },
  { id: 'elogio', label: 'Elogio', icon: ThumbsUp, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/25' },
  { id: 'critica', label: 'Crítica', icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/25' },
  { id: 'sugestao', label: 'Sugestão', icon: Lightbulb, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/25' },
  { id: 'reclamacao', label: 'Reclamação', icon: MessageSquare, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/25' },
  { id: 'solicitacao', label: 'Solicitação', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/25' },
  { id: 'outros', label: 'Outros', icon: HelpCircle, color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-900/25' },
] as const;

const faqs = [
  { q: 'Quanto tempo leva para receber uma resposta?', a: 'O prazo médio de resposta é de até 10 dias úteis a partir do registro da manifestação.' },
  { q: 'Posso fazer uma denúncia anônima?', a: 'Sim. Para denúncias anônimas, você pode deixar os campos de identificação em branco, informando apenas os detalhes da denúncia.' },
  { q: 'Como acompanho o status da minha manifestação?', a: 'Após o envio, você receberá um e-mail de confirmação com um número de protocolo para acompanhamento.' },
];

const ombudsmanSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('E-mail inválido').max(100, 'E-mail deve ter no máximo 100 caracteres'),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional().or(z.literal('')),
  tipoManifestacao: z.enum(['denuncia', 'elogio', 'critica', 'sugestao', 'reclamacao', 'solicitacao', 'outros']),
  assunto: z.string().min(5, 'Assunto deve ter pelo menos 5 caracteres').max(150, 'Assunto deve ter no máximo 150 caracteres'),
  mensagem: z.string().min(20, 'Mensagem deve ter pelo menos 20 caracteres').max(2000, 'Mensagem deve ter no máximo 2000 caracteres'),
  lgpdConsentimento: z.boolean().refine((val) => val === true, { message: 'Você deve concordar com o uso dos dados para prosseguir' }),
});

type OmbudsmanFormData = z.infer<typeof ombudsmanSchema>;

export default function OmbudsmanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showLgpdModal, setShowLgpdModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const form = useForm<OmbudsmanFormData>({
    resolver: zodResolver(ombudsmanSchema),
    defaultValues: {
      nome: '', email: '', telefone: '', tipoManifestacao: undefined as unknown as 'denuncia',
      assunto: '', mensagem: '', lgpdConsentimento: false,
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setSelectedType(value.tipoManifestacao as string);
      setCharCount(value.mensagem?.length || 0);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: OmbudsmanFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Dados enviados:', data);
    setIsSubmitting(false);
    setShowSuccessDialog(true);
    form.reset();
    setCharCount(0);
    setSelectedType(null);
  };

  const typeInfo = manifestationTypes.find((t) => t.id === selectedType);

  return (
    <div className="min-h-screen bg-crfal-gray-50 dark:bg-slate-950">
      <SEO
        title="Ouvidoria"
        description="Ouvidoria do CRFAL — canal oficial para reclamações, sugestões, elogios e denúncias. Manifeste-se e contribua para a melhoria dos serviços farmacêuticos em Alagoas."
        path="/servicos/ouvidoria"
      />

      <div className="relative overflow-hidden bg-crfal-blue-dark pb-16 pt-24 md:pb-20 md:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-crfal-blue-dark via-crfal-blue/90 to-crfal-blue-dark" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '56px 56px' }} aria-hidden />

        <div className="container-crfal relative z-10">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/60 sm:text-sm" aria-label="Breadcrumb">
            <a href="/" className="transition-colors hover:text-white">Início</a>
            <ChevronRight className="h-4 w-4" />
            <span>Serviços</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Ouvidoria</span>
          </nav>

          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
            <MessageSquare className="h-3.5 w-3.5" />
            Canal de Manifestações
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.3)] sm:text-4xl md:text-5xl">
            Ouvidoria
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Sua voz é essencial para aprimorarmos nossos serviços. Registre denúncias, elogios, críticas, sugestões e reclamações de forma segura e transparente.
          </p>
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16" ref={sectionRef}>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-28">
              <div className={`transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <button
                  onClick={() => setMobileInfoOpen(!mobileInfoOpen)}
                  className="flex w-full items-center justify-between rounded-xl border border-crfal-gray-200 bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-crfal-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 lg:cursor-default lg:pointer-events-none"
                >
                  <span className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-crfal-blue dark:text-crfal-blue-light" />
                    <span className="text-sm font-semibold text-neutral-800 dark:text-white">Informações</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-crfal-gray-400 transition-transform duration-300 lg:hidden ${mobileInfoOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`mt-3 overflow-hidden transition-all duration-300 lg:mt-0 lg:block ${mobileInfoOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'}`}>
                  <div className="space-y-4 lg:space-y-5">
                    <div className="rounded-xl border border-crfal-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue dark:bg-slate-800 dark:text-crfal-blue-light">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800 dark:text-white">Prazo de resposta</p>
                          <p className="text-xs text-crfal-gray-500 dark:text-crfal-gray-400">Até 10 dias úteis</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 border-t border-crfal-gray-100 pt-4 dark:border-slate-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue dark:bg-slate-800 dark:text-crfal-blue-light">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800 dark:text-white">E-mail</p>
                          <a href="mailto:ouvidoria@crf-al.org.br" className="text-xs text-crfal-blue hover:underline dark:text-crfal-blue-light">ouvidoria@crf-al.org.br</a>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-crfal-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="mb-3 text-sm font-semibold text-neutral-800 dark:text-white">Tipos de Manifestação</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {manifestationTypes.map((type) => (
                          <div key={type.id} className={`rounded-lg px-3 py-2 text-center ${type.bgColor}`}>
                            <type.icon className={`mx-auto mb-1 h-4 w-4 ${type.color}`} />
                            <p className={`text-[11px] font-medium ${type.color}`}>{type.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-crfal-blue/15 bg-crfal-blue-lighter/50 p-5 dark:border-crfal-blue/25 dark:bg-crfal-blue/10">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-crfal-blue text-white">
                          <Shield className="h-4.5 w-4.5" />
                        </div>
                        <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">Sua Privacidade</h3>
                      </div>
                      <p className="mb-3 text-xs leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400">
                        Em conformidade com a LGPD, seus dados são tratados com segurança e utilizados apenas para o atendimento da sua manifestação.
                      </p>
                      <button onClick={() => setShowPrivacyModal(true)} className="text-xs font-medium text-crfal-blue hover:underline dark:text-crfal-blue-light">
                        Ver Política de Privacidade
                      </button>
                    </div>

                    <div className="rounded-xl border border-crfal-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-crfal-blue dark:text-crfal-blue-light" />
                        <div>
                          <p className="text-sm font-semibold text-neutral-800 dark:text-white">Endereço</p>
                          <p className="text-xs text-crfal-gray-500 dark:text-crfal-gray-400">Rua Oldemburgo da Silva Paranhos, 290 — Farol, Maceió/AL</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className={`overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-sm transition-all duration-700 dark:border-slate-700 dark:bg-slate-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="border-b border-crfal-gray-100 bg-gradient-to-r from-crfal-blue/5 to-transparent px-6 py-5 dark:border-slate-800 dark:from-crfal-blue/10">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeInfo ? typeInfo.bgColor : 'bg-crfal-gray-100 dark:bg-slate-800'}`}>
                    {typeInfo ? (
                      <typeInfo.icon className={`h-6 w-6 ${typeInfo.color}`} />
                    ) : (
                      <MessageSquare className="h-6 w-6 text-crfal-gray-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-800 dark:text-white md:text-xl">
                      {typeInfo ? typeInfo.label : 'Nova Manifestação'}
                    </h2>
                    <p className="text-sm text-crfal-gray-500 dark:text-crfal-gray-400">
                      {typeInfo ? 'Preencha os dados abaixo' : 'Selecione o tipo e preencha os dados abaixo'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="tipoManifestacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-neutral-800 dark:text-white">Tipo de Manifestação *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-crfal-gray-200 bg-crfal-gray-50 focus:ring-crfal-blue dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {manifestationTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  <div className="flex items-center gap-2">
                                    <type.icon className={`h-4 w-4 ${type.color}`} />
                                    {type.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-neutral-800 dark:text-white">Nome Completo *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-crfal-gray-400" />
                                <Input placeholder="Seu nome completo" className="h-12 border-crfal-gray-200 bg-crfal-gray-50 pl-10 focus:ring-crfal-blue dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-crfal-gray-500" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-neutral-800 dark:text-white">E-mail *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-crfal-gray-400" />
                                <Input type="email" placeholder="seu@email.com" className="h-12 border-crfal-gray-200 bg-crfal-gray-50 pl-10 focus:ring-crfal-blue dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-crfal-gray-500" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-neutral-800 dark:text-white">Telefone (opcional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-crfal-gray-400" />
                              <Input type="tel" placeholder="(82) 99999-9999" className="h-12 border-crfal-gray-200 bg-crfal-gray-50 pl-10 focus:ring-crfal-blue dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-crfal-gray-500" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs text-crfal-gray-500 dark:text-crfal-gray-400">Informe se deseja ser contatado por telefone</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assunto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-neutral-800 dark:text-white">Assunto *</FormLabel>
                          <FormControl>
                            <Input placeholder="Resumo do motivo" className="h-12 border-crfal-gray-200 bg-crfal-gray-50 focus:ring-crfal-blue dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-crfal-gray-500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mensagem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-neutral-800 dark:text-white">Mensagem *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descreva sua manifestação com detalhes..." className="min-h-[180px] resize-none border-crfal-gray-200 bg-crfal-gray-50 focus:ring-crfal-blue dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-crfal-gray-500" {...field} onChange={(e) => { field.onChange(e); setCharCount(e.target.value.length); }} />
                          </FormControl>
                          <div className="flex justify-between items-center">
                            <FormDescription className="text-xs text-crfal-gray-500 dark:text-crfal-gray-400">Mínimo de 20 caracteres</FormDescription>
                            <span className={`text-xs ${charCount > 2000 ? 'text-red-500' : 'text-crfal-gray-400'}`}>{charCount}/2000</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-lg border border-crfal-blue/15 bg-crfal-blue-lighter/50 p-4 dark:border-crfal-blue/25 dark:bg-crfal-blue/10">
                      <FormField
                        control={form.control}
                        name="lgpdConsentimento"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5 border-crfal-blue data-[state=checked]:bg-crfal-blue" />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="cursor-pointer text-sm font-normal text-neutral-700 dark:text-neutral-300">
                                Li e concordo com o{' '}
                                <button type="button" onClick={() => setShowLgpdModal(true)} className="font-medium text-crfal-blue hover:underline dark:text-crfal-blue-light">
                                  tratamento dos meus dados pessoais
                                </button>{' '}
                                conforme a LGPD.
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button type="submit" disabled={isSubmitting} className="h-12 flex-1 rounded-lg bg-crfal-blue font-medium text-white transition-all hover:bg-crfal-blue-dark disabled:opacity-50">
                        {isSubmitting ? (
                          <>
                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Enviar Manifestação
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting} className="h-12 rounded-lg border-crfal-gray-200 px-6 text-crfal-gray-600 hover:bg-crfal-gray-50 dark:border-slate-700 dark:text-crfal-gray-400 dark:hover:bg-slate-800">
                        Limpar
                      </Button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-crfal-gray-500 dark:text-crfal-gray-400">
                      <Lock className="h-4 w-4" />
                      <span>Formulário protegido — seus dados são criptografados</span>
                    </div>
                  </form>
                </Form>
              </div>
            </div>

            <div className={`mt-8 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
              <div className="rounded-xl border border-crfal-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-neutral-800 dark:text-white">
                  <HelpCircle className="h-5 w-5 text-crfal-blue dark:text-crfal-blue-light" />
                  Perguntas Frequentes
                </h3>
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div key={faq.q} className="rounded-lg bg-crfal-gray-50 p-4 dark:bg-slate-800/50">
                      <p className="text-sm font-semibold text-neutral-800 dark:text-white">{faq.q}</p>
                      <p className="mt-1 text-sm text-crfal-gray-600 dark:text-crfal-gray-400">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-center text-xl">Manifestação Enviada!</DialogTitle>
            <DialogDescription className="text-center">
              Sua manifestação foi registrada com sucesso e encaminhada para a Ouvidoria do CRF-AL.
              <br /><br />
              <strong>Prazo de resposta:</strong> até 10 dias úteis.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full bg-crfal-blue hover:bg-crfal-blue-dark">Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLgpdModal} onOpenChange={setShowLgpdModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-crfal-blue" />Tratamento de Dados Pessoais</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-crfal-gray-600 dark:text-crfal-gray-400">
            <p>O CRF-AL, inscrito no CNPJ sob o nº 03.483.952/0001-06, com sede na Rua Oldemburgo da Silva Paranhos, nº 290, Farol, Maceió/AL, é o controlador dos dados pessoais coletados por meio deste formulário.</p>
            <h4 className="font-semibold text-neutral-800 dark:text-white">Finalidade</h4>
            <p>Os dados coletados serão utilizados exclusivamente para identificação do manifestante, comunicação sobre o andamento e envio de resposta à manifestação.</p>
            <h4 className="font-semibold text-neutral-800 dark:text-white">Base Legal</h4>
            <p>Art. 7º, inciso V, da Lei nº 13.709/2018 (LGPD).</p>
            <h4 className="font-semibold text-neutral-800 dark:text-white">Seus Direitos</h4>
            <p>Você tem direito a confirmar, acessar, corrigir e solicitar a eliminação de seus dados. Para exercê-los, contate ouvidoria@crf-al.org.br.</p>
          </div>
          <div className="mt-4"><Button onClick={() => setShowLgpdModal(false)} className="w-full bg-crfal-blue hover:bg-crfal-blue-dark">Entendi</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-crfal-blue" />Política de Privacidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-crfal-gray-600 dark:text-crfal-gray-400">
            <p>O CRF-AL está comprometido com a proteção dos dados pessoais em conformidade com a LGPD (Lei 13.709/2018).</p>
            <h4 className="font-semibold text-neutral-800 dark:text-white">Coleta</h4>
            <p>Coletamos apenas os dados necessários para o atendimento da manifestação.</p>
            <h4 className="font-semibold text-neutral-800 dark:text-white">Uso</h4>
            <p>Seus dados são utilizados exclusivamente para processar e responder sua manifestação.</p>
            <h4 className="font-semibold text-neutral-800 dark:text-white">Segurança</h4>
            <p>Implementamos medidas técnicas adequadas para proteger seus dados.</p>
          </div>
          <div className="mt-4"><Button onClick={() => setShowPrivacyModal(false)} className="w-full bg-crfal-blue hover:bg-crfal-blue-dark">Fechar</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
