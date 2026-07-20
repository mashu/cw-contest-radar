// Static export for GitHub Pages.
// For a project site served at https://<user>.github.io/<repo>/, set
// NEXT_PUBLIC_BASE_PATH=/<repo> (the deploy workflow does this automatically).
// For a user/org root site or a custom domain, leave it empty.
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Fonts are loaded via <link> in the layout; don't fetch/optimize them at build.
  optimizeFonts: false,
  basePath: base || undefined,
  assetPrefix: base || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: base },
};

export default nextConfig;
