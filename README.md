# Scaling Websockets using Redis and HAProxy

Scalable chat application that uses Redis pub-sub for scaling Websockets across large number of clients.

Thx to our lord and saviour Hussein Nasser for the tutorials and knowledge 🙏

## Steps to run (Server)

### Build the docker image

```bash
docker build -t wsapp .
```

### Run docker-compose

```bash
docker-compose up
```

## Testing (Clients)

There is no UI because I don't want to write html.

1. Simply open up a couple of tabs in your browser, and open up the console in each one.
1. Each of these tabs will act like a client connected to your server (the reverse proxy).
1. Run the following commands in the terminal to connect to the server

```js
let ws = new WebSocket("ws://localhost:8080");

ws.onmessage = (message) => console.log(`Received: ${message.data}`);
```

Now you can send messages from each of these clients (the tabs) to the other clients (the other tabs)

```js
ws.send("Hello! I'm client");
```

You will see a `console.log` of the message you just sent in each of the client windows - with the additional info detailing which server that client is communicating with.

(Since we don't define any load balancing algo in our `haproxy.cfg` we default to round robin.)
