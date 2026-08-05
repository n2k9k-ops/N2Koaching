import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/favicon-16.png", "icons/favicon-32.png", "icons/apple-touch-icon.png"],
      manifest: {
        name: "N2Koaching",
        short_name: "N2Koaching",
        description: "Coaching sportif premium — programmes, séances guidées, suivi et gamification.",
        theme_color: "#0071E3",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      },
    }),
  ],
  server: { port: 5173 },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "charts-vendor": ["recharts"],
          "icons-vendor": ["lucide-react"],
          "supabase-vendor": ["@supabase/supabase-js"],
        },
      },
    },
  },
});
