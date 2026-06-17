/* KOPS liveline — dependency-free canvas line chart in the "liveline" aesthetic:
   smooth gradient-area line, soft confidence band, faint grid, glowing live dot,
   optional dashed target + forward projection. No React, no build step.

   kopsLine(canvas, {
     series:[{t,v},...],          // required, t = ms epoch, v = value
     band:[{t,lo,hi},...],        // optional confidence band (same t grid as series)
     target:{v,label},            // optional horizontal target line (e.g. Ê)
     project:{t,v},               // optional forward point (dashed projection from last → here)
     color:'#473982', accent:'#473982',
     fmt:(v)=>string,             // y-axis / label formatter
     pad:{l,r,t,b}, grid:true, live:true
   })
   Returns a controller {draw, stop}. Re-call draw() (or kopsLine again) on new data.
*/
(function (g) {
  const CSS = getComputedStyle(document.documentElement);
  const tok = (n, f) => (CSS.getPropertyValue(n).trim() || f);
  function smoothPath(ctx, pts) {
    if (pts.length < 2) { if (pts[0]) ctx.lineTo(pts[0][0], pts[0][1]); return; }
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < pts.length - 1; i++) {
      const x0 = pts[i][0], y0 = pts[i][1], x1 = pts[i + 1][0], y1 = pts[i + 1][1];
      const mx = (x0 + x1) / 2;
      ctx.bezierCurveTo(mx, y0, mx, y1, x1, y1);
    }
  }
  g.kopsLine = function (canvas, o) {
    const color = o.color || tok('--minsk', '#473982');
    const grid = tok('--grid300', '#E9E5E8');
    const muted = tok('--cement2', '#938D9C');
    const paper = tok('--white', '#fff');
    const citr = tok('--citrine', '#CDA849');
    const fmt = o.fmt || ((v) => v.toFixed(2));
    const pad = Object.assign({ l: 12, r: 58, t: 16, b: 18 }, o.pad || {});
    let raf = 0, t0 = performance.now();
    const ctx = canvas.getContext('2d');

    function frame(now) {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const W = canvas.clientWidth || 600, H = canvas.clientHeight || 220;
      if (canvas.width !== W * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const s = o.series || [];
      if (!s.length) { raf = o.live ? requestAnimationFrame(frame) : 0; return; }
      // domains
      let xs = s.map(p => p.t), vs = s.map(p => p.v);
      if (o.band) o.band.forEach(b => { vs.push(b.lo, b.hi); });
      if (o.target) vs.push(o.target.v);
      if (o.project) { xs.push(o.project.t); vs.push(o.project.v); }
      if (o.series2) o.series2.forEach(p => { xs.push(p.t); vs.push(p.v); });
      const xmin = Math.min(...xs), xmax = Math.max(...xs);
      let ymin = Math.min(...vs), ymax = Math.max(...vs);
      const span = (ymax - ymin) || Math.abs(ymax) * 0.01 || 1; ymin -= span * 0.18; ymax += span * 0.18;
      const X = t => pad.l + (xmax === xmin ? 0.5 : (t - xmin) / (xmax - xmin)) * (W - pad.l - pad.r);
      const Y = v => pad.t + (1 - (v - ymin) / (ymax - ymin)) * (H - pad.t - pad.b);
      // shade regions (e.g. NBER recessions)
      if (o.shade) o.shade.forEach(z => { const a = X(z.t0), b = X(z.t1); ctx.fillStyle = tok('--grid500', '#DBD7DA'); ctx.globalAlpha = .55; ctx.fillRect(a, pad.t, Math.max(1.2, b - a), H - pad.t - pad.b); ctx.globalAlpha = 1; });
      // grid
      if (o.grid !== false) {
        ctx.strokeStyle = grid; ctx.lineWidth = 1; ctx.font = '10px ui-monospace,monospace'; ctx.fillStyle = muted;
        for (let i = 0; i <= 3; i++) {
          const v = ymin + (ymax - ymin) * (i / 3), y = Y(v);
          ctx.globalAlpha = .55; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); ctx.globalAlpha = 1;
          ctx.fillText(fmt(v), W - pad.r + 6, y + 3);
        }
      }
      const pts = s.map(p => [X(p.t), Y(p.v)]);
      // band
      if (o.band && o.band.length) {
        ctx.beginPath();
        o.band.forEach((b, i) => { const x = X(b.t), y = Y(b.hi); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        for (let i = o.band.length - 1; i >= 0; i--) { const b = o.band[i]; ctx.lineTo(X(b.t), Y(b.lo)); }
        ctx.closePath(); ctx.fillStyle = color; ctx.globalAlpha = .10; ctx.fill(); ctx.globalAlpha = 1;
      }
      // target line
      if (o.target) {
        const y = Y(o.target.v);
        ctx.strokeStyle = citr; ctx.lineWidth = 1.3; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); ctx.setLineDash([]);
        if (o.target.label) { ctx.fillStyle = citr; ctx.font = '10px ui-monospace,monospace'; ctx.fillText(o.target.label, pad.l + 2, y - 5); }
      }
      // area gradient
      const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
      grad.addColorStop(0, hexA(color, .22)); grad.addColorStop(1, hexA(color, 0));
      ctx.beginPath(); smoothPath(ctx, pts);
      ctx.lineTo(pts[pts.length - 1][0], H - pad.b); ctx.lineTo(pts[0][0], H - pad.b); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();
      // forward projection (dashed)
      if (o.project) {
        const last = pts[pts.length - 1];
        ctx.strokeStyle = color; ctx.globalAlpha = .45; ctx.lineWidth = 1.6; ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(X(o.project.t), Y(o.project.v)); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
      // secondary line (no fill, no dot)
      if (o.series2 && o.series2.length) {
        const p2 = o.series2.map(p => [X(p.t), Y(p.v)]);
        ctx.beginPath(); smoothPath(ctx, p2);
        ctx.strokeStyle = o.color2 || tok('--amethyst', '#A477B2'); ctx.lineWidth = 1.9; ctx.globalAlpha = .9; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); ctx.globalAlpha = 1;
      }
      // line
      ctx.beginPath(); smoothPath(ctx, pts);
      ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
      // live dot + pulse
      const lx = pts[pts.length - 1][0], ly = pts[pts.length - 1][1];
      if (o.live !== false) {
        const ph = (Math.sin((now - t0) / 480) + 1) / 2;
        ctx.beginPath(); ctx.arc(lx, ly, 5 + ph * 5, 0, 7); ctx.fillStyle = hexA(color, .18 - ph * .12); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(lx, ly, 4, 0, 7); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 9; ctx.fill(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(lx, ly, 1.6, 0, 7); ctx.fillStyle = paper; ctx.fill();
      raf = o.live === false ? 0 : requestAnimationFrame(frame);
    }
    function hexA(h, a) {
      h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const n = parseInt(h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
    }
    cancelAnimationFrame(raf); frame(performance.now());   // draw once synchronously, then frame() self-schedules the live loop
    return { stop: () => cancelAnimationFrame(raf), redraw: () => frame(performance.now()) };
  };
})(window);
