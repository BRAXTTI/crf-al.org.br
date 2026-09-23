import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { getInstagramItems } from "./functions/api/_parse"

/**
 * Em dev, o Vite não executa as Pages Functions. Este middleware replica
 * `/api/instagram` localmente, para o carrossel nativo funcionar igual à produção.
 */
function instagramDevApi(): Plugin {
  return {
    name: "instagram-dev-api",
    configureServer(server) {
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
});
