import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // أضيفي الـ console دي عشان نشوف القيمة
  console.log("VITE_API_URL from env:", env.VITE_API_URL);
  console.log("Mode:", mode);

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          // أضيفي rewrite عشان نتأكد
          rewrite: (path) => path.replace(/^\/api/, ""),
          // أضيفي log عشان نشوف الـ proxy بيشتغل ولا لأ
          configure: (proxy, _options) => {
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log(
                "Proxying request:",
                req.method,
                req.url,
                "to",
                env.VITE_API_URL
              );
            });
            proxy.on("error", (err, _req, _res) => {
              console.log("Proxy error:", err);
            });
          },
        },
      },
    },
  });
};
