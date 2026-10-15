import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { getInstagramItems } from "./functions/api/_parse"
import { newsApi } from "./functions/_news"
import { getCffPublications } from "./functions/api/_cff"

/**
 * Em dev, o Vite não executa as Pages Functions. Este middleware replica
 * `/api/instagram` localmente, para o carrossel nativo funcionar igual à produção.
 */
function instagramDevApi(): Plugin {
  return {
    name: "instagram-dev-api",
    configureServer(server) {
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
          const items = await getInstagramItems(process.env.VITE_INSTAGRAM_FEED_URL)
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
export default defineConfig({
  base: '/',
  plugins: [react(), instagramDevApi()],
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
});
