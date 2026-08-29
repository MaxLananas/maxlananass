import { useEffect, useState } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Header({ hidden }) {
  const [time, setTime] = useState("00:00:00");
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const links = [
    { href: "#index", label: "Index" },
    { href: "#archive", label: "Archive" },
    { href: "#process", label: "Process" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <>
      <header className={`site-header ${hidden ? "hide" : ""}`}>
        <a href="#index" className="brand" data-cursor="hidden">
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M16 2 28 9v14L16 30 4 23V9Z" />
            <path d="M16 2v14M16 16 4 9M16 16l12-7M16 16v14" />
          </svg>
          MaxLananas
        </a>
        <nav className="main-nav">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="header-meta">
          <span>Commissions closed</span>
          <time className="header-clock">{time}</time>
        </div>
        <a className="btn-discord" href="https://discord.gg/pnJhKuU2QK" target="_blank" rel="noopener" data-cursor="hidden">
          Discord
        </a>
        <button className="nav-toggle" onClick={() => setMenu((v) => !v)} aria-label="Menu">
          {menu ? "×" : "☰"}
        </button>
      </header>
      {menu && (
        <div className="menu">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenu(false)}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
