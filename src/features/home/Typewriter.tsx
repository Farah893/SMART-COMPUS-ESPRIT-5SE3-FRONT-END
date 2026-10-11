import { useEffect, useState } from "react";

interface TypewriterProps {
  /** Phrases écrites puis effacées l'une après l'autre. */
  words: readonly string[];
  className?: string;
}

const TYPE_MS = 70;
const ERASE_MS = 35;
const HOLD_MS = 1700;
const GAP_MS = 350;

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * « Écriture magique » : le texte s'écrit lettre par lettre, reste lisible un instant, s'efface, puis la phrase suivante arrive.
 * Pour les lecteurs d'écran, toutes les phrases sont données d'un coup (texte masqué), l'animation étant ignorée.
 * Si l'utilisateur demande moins de mouvement, seule la première phrase s'affiche, sans animation.
 */
export function Typewriter({ words, className }: TypewriterProps) {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [erasing, setErasing] = useState(false);
  const still = prefersReducedMotion();

  useEffect(() => {
    if (still) return;
    const word = words[index]!;
    let id: ReturnType<typeof setTimeout>;
    if (!erasing && count < word.length) id = setTimeout(() => setCount(count + 1), TYPE_MS);
    else if (!erasing) id = setTimeout(() => setErasing(true), HOLD_MS);
    else if (count > 0) id = setTimeout(() => setCount(count - 1), ERASE_MS);
    else id = setTimeout(() => {
      setErasing(false);
      setIndex((index + 1) % words.length);
    }, GAP_MS);
    return () => clearTimeout(id);
  }, [count, erasing, index, still, words]);

  const text = still ? words[0]! : words[index]!.slice(0, count);
  return (
    <>
      <span className="sr-only">{words.join(" ")}</span>
      <span aria-hidden="true" className={className}>
        {text}
        {!still && <span className="lp-caret ml-0.5 inline-block w-[3px] translate-y-[0.08em] self-center bg-white align-baseline">&nbsp;</span>}
      </span>
    </>
  );
}
