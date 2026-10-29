// ====== YOUR SETTINGS (edit these two lines) ======
const HER_NAME = "";            // e.g. "Anisha". Leave "" to show "my love"
const ACCESS_KEY = "8497df51-ef16-4c12-a73f-bc3ad57400ae";   // from web3forms.com (free)
// ==================================================

const $ = (id) => document.getElementById(id);
const yes = $("yes"), no = $("no");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (HER_NAME) $("her-name").textContent = HER_NAME;

/* ---------- decoration: fairy lights + petals ---------- */
(function decorate() {
  const lights = document.querySelector(".lights");
  const count = Math.max(8, Math.min(22, Math.floor(innerWidth / 55)));
  for (let i = 0; i < count; i++) {
    const l = document.createElement("i");
    l.style.animationDelay = (i * 0.37) % 3 + "s";
    lights.appendChild(l);
  }
  if (reduceMotion) return;
  const petals = document.querySelector(".petals");
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    p.style.left = Math.random() * 100 + "%";
    p.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
    p.style.animationDuration = 12 + Math.random() * 10 + "s";
    p.style.animationDelay = -Math.random() * 20 + "s";
    p.style.transform = "scale(" + (0.7 + Math.random() * 0.7) + ")";
    petals.appendChild(p);
  }
})();

/* ---------- the question loop ----------
   Every "No" shows a NEW page. After the last one it goes back to the
   second page and keeps looping until she presses YES.
   Want your own GIFs? Put them in an "images" folder next to index.html
   and set gif: "images/yourfile.gif" on any page below. */
const STAGES = [
  { art: "🪔", anim: "a-bounce", q: "Will you go on a Tihar date with me? 💗", sub: "", no: "No 🙈" },
  { art: "🥺", anim: "a-pulse",  sad: true, q: "Are you sure?", sub: "Look at this little face. Please think again.", no: "Still no 🙈" },
  { art: "🪔", anim: "a-dim",    q: "The diyas are waiting for us…", sub: "They only shine their brightest when you say yes.", no: "No 😶" },
  { art: "😭", anim: "a-shake",  sad: true, q: "Pretty please? 🥹", sub: "I will bring your favorite sweets.", no: "No 🙈" },
  { art: "💔", anim: "a-wobble", q: "My heart just cracked a little.", sub: "A date is all it would take to fix it.", no: "Nope 😝" },
  { art: "🧸", anim: "a-spin",   sad: true, q: "This teddy is begging you.", sub: "He says you have the kindest heart.", no: "No 🙈" },
  { art: "✨", anim: "a-pulse",  q: "The fairy lights are getting dim…", sub: "Only one little word can light them up again.", no: "No 🙊" },
  { art: "💗", anim: "a-bounce", q: "I am not giving up, my love.", sub: "I will ask again and again and again.", no: "No 😜" },
];
// Each page can also use its own GIF, for example: { ..., gif: "images/sad1.gif" }
const LOOP_START = 1;           // after the last page, return to page number 2
let stage = 0, noCount = 0, dodgesLeft = 0, lastDodge = 0;
let lastPtr = { x: innerWidth / 2, y: innerHeight / 2 };
const slot = $("no-slot");
// How many times "No" runs away on each page before she can catch it.
const DODGES_MOUSE = 4, DODGES_TOUCH = 2;
const YES_GROWTH = 0.4;         // YES gets this much bigger with every No

function unfly() {              // put the No button back in its normal place
  if (no.classList.contains("flying")) {
    slot.appendChild(no);
    no.classList.remove("flying");
    no.style.left = no.style.top = "";
  }
  slot.style.width = slot.style.height = "";
}

