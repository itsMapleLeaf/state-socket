import { expect, test } from "vitest"
import { getValueAtPath } from "./get-value-at-path"

test("getValueAtPath", () => {
  type State = {
    rooms: Record<
      string,
      {
        title: string
        messages: string[]
      }
    >
  }

  const state: State = {
    rooms: {
      "room-1": { title: "Room 1", messages: [] },
      "room-2": { title: "Room 2", messages: ["Hello", "World"] },
    },
  }

  expect(getValueAtPath(state, "rooms")).toEqual(state.rooms)
  expect(getValueAtPath(state, "rooms", "room-1", "title")).toEqual("Room 1")
  expect(getValueAtPath(state, "rooms", "room-2", "messages", 0)).toEqual(
    "Hello",
  )
  expect(getValueAtPath(state, "rooms", "room-2", "messages", 1)).toEqual(
    "World",
  )
  expect(getValueAtPath(state, "rooms", "room-2", "messages", 2)).toEqual(
    undefined,
  )
})
