import { useEffect, useRef, useState } from "react";

/**
 * Révèle un élément quand il entre dans l'écran (fondu + glissement).
 * Sans IntersectionObserver, ou si le mouvement est réduit, l'élément est visible tout de suite.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, className: visible ? "lp-reveal" : "lp-reveal lp-hidden" };
}
