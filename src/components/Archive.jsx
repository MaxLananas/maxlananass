import { useEffect, useMemo, useRef, useState } from "react";
import { CREDITS, FILES } from "../data/builds";
import { connectionProfile, progressiveLoad, proxyChain, sourceUrl } from "../lib/images";

const SORTS = ["featured", "newest", "oldest"];

function shuffled(len) {
  const arr = Array.from({ length: len }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Archive() {
  const profile = useMemo(() => connectionProfile(), []);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(0);
  const [order, setOrder] = useState(() => shuffled(FILES.length));
  const [lb, setLb] = useState(null);
  const masonry = useRef(null);
  const loaded = useRef(new Set());

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    let idxs = order.filter((i) => {
      const f = FILES[i];
      const type = f.credit ? "collab" : "original";
      if (filter !== "all" && type !== filter) return false;
      if (!term) return true;
      const bits = [f.name, f.credit ? CREDITS[f.credit].linkText : "", ...(f.tags || [])].join(" ").toLowerCase();
      return bits.includes(term);
    });
    const mode = SORTS[sort];
    if (mode !== "featured") {
      const dated = idxs.filter((i) => FILES[i].ts != null);
      const undated = idxs.filter((i) => FILES[i].ts == null);
      dated.sort((a, b) => (mode === "newest" ? FILES[b].ts - FILES[a].ts : FILES[a].ts - FILES[b].ts));
      idxs = [...dated, ...undated];
    }
    return idxs;
  }, [filter, q, sort, order]);

  useEffect(() => {
    const root = masonry.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          const i = Number(img.dataset.index);
          if (loaded.current.has(i)) return;
          const w = Math.min(560, Math.round((img.parentElement?.clientWidth || 240) * Math.min(devicePixelRatio || 1, 1.75) * profile.scale));
          progressiveLoad(img, FILES[i].name, w, profile.quality)
            .then((im) => {
              loaded.current.add(i);
              if (im?.naturalWidth) img.parentElement.style.aspectRatio = `${im.naturalWidth} / ${im.naturalHeight}`;
            })
            .catch(() => {
              img.src = sourceUrl(FILES[i].name);
              img.classList.add("loaded");
            });
          io.unobserve(img);
        });
      },
      { rootMargin: "500px 0px" }
    );
    root.querySelectorAll("img[data-index]").forEach((img) => io.observe(img));
    return () => io.disconnect();
  }, [visible, profile]);

  useEffect(() => {
    if (lb == null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLb(null);
      if (e.key === "ArrowRight") setLb((i) => (i + 1) % FILES.length);
      if (e.key === "ArrowLeft") setLb((i) => (i - 1 + FILES.length) % FILES.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb]);

  const item = lb != null ? FILES[lb] : null;
  const credit = item?.credit ? CREDITS[item.credit] : null;

  return (
    <section className="archive" id="archive">
      <div className="archive-head">
        <span className="eyebrow">Archive</span>
        <h2 className="display">One hundred builds</h2>
        <p style={{ color: "var(--paper-dim)", marginTop: 12 }}>
          Originals, collaborations and commissions — search, filter, shuffle.
        </p>
      </div>
      <form className="search" onSubmit={(e) => e.preventDefault()}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search builds, places, tags…" />
      </form>
      <div className="controls">
        <div className="tabs">
          {["all", "original", "collab"].map((f) => (
            <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "original" ? "Originals" : "Collaborations"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="sort-btn"
            onClick={() => setSort((s) => (s + 1) % SORTS.length)}
          >
            {SORTS[sort]}
          </button>
          <button className="icon-btn" onClick={() => { setOrder(shuffled(FILES.length)); setSort(0); }} aria-label="Shuffle">
            ⟲
          </button>
        </div>
      </div>
      <p className="results">Showing {visible.length} of {FILES.length} builds</p>
      <div className="masonry" ref={masonry}>
        {visible.map((i) => (
          <div className="tile" key={FILES[i].name} data-cursor="view" onClick={() => setLb(i)}>
            <span className="tile-plate">#{String(i + 1).padStart(3, "0")}</span>
            <img alt="Minecraft build by MaxLananas" data-index={i} decoding="async" />
          </div>
        ))}
      </div>

      <div className={`lightbox ${lb != null ? "open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setLb(null); }}>
        <button className="lb-btn lb-close" onClick={() => setLb(null)} aria-label="Close">×</button>
        <button className="lb-btn lb-prev" onClick={() => setLb((i) => (i - 1 + FILES.length) % FILES.length)}>‹</button>
        {item && (
          <LightboxImage name={item.name} />
        )}
        <button className="lb-btn lb-next" onClick={() => setLb((i) => (i + 1) % FILES.length)}>›</button>
        {credit && (
          <div className="lb-caption">
            {credit.text} {credit.linkUrl ? <a href={credit.linkUrl} target="_blank" rel="noopener">{credit.linkText}</a> : <strong>{credit.linkText}</strong>}
          </div>
        )}
      </div>
    </section>
  );
}

function LightboxImage({ name }) {
  const ref = useRef(null);
  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    const w = Math.min(1400, Math.round(window.innerWidth * Math.min(devicePixelRatio || 1, 1.75)));
    const urls = proxyChain(name, w, 78);
    let i = 0;
    img.onerror = () => {
      i += 1;
      if (i < urls.length) img.src = urls[i];
      else img.src = sourceUrl(name);
    };
    img.src = urls[0];
  }, [name]);
  return <img ref={ref} alt="Minecraft build by MaxLananas" />;
}
