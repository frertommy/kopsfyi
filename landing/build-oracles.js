const fs=require('fs');

const ORACLES=[
  {slug:'inflation-expectations',name:'Inflation Expectations Index',ticker:'CPI',domain:'Macroeconomic Expectations',status:'research',
   tag:'A continuous market-implied CPI forecast — no release date required.',
   desc:'Synthesized from prediction-market CPI contracts, Fed funds futures and TIPS breakevens into one continuously-updated inflation-expectations signal, publishable on-chain.',
   value:'3.12%',vlabel:'12-mo implied CPI',change:'+0.04',dir:'up',cadence:'Continuous',
   sources:['Kalshi CPI contracts','CME Fed funds futures','TIPS breakeven spreads'],
   contrib:[['Kalshi CPI',46],['Fed funds futures',34],['TIPS breakevens',20]],
   seed:31,up:true},
  {slug:'employment-expectations',name:'Employment Expectations Index',ticker:'NFP',domain:'Macroeconomic Expectations',status:'research',
   tag:'Market-implied payrolls, updated continuously between releases.',
   desc:'A continuous nonfarm-payrolls and unemployment trajectory derived from prediction-market NFP contracts and jobless-claims data — so the labor signal never goes stale between prints.',
   value:'+184K',vlabel:'Implied next NFP',change:'+6K',dir:'up',cadence:'Continuous',
   sources:['Kalshi NFP contracts','Jobless claims data'],
   contrib:[['Kalshi NFP',62],['Jobless claims',38]],
   seed:53,up:true},
  {slug:'policy-direction',name:'Policy Direction Index',ticker:'POL',domain:'Sovereign & Political Risk',status:'research',
   tag:'Election odds, legislation and executive action as one trajectory.',
   desc:'Synthesizes election outcomes, legislative prediction markets and executive-action probabilities into a continuous policy-trajectory signal spanning hawkish to dovish.',
   value:'0.42',vlabel:'Policy drift (hawkish)',change:'-0.03',dir:'dn',cadence:'Continuous',
   sources:['Polymarket','Kalshi','Metaculus'],
   contrib:[['Polymarket',44],['Kalshi',38],['Metaculus',18]],
   seed:71,up:false},
  {slug:'geopolitical-instability',name:'Geopolitical Instability Index',ticker:'GEO',domain:'Sovereign & Political Risk',status:'research',
   tag:'Conflict risk and tension, priced from the deepest information markets.',
   desc:'A continuous measure of conflict risk and geopolitical tension derived from prediction-market activity, CDS spreads and market-stress indicators — a single signal for scattered probabilities.',
   value:'6.8',vlabel:'Instability (0–10)',change:'+0.2',dir:'dn',cadence:'Continuous',
   sources:['Prediction markets','CDS spreads','VIX correlation'],
   contrib:[['Prediction markets',40],['CDS spreads',36],['VIX correlation',24]],
   seed:97,up:true},
  {slug:'entity-strength',name:'Entity Strength Indices',ticker:'ESI',domain:'Competitive Networks',status:'live',
   tag:'Strength ratings, solved simultaneously across the whole graph.',
   desc:'Continuous strength ratings for participants in any competitive network — entities face each other in discrete, verifiable events while distributed markets price the outcomes. The network structure enables a simultaneous equilibrium solve, consistent across the entire graph.',
   value:'1742',vlabel:'Top entity rating',change:'+14',dir:'up',cadence:'Per event',
   sources:['Distributed market data','Verified outcomes'],
   contrib:[['Historical layer',48],['Market consensus',34],['Live event',18]],
   seed:13,up:true},
];

const arrow=`<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const nav=`<header class="nav" id="nav"><div class="nav-in">
  <a class="brand" href="../index.html"><svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13.5" stroke="var(--minsk)" stroke-width="1.6"/><circle cx="16" cy="16" r="4.5" fill="var(--minsk)"/><circle cx="16" cy="16" r="9" stroke="var(--amethyst)" stroke-width="1.1" stroke-dasharray="2.2 4"/></svg> KOPS</a>
  <nav class="nav-links"><a href="../index.html#oracles">Indices</a><a href="../index.html#how">How it works</a><a href="https://docs.kops.ai">Docs</a></nav>
  <div class="nav-right"><a class="gl" href="../index.html">← All indices</a><a class="btn primary" href="https://docs.kops.ai">Read the docs ${arrow}</a></div>
