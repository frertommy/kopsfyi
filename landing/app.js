const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const onVis=(el,cb,th=.2)=>new IntersectionObserver(es=>es.forEach(e=>cb(e.isIntersecting)),{threshold:th}).observe(el);

addEventListener('scroll',()=>$('#nav').classList.toggle('scrolled',scrollY>8),{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.14});
$$('.rv:not(.in)').forEach(el=>io.observe(el));

/* ticker */
const TICK=['<b>◆ KOPS</b> — constructive oracle protocol for non-financialized markets','Crypto oracles read prices. <b>We create them.</b>','Inflation, employment, policy, geopolitics & competitive networks — <b>synthesized on-chain</b>','Every index update is <b>deterministically reconstructable</b>','<b>Read the docs →</b>'];
$('#ticker').innerHTML=[...TICK,...TICK].map(t=>`<span class="it-x"><span class="em">◆</span>${t}</span>`).join('');

/* ===== Hex-style data-app charts (viridis) ===== */
const VIR=['#440154','#472d7b','#3b528b','#21918c','#5ec962','#addc30','#fde725'];
const SVGNS='http://www.w3.org/2000/svg';
function mkRng(s){return ()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff};}

/* multi-line: 5 feeds over 7 points */
(function lineChart(){
  const svg=$('#ch-line');if(!svg)return;
  const W=440,H=220,pl=30,pr=10,pt=12,pb=24,iw=W-pl-pr,ih=H-pt-pb;
  const rng=mkRng(11),series=5,n=7;let html='';
  // gridlines + y labels (0..50)
  for(let g=0;g<=5;g++){const y=pt+ih-(g/5)*ih;html+=`<line x1="${pl}" y1="${y.toFixed(1)}" x2="${W-pr}" y2="${y.toFixed(1)}" stroke="#ECE8EA" stroke-width="1"/><text x="${pl-7}" y="${(y+3.5).toFixed(1)}" text-anchor="end" font-family="IBM Plex Mono" font-size="9" fill="#8B8794">${g*10}</text>`;}
  const xlab=['Mon','','Wed','','Fri','','Sun'];
  for(let i=0;i<n;i++){if(!xlab[i])continue;const x=pl+(i/(n-1))*iw;html+=`<text x="${x.toFixed(1)}" y="${H-7}" text-anchor="middle" font-family="IBM Plex Mono" font-size="9" fill="#8B8794">${xlab[i]}</text>`;}
  const cols=[VIR[1],VIR[2],VIR[3],VIR[4],VIR[5]];const paths=[];
  for(let s=0;s<series;s++){let base=12+s*7,pts=[];for(let i=0;i<n;i++){base+=(rng()-.42)*6;base=Math.max(4,Math.min(49,base));pts.push([pl+(i/(n-1))*iw, pt+ih-(base/50)*ih]);}
    let d=`M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;for(let i=1;i<n;i++)d+=` L${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`;
    paths.push(`<path class="lc" d="${d}" fill="none" stroke="${cols[s]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);}
  svg.innerHTML=html+paths.join('');
  $$('.lc',svg).forEach((p,i)=>{const len=p.getTotalLength();p.style.strokeDasharray=len;p.style.strokeDashoffset=len;p.style.transition=`stroke-dashoffset 1.3s ${.08*i}s cubic-bezier(.22,.61,.36,1)`;});
  onVis(svg,v=>{if(v)$$('.lc',svg).forEach(p=>p.style.strokeDashoffset=0);},.1);
})();

/* scatter: ~150 dots colored along viridis by x */
(function scatter(){
  const svg=$('#ch-scatter');if(!svg)return;
  const W=440,H=220,pl=30,pr=10,pt=12,pb=24,iw=W-pl-pr,ih=H-pt-pb;
  const rng=mkRng(29);let html='';
  for(let g=0;g<=5;g++){const y=pt+ih-(g/5)*ih;html+=`<line x1="${pl}" y1="${y.toFixed(1)}" x2="${W-pr}" y2="${y.toFixed(1)}" stroke="#ECE8EA" stroke-width="1"/><text x="${pl-7}" y="${(y+3.5).toFixed(1)}" text-anchor="end" font-family="IBM Plex Mono" font-size="9" fill="#8B8794">${g*5}</text>`;}
  for(let g=0;g<=5;g++){const x=pl+(g/5)*iw;html+=`<text x="${x.toFixed(1)}" y="${H-7}" text-anchor="middle" font-family="IBM Plex Mono" font-size="9" fill="#8B8794">${g*10}</text>`;}
  let dots='';
  for(let i=0;i<150;i++){const t=rng();const cx=pl+(t*.8+rng()*.2)*iw;const cy=pt+ih-(Math.max(0,Math.min(1,(t*.7+(rng()-.5)*.5)))*ih);
    const col=VIR[Math.min(6,Math.floor(t*6.99))];dots+=`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3" fill="${col}" opacity="0"/>`;}
  svg.innerHTML=html+dots;
  onVis(svg,v=>{if(v)$$('circle',svg).forEach((c,i)=>{c.style.transition=`opacity .5s ${Math.min(.6,i*.003)}s`;c.style.opacity=.82;});},.1);
})();

/* stacked horizontal bars */
(function mix(){
  const el=$('#ch-mix');if(!el)return;
  const rows=[['Sports',[42,20,22,16]],['Macro',[34,26,24,16]],['Volatility',[30,30,24,16]],['Weather',[26,28,28,18]],['Events',[22,30,30,18]]];
  const cols=[VIR[1],VIR[3],VIR[4],VIR[5]];
  el.innerHTML=rows.map(r=>`<div class="mix-row"><div class="lbl">${r[0]}</div><div class="mix-bar">${r[1].map((w,i)=>`<i style="width:0%;background:${cols[i]}" data-w="${w}"></i>`).join('')}</div></div>`).join('');
  onVis(el,v=>{if(v)$$('.mix-bar i',el).forEach((b,i)=>{b.style.transition=`width .9s ${.04*i}s cubic-bezier(.22,.61,.36,1)`;b.style.width=b.dataset.w+'%';});},.15);
})();

/* code typing */
const CODE=[
  ['cm','// Subscribe to any KOPS feed — one client, every market'],
  ['',''],
  ['kw','import ','pl','{ Kops } ','kw','from ','st',"'@kops/sdk'",'pl',';'],
  ['',''],
  ['kw','const ','pl','kops = ','kw','new ','fn','Kops','pl','({ network: ','st',"'mainnet'",'pl',' });'],
  ['',''],
  ['cm','// soccer perps, attested on-chain, 1s cadence'],
  ['kw','const ','pl','feed = ','pl','kops','pl','.','fn','subscribe','pl','(','st',"'ARS-EPL'",'pl',', {'],
  ['pl','  interval','pl',': ','nm','1000','pl',','],
  ['pl','  onTick','pl',': (','pl','px','pl',') => ','fn','book','pl','.','fn','mark','pl','(','pl','px.value','pl',')'],
  ['pl','});'],
];
const esc=t=>t.replace(/</g,'&lt;').replace(/>/g,'&gt;');
const renderCode=lines=>lines.map(p=>{let s='';for(let i=0;i<p.length;i+=2){const c=p[i],t=p[i+1]??'';s+=c?`<span class="${c}">${esc(t)}</span>`:esc(t);}return s||'&nbsp;';}).join('\n');
let codeShown=false;
onVis($('#code-block'),v=>{if(!v||codeShown)return;codeShown=true;let n=0;(function step(){$('#code-block').innerHTML=renderCode(CODE.slice(0,n));if(n<CODE.length){n++;setTimeout(step,72);}else $('#code-block').innerHTML=renderCode(CODE);})();},.01);

/* categories */
const CATS=[
  {tk:'CPI',slug:'inflation-expectations',t:'Inflation Expectations',n:'Macro Expectations',st:'Research',d:'A continuous market-implied CPI forecast synthesized from prediction-market contracts, Fed funds futures, and TIPS breakevens.',ico:'<path d="M4 20V10M10 20V4M16 20v-7M2 20h20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'},
  {tk:'NFP',slug:'employment-expectations',t:'Employment Expectations',n:'Macro Expectations',st:'Research',d:'Market-implied nonfarm payrolls and unemployment trajectory, updated continuously between releases.',ico:'<path d="M4 20h16M7 20v-6M12 20V8M17 20v-9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'},
  {tk:'POL',slug:'policy-direction',t:'Policy Direction',n:'Sovereign & Political Risk',st:'Research',d:'Election outcomes, legislative prediction markets, and executive-action probabilities fused into one policy-trajectory signal.',ico:'<path d="M12 3l8 4-8 4-8-4 8-4zM4 11v6M20 11v6M8 13v5M16 13v5M12 13v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'},
  {tk:'GEO',slug:'geopolitical-instability',t:'Geopolitical Instability',n:'Sovereign & Political Risk',st:'Research',d:'A continuous measure of conflict risk and geopolitical tension from prediction-market activity and market-stress indicators.',ico:'<path d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20" stroke="currentColor" stroke-width="1.4" fill="none"/>'},
  {tk:'ESI',slug:'entity-strength',t:'Entity Strength Indices',n:'Competitive Networks',st:'Live',d:'Continuous strength ratings for any competitive network, solved simultaneously across the entire graph for consistency.',ico:'<path d="M12 4l2.4 5 5.6.5-4.3 3.7 1.3 5.5L12 20.7 6.9 23.7l1.3-5.5L4 14.5l5.6-.5L12 4z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/>'},
];
$('#cat-grid').innerHTML=CATS.map((c,i)=>`<a class="cat rv" href="oracles/${c.slug}.html" data-d="${(i%3)+1}"><div class="ico"><svg width="21" height="21" viewBox="0 0 24 24" fill="none">${c.ico}</svg></div><h3>${c.t} <span class="tk">${c.tk}</span></h3><p>${c.d}</p><div class="feedn"><i class="${c.st==='Live'?'':'r'}"></i>${c.n} · ${c.st}</div></a>`).join('');
$$('#cat-grid .rv').forEach(el=>io.observe(el));

/* integrations */
const INTS=[
  {k:'TS',t:'TypeScript SDK',d:'Type-safe client with autocompletion for every feed symbol.'},
  {k:'⟨/⟩',t:'Solidity Interfaces',d:'Drop-in AggregatorV3-compatible interfaces for your contracts.'},
  {k:'⇄',t:'WebSocket Streams',d:'Sub-second push updates over a single persistent connection.'},
  {k:'◇',t:'EVM Chains',d:'Settle feeds on Ethereum, Base, Arbitrum and OP Stack rollups.'},
  {k:'{}',t:'REST API',d:'Stateless historical & snapshot queries for any feed.'},
  {k:'⚡',t:'Webhooks',d:'Fire events on threshold crossings, attestations and resolutions.'},
];
$('#int-grid').innerHTML=INTS.map((c,i)=>`<div class="int rv" data-d="${(i%3)+1}"><div class="ic">${c.k}</div><div><h4>${c.t}</h4><p>${c.d}</p></div></div>`).join('');
$$('#int-grid .rv').forEach(el=>io.observe(el));

/* count-up */
$$('.metric .v[data-count]').forEach(el=>{
  const target=parseFloat(el.dataset.count),dec=+(el.dataset.dec||0),sfx=el.dataset.suffix||'';let done=false;
  onVis(el,v=>{if(!v||done)return;done=true;const t0=performance.now(),dur=1100;
    (function f(now){let p=Math.min(1,(now-t0)/dur);p=1-Math.pow(1-p,3);const val=target*p;
      el.innerHTML=(dec?val.toFixed(dec):Math.round(val).toLocaleString())+(sfx?`<span class="u">${sfx}</span>`:'');
      if(p<1)requestAnimationFrame(f);})(performance.now());},.5);
});
