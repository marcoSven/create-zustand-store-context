import { createContext, useCallback, useContext, useRef } from "react";

import { createStore as create, StoreApi, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

const DEFAULT_ZUSTAND_STORE_Value = "DEFAULT_ZUSTAND_STORE_Value";

export function createZustandStoreContext<
  T extends Record<string, unknown>,
  O extends string = ""
>({
  defaultState,
  localStorage,
  name,
}: {
  defaultState: T;
  localStorage?: {
    force?: boolean;
    migrate?: (persistedState: unknown, version: number) => T;
    name: string;
    partialize?: (state: T) => Partial<T>;
    version?: number;
  };
  name?: string;
}) {
  const createStore = !localStorage
    ? (state: T) => create<T>(() => state)
    : (state: T) => {
        const { migrate, partialize, ...config } = localStorage;
        const isObject = (obj: unknown): obj is Record<string, unknown> =>
          typeof obj === "object" &&
          obj !== null &&
          !Array.isArray(obj) &&
          Object.keys(obj).every((key) => typeof key === "string");

        const store = create<T>()(
          persist(() => state, {
            ...config,
            migrate: migrate
              ? (persistedState: unknown, version: number): T =>
                  isObject(persistedState)
                    ? ((obj: Record<string, unknown>) =>
                        ((obj): obj is T => {
                          const set: Record<string, unknown> = {};

                          for (const k of Object.keys(obj)) {
                            set[k] = 1;
                          }

                          for (const k of Object.keys(
                            (localStorage &&
                              localStorage.partialize?.(state)) ||
                              state
                          )) {
                            if (!set[k]) return false;

                            set[k] = 2;
                          }

                          for (const k in set) {
                            if (set[k] === 1) return false;
                          }

                          return true;
                        })(obj)
                          ? obj
                          : state)(migrate(persistedState, version))
                    : state
              : undefined,
            partialize: partialize || ((state) => state),
          })
        );

        localStorage.force && store.setState(state);

        return store;
      };
  const defaultStore = createStore({
    ...defaultState,
    [DEFAULT_ZUSTAND_STORE_Value]: true,
  });
  const storeContext = createContext(defaultStore);

  const useContextStore = (storeId?: string, initialState: Partial<T> = {}) => {
    const prevId = useRef(storeId);
    const storeRef = useRef<StoreApi<T>>();

    if (!storeRef.current || prevId.current !== storeId) {
      storeRef.current = createStore({
        ...defaultState,
        ...initialState,
      });

      prevId.current = storeId;
    }

    return storeRef.current;
  };

  type StateAPI = Omit<StoreApi<T>, "setState" | "getState" | "destroy"> & {
    setState: (value: Partial<Omit<T, O>>) => void;
  };

  function useState(): StateAPI;

  function useState<U extends Record<string, unknown>>(
    selector: (state: T) => U
  ): StateAPI & U;

  function useState<U extends Record<string, unknown>>(
    selector?: (state: T) => U
  ): StateAPI & U {
    const store = useContext(storeContext);

    if (
      typeof store === "undefined" ||
      store.getState()[DEFAULT_ZUSTAND_STORE_Value]
    ) {
      throw new Error(
        `${name ? name + ": " : ""}useState must be used within a provider`
      );
    }

    const state = useStore(store, selector ?? (() => ({} as U)), shallow);

    return {
      ...store,
      ...state,
      setState: useCallback(
        (value: Partial<Omit<T, O>>) =>
          store.setState((state: T) => ({ ...state, ...value })),
        [store]
      ),
    };
  }

  return {
    storeContext,
    useState,
    useStore: useContextStore,
  };
}
