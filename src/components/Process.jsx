import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { n: "01", t: "Brief", p: "You describe the vision — a real place, a spawn concept, a full server world." },
  { n: "02", t: "Quote", p: "Transparent scope, timeline and pricing sent within 2 to 24 hours." },
  { n: "03", t: "Build", p: "Progress shots, WorldEdit precision, constant back-and-forth with you." },
  { n: "04", t: "Delivery", p: "Final render pass, schematic handoff or direct server integration." },
];

export default function Process() {
  const pin = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(max-width: 800px)").matches) return;
    const steps = pin.current.querySelectorAll(".process-step");
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pin.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.7,
      },
    });
    steps.forEach((s, i) => {
      tl.to(steps, { opacity: 0.28, duration: 0.2 }, i * 0.25);
      tl.to(s, { opacity: 1, duration: 0.2 }, i * 0.25);
    });
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section className="process" id="process">
      <div className="process-pin" ref={pin}>
        <div className="process-sticky">
          <div>
            <span className="eyebrow">Process</span>
            <h2 className="display">From brief to block</h2>
          </div>
          <div>
            {STEPS.map((s, i) => (
              <article key={s.n} className={`process-step ${i === 0 ? "is-on" : ""}`}>
                <div className="num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.p}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
