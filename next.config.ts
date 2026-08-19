import type { NextConfig } from "next";

/**
 * O back-end (calibre-backend-node, porta 4000) não monta middleware de CORS,
 * então o browser nunca fala com ele diretamente: este rewrite faz o servidor
 * do Next encaminhar /api/* para lá, deixando tudo same-origin.
 *
 * Por isso NEXT_PUBLIC_API_URL fica vazia no ambiente local — o httpClient
 * monta caminho relativo e é este rewrite que intercepta. Ver ARQUITETURA.md.
 */
const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
