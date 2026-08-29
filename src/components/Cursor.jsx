import { useEffect, useRef } from "react";

export default function Cursor() {
  const root = useRef(null);
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pos = { x: 0, y: 0 };
    const ringPos = { x: 0, y: 0 };
    let raf;
    const move = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`;
      }
    };
    const over = (e) => {
      const t = e.target.closest("[data-cursor]");
      const state = t?.dataset.cursor || "default";
      root.current?.classList.remove("is-view", "is-open", "is-hidden");
      if (state === "view" || state === "open" || state === "hidden") {
        root.current?.classList.add(`is-${state}`);
      }
      if (label.current) {
        label.current.textContent = state === "open" ? "Open" : state === "view" ? "View" : "";
      }
    };
    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px,${ringPos.y}px,0)`;
      if (label.current) label.current.style.transform = `translate3d(${ringPos.x}px,${ringPos.y}px,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseover", over);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseover", over);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <div className="cursor-ring" ref={ring} />
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-label" ref={label} />
    </div>
  );
}
