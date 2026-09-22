const BASE = "";
const F = [BASE+"primera.jpg", BASE+"primera-cita.jpg", BASE+"primera-novios.jpg"];
document.querySelectorAll(".featured").forEach((el,i)=>{
  el.dataset.full = F[i];
  el.querySelector("img").src = F[i];
});
const track0 = document.getElementById("railTrack");
const tilts = [-2,1.8,-1.2,1.4,-1.8,1.1,-0.8,2,-1.5,1.3];
for (let i=1;i<=54;i++){
  const src = BASE+"t"+String(i).padStart(2,"0")+".jpg";
  const fig = document.createElement("figure");
  fig.className = "polaroid";
  fig.dataset.full = src;
  fig.style.setProperty("--tilt", tilts[(i-1)%tilts.length]+"deg");
  fig.innerHTML = '<img src="'+src+'" alt="" />';
  track0.appendChild(fig);
}

const $ = (id) => document.getElementById(id);
const START = new Date("2024-10-26T00:00:00-03:00");
const previewFiesta = /(?:^|[?&])fiesta(?:=1|&|$)/.test(location.search);
let fiestaOn = false;
const FIESTA_TXT = "Hoy ya son dos años con la persona más linda del mundo, te mereces todo y un poco más";
const FIESTA_DAY = "2026-10-26";

function fechaAR(d) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d);
}

function esDiaFiesta(d) {
  return previewFiesta || fechaAR(d) === FIESTA_DAY;
}

function diffParts(from, to) {
  let seconds = Math.max(0, Math.floor((to - from) / 1000));
  const s = seconds % 60; seconds = Math.floor(seconds / 60);
  const m = seconds % 60; seconds = Math.floor(seconds / 60);
  const h = seconds % 24;
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) { years -= 1; months += 12; }
  if (years < 0) years = months = days = 0;
  return { years, months, days, hours: h, minutes: m, seconds: s };
}

function nextAnniversary(from, now) {
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  next.setFullYear(now.getFullYear());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (next < today) next.setFullYear(now.getFullYear() + 1);
  return next;
}

function setFiesta(on) {
  fiestaOn = on;
  document.body.classList.toggle("fiesta", on);
  const msg = $("fiestaMsg");
  if (msg) {
    if (on) msg.textContent = FIESTA_TXT;
    else msg.textContent = "";
  }
}

function renderCounter() {
  const now = new Date();
  const p = diffParts(START, now);
  const units = [
    ["años", p.years], ["meses", p.months], ["días", p.days],
    ["horas", p.hours], ["min", p.minutes], ["seg", p.seconds]
  ];
  const next = nextAnniversary(START, now);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const left = Math.round((next - today) / 86400000);
  const isDay = esDiaFiesta(now);
  $("chip").textContent = isDay
    ? `Hoy es el aniversario · ${Math.max(p.years, previewFiesta ? 2 : 0)} año${p.years === 1 && !previewFiesta ? "" : "s"} juntos`
    : `Faltan ${left} día${left === 1 ? "" : "s"} para el próximo aniversario`;
  const totalDays = Math.floor((now - START) / 86400000);
  $("sub").innerHTML = `<span><strong>${totalDays}</strong> días juntitos</span>`;
  $("counter").innerHTML = units.map(([label, n]) =>
    `<div class="unit"><b>${n}</b><span>${label}</span></div>`
  ).join("");
  setFiesta(isDay);
}

function spawnHearts() {
  const root = $("hearts");
  const n = fiestaOn ? 22 : 10;
  for (let i = 0; i < n; i++) {
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = i % 3 === 0 ? "♥" : "♡";
    h.style.left = Math.random() * 100 + "%";
    h.style.fontSize = (fiestaOn ? 14 : 12) + Math.random() * (fiestaOn ? 22 : 16) + "px";
    h.style.animationDuration = 6 + Math.random() * 6 + "s";
    h.style.animationDelay = Math.random() * 3 + "s";
    root.appendChild(h);
    setTimeout(() => h.remove(), 14000);
  }
}

function openLightbox(src) {
  $("lbImg").src = src;
  $("lightbox").classList.add("open");
}

document.querySelectorAll(".featured[data-full]").forEach((el) => {
  el.addEventListener("click", () => openLightbox(el.dataset.full));
});
$("btnCloseLb").onclick = () => $("lightbox").classList.remove("open");
$("lightbox").addEventListener("click", (e) => {
  if (e.target.id === "lightbox") $("lightbox").classList.remove("open");
});

const rail = $("rail");
const track = rail.querySelector(".rail-track");
[...track.children].forEach((el) => track.appendChild(el.cloneNode(true)));
let hold = false, dragging = false, x = 0, startX = 0, startPos = 0, lastX = 0, lastT = 0, vx = 0, moved = 0;
const cruise = 0.85, friction = 0.92;
function apply() {
  const half = track.scrollWidth / 2;
  if (half < 10) return;
  while (x <= -half) x += half;
  while (x > 0) x -= half;
  track.style.transform = "translate3d(" + x + "px,0,0)";
}
function tick() {
  const lbOpen = document.getElementById("lightbox").classList.contains("open");
  if (!hold && !lbOpen) {
    x += vx - cruise;
    vx *= friction;
    if (Math.abs(vx) < 0.15) vx = 0;
    apply();
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
rail.addEventListener("pointerdown", (e) => {
  hold = true; dragging = true; moved = 0; vx = 0;
  startX = lastX = e.clientX; startPos = x; lastT = performance.now();
  rail.classList.add("grabbing");
  rail.setPointerCapture(e.pointerId);
});
rail.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const now = performance.now();
  const dx = e.clientX - startX;
  const step = e.clientX - lastX;
  const dt = Math.max(8, now - lastT);
  vx = Math.max(-40, Math.min(40, vx * 0.6 + step * (16 / dt) * 0.4));
  lastX = e.clientX; lastT = now;
  moved = Math.max(moved, Math.abs(dx));
  x = startPos + dx;
  apply();
});
function endDrag() {
  if (!dragging) return;
  dragging = false; hold = false;
  rail.classList.remove("grabbing");
  if (performance.now() - lastT > 80) vx = 0;
}
rail.addEventListener("pointerup", endDrag);
rail.addEventListener("pointercancel", endDrag);
rail.querySelectorAll("[data-full]").forEach((el) => {
  el.addEventListener("click", (e) => {
    if (moved > 8) { e.preventDefault(); return; }
    openLightbox(el.dataset.full);
  });
});
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
}, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = Math.min(i * 0.08, 0.32) + "s";
  io.observe(el);
});
renderCounter();
spawnHearts();
setInterval(renderCounter, 1000);
setInterval(spawnHearts, 9000);
