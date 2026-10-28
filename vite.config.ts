import { contentApi } from "./functions/_content"
import path from "path"
import { ATENDIMENTO, LOCAIS } from "./src/config/contact"
import { SOCIAL_LINKS, SITE_URL } from "./src/config/site"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"
import { getInstagramItems } from "./functions/api/_parse"
import { newsApi } from "./functions/_news"
import { getCffPublications } from "./functions/api/_cff"

/**
 * Em dev, o Vite não executa as Pages Functions. Este middleware replica
 * as APIs de notícias, CFF e Instagram localmente.
 */
function portalDevApi(feedUrl?: string): Plugin {
  return {
    name: "portal-dev-api",
    configureServer(server) {
      for (const route of ['/api/events', '/api/gallery']) server.middlewares.use(route, async (req, res) => {
        const response = await contentApi(new Request(`http://localhost${route}${req.url ?? ''}`, { method: req.method }), { waitUntil: promise => { void promise } })
        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(await response.text())
      })
      server.middlewares.use("/api/news", async (req, res) => {
        const response = await newsApi(new Request(`http://localhost/api/news${req.url ?? ''}`, { method: req.method }))
        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(await response.text())
      })
      server.middlewares.use("/api/cff-publicacoes", async (_req, res) => {
        res.setHeader("content-type", "application/json; charset=utf-8")
        try {
          res.end(JSON.stringify({ collections: await getCffPublications() }))
        } catch (error) {
          res.statusCode = 502
          res.end(JSON.stringify({ collections: [], error: String(error) }))
        }
      })
      server.middlewares.use("/api/instagram", async (_req, res) => {
        try {
          const items = await getInstagramItems(feedUrl)
          res.setHeader("content-type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ items }))
        } catch (error) {
          res.statusCode = 502
          res.setHeader("content-type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ items: [], error: String(error) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
  base: '/',
  plugins: [{ name: "canonical-html", transformIndexHtml: html => html.replaceAll("%SITE_URL%", SITE_URL).replace('%ORGANIZATION_JSON%', JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'GovernmentOrganization', name: 'Conselho Regional de Farmácia do Estado de Alagoas', url: SITE_URL, logo: `${SITE_URL}/images/logo-crf-azul.png`, telephone: ATENDIMENTO.telefone, email: ATENDIMENTO.email, address: { '@type': 'PostalAddress', streetAddress: LOCAIS[0].endereco, addressLocality: LOCAIS[0].cidade, postalCode: LOCAIS[0].endereco.match(/CEP ([0-9-]+)/)?.[1], addressRegion: 'AL', addressCountry: 'BR' }, parentOrganization: { '@type': 'GovernmentOrganization', name: 'Conselho Federal de Farmácia', url: 'https://www.cff.org.br' }, sameAs: SOCIAL_LINKS.map(social => social.href) }, { '@type': 'WebSite', name: 'Conselho Regional de Farmácia do Estado de Alagoas', alternateName: ['CRF-AL', 'CRFAL'], url: SITE_URL }] }).replaceAll('<', '\\u003c')) }, react(), portalDevApi(env.VITE_INSTAGRAM_FEED_URL)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Bibliotecas em chunks próprios: mudam pouco e ficam em cache entre deploys.
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|cookie|set-cookie-parser)[\\/]/.test(id)) return "react"
          if (id.includes("@tanstack")) return "tanstack"
          if (id.includes("@radix-ui")) return "radix"
          if (id.includes("dompurify")) return "dompurify"
          if (id.includes("lucide-react")) return "lucide"
          if (id.includes("react-helmet-async")) return "helmet"
        },
      },
    },
  },
  }
});
