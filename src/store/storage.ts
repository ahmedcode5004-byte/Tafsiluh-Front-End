import { createJSONStorage, type StateStorage } from "zustand/middleware";

const noop: StateStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

/** localStorage in the browser, a no-op during SSR. Stores use skipHydration and rehydrate in __root. */
export const browserStorage = createJSONStorage(() =>
  typeof window === "undefined" ? noop : window.localStorage,
);
