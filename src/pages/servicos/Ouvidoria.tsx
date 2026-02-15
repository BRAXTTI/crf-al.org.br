import { useState, useEffect, useRef } from 'react';
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

// Tipos de manifestação disponíveis
const tiposManifestacao = [
  {
    id: 'denuncia',
    label: 'Denúncia',
    description: 'Reporte de irregularidades ou condutas inadequadas',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    id: 'elogio',
    label: 'Elogio',
    description: 'Reconhecimento de atendimento ou serviço de qualidade',
    icon: ThumbsUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'critica',
    label: 'Crítica',
    description: 'Apontamento de falhas ou pontos a melhorar',
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'sugestao',
    label: 'Sugestão',
    description: 'Ideias para melhoria dos serviços',
    icon: Lightbulb,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    id: 'reclamacao',
    label: 'Reclamação',
    description: 'Insatisfação com produto ou serviço',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'solicitacao',
    label: 'Solicitação',
    description: 'Pedido de informação ou serviço',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'outros',
    label: 'Outros',
    description: 'Demais tipos de manifestação',
    icon: HelpCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
] as const;

// Schema de validação com Zod
const ouvidoriaSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(100, 'E-mail deve ter no máximo 100 caracteres'),
  telefone: z
    .string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),
  tipoManifestacao: z.enum([
    'denuncia',
    'elogio',
    'critica',
    'sugestao',
    'reclamacao',
    'solicitacao',
    'outros',
  ]),
  assunto: z
    .string()
    .min(5, 'Assunto deve ter pelo menos 5 caracteres')
    .max(150, 'Assunto deve ter no máximo 150 caracteres'),
  mensagem: z
    .string()
    .min(20, 'Mensagem deve ter pelo menos 20 caracteres')
    .max(2000, 'Mensagem deve ter no máximo 2000 caracteres'),
  lgpdConsentimento: z.boolean().refine((val) => val === true, {
    message: 'Você deve concordar com o uso dos dados para prosseguir',
  }),
});

type OuvidoriaFormData = z.infer<typeof ouvidoriaSchema>;

