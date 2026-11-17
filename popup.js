const DEFAULTS = { enabled: true, domains: [], text: "PRODUCTION" };
const $ = (id) => document.getElementById(id);
const store = chrome.storage.sync;

// Accepts "https://app.x.com/path", "app.x.com:8080", "*.x.com" → bare (wildcard) hostname
function normalize(input) {
  let s = (input || "").trim().toLowerCase();
  const wild = s.startsWith("*.");
  if (wild) s = s.slice(2);
  try {
    s = new URL(s.includes("://") ? s : "https://" + s).hostname;
  } catch {
    return null;
  }
  return s ? (wild ? "*." + s : s) : null;
}

function render(domains) {
  const list = $("domainList");
  list.replaceChildren();
  if (!domains.length) {
    list.innerHTML = '<li class="empty">No sites yet</li>';
    return;
  }
  for (const d of domains) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = d;
    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.title = "Remove";
    btn.onclick = () => updateDomains((ds) => ds.filter((x) => x !== d));
    li.append(span, btn);
    list.append(li);
  }
}

function updateDomains(fn) {
  store.get(DEFAULTS, ({ domains }) => {
    const next = fn(domains);
    store.set({ domains: next }, () => render(next));
  });
}

function addDomain(input) {
  const d = normalize(input);
  if (d) updateDomains((ds) => (ds.includes(d) ? ds : [...ds, d]));
}

$("addCurrent").onclick = () =>
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => addDomain(tab?.url));

$("addManual").onclick = () => {
  addDomain($("domainInput").value);
  $("domainInput").value = "";
};
$("domainInput").onkeydown = (e) => e.key === "Enter" && $("addManual").click();

$("saveText").onclick = () => {
  store.set({ text: $("textInput").value.trim() || DEFAULTS.text }, () => {
    $("saveText").textContent = "Saved ✓";
    setTimeout(() => ($("saveText").textContent = "Save"), 1200);
  });
};
$("textInput").onkeydown = (e) => e.key === "Enter" && $("saveText").click();

$("enabled").onchange = (e) => store.set({ enabled: e.target.checked });

store.get(DEFAULTS, ({ enabled, domains, text }) => {
  $("enabled").checked = enabled;
  $("textInput").value = text;
  render(domains);
});
