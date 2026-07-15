const STORE_EVENT = "universal-rating-store";

export function subscribeStore(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(STORE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(STORE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function emitStoreChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORE_EVENT));
}
