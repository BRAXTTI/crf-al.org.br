# Créditos das fotos

Todas as fotos abaixo são do [Pexels](https://www.pexels.com) e usadas sob a [Licença Pexels](https://www.pexels.com/license/): uso comercial gratuito, atribuição não obrigatória (registrada aqui por transparência). Não vender as fotos inalteradas nem sugerir endosso dos fotógrafos ou do Pexels.

Os arquivos em `public/images/` são recortes dos originais em resolução total, exportados em WebP sem texto embutido. Toda tipografia sobre as fotos é HTML/CSS, com véu azul-marinho (#003366 → #0B192C) que mantém o texto branco em contraste WCAG AA (≥ 4,5:1 no pior pixel medido).

| # | Uso no site | Arquivo | Foto (Pexels) | Autor | Recorte (x0, y0, x1, y1) |
|---|---|---|---|---|---|
| 1 | Card “CRF AL em Casa” (`ServiceAccessCards`) | `crf-em-casa-card-foto.webp` (1672×941) | [5520296](https://www.pexels.com/photo/a-laptop-near-the-plant-and-documents-on-the-table-5520296/) | Pavel Danilyuk | [0, 584, 5604, 3736] |
| 2 | Card “Serviços e Requerimentos” (`ServiceAccessCards`) | `servicos-requerimentos-card-foto.webp` (1672×941) | [7054502](https://www.pexels.com/photo/a-person-signing-a-document-7054502/) | Kindel Media | [0, 2, 5184, 2918] |
| 3 | Perfil Empresas (`ServiceProfiles`) | `servicos-card-empresas.webp` (800×1280) | [8730987](https://www.pexels.com/photo/a-person-signing-a-document-in-close-up-shot-8730987/) | Mikhail Nilov | [102, 0, 3095, 4789] |
| 4 | Perfil Farmacêuticos (`ServiceProfiles`) | `servicos-card-farmaceuticos.webp` (800×1280) | [8540007](https://www.pexels.com/photo/close-up-of-woman-hands-making-chemistry-experiment-8540007/) | kaboompics | [140, 0, 4340, 6720] |
| 5 | Perfil Cidadão (`ServiceProfiles`) | `servicos-card-cidadao.webp` (800×1280) | [9155927](https://www.pexels.com/photo/close-up-shot-of-medicines-and-stethoscope-on-the-table-9155927/) | Towfiqu barbhuiya | [900, 0, 3395, 3992] |
| 6 | Capa provisória do tutorial Primeira Inscrição | `tutoriais/primeira-inscricao-foto-poster.webp` (1280×720) | [8376289](https://www.pexels.com/photo/clipboard-on-the-wooden-table-8376289/) | Tima Miroshnichenko | [0, 1400, 4000, 3650] |
| 7 | Fundo do `PageHero` (páginas internas) | `page-hero-foto-1280.webp` / `-2400.webp` | [8667531](https://www.pexels.com/photo/interior-of-a-vintage-pharmacy-8667531/) | cottonbro studio | [0, 971, 6276, 3212] |
| 8 | Card “Siga o CRF-AL” (`InstagramFeed`) | `instagram-card-foto.webp` (1080×1350) | [8666814](https://www.pexels.com/photo/ampules-on-wooden-shelf-8666814/) | cottonbro studio | [0, 0, 4480, 5600] |
| 9 | Slider: “Golpe da anuidade” | `banners/foto-golpe-*` | [10376213](https://www.pexels.com/photo/hands-of-man-working-on-laptop-and-smart-phone-10376213/) | RDNE Stock project | [0, 1164, 6568, 3215] · celular 4:5 [1532, 0, 5035, 4379] |
| 10 | Slider: “Sua voz faz parte” (Ouvidoria) | `banners/foto-ouvidoria-atendente-*` | [7709180](https://www.pexels.com/photo/a-man-wearing-a-headset-7709180/) | MART PRODUCTION | [0, 700, 3721, 4900] (pessoa a 1480–2101 px no quadro 2244×701; fundo de estúdio estendido das bordas da foto) · celular 4:5 [0, 930, 3721, 5581] |
| 11 | Slider: “CRF AL em Casa” | `banners/foto-crf-em-casa-tablet-*` | [19963125](https://www.pexels.com/photo/doctor-sitting-with-tablet-19963125/) | Tessy Agbonome | [1500, 60, 5100, 3150] (pessoa a 1312–2129 px no quadro 2244×701; fundo de estúdio estendido das bordas da foto) · celular 4:5 [2100, 125, 4900, 3625] |

Banners: `foto-<tema>-desktop.webp` (2244×701), `foto-<tema>-mobile.webp` (1080×1350) e `foto-<tema>-mobile-720.webp` (720×900).

Nos banners em painel (Ouvidoria e CRF AL em Casa), a foto desktop é montada a partir de um retrato de estúdio: a parede tem a queda de luz horizontal corrigida e é estendida para a esquerda a partir das bordas da própria foto, sem recorte da pessoa nem imagem gerada. O painel azul do slide (HTML/CSS) cobre a parte estendida. Script: `build_banners.py` (job `crfal-banners-v2`).

Ao trocar uma foto, atualize esta tabela. Não use imagens geradas por IA, ilustrações ou bancos pagos nesses espaços.
