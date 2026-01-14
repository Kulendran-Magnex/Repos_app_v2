// utils/useFormNavigation.js or inline in your component
import { useRef } from "react";

export function useFormNavigation(count) {
  const refs = useRef([]);

  const getRef = (index) => (el) => {
    refs.current[index] = el;
  };

  const handleKeyDown = (index) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = refs.current[index + 1];
      next?.focus?.();
    }
  };

  return { getRef, handleKeyDown };
}
