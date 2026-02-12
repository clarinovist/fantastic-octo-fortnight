<<<<<<< HEAD
=======
import tailwindcss from "@tailwindcss/vite";
>>>>>>> 1a19ced (chore: update service folders from local)
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
<<<<<<< HEAD
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
=======
  plugins: [react(), tailwindcss()],
>>>>>>> 1a19ced (chore: update service folders from local)
});
