import http from "http";
import ws from "websocket";
import { createClient } from "redis";

const APPID = process.env.APPID;
const LIVECHAT_CHANNEL = "livechat";
const connections = new Set();

const subscriber = createClient({
  url: "redis://rds:6379",
});

const publisher = createClient({
  url: "redis://rds:6379",
});

async function initializeRedisClients() {
  try {
    await publisher.connect();
    await subscriber.connect();
    console.log(`Server ${APPID} subscribed successfully to livechat server.`);
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    process.exit(1);
  }
}

async function subscribeToRedisChannel() {
  await subscriber.subscribe(LIVECHAT_CHANNEL, (message) => {
    console.log(
      `Server ${APPID} received message in channel ${LIVECHAT_CHANNEL}:`,
      message
    );
    broadcastToAllWebsockets(message);
  });
}

function broadcastToAllWebsockets(message) {
  try {
    connections.forEach((conn) => conn.send(`${APPID}:${message}`));
  } catch (error) {
    console.error("Error broadcasting to WebSocket connections:", error);
  }
}

function setupHttpAndWebSocketServer() {
  const httpServer = http.createServer();

  const websocketServer = new ws.server({
    httpServer,
  });

  httpServer.listen(8080, () => {
    console.log(`Server ${APPID} is listening on port 8080`);
  });

  websocketServer.on("request", handleWebSocketRequest);
}

function handleWebSocketRequest(request) {
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
    publisher.publish(LIVECHAT_CHANNEL, message.utf8Data);
  });

  setTimeout(() => {
    connection.send(`Connected successfully to server ${APPID}`);
  }, 5000);

  connections.add(connection);
}

function shutdownServer() {
  console.log(`Gracefully shutting down server ${APPID}.`);

  subscriber.unsubscribe();
  subscriber.quit();
  publisher.quit();

  connections.forEach((conn) => conn.close());

  console.log(`Server ${APPID} has shut down.`);
  process.exit(0);
}

// Main function to set up the application.
async function main() {
  await initializeRedisClients();
  await subscribeToRedisChannel();
  setupHttpAndWebSocketServer();

  process.on("SIGTERM", shutdownServer);
}

main();
