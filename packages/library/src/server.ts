import WebSocket from "isomorphic-ws"
import { resultify, resultifyAsync } from "./helpers/resultify"
import { clientMessage, serverMessageSchema } from "./messages"
import type { StateWrapper, StoreDefinition, StoreGenerics } from "./store"

export function createServer<Generics extends StoreGenerics>(
  store: StoreDefinition<Generics>,
) {
  const port = 8080
  const server = new WebSocket.Server({ port })

  let state = store.options.initialState

  const stateWrapper: StateWrapper<Generics["state"]> = {
    get current() {
      return state
    },
    set(value) {
      state = value

      // TODO: want to buffer and optimize these
      for (const client of server.clients) {
        client.send(clientMessage({ type: "updateState", payload: value }))
      }
    },
  }

  server.on("connection", (client) => {
    console.info("client connected")

    client.send(clientMessage({ type: "updateState", payload: state }))

    client.on("message", async (data) => {
      const [parsed, parseError] = resultify(() => JSON.parse(data.toString()))
      if (parseError) {
        return console.error("Error parsing json:", parseError, data.toString())
      }

      const [message, messageError] = resultify(() =>
        serverMessageSchema.parse(parsed),
      )
      if (!message) {
        return console.error("Malformed message from client:", messageError)
      }

      console.info("received client message:", message)

      if (message.type === "action") {
        const actions = store.options.actionsFactory(stateWrapper)
        const action = actions[message.name]
        if (!action) {
          return console.error("Unknown action:", message.name, message.args)
        }

        const [, actionError] = await resultifyAsync(() =>
          action(...message.args),
        )
        if (actionError) {
          return console.error("Error executing action:", actionError)
        }
      }
    })

    client.on("close", () => {
      console.info("client disconnected")
    })
  })

  server.on("listening", () => {
    console.info(`socket listening on ws://localhost:${port}`)
  })
}
