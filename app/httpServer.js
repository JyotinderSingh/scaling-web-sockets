import http from "http";

function createHttpServer() {
  return http.createServer();
}

export { createHttpServer };