export default function Ouvidoria() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showLgpdModal, setShowLgpdModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const form = useForm<OuvidoriaFormData>({
    resolver: zodResolver(ouvidoriaSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      tipoManifestacao: undefined as unknown as 'denuncia',
      assunto: '',
      mensagem: '',
      lgpdConsentimento: false,
    },
  });

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

  // Atualiza o tipo selecionado quando muda no form
  useEffect(() => {
    const subscription = form.watch((value) => {
      setTipoSelecionado(value.tipoManifestacao as string);
      setCharCount(value.mensagem?.length || 0);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: OuvidoriaFormData) => {
    setIsSubmitting(true);
    
    // Simula o envio do formulário
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Aqui você implementaria a integração real com o backend
    // para enviar o email para ouvidoria@crf-al.org.br
    console.log('Dados enviados:', data);
    
    setIsSubmitting(false);
    setShowSuccessDialog(true);
    form.reset();
    setCharCount(0);
    setTipoSelecionado(null);
  };

  const tipoInfo = tiposManifestacao.find((t) => t.id === tipoSelecionado);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-white/60 text-xs sm:text-sm mb-4">
            <a href="/" className="hover:text-white transition-colors">
              Início
            </a>
            <ChevronRight className="w-4 h-4" />
            <span>Serviços</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Ouvidoria</span>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Ouvidoria
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Canal direto de comunicação com o CRF-AL. Registre suas manifestações
              de forma rápida, segura e transparente. Sua opinião é fundamental
              para melhorarmos nossos serviços.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-crfal py-10 md:py-16" ref={sectionRef}>
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Info */}
          <div className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-24">
              {/* Info Card */}
              <div
                className={`bg-white rounded-2xl border border-neutral-200 p-6 transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="w-12 h-12 bg-crfal-blue/10 rounded-xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-crfal-blue" />
                </div>
                <h3 className="font-bold text-neutral-800 mb-2">
                  Canal de Manifestações
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  A Ouvidoria é o canal adequado para registrar denúncias, elogios,
                  críticas, sugestões e reclamações sobre os serviços do CRF-AL.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-crfal-blue" />
                    <span className="text-neutral-600">
                      Prazo de resposta: <strong>até 10 dias úteis</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-crfal-blue" />
                    <span className="text-neutral-600">
                      ouvidoria@crf-al.org.br
                    </span>
                  </div>
                </div>
              </div>

              {/* Tipos de Manifestação */}
              <div
                className={`bg-white rounded-2xl border border-neutral-200 p-6 transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '100ms' }}
              >
                <h3 className="font-bold text-neutral-800 mb-4">
                  Tipos de Manifestação
                </h3>
                <div className="space-y-3">
                  {tiposManifestacao.map((tipo) => {
                    const Icon = tipo.icon;
                    return (
                      <div
                        key={tipo.id}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                          tipoSelecionado === tipo.id
                            ? `${tipo.bgColor} ${tipo.borderColor} border`
                            : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tipo.bgColor}`}
                        >
                          <Icon className={`w-4 h-4 ${tipo.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-neutral-800">
                            {tipo.label}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {tipo.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LGPD Card */}
              <div
                className={`bg-gradient-to-br from-crfal-blue-lighter to-white rounded-2xl border border-crfal-blue/10 p-6 transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-crfal-blue/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-crfal-blue" />
                  </div>
                  <h3 className="font-bold text-neutral-800">Sua Privacidade</h3>
                </div>
                <p className="text-sm text-neutral-600 mb-3">
                  Em conformidade com a LGPD, seus dados são tratados com segurança
                  e utilizados apenas para o atendimento da sua manifestação.
                </p>
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-sm text-crfal-blue hover:underline font-medium"
                >
                  Ver Política de Privacidade
                </button>
              </div>
            </div>
          </div>

          {/* Right Content - Form */}
          <div className="lg:col-span-8">
            <div
              className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-700 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '150ms' }}
            >
              {/* Form Header */}
              <div className="bg-gradient-to-r from-crfal-blue to-crfal-blue-dark p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      tipoInfo
                        ? tipoInfo.bgColor
                        : 'bg-white/20'
                    }`}
                  >
                    {tipoInfo ? (
                      <tipoInfo.icon
                        className={`w-7 h-7 ${tipoInfo.color}`}
                      />
                    ) : (
                      <MessageSquare className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      {tipoInfo ? tipoInfo.label : 'Nova Manifestação'}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {tipoInfo
                        ? tipoInfo.description
                        : 'Preencha o formulário abaixo para registrar sua manifestação'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 md:p-8">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Tipo de Manifestação */}
                    <FormField
                      control={form.control}
                      name="tipoManifestacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-neutral-800 font-medium">
                            Tipo de Manifestação *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 border-neutral-200 focus:ring-crfal-blue">
                                <SelectValue placeholder="Selecione o tipo de manifestação" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tiposManifestacao.map((tipo) => (
                                <SelectItem key={tipo.id} value={tipo.id}>
                                  <div className="flex items-center gap-2">
                                    <tipo.icon className={`w-4 h-4 ${tipo.color}`} />
                                    {tipo.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Dados Pessoais */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neutral-800 font-medium">
                              Nome Completo *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <Input
                                  placeholder="Digite seu nome completo"
                                  className="pl-10 h-12 border-neutral-200 focus:ring-crfal-blue"
                                  {...field}
                                />
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
                            <FormLabel className="text-neutral-800 font-medium">
                              E-mail *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <Input
                                  type="email"
                                  placeholder="seu@email.com"
                                  className="pl-10 h-12 border-neutral-200 focus:ring-crfal-blue"
                                  {...field}
                                />
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
                          <FormLabel className="text-neutral-800 font-medium">
                            Telefone (opcional)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                              <Input
                                type="tel"
                                placeholder="(82) 99999-9999"
                                className="pl-10 h-12 border-neutral-200 focus:ring-crfal-blue"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs text-neutral-500">
                            Informe se deseja ser contatado por telefone
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Assunto */}
                    <FormField
                      control={form.control}
                      name="assunto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-neutral-800 font-medium">
                            Assunto *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Resuma o motivo da sua manifestação"
                              className="h-12 border-neutral-200 focus:ring-crfal-blue"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Mensagem */}
                    <FormField
                      control={form.control}
                      name="mensagem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-neutral-800 font-medium">
                            Mensagem *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva sua manifestação com o máximo de detalhes possível..."
                              className="min-h-[180px] resize-none border-neutral-200 focus:ring-crfal-blue"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setCharCount(e.target.value.length);
                              }}
                            />
                          </FormControl>
                          <div className="flex justify-between items-center">
                            <FormDescription className="text-xs text-neutral-500">
                              Mínimo de 20 caracteres, máximo de 2000
                            </FormDescription>
                            <span
                              className={`text-xs ${
                                charCount > 2000
                                  ? 'text-red-500'
                                  : 'text-neutral-400'
                              }`}
                            >
                              {charCount}/2000
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* LGPD Consentimento */}
                    <div className="bg-crfal-blue-lighter rounded-xl p-4 border border-crfal-blue/10">
                      <FormField
                        control={form.control}
                        name="lgpdConsentimento"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-0.5 border-crfal-blue data-[state=checked]:bg-crfal-blue"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm text-neutral-700 font-normal cursor-pointer">
                                Li e concordo com o{' '}
                                <button
                                  type="button"
                                  onClick={() => setShowLgpdModal(true)}
                                  className="text-crfal-blue hover:underline font-medium"
                                >
                                  tratamento dos meus dados pessoais
                                </button>{' '}
                                para fins de atendimento desta manifestação,
                                conforme a Lei Geral de Proteção de Dados (LGPD).
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-12 bg-crfal-blue hover:bg-crfal-blue-dark text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Enviar Manifestação
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={isSubmitting}
                        className="h-12 px-6 border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-xl"
                      >
                        Limpar
                      </Button>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 justify-center">
                      <Lock className="w-4 h-4" />
                      <span>
                        Este formulário é protegido e seus dados são criptografados
                      </span>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Manifestação Enviada!
            </DialogTitle>
            <DialogDescription className="text-center">
              Sua manifestação foi registrada com sucesso e encaminhada para a
              Ouvidoria do CRF-AL. Você receberá um e-mail de confirmação em breve.
              <br />
              <br />
              <strong>Prazo de resposta:</strong> até 10 dias úteis.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="w-full bg-crfal-blue hover:bg-crfal-blue-dark"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* LGPD Modal */}
      <Dialog open={showLgpdModal} onOpenChange={setShowLgpdModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-crfal-blue" />
              Tratamento de Dados Pessoais
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-neutral-600">
            <p>
              O Conselho Regional de Farmácia de Alagoas (CRF-AL), inscrito no
              CNPJ sob o nº 03.483.952/0001-06, com sede na Rua Oldemburgo da
              Silva Paranhos, nº 290, Farol, Maceió/AL, CEP 57055-320, é o
              controlador dos dados pessoais coletados por meio deste formulário.
            </p>
            <h4 className="font-semibold text-neutral-800">
              Finalidade do Tratamento
            </h4>
            <p>
              Os dados pessoais coletados (nome, e-mail e telefone) serão
              utilizados exclusivamente para:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Identificação do manifestante</li>
              <li>Comunicação sobre o andamento da manifestação</li>
              <li>Envio de resposta à manifestação</li>
              <li>Geração de estatísticas internas (dados anonimizados)</li>
            </ul>
            <h4 className="font-semibold text-neutral-800">
              Base Legal
            </h4>
            <p>
              O tratamento de dados é realizado com base no art. 7º, inciso V, da
              Lei nº 13.709/2018 (LGPD), que autoriza o tratamento para o
              exercício regular de direitos em processo judicial, administrativo
              ou arbitral.
            </p>
            <h4 className="font-semibold text-neutral-800">
              Seus Direitos
            </h4>
            <p>Você tem direito a:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Confirmar a existência de tratamento de seus dados</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar anonimização, bloqueio ou eliminação de dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
            <p>
              Para exercer seus direitos, entre em contato pelo e-mail:{' '}
              <a
                href="mailto:ouvidoria@crf-al.org.br"
                className="text-crfal-blue hover:underline"
              >
                ouvidoria@crf-al.org.br
              </a>
            </p>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => setShowLgpdModal(false)}
              className="w-full bg-crfal-blue hover:bg-crfal-blue-dark"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-crfal-blue" />
              Política de Privacidade
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-neutral-600">
            <p>
              O CRF-AL valoriza a privacidade de seus usuários e está comprometido
              com a proteção dos dados pessoais em conformidade com a Lei Geral de
              Proteção de Dados (LGPD - Lei 13.709/2018).
            </p>
            <h4 className="font-semibold text-neutral-800">
              1. Coleta de Dados
            </h4>
            <p>
              Coletamos apenas os dados necessários para o atendimento adequado de
              sua manifestação: nome, e-mail, telefone (opcional) e conteúdo da
              manifestação.
            </p>
            <h4 className="font-semibold text-neutral-800">
              2. Uso dos Dados
            </h4>
            <p>
              Seus dados são utilizados exclusivamente para processar e responder
              sua manifestação. Não utilizamos seus dados para fins de marketing
              nem os compartilhamos com terceiros sem sua autorização.
            </p>
            <h4 className="font-semibold text-neutral-800">
              3. Segurança
            </h4>
            <p>
              Implementamos medidas técnicas e administrativas adequadas para
              proteger seus dados contra acesso não autorizado, perda, destruição
              ou vazamento.
            </p>
            <h4 className="font-semibold text-neutral-800">
              4. Retenção
            </h4>
            <p>
              Mantemos seus dados pelo período necessário para cumprimento de
              obrigações legais e regulatórias, ou conforme determinado pela
              legislação aplicável.
            </p>
            <h4 className="font-semibold text-neutral-800">
              5. Contato
            </h4>
            <p>
              Em caso de dúvidas sobre esta política, entre em contato pelo
              e-mail:{' '}
              <a
                href="mailto:ouvidoria@crf-al.org.br"
                className="text-crfal-blue hover:underline"
              >
                ouvidoria@crf-al.org.br
              </a>
            </p>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full bg-crfal-blue hover:bg-crfal-blue-dark"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
