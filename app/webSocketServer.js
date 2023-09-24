import ws from "websocket";
import { publishToRedisChannel } from "./redisClient.js";

const connections = new Set();

function setupWebSocketServer(httpServer, APPID) {
  const websocketServer = new ws.server({
    httpServer,
  });

  websocketServer.on("request", (request) =>
    handleWebSocketRequest(request, APPID)
  );
}

function handleWebSocketRequest(request, APPID) {
  const connection = request.accept(null, request.origin);

  connection.on("open", () => {
    console.log(`Connection opened on server ${APPID} with ${request.origin}`);
  });

  connection.on("close", () => {
    connections.delete(connection);
    console.log(`Connection closed on server ${APPID} with ${request.origin}`);
  });

  connection.on("message", (message) => {
    console.log(
      `${APPID} received message from ${request.origin}: ${message.utf8Data}`
    );
    publishToRedisChannel(message.utf8Data);
  });

  setTimeout(() => {
    connection.send(`Connected successfully to server ${APPID}`);
  }, 5000);

  connections.add(connection);
}

function broadcastToAllWebsockets(message, APPID) {
  try {
    connections.forEach((conn) => conn.send(`${APPID}:${message}`));
  } catch (error) {
    console.error("Error broadcasting to WebSocket connections:", error);
  }
}

function closeAllWebSocketConnections() {
  connections.forEach((conn) => conn.close());
}

export {
  setupWebSocketServer,
  closeAllWebSocketConnections,
  broadcastToAllWebsockets,
};
