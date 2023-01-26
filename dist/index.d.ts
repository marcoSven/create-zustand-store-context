/// <reference types="react" />
import { StoreApi } from "zustand";
export declare function createZustandStoreContext<T extends Record<string, unknown>, O extends string = "">({ defaultState, localStorage, name, }: {
    defaultState: T;
    localStorage?: {
        force?: boolean;
        migrate?: (persistedState: unknown, version: number) => T;
        name: string;
        partialize?: (state: T) => Partial<T>;
        version?: number;
    };
    name?: string;
}): {
    storeContext: import("react").Context<StoreApi<T>>;
    useState: {
        (): Omit<StoreApi<T>, "setState" | "getState" | "destroy"> & {
            setState: (value: Partial<Omit<T, O>>) => void;
        };
        <U extends Record<string, unknown>>(selector: (state: T) => U): Omit<StoreApi<T>, "setState" | "getState" | "destroy"> & {
            setState: (value: Partial<Omit<T, O>>) => void;
        } & U;
    };
    useStore: (storeId?: string, initialState?: Partial<T>) => StoreApi<T>;
};