function dodge() {
  const now = Date.now();
  if (now - lastDodge < 250 || dodgesLeft <= 0) return;
  lastDodge = now; dodgesLeft--;
  const r = no.getBoundingClientRect(), w = r.width, h = r.height;
  if (!no.classList.contains("flying")) {
    slot.style.width = w + "px"; slot.style.height = h + "px";   // keep its old space
    document.body.appendChild(no);                               // so page scaling can't move it
    no.style.left = r.left + "px"; no.style.top = r.top + "px";
    no.classList.add("flying"); void no.offsetWidth;
  }
  // stay well inside the screen: never touch edges or corners
  const mx = Math.max(16, innerWidth * 0.06), bot = Math.max(16, innerHeight * 0.06);
  const minX = mx, maxX = innerWidth - w - mx, minY = Math.max(72, innerHeight * 0.14), maxY = innerHeight - h - bot;
  const yr = yes.getBoundingClientRect();
  let best = null, bestScore = -1, any = null;
  for (let i = 0; i < 50; i++) {
    const x = minX + Math.random() * Math.max(0, maxX - minX);
    const y = minY + Math.random() * Math.max(0, maxY - minY);
    any = { x, y };
    const cx = x + w / 2, cy = y + h / 2;
    const overYes = x < yr.right + 14 && x + w > yr.left - 14 && y < yr.bottom + 14 && y + h > yr.top - 14;
    const inCorner = Math.min(cx, innerWidth - cx) < innerWidth * 0.18 && Math.min(cy, innerHeight - cy) < innerHeight * 0.18;
    if (overYes || inCorner) continue;
    const score = Math.hypot(cx - lastPtr.x, cy - lastPtr.y);   // as far from the cursor as possible
    if (score > bestScore) { bestScore = score; best = { x, y }; }
  }
  const t = best || any;
  no.style.left = t.x + "px"; no.style.top = t.y + "px";
}

document.addEventListener("pointermove", (e) => {
  lastPtr = { x: e.clientX, y: e.clientY };
  if (e.pointerType !== "mouse" || current !== "ask" || dodgesLeft <= 0) return;
  const r = no.getBoundingClientRect();
  if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 110) dodge();
});
no.addEventListener("pointerdown", (e) => {
  lastPtr = { x: e.clientX, y: e.clientY };
  if (dodgesLeft > 0) { e.preventDefault(); dodge(); }
});
no.addEventListener("click", (e) => {
  if (dodgesLeft > 0) { e.preventDefault(); dodge(); return; }
  noCount++;
  stage = stage + 1 >= STAGES.length ? LOOP_START : stage + 1;
  renderStage();
});
addEventListener("resize", () => {
  if (!no.classList.contains("flying")) return;
  const r = no.getBoundingClientRect();
  no.style.left = Math.max(8, Math.min(r.left, innerWidth - r.width - 8)) + "px";
  no.style.top = Math.max(8, Math.min(r.top, innerHeight - r.height - 8)) + "px";
});

function renderStage() {
  unfly();
  dodgesLeft = matchMedia("(pointer: coarse)").matches ? DODGES_TOUCH : DODGES_MOUSE;
  const s = STAGES[stage], ask = $("ask"), art = $("art"), emoji = $("art-emoji"), gif = $("art-gif");
  $("intro").hidden = stage > 0 || noCount > 0;   // the wish is only on the very first page
  emoji.textContent = s.art;
  emoji.className = "art-emoji " + s.anim;
  art.classList.toggle("sad", !!s.sad);
  if (s.gif) { gif.src = s.gif; gif.hidden = false; emoji.hidden = true; }
  else { gif.hidden = true; emoji.hidden = false; }
  $("question").textContent = s.q;
  $("sub").textContent = s.sub;
  no.textContent = s.no;
  // YES grows with every No, as big as the screen safely allows
  const want = 1 + noCount * YES_GROWTH;
  const cap = Math.max(1, Math.min(0.9 * innerWidth / yes.offsetWidth, 0.3 * innerHeight / yes.offsetHeight, 5));
  const sc = Math.min(want, cap);
  yes.style.transform = "scale(" + sc.toFixed(3) + ")";
  yes.style.margin = ((sc - 1) * yes.offsetHeight / 2).toFixed(1) + "px 0";
  $("actions").classList.toggle("stack", sc > 1.2);
  ask.classList.remove("turn"); void ask.offsetWidth; ask.classList.add("turn");
  if (typeof fit === "function") fit();
}

