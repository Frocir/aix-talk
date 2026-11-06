/* ============================================================
   Datawhale AI+X 高校行 · 动态分享站 交互
   全屏翻页 + 键盘/滚轮/触摸/圆点导航 + 进场动画
   ============================================================ */
(function () {
  "use strict";
  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;
  const dotsWrap = document.getElementById("dots");
  const curNo = document.getElementById("curNo");
  const bar = document.getElementById("progressBar");
  const hint = document.getElementById("hint");

  let cur = 0;
  let locked = false;

  // ---- 生成圆点导航 ----
  const dots = slides.map((s, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "第 " + (i + 1) + " 页");
    b.addEventListener("click", () => go(i));
    dotsWrap.appendChild(b);
    return b;
  });

  function render() {
    slides.forEach((s, i) => s.classList.toggle("active", i === cur));
    dots.forEach((b, i) => b.classList.toggle("on", i === cur));
    curNo.textContent = String(cur + 1).padStart(2, "0");
    bar.style.width = ((cur + 1) / total) * 100 + "%";
  }

  function go(n) {
    n = Math.max(0, Math.min(total - 1, n));
    if (n === cur || locked) return;
    locked = true;
    cur = n;
    render();
    setTimeout(() => (locked = false), 560);
  }

  // ---- 地址栏 hash 深链（可分享到某一页）----
  function fromHash() {
    const m = /^#s(\d+)$/.exec(location.hash);
    return m ? Math.max(0, Math.min(total - 1, +m[1] - 1)) : 0;
  }
  window.addEventListener("hashchange", () => {
    const n = fromHash();
    if (n !== cur) { cur = n; render(); }
  });

  const next = () => go(cur + 1);
  const prev = () => go(cur - 1);

  // ---- 键盘 ----
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": case " ": case "PageDown":
        e.preventDefault(); next(); break;
      case "ArrowLeft": case "ArrowUp": case "PageUp":
        e.preventDefault(); prev(); break;
      case "Home": go(0); break;
      case "End": go(total - 1); break;
      default:
        if (/^[1-9]$/.test(e.key)) {
          const idx = +e.key - 1;
          if (idx < total) go(idx);
        }
    }
  });

  // ---- 滚轮（节流） ----
  let wlock = false;
  window.addEventListener("wheel", (e) => {
    if (wlock || Math.abs(e.deltaY) < 12) return;
    wlock = true;
    e.deltaY > 0 ? next() : prev();
    setTimeout(() => (wlock = false), 820);
  }, { passive: true });

  // ---- 触摸滑动 ----
  let ts = 0;
  window.addEventListener("touchstart", (e) => { ts = e.touches[0].clientX; }, { passive: true });
  window.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - ts;
    if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
  }, { passive: true });

  // ---- 上下箭头按钮 ----
  document.getElementById("nextBtn").addEventListener("click", next);
  document.getElementById("prevBtn").addEventListener("click", prev);

  // ---- 提示淡出 ----
  setTimeout(() => hint && hint.classList.add("hide"), 4200);

  // ---- 初始化 ----
  cur = fromHash();
  render();
})();
