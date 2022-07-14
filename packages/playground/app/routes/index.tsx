import type { DataFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, useTransition } from "@remix-run/react"
import WebSocket from "isomorphic-ws"
import { useEffect, useRef, useState } from "react"

export async function action({ request }: DataFunctionArgs) {
  const form = await request.formData()

  await new Promise<void>((resolve, reject) => {
    const socket = new WebSocket("ws://localhost:8080")

    socket.addEventListener("open", () => {
      socket.send(
        JSON.stringify({
          type: "sendMessage",
          payload: form.get("message"),
        }),
      )
      socket.close()
      resolve()
    })

    socket.addEventListener("error", reject)
  })

  return redirect(request.headers.get("referer") || "/")
}

export default function Index() {
  const [state, setState] = useState<{
    messages: string[]
  }>({
    messages: [],
  })

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080")

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data.toString())
      console.info("message from server", message)
      if (message.type === "updateState") setState(message.payload)
    })

    return () => socket.close()
  }, [])

  const formRef = useRef<HTMLFormElement>(null)
  const transition = useTransition()

  useEffect(() => {
    if (transition.state === "idle") {
      formRef.current?.reset()
    }
  })

  return (
    <main>
      <Form method="post" ref={formRef}>
        <input type="text" name="message" />
        <button type="submit">Send</button>
      </Form>
      <ul>
        {state.messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </main>
  )
}
