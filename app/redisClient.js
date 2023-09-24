import { createClient } from "redis";

const LIVECHAT_CHANNEL = "livechat";

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
    console.log(`Subscribed successfully to livechat server.`);
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    process.exit(1);
  }
}

async function subscribeToRedisChannel(callback) {
  await subscriber.subscribe(LIVECHAT_CHANNEL, callback);
}

function publishToRedisChannel(message) {
  publisher.publish(LIVECHAT_CHANNEL, message);
}

function closeRedisConnections() {
  subscriber.unsubscribe();
  subscriber.quit();
  publisher.quit();
}

export {
  initializeRedisClients,
  subscribeToRedisChannel,
  publishToRedisChannel,
  closeRedisConnections,
  LIVECHAT_CHANNEL,
};
