import { WebSocketServer } from "ws"

const state = {
  /** @type {string[]} */
  messages: [],
}

const port = 8080
const server = new WebSocketServer({ port })

server.on("connection", (client) => {
  console.info("client connected")
  client.send(JSON.stringify({ type: "updateState", payload: state }))

  client.on("message", (data) => {
    const message = JSON.parse(data.toString())
    console.info("received client message:", message)

    if (message.type === "sendMessage") {
      state.messages.push(message.payload)
      for (const client of server.clients) {
        client.send(JSON.stringify({ type: "updateState", payload: state }))
      }
    }
  })

  client.on("close", () => {
    console.info("client disconnected")
  })
})

server.on("listening", () => {
  console.info(`listening on ws://localhost:${port}`)
})
