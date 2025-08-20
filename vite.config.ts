// gooddayforbusiness/gdfb-client/GDFB-Client-00.../vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // '/socket'으로 시작하는 웹소켓 요청을 받으면
      '/socket': {
        target: 'ws://localhost:3001', // 실제 백엔드 서버(3001번 포트)로 전달
        ws: true,                      // 웹소켓 프록시 활성화
        
        // 중요: 백엔드 서버로 요청을 보낼 때 '/socket' 경로를 제거합니다.
        // 이렇게 해야 백엔드 서버가 올바른 경로('/')로 요청을 받게 됩니다.
        rewrite: (path) => path.replace(/^\/socket/, ''), 
      },
    },
  },
});