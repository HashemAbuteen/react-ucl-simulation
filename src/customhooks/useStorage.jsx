import { useState, useEffect } from "react";

export function useStorage(key, defaultValue, storage = "localStorage") {
  const [value, setValue] = useState(() => {
    const storedValue = window[storage].getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  });

  useEffect(() => {
    window[storage].setItem(key, JSON.stringify(value));
  }, [key, value, storage]);

  return [value, setValue];
}

export default useStorage;
