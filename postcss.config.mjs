// Local PostCSS config so Next.js does not walk up to a parent
// postcss.config that expects Tailwind. This app uses hand-written CSS.
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {},
};

export default config;
