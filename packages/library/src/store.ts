import type { Overwrite } from "./helpers/types"

export type StoreActions = Record<string, (...args: any) => any>

export type StoreGenerics = {
  state: any
  actions: StoreActions
}

export type StateWrapper<T> = {
  current: T
  set: (value: T) => void
}

export class StoreDefinition<Generics extends StoreGenerics> {
  // used to easily extract the generics type
  __generics?: Generics

  constructor(
    readonly options: {
      initialState: Generics["state"]
      actionsFactory: (store: Generics["state"]) => Generics["actions"]
    },
  ) {}

  withState<T>(initialState: T) {
    return new StoreDefinition<Overwrite<Generics, { state: T }>>({
      ...this.options,
      initialState,
    })
  }

  withActions<T extends StoreActions>(
    factory: (state: StateWrapper<Generics["state"]>) => T,
  ) {
    return new StoreDefinition<Overwrite<Generics, { actions: T }>>({
      ...this.options,
      actionsFactory: factory as any,
    })
  }
}

export function defineStore() {
  return new StoreDefinition<{ state: undefined; actions: {} }>({
    initialState: undefined,
    actionsFactory: () => ({}),
  })
}
