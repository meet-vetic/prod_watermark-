// Prod Guard: covers configured production sites with a click-through watermark.
(() => {
  const OVERLAY_ID = "__prod_guard_overlay__";
  const DEFAULTS = { enabled: true, domains: [], text: "PRODUCTION", intensity: 3 };
  // intensity 1 = centre banner only; 2..5 = tiled, denser + stronger. 5 = original look.
  const TILE = { 2: [2.2, 0.07], 3: [1.7, 0.1], 4: [1.3, 0.14], 5: [1, 0.18] }; // [spacing scale, alpha]
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

  function buildOverlay(text, intensity) {
    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    Object.assign(overlay.style, { position: "fixed", inset: "0", zIndex: "2147483647", pointerEvents: "none" });

    const tile = TILE[intensity];
    if (tile) {
      const [scale, alpha] = tile;
      const w = 420 * scale, h = 220 * scale, t = escapeXml(text);
      const line = (y) =>
        `<text x="${10 * scale}" y="${y}" font-size="28" font-family="Arial, sans-serif" fill="rgba(255,0,0,${alpha})" transform="rotate(-28 ${w / 2},${h / 2})">${t}</text>`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${line(h * 60 / 220)}${line(h * 170 / 220)}</svg>`;
      overlay.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
    }

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

  function show(text, intensity) {
    hide();
    const root = document.documentElement; // exists at document_start, survives SPA <body> swaps
    const overlay = buildOverlay(text, intensity);
    root.appendChild(overlay);
    // Re-attach if the page wipes it
    observer = new MutationObserver(() => overlay.isConnected || root.appendChild(overlay));
    observer.observe(root, { childList: true });
  }

  function apply() {
    chrome.storage.sync.get(DEFAULTS, ({ enabled, domains, text, intensity }) => {
      if (enabled && matches(location.hostname.toLowerCase(), domains)) show(text || DEFAULTS.text, intensity);
      else hide();
    });
  }

  apply();
  chrome.storage.onChanged.addListener((_, area) => area === "sync" && apply());
})();
