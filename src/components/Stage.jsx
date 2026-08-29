import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FEATURED } from "../data/builds";
import { setProgress } from "../lib/store";
import World from "../scene/World";

gsap.registerPlugin(ScrollTrigger);

const PROLOGUE = {
  kicker: "001 — Minecraft builder, France",
  title: ["I translate", "real places", "into blocks"],
  copy: "Custom 1:1 recreations, monumental spawns and organic terraforming — more than a hundred builds, walked at true scale.",
};

export default function Stage() {
  const root = useRef(null);
  const [chapter, setChapter] = useState(-1);

  const chapters = useMemo(
    () => [
      { ...PROLOGUE, id: "prologue" },
      ...FEATURED.map((f) => ({
        id: f.id,
        kicker: `${f.index} — ${f.kicker}`,
        title: f.title,
        copy: f.copy,
        index: f.index,
      })),
    ],
    []
  );

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      onUpdate: (self) => {
        setProgress(self.progress);
        const i = self.progress < 0.12 ? -1 : Math.min(FEATURED.length - 1, Math.floor((self.progress - 0.12) / (0.88 / FEATURED.length)));
        setChapter(i);
      },
    });
    return () => st.kill();
  }, []);

  const active = chapter < 0 ? chapters[0] : chapters[chapter + 1];

  return (
    <section className="stage" id="index" ref={root}>
      <div className="stage-sticky">
        <div className="webgl">
          <Canvas
            dpr={[1, 1.4]}
            gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
            camera={{ fov: 42, position: [0, 0, 9], near: 0.1, far: 80 }}
            onCreated={({ gl }) => {
              gl.setClearColor("#0b0b0a", 1);
            }}
          >
            <Suspense fallback={null}>
              <World />
            </Suspense>
          </Canvas>
        </div>
        <div className="stage-overlay">
          <p className="stage-kicker">{active.kicker}</p>
          <div>
            <h1 className="stage-title">
              {active.title.map((w) => (
                <span className="line" key={w + active.id}>
                  {w}
                </span>
              ))}
            </h1>
            <p className="stage-copy" style={{ marginTop: 18 }}>
              {active.copy}
            </p>
          </div>
          <div className="stage-bottom">
            <span className="stage-index">{chapter < 0 ? "00 / 05" : `${FEATURED[chapter].index} / 05`}</span>
            <a className="scroll-cue" href="#archive">
              <i />
              Scroll
            </a>
            <span className="stage-index">100+ builds · WorldEdit</span>
          </div>
        </div>
      </div>
    </section>
  );
}
