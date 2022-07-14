import { WebSocketServer } from "ws"

const port = Number(process.env.PORT) || 3000

const server = new WebSocketServer({ port })

server.on("listening", () => {
  console.log(`listening on http://localhost:${port}`)
})
