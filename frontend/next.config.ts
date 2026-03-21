/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
