import { defineStore } from "library"

/** @typedef {{ messages: string[] }} Room */

export const store = defineStore()
  .withState({
    /** @type {Record<string, Room>} */
    rooms: {},
  })
  .withActions((state) => ({
    addMessage: (
      /** @type {string} */ roomId,
      /** @type {string} */ message,
    ) => {
      const room = (state.current.rooms[roomId] ??= { messages: [] })
      room.messages.push(message)
      state.set(state.current)
    },
  }))
