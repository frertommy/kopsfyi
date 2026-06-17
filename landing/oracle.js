const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const onVis=(el,cb,th=.2)=>new IntersectionObserver(es=>es.forEach(e=>cb(e.isIntersecting)),{threshold:th}).observe(el);
addEventListener('scroll',()=>$('#nav').classList.toggle('scrolled',scrollY>8),{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
$$('.rv:not(.in)').forEach(el=>io.observe(el));

/* ticker */
const TICK=['<b>◆ KOPS</b> — constructive oracle protocol for non-financialized markets','Crypto oracles read prices. <b>We create them.</b>','Every index update is <b>deterministically reconstructable</b>','<b>Read the docs →</b>'];
$('#ticker').innerHTML=[...TICK,...TICK].map(t=>`<span class="it-x"><span class="em">◆</span>${t}</span>`).join('');

const O=window.__O||{seed:7,up:true,contrib:[]};
const VIR=['#440154','#472d7b','#3b528b','#21918c','#5ec962','#addc30','#fde725'];
function mkRng(s){return ()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff};}

/* index value over time — single viridis line + area, animated draw */
(function line(){
  const svg=$('#o-line');if(!svg)return;
  const W=480,H=230,pl=34,pr=12,pt=14,pb=26,iw=W-pl-pr,ih=H-pt-pb;
  const rng=mkRng(O.seed),n=48;let html='';
  for(let g=0;g<=4;g++){const y=pt+ih-(g/4)*ih;html+=`<line x1="${pl}" y1="${y.toFixed(1)}" x2="${W-pr}" y2="${y.toFixed(1)}" stroke="#ECE8EA" stroke-width="1"/><text x="${pl-8}" y="${(y+3.5).toFixed(1)}" text-anchor="end" font-family="IBM Plex Mono" font-size="9" fill="#8B8794">${g*25}</text>`;}
  const xl=['','30d','','15d','','now'];
  for(let i=0;i<6;i++){if(!xl[i])continue;const x=pl+(i/5)*iw;html+=`<text x="${x.toFixed(1)}" y="${H-8}" text-anchor="middle" font-family="IBM Plex Mono" font-size="9" fill="#8B8794">${xl[i]}</text>`;}
  let base=42,pts=[];for(let i=0;i<n;i++){base+=(rng()-.46)*7;base=Math.max(14,Math.min(92,base));pts.push([pl+(i/(n-1))*iw, pt+ih-(base/100)*ih]);}
  for(let i=n-7;i<n;i++)pts[i][1]+=(O.up?-1:1)*(i-(n-7))*2.0;
  let d=`M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for(let i=0;i<n-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
    d+=` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;}
  svg.innerHTML=html+`<defs><linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(71,57,130,.16)"/><stop offset="1" stop-color="rgba(71,57,130,.01)"/></linearGradient><linearGradient id="ol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b528b"/><stop offset=".55" stop-color="#473982"/><stop offset="1" stop-color="${O.up?'#21918c':'#c25a6b'}"/></linearGradient></defs>
    <path d="${d} L${W-pr},${pt+ih} L${pl},${pt+ih} Z" fill="url(#og)"/>
    <path class="ln" d="${d}" fill="none" stroke="url(#ol)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const ln=svg.querySelector('.ln'),len=ln.getTotalLength();
  ln.style.strokeDasharray=len;ln.style.strokeDashoffset=len;
  onVis(svg,v=>{if(v){ln.style.transition='stroke-dashoffset 1.5s cubic-bezier(.22,.61,.36,1)';ln.style.strokeDashoffset=0;}},.1);
})();

/* source contribution bars */
(function bars(){
  const el=$('#o-bars');if(!el)return;
  el.innerHTML=(O.contrib||[]).map((c,i)=>`<div class="obar-row"><span class="nm">${c[0]}</span><div class="track"><i data-w="${c[1]}" style="background:${VIR[1+i]||'#473982'}"></i></div><span class="pct">${c[1]}%</span></div>`).join('');
  onVis(el,v=>{if(v)$$('.track i',el).forEach((b,i)=>{b.style.transition=`width .9s ${.06*i}s cubic-bezier(.22,.61,.36,1)`;b.style.width=b.dataset.w+'%';});},.2);
})();
