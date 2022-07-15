import type { Object } from "ts-toolbelt"
import { ClientSocket } from "./client-socket"
import { getValueAtPath } from "./helpers/get-value-at-path"
import { resultify } from "./helpers/resultify"
import { clientMessageSchema, serverMessage } from "./messages"
import type { StoreGenerics } from "./store"

export class Client<Generics extends StoreGenerics> {
  private listeners = new Set<(state: Generics["state"]) => void>()

  private readonly socket = new ClientSocket({
    url: "ws://localhost:8080",
    onMessage: (data) => {
      const [parsed, parseError] = resultify(() => JSON.parse(data))
      if (parseError) {
        return console.error("Error parsing json:", parseError, data)
      }

      const [message, messageError] = resultify(() =>
        clientMessageSchema.parse(parsed),
      )
      if (!message) {
        return console.error("Malformed message from server:", messageError)
      }

      console.info("received server message:", message)

      if (message.type === "updateState") {
        for (const listener of this.listeners) {
          listener(message.payload)
        }
      }
    },
    onError(error) {
      console.error("Socket error:", error)
    },
  })

  connect() {
    this.socket.connect()
  }

  disconnect() {
    this.socket.disconnect()
  }

  subscribe<Path extends Object.Paths<Generics["state"]>>(
    statePath: Path,
    onChange: (value: Object.Path<Generics["state"], Path> | undefined) => void,
  ) {
    const listener = (state: Generics["state"]) =>
      onChange(
        getValueAtPath(state, ...statePath) as
          | Object.Path<Generics["state"], Path>
          | undefined,
      )

    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  send<ActionName extends Extract<keyof Generics["actions"], string>>(
    actionName: ActionName,
    ...args: Parameters<Generics["actions"][ActionName]>
  ) {
    this.socket.send(serverMessage({ type: "action", name: actionName, args }))
  }
}

export function createClient<Store extends { __generics?: StoreGenerics }>() {
  return new Client<NonNullable<Store["__generics"]>>()
}
