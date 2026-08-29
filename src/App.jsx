import { useCallback, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Lenis from "lenis";
import Archive from "./components/Archive";
import Contact from "./components/Contact";
import Cursor from "./components/Cursor";
import Header from "./components/Header";
import Loader from "./components/Loader";
import Process from "./components/Process";
import Stage from "./components/Stage";
import { setMouse, world } from "./lib/store";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function App() {
  const [booted, setBooted] = useState(false);
  const [hideNav, setHideNav] = useState(false);

  const onDone = useCallback(() => setBooted(true), []);

  useEffect(() => {
    world.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const move = (e) => {
      setMouse((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    if (!booted) return;
    const reduced = world.reduced;
    let lenis = null;
    if (!reduced) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      lenis._raf = raf;
    }
    let last = 0;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        setHideNav(y > last && y > 140);
        last = y;
      },
    });
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      const el = id && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: 0 });
      else gsap.to(window, { duration: 1, scrollTo: el, ease: "power3.inOut" });
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      st.kill();
      if (lenis) {
        if (lenis._raf) gsap.ticker.remove(lenis._raf);
        lenis.destroy();
      }
    };
  }, [booted]);

  return (
    <>
      <div className="noise" />
      <Cursor />
      {!booted && <Loader onDone={onDone} />}
      <Header hidden={hideNav} />
      <main>
        <Stage />
        <Archive />
        <Process />
        <Contact />
      </main>
      <nav className="quick-nav">
        <a href="#index">Index</a>
        <a href="#archive">Archive</a>
        <a href="#process">Process</a>
        <a href="#contact">Contact</a>
        <a className="cta" href="https://discord.gg/pnJhKuU2QK" target="_blank" rel="noopener" data-cursor="hidden">
          Discord
        </a>
      </nav>
    </>
  );
}
