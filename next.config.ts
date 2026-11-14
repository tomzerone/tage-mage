import type { NextConfig } from "next";

// Le site est exporté en fichiers statiques (dossier `out`) et hébergé sur GitHub Pages.
// BASE_PATH vaut "/tage-mage" tant que le site est servi sous tomzerone.github.io/tage-mage ;
// il sera vide le jour où un nom de domaine personnalisé sera branché.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
