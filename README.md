# create-zustand-store-context

> AbortController hook

[![NPM](https://img.shields.io/npm/v/create-zustand-store-context.svg)](https://www.npmjs.com/package/create-zustand-store-context) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save create-zustand-store-context
```

## Usage

```tsx
import { createZustandStoreContext } from "create-zustand-store-context";

type Store = {
  value: boolean;
};

const initialState: Store = {
  value: false,
};

const { storeContext, useState, useStore } =
  createZustandStoreContext<Store>(initialState);

const StoreContext = storeContext;

function Provider({ children }: WithChildren) {
  const currentStore = useStore();

  return (
    <StoreContext.Provider value={currentStore}>
      {children}
    </StoreContext.Provider>
  );
}

export { Provider, useState };
```

## License

MIT © [marcoSven](https://github.com/marcoSven)