</div></header>`;

const layers=`<div class="ogrid3">
  <div class="ocard"><div class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 18l5-5 4 3 8-9" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h4>Historical Performance</h4><p>Tracks cumulative entity performance through an adaptive rating system, solved simultaneously across the whole network — no error propagation from sequential updates.</p></div>
  <div class="ocard"><div class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1016 0 8 8 0 00-16 0zM12 4v16" stroke="currentColor" stroke-width="1.5" fill="none"/></svg></div><h4>Market Consensus</h4><p>Incorporates forward-looking information from distributed aggregation mechanisms — market-implied assessments transformed into the rating space via context-specific transforms.</p></div>
  <div class="ocard"><div class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/></svg></div><h4>Live Event</h4><p>During active events, real-time market signals inject continuous updates. The layer activates deterministically at event boundaries and deactivates at settlement.</p></div>
</div>
<div class="formula">I<sub>t</sub> = 𝓕( Σ<sub>k</sub> α<sub>k</sub> · Λ<sub>k</sub>(t) )<div class="cap">Multi-layer composition with monotonic price transformation</div></div>`;

const trust=`<div class="ogrid3">
  <div class="ocard"><div class="num">01</div><h4>Constructive Verification</h4><p>Every index update is deterministically traceable to its inputs. Given the public formula, public outcomes and public market data, any observer can independently reconstruct the value.</p></div>
  <div class="ocard"><div class="num">02</div><h4>Market Anchoring</h4><p>The index is continuously anchored to the deepest information markets in the world — constructed from market data, the way VIX is built from S&amp;P 500 options, not discovered through trading.</p></div>
  <div class="ocard"><div class="num">03</div><h4>Cause-Effect Guarantee</h4><p>A hard causal-monotonicity clamp on every settlement: a positive outcome moves the index up or flat, never down. Verifiable from the settlement log — no trust in the operator.</p></div>
</div>`;

const useCases=`<div class="ulist">
  <div class="u"><span class="k">01</span><div><h4>Derivative protocols</h4><p>Oracle feed for futures, options or structured products referencing the index.</p></div></div>
  <div class="u"><span class="k">02</span><div><h4>Structured vaults</h4><p>Yield strategies referencing macro expectations or sector risk.</p></div></div>
  <div class="u"><span class="k">03</span><div><h4>Risk management</h4><p>Indices as inputs for on-chain insurance or hedging.</p></div></div>
  <div class="u"><span class="k">04</span><div><h4>Data products</h4><p>Analytics and research on continuous constructed indices.</p></div></div>
</div>`;

const cta=`<div class="cta"><div class="wrap"><div class="cta-card rv"><h2>Build on a <span class="it">constructed</span> oracle.</h2><p>Every index is continuous, on-chain and deterministically reconstructable from public inputs.</p><div class="hero-cta"><a class="btn primary" href="https://docs.kops.ai">Read the docs ${arrow}</a><a class="btn secondary" href="../index.html#oracles">All indices</a></div></div></div></div>`;

const footer=`<footer><div class="wrap"><div class="foot-grid">
  <div class="about"><a class="brand" href="../index.html"><svg viewBox="0 0 32 32" fill="none" style="width:22px;height:22px"><circle cx="16" cy="16" r="13.5" stroke="var(--minsk)" stroke-width="1.6"/><circle cx="16" cy="16" r="4.5" fill="var(--minsk)"/></svg> KOPS</a><p>Constructive oracle protocol for non-financialized markets. Crypto oracles read prices — we create them.</p></div>
  <div class="fcol"><h5>Indices</h5><a href="inflation-expectations.html">Inflation Expectations</a><a href="employment-expectations.html">Employment Expectations</a><a href="policy-direction.html">Policy Direction</a><a href="geopolitical-instability.html">Geopolitical Instability</a><a href="entity-strength.html">Entity Strength</a></div>
  <div class="fcol"><h5>Protocol</h5><a href="https://docs.kops.ai">Documentation</a><a href="../index.html#how">How it works</a><a href="../index.html#developers">Integration</a><a href="https://kops.ai">kops.ai ↗</a></div>
  <div class="fcol"><h5>Network</h5><a href="#">Settlement log</a><a href="../index.html">Landing</a><a href="https://twitter.com/kopshype">Twitter</a></div>
</div><div class="foot-bot"><span class="mono">© 2026 kops.ai — Constructive Oracle Protocol</span><span class="mono ops"><i></i> All systems operational</span></div></div></footer>`;

function page(o){
  const others=ORACLES.filter(x=>x.slug!==o.slug).slice(0,4);
  const xcards=others.map(x=>`<a class="xcard" href="${x.slug}.html"><div><div class="t">${x.name}</div><div class="d">${x.domain}</div></div><span class="tk">${x.ticker}</span></a>`).join('');
  const sources=o.sources.map(s=>`<div class="source-chip"><i></i>${s}</div>`).join('');
  const badge=o.status==='live'?`<span class="status-badge live"><i></i>LIVE</span>`:`<span class="status-badge research"><i></i>RESEARCH</span>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${o.name} — KOPS Oracle</title>
