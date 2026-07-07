import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";

// PORT and BASE_PATH are injected by the host at runtime (Replit, Vercel, etc).
// Sensible defaults keep local builds and CI green without requiring them.
const port = Number(process.env.PORT ?? "3000");

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    VitePWA({
      registerType: "autoUpdate",
      base: basePath,
      manifest: {
        name: "SolaraForge",
        short_name: "SolaraForge",
        description: "AI-powered regenerative habitat designer",
        start_url: basePath,
        display: "standalone",
        background_color: "#f5f0e8",
        theme_color: "#1a3a2a",
        orientation: "portrait-primary",
        icons: [
          { src: `${basePath}icons/icon-192.svg`, sizes: "192x192", type: "image/svg+xml" },
          { src: `${basePath}icons/icon-512.svg`, sizes: "512x512", type: "image/svg+xml" },
          { src: `${basePath}favicon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: `${basePath}index.html`,
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/materials/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "materials-api",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
