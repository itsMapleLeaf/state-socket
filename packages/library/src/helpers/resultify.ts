export type Result<T> = [T, undefined] | [undefined, unknown]

export function resultify<T>(block: () => T): Result<T> {
  try {
    return [block(), undefined]
  } catch (error) {
    return [undefined, error]
  }
}

export async function resultifyAsync<T>(
  block: () => T,
): Promise<Result<Awaited<T>>> {
  try {
    return [await block(), undefined]
  } catch (error) {
    return [undefined, error]
  }
}
