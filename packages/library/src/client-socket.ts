import WebSocket from "isomorphic-ws"

const reconnectPeriod = 1000

export class ClientSocket {
  private socket?: WebSocket
  private status: "offline" | "connecting" | "online" | "willReconnect" =
    "offline"
  private readonly offlineMessageQueue = new Set<string>()
  private reconnection = true
  private reconnectTimeout?: NodeJS.Timeout

  constructor(
    private readonly options: {
      url: string
      onMessage: (message: string) => void
      onError: (error: unknown) => void
    },
  ) {}

  connect() {
    if (this.status !== "offline" && this.status !== "willReconnect") return

    this.status = "connecting"
    clearTimeout(this.reconnectTimeout)
    console.info("Connecting...")

    const socket = (this.socket = new WebSocket(this.options.url))

    socket.addEventListener("open", () => {
      console.info("Connected!")
      this.status = "online"

      for (const message of this.offlineMessageQueue) {
        socket.send(message)
      }
      this.offlineMessageQueue.clear()
    })

    socket.addEventListener("close", () => {
      this.socket = undefined

      if (this.reconnection) {
        console.info("Socket closed, reconnecting...")
        this.status = "willReconnect"
        this.reconnectTimeout = setTimeout(
          () => this.connect(),
          reconnectPeriod,
        )
      } else {
        console.info("Socket closed")
        this.status = "offline"
      }
    })

    socket.addEventListener("message", (event) => {
      this.options.onMessage(event.data.toString())
    })

    socket.addEventListener("error", (error) => {
      this.options.onError(error)
    })
  }

  disconnect() {
    this.reconnection = false
    clearTimeout(this.reconnectTimeout)
    this.socket?.close()
  }

  // I considered making this method async and resolve when the message gets sent,
  // but I think it makes more sense for messages to be fire and forget.
  // Plus, if the message causes a state update, the client will get that state,
  // and I don't think there's a good case for waiting for that update
  send(message: string) {
    if (this.status === "online") {
      this.socket?.send(message)
    } else {
      this.offlineMessageQueue.add(message)
      this.connect()
    }
  }
}
