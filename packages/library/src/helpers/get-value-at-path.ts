export function getValueAtPath(
  object: object,
  ...path: PropertyKey[]
): unknown {
  // eslint-disable-next-line unicorn/no-array-reduce
  return path.reduce((acc, key) => (acc as any)?.[key], object)
}
