import * as z from "zod"

export const clientMessageSchema = z.object({
  type: z.literal("updateState"),
  payload: z.unknown(),
})

export const clientMessage = <T extends z.infer<typeof clientMessageSchema>>(
  message: T,
) => JSON.stringify(message)

export const serverMessageSchema = z.object({
  type: z.literal("action"),
  name: z.string(),
  args: z.array(z.unknown()),
})

export const serverMessage = <T extends z.infer<typeof serverMessageSchema>>(
  message: T,
) => JSON.stringify(message)