/* ---------- screens + "never scroll" fitting ---------- */
const SCREENS = ["ask", "plan", "step-date", "step-time", "step-activity", "done"];
let current = "ask";

// If a page is ever taller or wider than the screen, shrink it until it fits.
function fit() {
  const sc = $(current), m = document.querySelector("main");
  if (!sc) return;
  sc.style.setProperty("--fit", 1);
  const cs = getComputedStyle(m);
  const availH = m.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const availW = m.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const k = Math.min(1, availH / sc.offsetHeight, availW / sc.offsetWidth);
  sc.style.setProperty("--fit", Math.max(0.45, k).toFixed(3));
}
function show(id) {
  current = id;
  if (id !== "ask") unfly();
  SCREENS.forEach((s) => ($(s).hidden = s !== id));
  document.querySelectorAll(".error").forEach((e) => (e.hidden = true));
  fit();
}
addEventListener("resize", fit);
if (window.visualViewport) visualViewport.addEventListener("resize", fit);
if (document.fonts) document.fonts.ready.then(fit);
addEventListener("load", fit);

function floatHearts(n) {
  if (reduceMotion) return;
  const box = document.querySelector(".hearts");
  for (let i = 0; i < n; i++) {
    const h = document.createElement("span");
    h.className = "heart";
    h.textContent = "♥";
    h.style.left = Math.random() * 100 + "%";
    h.style.fontSize = 14 + Math.random() * 22 + "px";
    h.style.animationDuration = 4 + Math.random() * 4 + "s";
    h.style.animationDelay = Math.random() * 2.5 + "s";
    box.appendChild(h);
    setTimeout(() => h.remove(), 10000);
  }
}
yes.addEventListener("click", () => { show("plan"); floatHearts(26); });
$("to-plan").addEventListener("click", () => show("step-date"));
fit();

/* ---------- the plan: one small question per page ---------- */
const form = $("date-form"), sendBtn = $("send");
function showError(msg) {
  const e = $(current).querySelector(".error");
  e.textContent = msg; e.hidden = false; fit();
}
function prettyDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function prettyTime(t) {
  const [h, m] = t.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function validDate() { const d = $("date").value; return d >= "2026-11-01" && d <= "2026-11-30"; }

form.querySelectorAll("[data-next]").forEach((b) => b.addEventListener("click", () => {
  if (current === "step-date" && !validDate()) return showError("Please pick a day in November 2026.");
  if (current === "step-time" && !$("time").value) return showError("Please pick a time.");
  show(b.dataset.next);
}));
form.querySelectorAll("[data-back]").forEach((b) => b.addEventListener("click", () => show(b.dataset.back)));
form.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => { $("time").value = b.dataset.t; }));
form.addEventListener("change", () => {
  const other = form.activity.value === "Something else";
  $("custom-wrap").hidden = !other;
  fit();
  if (other) $("custom").focus();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Pressing Enter on an earlier page just moves forward
  if (current === "step-date") return $(current).querySelector("[data-next]").click();
  if (current === "step-time") return $(current).querySelector("[data-next]").click();

  const date = $("date").value, time = $("time").value;
  const activity = form.activity.value, custom = $("custom").value.trim();
  if (activity === "Something else" && !custom) return showError("Tell me your idea in the box, or pick another option.");
  if (!ACCESS_KEY || ACCESS_KEY.startsWith("PASTE_")) {
    return showError("The email link is not connected yet. (Owner: add your Web3Forms key in script.js.)");
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "Sending…";
  const summary = prettyDate(date) + " at " + prettyTime(time) + " · " + (custom || activity);
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: "💗 Tihar date plan from her",
        from_name: "Tihar proposal site",
        message: "She said YES! 💗",
        Date: prettyDate(date),
        Time: prettyTime(time),
        Activity: activity,
        "Her own idea": custom || "-",
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "failed");
    $("summary").textContent = summary;
    show("done");
    floatHearts(18);
  } catch (_) {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send my plan 💌";
    showError("That did not go through. Please check your internet and press the button again.");
  }
});

renderStage();   // show the first question
