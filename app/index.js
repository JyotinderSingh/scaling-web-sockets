import { createHttpServer } from "./httpServer.js";
import {
  setupWebSocketServer,
  closeAllWebSocketConnections,
  broadcastToAllWebsockets,
} from "./webSocketServer.js";
import {
  initializeRedisClients,
  subscribeToRedisChannel,
  closeRedisConnections,
  LIVECHAT_CHANNEL,
} from "./redisClient.js";

const APPID = process.env.APPID;

async function main() {
  process.on("SIGTERM", shutdownServer);

  await initializeRedisClients();
  await subscribeToRedisChannel((message) => {
    console.log(
      `Server ${APPID} received message in channel ${LIVECHAT_CHANNEL}:`,
      message
    );
    broadcastToAllWebsockets(message, APPID);
  });

  const httpServer = createHttpServer();
  setupWebSocketServer(httpServer, APPID);

  httpServer.listen(8080, () => {
    console.log(`Server ${APPID} is listening on port 8080`);
  });
}

function shutdownServer() {
  console.log(`Gracefully shutting down server ${APPID}.`);

  closeRedisConnections();
  closeAllWebSocketConnections();

  console.log(`Server ${APPID} has shut down.`);
  process.exit(0);
}

main();
