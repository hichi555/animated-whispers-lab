import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackStart({
      customViteReact: true,
      tsr: { generateRouteTree: true },
    } as never),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: { host: "0.0.0.0", allowedHosts: true },
});
