// Prod Guard: covers configured production sites with a click-through watermark.
(() => {
  const OVERLAY_ID = "__prod_guard_overlay__";
  const DEFAULTS = { enabled: true, domains: [], text: "PRODUCTION" };
  let observer = null;

  // "example.com" = exact host; "*.example.com" = example.com + all subdomains
  function matches(host, domains) {
    return domains.some((d) => {
      d = d.trim().toLowerCase();
      if (!d) return false;
      if (d.startsWith("*.")) {
        const base = d.slice(2);
        return host === base || host.endsWith("." + base);
      }
      return host === d;
    });
  }

  const escapeXml = (s) =>
    s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

  function buildOverlay(text) {
    const t = escapeXml(text);
    const line = (y) =>
      `<text x="10" y="${y}" font-size="28" font-family="Arial, sans-serif" fill="rgba(255,0,0,0.18)" transform="rotate(-28 210,110)">${t}</text>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="220">${line(60)}${line(170)}</svg>`;

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      pointerEvents: "none",
      backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`,
      backgroundRepeat: "repeat",
    });

    const banner = document.createElement("div");
    Object.assign(banner.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) rotate(-28deg)",
      fontSize: "min(8vw, 90px)",
      fontFamily: "Arial, sans-serif",
      fontWeight: "900",
      color: "rgba(255,0,0,0.20)",
      whiteSpace: "nowrap",
      pointerEvents: "none",
    });
    banner.textContent = text;
    overlay.appendChild(banner);
    return overlay;
  }

  function hide() {
    observer?.disconnect();
    observer = null;
    document.getElementById(OVERLAY_ID)?.remove();
  }

  function show(text) {
    hide();
    const root = document.documentElement; // exists at document_start, survives SPA <body> swaps
    const overlay = buildOverlay(text);
    root.appendChild(overlay);
    // Re-attach if the page wipes it
    observer = new MutationObserver(() => overlay.isConnected || root.appendChild(overlay));
    observer.observe(root, { childList: true });
  }

  function apply() {
    chrome.storage.sync.get(DEFAULTS, ({ enabled, domains, text }) => {
      if (enabled && matches(location.hostname.toLowerCase(), domains)) show(text || DEFAULTS.text);
      else hide();
    });
  }

  apply();
  chrome.storage.onChanged.addListener((_, area) => area === "sync" && apply());
})();
