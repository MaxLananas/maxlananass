import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Loader({ onDone }) {
  const root = useRef(null);
  const count = useRef(null);
  const bar = useRef(null);

  useEffect(() => {
    const obj = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(root.current, {
          yPercent: -100,
          duration: 1,
          ease: "power4.inOut",
          onComplete: onDone,
        });
      },
    });
    tl.to(obj, {
      v: 100,
      duration: 1.7,
      ease: "power2.inOut",
      onUpdate: () => {
        if (count.current) count.current.textContent = String(Math.floor(obj.v)).padStart(2, "0");
        if (bar.current) bar.current.style.width = obj.v + "%";
      },
    });
    tl.to(".loader-center", { y: -16, opacity: 0, duration: 0.4 }, "+=0.1");
    return () => tl.kill();
  }, [onDone]);

  return (
    <div className="loader" ref={root}>
      <div className="loader-row">
        <span>MaxLananas</span>
        <span>Portfolio / 2026</span>
      </div>
      <div className="loader-center">
        <p className="stage-kicker" style={{ textAlign: "center", marginBottom: 8 }}>
          Assembling the world
        </p>
        <div className="loader-count" ref={count}>00</div>
        <div className="loader-bar">
          <span ref={bar} />
        </div>
      </div>
      <div className="loader-row">
        <span>Minecraft builder</span>
        <span>Please wait</span>
      </div>
    </div>
  );
}
