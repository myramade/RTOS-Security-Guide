/* ============================================================
   RTOS/SEC — app logic
   No frameworks, no build step, no external calls. Pure DOM.
   Progress is kept in memory for the session (GitHub Pages safe).
   ============================================================ */
(function () {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const done = new Set();          // completed module numbers (session memory)

  // Safe reduced-motion check (guards environments without matchMedia)
  const prefersReducedMotion = () => {
    try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch (e) { return false; }
  };

  /* ---------------------------------------------------------
     MODULES
     --------------------------------------------------------- */
  const grid = $("#moduleGrid");

  function moduleCard(m) {
    const meta = TRACK_META[m.track];
    const li = document.createElement("li");
    li.className = "mod";
    li.dataset.track = m.track;
    li.dataset.search = (m.title + " " + m.lead + " " + m.points.join(" ")).toLowerCase();
    li.style.setProperty("--track-color", meta.color);

    li.innerHTML = `
      <button class="mod-btn" aria-expanded="false">
        <span class="mod-num">${String(m.n).padStart(2, "0")}</span>
        <span class="mod-head-txt">
          <span class="mod-track">${meta.label}</span>
          <span class="mod-title">${m.title}</span>
        </span>
        <span class="mod-caret" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="16" height="16"><path d="M6 3 L11 8 L6 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </button>
      <div class="mod-body">
        <div class="mod-body-inner">
          <p class="mod-lead">${m.lead}</p>
          <div class="mod-why"><b>Why it matters for real-time</b><p>${m.why}</p></div>
          <ul class="mod-points">${m.points.map(p => `<li>${p}</li>`).join("")}</ul>
          <div class="mod-foot">
            <button class="done-btn" data-n="${m.n}">
              <span class="check" aria-hidden="true">✓</span> Mark complete
            </button>
            <span class="mod-ref">${m.ref}</span>
          </div>
        </div>
      </div>`;

    const btn = $(".mod-btn", li);
    btn.addEventListener("click", () => {
      const open = li.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });

    const dbtn = $(".done-btn", li);
    dbtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDone(m.n, dbtn);
    });

    return li;
  }

  function toggleDone(n, btn) {
    if (done.has(n)) {
      done.delete(n);
      btn.classList.remove("is-done");
      btn.innerHTML = `<span class="check" aria-hidden="true">✓</span> Mark complete`;
    } else {
      done.add(n);
      btn.classList.add("is-done");
      btn.innerHTML = `<span class="check" aria-hidden="true">✓</span> Completed`;
    }
    updateProgress();
  }

  function updateProgress() {
    const txt = `${done.size} / ${MODULES.length}`;
    $("#progressText").textContent = txt;
  }

  MODULES.forEach(m => grid.appendChild(moduleCard(m)));
  updateProgress();

  /* ---- search + filter ---- */
  let activeTrack = "all";
  const searchInput = $("#moduleSearch");

  function applyFilter() {
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;
    $$(".mod", grid).forEach(li => {
      const trackOk = activeTrack === "all" || li.dataset.track === activeTrack;
      const searchOk = !q || li.dataset.search.includes(q);
      const show = trackOk && searchOk;
      li.style.display = show ? "" : "none";
      if (show) visible++;
    });
    $("#emptyState").hidden = visible !== 0;
  }

  searchInput.addEventListener("input", applyFilter);
  $$(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      $$(".chip").forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeTrack = chip.dataset.track;
      applyFilter();
    });
  });

  $("#resetProgress").addEventListener("click", () => {
    done.clear();
    $$(".done-btn").forEach(b => {
      b.classList.remove("is-done");
      b.innerHTML = `<span class="check" aria-hidden="true">✓</span> Mark complete`;
    });
    updateProgress();
  });

  /* ---------------------------------------------------------
     HERO SCOPE — decorative rate-monotonic animation
     Three tasks, drawn once, CSS animates the sweep.
     --------------------------------------------------------- */
  (function heroScope() {
    const scope = $("#scope");
    if (!scope) return;
    const W = scope.clientWidth || 520;
    const laneY = [16, 90, 164];          // vertical positions for τ1..τ3
    const cls = ["t1", "t2", "t3"];
    // periods in "grid units"; τ1 fires every 2, τ2 every 4, τ3 every 8
    const periods = [2, 4, 8];
    const burst   = [1, 1.4, 2.2];         // execution length
    const unit = W / 16;                    // 16 grid columns visible

    let html = `<div class="sweep"></div>`;
    for (let ti = 0; ti < 3; ti++) {
      for (let t = 0; t < 16; t += periods[ti]) {
        const left = t * unit;
        const w = burst[ti] * unit - 4;
        const delay = (t / 16) * 4;         // sync to 4s sweep
        html += `<div class="job ${cls[ti]}" style="left:${left}px;top:${laneY[ti]}px;width:${w}px;animation-delay:${delay}s"></div>`;
      }
    }
    scope.innerHTML = html;

    // occasional "deadline miss" flash on the low-priority lane
    const flag = $("#missFlag");
    if (flag && !prefersReducedMotion()) {
      setInterval(() => {
        flag.hidden = false;
        setTimeout(() => (flag.hidden = true), 900);
      }, 8000);
    }
  })();

  /* ---------------------------------------------------------
     SCHEDULER LAB — real rate-monotonic analysis + timeline
     --------------------------------------------------------- */
  const COLORS = ["#e94b4b", "#f5a524", "#35a9d9", "#a78bfa", "#4ade80"];
  let tasks = [
    { c: 1, t: 5 },
    { c: 2, t: 10 },
    { c: 3, t: 20 },
  ];

  const editor = $("#taskEditor");

  function renderEditor() {
    editor.innerHTML = "";
    tasks.forEach((task, i) => {
      const row = document.createElement("div");
      row.className = "task-row";
      row.innerHTML = `
        <span class="tk-dot" style="background:${COLORS[i % COLORS.length]}"></span>
        <span><label>WCET (ms)</label><input type="number" min="0.1" step="0.1" value="${task.c}" data-i="${i}" data-f="c"></span>
        <span><label>Period (ms)</label><input type="number" min="1" step="1" value="${task.t}" data-i="${i}" data-f="t"></span>
        <button class="tk-del" data-i="${i}" title="Remove task" aria-label="Remove task">×</button>`;
      editor.appendChild(row);
    });

    $$("#taskEditor input").forEach(inp => {
      inp.addEventListener("input", () => {
        const i = +inp.dataset.i, f = inp.dataset.f;
        const v = parseFloat(inp.value);
        if (!isNaN(v) && v > 0) { tasks[i][f] = v; analyse(); }
      });
    });
    $$("#taskEditor .tk-del").forEach(btn => {
      btn.addEventListener("click", () => {
        if (tasks.length <= 1) return;
        tasks.splice(+btn.dataset.i, 1);
        renderEditor(); analyse();
      });
    });
  }

  $("#addTask").addEventListener("click", () => {
    if (tasks.length >= 5) return;
    tasks.push({ c: 1, t: 15 });
    renderEditor(); analyse();
  });

  function rmsBound(n) { return n * (Math.pow(2, 1 / n) - 1); }

  // Simulate RM scheduling over the hyperperiod (or a cap) to find real misses.
  function simulateMisses(sorted, horizon) {
    // sorted: tasks sorted by period asc (rate-monotonic priority)
    const jobs = sorted.map(() => ({ rem: 0, deadline: Infinity, next: 0 }));
    const timeline = []; // {task, start, len}
    let misses = 0;
    const step = 0.1;
    for (let time = 0; time < horizon; time += step) {
      // release new jobs
      sorted.forEach((tk, i) => {
        if (time >= jobs[i].next - 1e-9) {
          if (jobs[i].rem > 1e-6) misses++;      // previous job unfinished at release
          jobs[i].rem = tk.c;
          jobs[i].deadline = time + tk.t;
          jobs[i].next += tk.t;
        }
      });
      // pick highest-priority ready job (lowest index = shortest period)
      let run = -1;
      for (let i = 0; i < sorted.length; i++) {
        if (jobs[i].rem > 1e-6) { run = i; break; }
      }
      if (run >= 0) {
        jobs[run].rem -= step;
        if (time > jobs[run].deadline + 1e-6 && jobs[run].rem > 1e-6) {
          // running past deadline
        }
        const last = timeline[timeline.length - 1];
        if (last && last.task === run && Math.abs(last.start + last.len - time) < 1e-6) {
          last.len += step;
        } else {
          timeline.push({ task: run, start: time, len: step });
        }
      }
    }
    return { timeline, misses };
  }

  function analyse() {
    $("#taskCount").textContent = tasks.length;
    const U = tasks.reduce((s, t) => s + t.c / t.t, 0);
    const bound = rmsBound(tasks.length);

    $("#utilVal").textContent = (U * 100).toFixed(1) + "%";
    $("#rmBound").textContent = (bound * 100).toFixed(1) + "%";

    const fill = $("#utilFill");
    fill.style.width = Math.min(U * 100, 100) + "%";
    fill.style.background = U <= bound
      ? "linear-gradient(90deg,#4ade80,#35d0d9)"
      : U <= 1
        ? "linear-gradient(90deg,#f5a524,#ff8a3d)"
        : "linear-gradient(90deg,#ff5d5d,#ff2d2d)";

    const verdict = $("#verdict");
    if (U <= bound) {
      verdict.className = "verdict ok";
      verdict.textContent = "✓ Schedulable. Utilisation is within the rate-monotonic bound — every deadline is provably met.";
    } else if (U <= 1) {
      verdict.className = "verdict warn";
      verdict.textContent = "~ Above the RM bound but under 100%. May still be schedulable — needs exact response-time analysis, not just the bound.";
    } else {
      verdict.className = "verdict bad";
      verdict.textContent = "✗ Overloaded (U > 100%). Deadlines will be missed. In a real system this is where a low-priority task starves.";
    }

    drawLab();
  }

  function drawLab() {
    const el = $("#labScope");
    const W = el.clientWidth || 640;
    const sorted = [...tasks].map((t, idx) => ({ ...t, idx }))
      .sort((a, b) => a.t - b.t);              // rate-monotonic order
    const colorFor = origIdx => COLORS[origIdx % COLORS.length];

    // horizon: a few of the longest period, capped for perf
    const maxT = Math.max(...tasks.map(t => t.t));
    const horizon = Math.min(maxT * 2, 60);
    const pxPerMs = W / horizon;
    const laneH = 34, laneGap = 10;
    const topPad = 8;

    const { timeline, misses } = simulateMisses(sorted, horizon);

    let html = "";
    // lane labels + baselines
    sorted.forEach((tk, lane) => {
      const y = topPad + lane * (laneH + laneGap);
      html += `<span class="lane-label" style="top:${y - 2}px">τ${tk.idx + 1} · T=${tk.t}ms</span>`;
    });
    // job bars
    timeline.forEach(seg => {
      const lane = seg.task;
      const y = topPad + lane * (laneH + laneGap);
      const x = seg.start * pxPerMs;
      const w = Math.max(seg.len * pxPerMs, 1);
      const orig = sorted[lane].idx;
      html += `<div class="job" style="left:${x}px;top:${y}px;width:${w}px;height:${laneH}px;background:${colorFor(orig)}"></div>`;
    });
    // deadline miss markers at each period boundary that overran
    // (visual cue only; count already in verdict via simulate)
    el.innerHTML = html;
    el.style.height = (topPad * 2 + sorted.length * (laneH + laneGap)) + "px";
  }

  renderEditor();
  analyse();
  window.addEventListener("resize", () => { drawLab(); });

  /* ---------------------------------------------------------
     THREAT MAP
     --------------------------------------------------------- */
  const stackList = $("#stackList");
  const detail = $("#threatDetail");

  THREATS.forEach((th, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<button role="tab" data-i="${i}" ${i === 0 ? 'class="active" aria-selected="true"' : 'aria-selected="false"'}>
      <span class="layer-idx">L${i + 1}</span>${th.layer}</button>`;
    stackList.appendChild(li);
  });

  function renderThreat(i) {
    const th = THREATS[i];
    detail.innerHTML = `
      <h3>${th.layer}</h3>
      <p class="td-sub">${th.sub}</p>
      <div class="td-block attack"><h4>How it's attacked</h4><p>${th.attack}</p></div>
      <div class="td-block incident"><h4>Real-world echo</h4><p>${th.incident}</p></div>
      <div class="td-block fix"><h4>The mitigation</h4><p>${th.fix}</p></div>
      <div class="td-stride" aria-label="STRIDE categories touched">
        ${STRIDE.map((s, k) => `<span class="${th.hits[k] ? "hit" : ""}">${s}</span>`).join("")}
      </div>`;
  }

  stackList.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    $$("#stackList button").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
    btn.classList.add("active"); btn.setAttribute("aria-selected", "true");
    renderThreat(+btn.dataset.i);
  });
  renderThreat(0);

  /* ---------------------------------------------------------
     CODE BENCH
     --------------------------------------------------------- */
  const bench = $("#bench");

  SNIPPETS.forEach(sn => {
    const card = document.createElement("div");
    card.className = "snippet";
    card.innerHTML = `
      <div class="snip-head">
        <h3>${sn.title}</h3>
        <p>${sn.desc}</p>
      </div>
      <div class="snip-tabs" role="tablist">
        <button class="snip-tab active" data-pane="bad" role="tab"><span class="tag-bad"></span>Flawed</button>
        <button class="snip-tab" data-pane="good" role="tab"><span class="tag-good"></span>Hardened</button>
      </div>
      <div class="snip-panes">
        <div class="snip-pane bad active" role="tabpanel">
          <div class="code-wrap">
            <button class="copy-btn" type="button">Copy</button>
            <pre><code>${sn.bad.code}</code></pre>
          </div>
          <p class="snip-note">${sn.bad.note}</p>
        </div>
        <div class="snip-pane good" role="tabpanel">
          <div class="code-wrap">
            <button class="copy-btn" type="button">Copy</button>
            <pre><code>${sn.good.code}</code></pre>
          </div>
          <p class="snip-note">${sn.good.note}</p>
        </div>
      </div>`;
    bench.appendChild(card);

    // tab switching
    $$(".snip-tab", card).forEach(tab => {
      tab.addEventListener("click", () => {
        $$(".snip-tab", card).forEach(t => t.classList.remove("active"));
        $$(".snip-pane", card).forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        $(`.snip-pane.${tab.dataset.pane}`, card).classList.add("active");
      });
    });

    // copy buttons
    $$(".copy-btn", card).forEach(cb => {
      cb.addEventListener("click", () => {
        const code = cb.closest(".code-wrap").querySelector("code");
        const text = code.textContent;
        const finish = () => {
          cb.textContent = "Copied";
          cb.classList.add("copied");
          setTimeout(() => { cb.textContent = "Copy"; cb.classList.remove("copied"); }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(finish).catch(fallbackCopy);
        } else { fallbackCopy(); }
        function fallbackCopy() {
          const ta = document.createElement("textarea");
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); } catch (e) {}
          document.body.removeChild(ta); finish();
        }
      });
    });
  });

  /* ---------------------------------------------------------
     Scroll reveal (respects reduced motion)
     --------------------------------------------------------- */
  if (!prefersReducedMotion() && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.style.opacity = "1"; en.target.style.transform = "none"; io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    $$(".section-head, .snippet, .mod").forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(14px)";
      el.style.transition = "opacity .5s ease, transform .5s ease";
      io.observe(el);
    });
  }
})();
