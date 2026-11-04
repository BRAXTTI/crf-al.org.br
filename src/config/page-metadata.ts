/** Shared by React and Pages Functions so initial HTML and navigation agree. */
export const PAGE_METADATA: Record<string, { title: string; description: string }> = {
  "/": {
    "title": "Conselho Regional de Farmácia do Estado de Alagoas",
    "description": "CRFAL — Conselho Regional de Farmácia do Estado de Alagoas. Fiscalização, registros, serviços e informações para profissionais e estabelecimentos farmacêuticos em Alagoas."
  },
  "/instituicao": {
    "title": "Institucional",
    "description": "Conheça o CRFAL — história, missão, visão, valores, diretoria e estatuto do Conselho Regional de Farmácia do Estado de Alagoas."
  },
  "/instituicao/sobre-conselho": {
    "title": "Sobre o Conselho",
    "description": "Conheça a história e a trajetória do CRFAL — Conselho Regional de Farmácia do Estado de Alagoas, suas atribuições e papel na saúde pública alagoana."
  },
  "/instituicao/diretoria": {
    "title": "Diretoria",
    "description": "Conheça a diretoria e os membros do Conselho Regional de Farmácia do Estado de Alagoas (CRFAL) — gestão atual e suas responsabilidades."
  },
  "/instituicao/plenarias": {
    "title": "Plenárias",
    "description": "Acompanhe a agenda das reuniões plenárias do CRF-AL e consulte as pautas, atas e transmissões disponibilizadas pelo Conselho."
  },
  "/politica-de-privacidade": {
    "title": "Política de Privacidade",
    "description": "Política de Privacidade do CRFAL — saiba como tratamos seus dados pessoais em conformidade com a LGPD."
  },
  "/termos-de-uso": {
    "title": "Termos de Uso",
    "description": "Termos de Uso do site CRFAL — condições gerais de uso do portal do Conselho Regional de Farmácia do Estado de Alagoas."
  },
  "/servicos/requerimentos": {
    "title": "Requerimentos",
    "description": "Acesse todos os requerimentos do CRFAL para pessoa física e jurídica — registro, renovação, certidões e muito mais para profissionais farmacêuticos em Alagoas."
  },
  "/servicos/requerimentos/primeira-inscricao-profissional-provisoria": {
    "title": "Primeira Inscrição Profissional (Provisória)",
    "description": "Serviço realizado pelo CRF AL em Casa para primeira inscrição profissional provisória — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/inscricao-profissional-definitiva": {
    "title": "Inscrição Definitiva",
    "description": "Serviço realizado pelo CRF AL em Casa para inscrição profissional definitiva — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/inscricao-secundaria-transferencia-reativacao": {
    "title": "Inscrição Secundária, Transferência e Reativação",
    "description": "Requerimento profissional para serviços de inscrição secundária, transferência e reativação — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/prorrogacao-inscricao-provisoria": {
    "title": "Prorrogação de Inscrição Provisória",
    "description": "Solicitação de prorrogação da inscrição provisória — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/carteira-definitiva-segunda-via": {
    "title": "Carteira Profissional Definitiva ou Segunda Via",
    "description": "Requerimento para carteira definitiva e emissão de segunda via — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/certidao-regularidade-pf": {
    "title": "Certidão de Regularidade",
    "description": "Emissão de certidão de regularidade do profissional — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/transferencia-outro-regional": {
    "title": "Transferência para Outro Regional",
    "description": "Solicitação de transferência do registro para outro CRF — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/cancelamento-inscricao": {
    "title": "Cancelamento de Inscrição",
    "description": "Solicitação de cancelamento de inscrição profissional — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/registro-novo-pj": {
    "title": "Registro Inicial - Pessoa Jurídica",
    "description": "Solicitação de registro inicial para pessoa jurídica no CRF-AL — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/registro-inicial-servico-publico": {
    "title": "Registro Inicial - Serviço Público",
    "description": "Solicitação de registro inicial para estabelecimento público — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/registro-posto-medicamentos": {
    "title": "Registro de Postos de Medicamentos",
    "description": "Registro específico para posto de medicamentos — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/contratacao-rt-pj": {
    "title": "Contratação de Responsável Técnico - Pessoa Jurídica",
    "description": "Contratação de farmacêutico responsável técnico para empresa privada — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/contratacao-rt-servico-publico": {
    "title": "Contratação de Responsável Técnico - Serviço Público",
    "description": "Contratação de responsável técnico para estabelecimento público — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/contratacao-rt-plantonista": {
    "title": "Contratação de RT Plantonista 12x36 + DOA",
    "description": "Contratação de RT no regime de plantão 12x36 — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/alteracao-horarios": {
    "title": "Alteração de Horários de Funcionamento e Assistência Farmacêutica",
    "description": "Atualização de horários do estabelecimento e assistência farmacêutica — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/transferencia-matriz-filiais": {
    "title": "Transferência entre Matriz e Filiais",
    "description": "Transferência de farmacêutico entre matriz e filiais — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/alteracao-contratual-firma": {
    "title": "Alteração Contratual de Firma",
    "description": "Atualização de dados contratuais da empresa perante o CRF-AL — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/dap": {
    "title": "Declaração de Atividade Profissional (DAP)",
    "description": "Solicitação de DAP para fins de comprovação de atividade profissional — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/defesa-auto-infracao": {
    "title": "Defesa ao Auto de Infração",
    "description": "Protocolo de defesa administrativa para auto de infração — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/recurso-multa-fiscal": {
    "title": "Recurso de Multa Fiscal",
    "description": "Recurso administrativo contra multa fiscal homologada — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/requerimentos/reconsideracao-indeferimento": {
    "title": "Reconsideração de Indeferimento",
    "description": "Pedido de revisão de decisão de indeferimento — veja o passo a passo e os documentos no site do CRF-AL."
  },
  "/servicos/tutoriais": {
    "title": "Tutoriais",
    "description": "Veja em vídeo e siga os passos das tarefas do CRF AL em Casa: inscrição, responsabilidade técnica, boletos, certidão de regularidade técnica (CRT) e mais."
  },
  "/servicos/tutoriais/primeira-inscricao": {
    "title": "Fazer a primeira inscrição",
    "description": "Veja como fazer a primeira inscrição (provisória) de farmacêutico no CRF-AL pelo CRF AL em Casa: documentos, passos e o que acontece depois."
  },
  "/servicos/tutoriais/inscricao-definitiva": {
    "title": "Pedir a inscrição definitiva",
    "description": "Veja como pedir a inscrição definitiva e a carteira profissional pelo CRF AL em Casa: documentos e passo a passo."
  },
  "/servicos/tutoriais/alteracao-de-dados": {
    "title": "Alterar meus dados",
    "description": "Veja como atualizar os dados do seu cadastro profissional pelo CRF AL em Casa, em poucos passos."
  },
  "/servicos/tutoriais/contratacao-rt": {
    "title": "Contratar responsável técnico (RT)",
    "description": "Veja como a empresa vincula um farmacêutico como responsável técnico pelo CRF AL em Casa."
  },
  "/servicos/tutoriais/baixa-rt": {
    "title": "Dar baixa de RT",
    "description": "Veja em vídeo como dar baixa de responsabilidade técnica pelo CRF AL em Casa ao encerrar o vínculo com o estabelecimento."
  },
  "/servicos/tutoriais/consulta-rt": {
    "title": "Consultar meus vínculos de RT",
    "description": "Veja como consultar seus vínculos de responsabilidade técnica ativos pelo CRF AL em Casa."
  },
  "/servicos/tutoriais/afastamento-provisorio": {
    "title": "Comunicar afastamento",
    "description": "Veja como comunicar o afastamento provisório pelo CRF AL em Casa: dados, comprovante e passo a passo."
  },
  "/servicos/tutoriais/justificativa-de-ausencia": {
    "title": "Justificar ausência",
    "description": "Veja como justificar pelo CRF AL em Casa uma ausência identificada em inspeção da fiscalização."
  },
  "/servicos/tutoriais/defesa-auto-infracao": {
    "title": "Defender auto de infração",
    "description": "Veja como a empresa apresenta a defesa de um auto de infração pelo CRF AL em Casa."
  },
  "/servicos/tutoriais/situacao-protocolos": {
    "title": "Acompanhar meu protocolo",
    "description": "Veja em vídeo como acompanhar seu protocolo e responder a pendências no CRF AL em Casa."
  },
  "/servicos/tutoriais/emitir-boletos": {
    "title": "Emitir boleto",
    "description": "Veja em vídeo como emitir o boleto da anuidade do ano no CRF AL em Casa, sem login, e onde encontrar parcelamentos e acordos."
  },
  "/servicos/tutoriais/imprimir-crt": {
    "title": "Imprimir a certidão (CRT)",
    "description": "Veja em vídeo como imprimir a Certidão de Regularidade Técnica (CRT) pelo CRF AL em Casa."
  },
  "/servicos/manual-crf-em-casa": {
    "title": "Manual do CRF AL em Casa",
    "description": "Manual de uso do CRF AL em Casa — aprenda com demonstrações a acessar o sistema, enviar documentos, acompanhar protocolos, emitir boletos, solicitar baixa de responsabilidade técnica e imprimir a certidão de regularidade."
  },
  "/servicos/ouvidoria": {
    "title": "Ouvidoria",
    "description": "Ouvidoria do CRFAL — canal oficial para reclamações, sugestões, elogios e denúncias, atendido pelo Portal da Transparência da Implanta. Manifeste-se e contribua para a melhoria dos serviços farmacêuticos em Alagoas."
  },
  "/imprensa/noticias": {
    "title": "Notícias",
    "description": "Fique por dentro das últimas notícias e comunicados do CRFAL — Conselho Regional de Farmácia do Estado de Alagoas."
  },
  "/imprensa/publicacoes-cff": {
    "title": "Publicações do CFF",
    "description": "Publicações do Conselho Federal de Farmácia (CFF): revista Pharmacia Brasileira, guias de prática clínica, notas técnicas, relatórios e materiais de orientação, com acesso direto ao site do CFF."
  },
  "/imprensa/galeria-de-fotos": {
    "title": "Galeria de Fotos",
    "description": "Registros fotográficos dos eventos, encontros e ações do Conselho Regional de Farmácia de Alagoas."
  },
  "/acesso-a-informacao": { title: "Acesso à Informação", description: "Acesso ao Portal da Transparência, e-SIC e informações públicas do CRF-AL." },
  "/acessibilidade": { title: "Acessibilidade", description: "Recursos de navegação por teclado e acessibilidade do portal CRF-AL." },
  "/contato": {
    "title": "Contato",
    "description": "Entre em contato com o CRFAL — Conselho Regional de Farmácia do Estado de Alagoas. Fale com nossos setores por e-mail, telefone ou WhatsApp."
  },
  "/fiscalizacao": {
    "title": "Fiscalização",
    "description": "Saiba como o CRFAL fiscaliza o exercício profissional farmacêutico em Alagoas — procedimentos, atuações, penalidades e base legal."
  },
  "/fiscalizacao/papel-da-fiscalizacao": {
    "title": "Papel da Fiscalização",
    "description": "Entenda o papel da fiscalização do CRFAL — objetivos, base normativa e medidas adotadas para garantir o exercício ético e legal da farmácia em Alagoas."
  },
  "/fiscalizacao/instrumentos-da-fiscalizacao": {
    "title": "Instrumentos de Fiscalização",
    "description": "Conheça os instrumentos formais utilizados pelo CRFAL na fiscalização do exercício farmacêutico em Alagoas — autos, termos e notificações."
  },
  "/fiscalizacao/plano-de-fiscalizacao-anual": {
    "title": "Plano de Fiscalização Anual",
    "description": "Acesse o Plano de Fiscalização Anual (PFA) do CRFAL — documento estratégico que orienta as atividades de fiscalização farmacêutica em Alagoas."
  },
  "/fiscalizacao/relatorios": {
    "title": "Relatórios de Fiscalização",
    "description": "Acesse os Relatórios de Fiscalização Anual (RFA) do CRFAL — resultados e execução das atividades de fiscalização farmacêutica em Alagoas."
  },
  "/fiscalizacao/processo-administrativo-fiscal": {
    "title": "Processo Administrativo Fiscal",
    "description": "Entenda o Processo Administrativo Fiscal do CRFAL — rito processual, defesa, multas e penalidades para infrações à legislação farmacêutica em Alagoas."
  },
  "/fiscalizacao/afastamento-provisorio": {
    "title": "Afastamento Provisório",
    "description": "Saiba como comunicar o afastamento provisório do farmacêutico ao CRF-AL pelo CRF AL em Casa — passo a passo, comprovante e acompanhamento do protocolo."
  },
  "/legislacao": {
    "title": "Legislação",
    "description": "Consulte a legislação farmacêutica aplicável ao exercício profissional e à fiscalização do CRFAL em Alagoas — leis, resoluções e atos normativos."
  },
  "/eventos": {
    "title": "Eventos",
    "description": "Confira a agenda de eventos do CRF-AL — Conselho Regional de Farmácia do Estado de Alagoas. Congressos, palestras, capacitações e ações sociais."
  }
};