<meta name="description" content="${o.desc.replace(/"/g,'&quot;')}" />
<link rel="preload" href="../fonts/PP-Formula-SemiExtendedBold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../fonts/GT-Cinetype-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../styles.css">
</head>
<body>
<svg class="paper" xmlns="http://www.w3.org/2000/svg"><filter id="pap"><feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#pap)"/></svg>
<div class="ticker"><div class="col-frame"><div class="track" id="ticker"></div></div></div>
${nav}

<section class="ohero">
  <div class="hero-lines" aria-hidden="true"><div class="c"></div></div>
  <div class="wrap">
    <div class="obreadcrumb rv in"><a href="../index.html#oracles">Indices</a><span class="sl">/</span><span>${o.domain}</span></div>
    <div class="rv in" data-d="1">${badge}</div>
    <h1 class="rv in" data-d="1">${o.name}</h1>
    <p class="tag rv in" data-d="2">${o.tag}</p>
    <p class="desc rv in" data-d="2">${o.desc}</p>
    <div class="octa rv in" data-d="3"><a class="btn primary" href="https://docs.kops.ai">Read the docs ${arrow}</a><a class="btn secondary" href="#construction">How it's constructed</a></div>
    <div class="ovalue rv" data-d="2">
      <div class="cell"><div class="l">Current value</div><div class="v">${o.value}</div></div>
      <div class="cell"><div class="l">${o.vlabel}</div><div class="v sm ${o.dir==='up'?'up':'dn'}">${o.dir==='up'?'▲':'▼'} ${o.change}</div></div>
      <div class="cell"><div class="l">Update cadence</div><div class="v sm">${o.cadence}</div></div>
      <div class="cell"><div class="l">Status</div><div class="v sm">${o.status==='live'?'Live':'Research'}</div></div>
    </div>
  </div>
</section>

<div class="divider" style="margin-top:80px"></div>

<section class="block" id="construction">
  <div class="wrap">
    <div class="sec-top"><span class="label rv">How it's constructed</span><h2 class="rv" data-d="1">Multiple independent <span class="it">signal layers</span>.</h2><p class="rv" data-d="2">KOPS indices are composed from layers that each capture a different information regime, fused with a monotonic price transformation.</p></div>
    <div class="rv" data-d="1">${layers}</div>
  </div>
</section>

<div class="divider"></div>

<section class="block">
  <div class="wrap">
    <div class="sec-top"><span class="label rv">Live index</span><h2 class="rv" data-d="1">The signal, <span class="it">continuously</span>.</h2></div>
    <div class="odash rv" data-d="1">
      <div class="odash-top"><span>${o.ticker} · ${o.domain.toLowerCase()}</span><span>cadence: ${o.cadence.toLowerCase()}</span></div>
      <div class="odash-body"><div class="osplit">
        <div><div class="odash-h">Index value over time</div><svg class="big" id="o-line" viewBox="0 0 480 230"></svg></div>
        <div><div class="odash-h">Source contribution</div><div class="obars" id="o-bars"></div></div>
      </div></div>
    </div>
  </div>
</section>

<div class="divider"></div>

<section class="block">
  <div class="wrap">
    <div class="sec-top"><span class="label rv">Sources</span><h2 class="rv" data-d="1">Built from the deepest <span class="it">information markets</span>.</h2></div>
    <div class="sources rv" data-d="1">${sources}</div>
  </div>
</section>

<div class="divider"></div>

<section class="block">
  <div class="wrap">
    <div class="sec-top"><span class="label rv">Trust model</span><h2 class="rv" data-d="1">No reference price. <span class="it">Constructive</span> trust.</h2><p class="rv" data-d="2">KOPS indices have no external price to copy — trust is derived from three complementary, verifiable mechanisms.</p></div>
    <div class="rv" data-d="1">${trust}</div>
  </div>
</section>

<div class="divider"></div>

<section class="block">
  <div class="wrap">
    <div class="sec-top"><span class="label rv">Use cases</span><h2 class="rv" data-d="1">What you can <span class="it">build</span>.</h2></div>
    <div class="rv" data-d="1">${useCases}</div>
  </div>
</section>

<div class="divider"></div>

<section class="block">
  <div class="wrap">
    <div class="sec-top"><span class="label rv">Other indices</span><h2 class="rv" data-d="1">Explore the <span class="it">catalog</span>.</h2></div>
    <div class="xgrid rv" data-d="1">${xcards}</div>
  </div>
</section>

${cta}
${footer}

<script>window.__O=${JSON.stringify({seed:o.seed,up:o.up,contrib:o.contrib})};</script>
<script src="../oracle.js"></script>
</body>
</html>`;
}

ORACLES.forEach(o=>{fs.writeFileSync('oracles/'+o.slug+'.html',page(o));console.log('wrote oracles/'+o.slug+'.html');});
