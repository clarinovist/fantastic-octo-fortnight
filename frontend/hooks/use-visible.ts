import { type RefObject, useEffect, useState } from "react";

export function useIsVisible(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
  root: Element | null = null,
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (ref.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry) {
            setIsIntersecting(entry.isIntersecting);
          }
        },
        { root },
      );

      observer.observe(ref.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [enabled, ref, root]);

  return isIntersecting;
}
