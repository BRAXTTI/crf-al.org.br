# Página de Plenárias

Rota: `/instituicao/plenarias`, acessível pelo menu Instituição no desktop, menu mobile e busca do cabeçalho.

A referência do CRF/MG foi usada para a organização: agenda anual, meses, data, horário, local, pauta e transmissão. Nenhuma reunião ou documento de Minas Gerais foi incorporado à agenda de Alagoas.

## Atualização da agenda

`src/config/plenarias.ts` centraliza os anos e as reuniões. A agenda de 2026 traz doze reuniões ordinárias (1ª a 12ª: 16/01, 20/02, 20/03, 17/04, 15/05, 19/06, 17/07, 21/08, 25/09, 16/10, 13/11 e 18/12) e uma extraordinária (13/04). A 9ª foi em 25/09, não em 18/09; o vídeo da 8ª (21/08) diz “Extraordinária” no YouTube, mas a numeração a confirma como ordinária. Gravações do canal do CRF-AL estão em `videoUrls` (uma URL por parte; na 2ª, usada a gravação original, não a cópia reenviada). Reuniões cuja gravação dura poucos minutos (3ª, extraordinária de 13/04, 6ª, 7ª e 8ª) têm `noQuorum: true`: não ocorreram por falta de quórum. Horário e local ainda não foram informados e, por isso, não aparecem; incluí-los em `time` e `location` quando confirmados. Não criar links fictícios para pautas, atas ou transmissões.

Cada ano tem `year`, `meetings` e, opcionalmente, `calendarUrl` (arquivo da agenda anual) e `isDemo` (aviso de dados demonstrativos). Cada reunião tem `id` único, `title`, `date` em `YYYY-MM-DD` e, opcionalmente, `time`, `location`, `agendaUrl` (PDF da pauta do dia), `minutesUrl` (PDF da ata assinada), `videoUrls` (gravações, em partes) e `noQuorum`. Datas são locais; não converter datas sem horário para UTC.

A página ordena os anos do mais recente para o mais antigo e as reuniões por data e horário. O ano escolhido fica em `?ano=2026`, permitindo compartilhar e restaurar a seleção. Ausência de um link não gera botão fictício: o espaço do documento mostra apenas a situação. Usar URLs HTTPS de documentos públicos; não cadastrar documentos restritos nem links administrativos.

Esta versão é mantida no projeto e requer novo build para atualizar a agenda. Publicações de eventos no WordPress não entram automaticamente nesta página; uma integração editorial específica pode ser adicionada após definir a origem e os campos das plenárias.

## Navegação e apresentação

A data de hoje é calculada no fuso de Maceió. Ordem: destaque “Próxima reunião” em gradiente azul com fio dourado (data, contagem “Hoje/Amanhã/Em N dias” e botão “Ver pauta do dia” quando a pauta existir; senão, “Pauta a divulgar”); barra do calendário com seleção do ano; grupos “Próximas reuniões” (da mais próxima para a mais distante) e “Reuniões anteriores” (da mais recente para a mais antiga). Cada reunião é uma linha com bloco de data, selo de situação (Agendada, Hoje, Realizada, Sem quórum, este em âmbar com a frase “Não realizada por falta de quórum.”), dia da semana, título, horário e local quando cadastrados, links “Assistir” (ou “Assistir parte N”) para o YouTube, e dois espaços fixos de documento: “Pauta do dia” e “Ata assinada”. Com link, o espaço vira botão azul que abre o PDF em nova aba; sem link, fica tracejado com a situação: pauta “A divulgar” (futura) ou “Não publicada” (realizada), ata “Após a reunião” (futura), “Aguardando publicação” (realizada) ou “Não se aplica” (sem quórum). Lateral “Resumo do ano” com reuniões, realizadas, sem quórum, a realizar e barra dourada de atas publicadas sobre realizadas (sem contar as sem quórum); abaixo, Documentos e Portal da Transparência. No desktop a lateral acompanha a rolagem; no celular vem antes da lista. A partir de 1280px os documentos ficam à direita da reunião; abaixo disso, embaixo. O aviso de agenda demonstrativa aparece somente em anos com `isDemo`.

## Verificação

Build, lint e teste de roteamento SEO passaram, com 23 rotas estáticas. A página foi conferida no navegador em desktop e em 390 px, sem rolagem horizontal. Foram exercitados a seleção de ano pelo teclado, o estado vazio de outro ano e a apresentação de links de pauta, ata e transmissão com dados temporários na memória do navegador; esses links não estão no projeto.

O axe-core não encontrou violações na página; o contraste sobre a arte do cabeçalho exige inspeção visual, realizada com o componente compartilhado existente. A auditoria estática geral está em `plenarias-auditoria-ui.json`: registrou três apontamentos anteriores a esta página, no CSS global de scrollbars e em um botão de `BoardPage.tsx` (este último usa `DialogTrigger`, não detectado pelo auditor). Não há apontamentos no código novo. O build mantém o aviso anterior de bundle acima de 500 kB.
