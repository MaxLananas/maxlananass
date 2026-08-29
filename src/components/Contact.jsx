import { CREDITS, FILES } from "../data/builds";

export default function Contact() {
  const seen = [...new Set(FILES.map((f) => f.credit).filter(Boolean))];
  return (
    <>
      <section className="contact" id="contact">
        <span className="eyebrow">Get in touch</span>
        <h2>
          Let&apos;s
          <br />
          build
        </h2>
        <p>Custom 1:1 recreations, event spawns and terraforming. Commissions are closed right now — the Discord stays open.</p>
        <a className="discord" href="https://discord.gg/pnJhKuU2QK" target="_blank" rel="noopener" data-cursor="hidden">
          Open Discord
        </a>
        <div className="faq">
          <details>
            <summary>How much does a commission cost?</summary>
            <p>Pricing depends on scale, complexity and timeline. When commissions reopen, a free quote lands within 2 to 24 hours.</p>
          </details>
          <details>
            <summary>What is a 1:1 scale Minecraft build?</summary>
            <p>A faithful recreation of a real-world location, translated block by block at true scale using WorldEdit and elevation data.</p>
          </details>
          <details>
            <summary>Can I commission a spawn or event map?</summary>
            <p>Yes — when the books are open. Spawn areas, lobbies, competition maps and full server worlds are regular work.</p>
          </details>
        </div>
      </section>
      <footer className="site-footer">
        <div className="footer-giant">MaxLananas</div>
        <div className="footer-row">
          <div>MaxLananas</div>
          <nav className="footer-links">
            <a href="#index">Index</a>
            <a href="#archive">Archive</a>
            <a href="#process">Process</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
        <div className="credits">
          {seen.map((k) => {
            const c = CREDITS[k];
            const Tag = c.linkUrl ? "a" : "span";
            return (
              <Tag key={k} className="chip" href={c.linkUrl || undefined} target={c.linkUrl ? "_blank" : undefined} rel="noopener">
                <img src={`/${c.logo}`} alt="" />
                <span>{c.linkText}</span>
              </Tag>
            );
          })}
        </div>
        <p className="copy">© 2026 MaxLananas. All builds shown remain the property of their respective owners.</p>
      </footer>
    </>
  );
}
