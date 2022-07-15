import type { DataFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, useTransition } from "@remix-run/react"
import type { Client } from "library"
import { createClient } from "library"
import { useEffect, useRef, useState } from "react"
import type { store } from "../../store.mjs"

declare global {
  var serverClient: Client<NonNullable<typeof store["__generics"]>> | undefined
}

export async function action({ request }: DataFunctionArgs) {
  const form = await request.formData()
  const message = form.get("message") as string

  let client = globalThis.serverClient
  if (!client) {
    client = globalThis.serverClient = createClient<typeof store>()
    client.connect()
  }
  client.send("addMessage", "main", message)

  return redirect(request.headers.get("referer") || "/")
}

export default function Index() {
  const [messages, setMessages] = useState<string[]>([])
  const [client, setClient] = useState<
    Client<NonNullable<typeof store["__generics"]>> | undefined
  >()

  useEffect(() => {
    const client = createClient<typeof store>()
    setClient(client)
    client.connect()
    return () => client.disconnect()
  }, [])

  useEffect(() => {
    return client?.subscribe(["rooms", "main", "messages"], (value) => {
      setMessages(value ?? [])
    })
  }, [client])

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
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </main>
  )
}
