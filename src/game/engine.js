/*
 * Imperative effects engine (canvas, banners, audio, showcase card).
 * Loaded dynamically after the Vue app has mounted, because it addresses
 * the overlay / stage elements by id. All game *state* lives in store.js.
 */
import { ui, S, R, fresh, fmt, probs, itemFor } from './store.js'

const $=s=>document.querySelector(s);
let timer=null;
let buf=new Uint32Array(8192),bi=8192;
function rnd(){if(bi>=buf.length){crypto.getRandomValues(buf);bi=0}return buf[bi++]/4294967296}
function open(n){
 const p=probs(),res=[],once=ui.once,pt=p[1];
 for(let i=0;i<n;i++){
  let x=rnd(),k=-1;
  for(let j=0;j<7;j++){if(x<p[j]){k=j;break}x-=p[j]}
  S.opened++;S.exp+=0;
  if(k<0)continue;
  const r=R[k];let dupe=false;
  if(r.once&&once&&S.owned.has(r.id))dupe=true;else if(r.once)S.owned.add(r.id);
  S.hits[r.id]++;if(dupe)S.dupes[r.id]++;
  if(r.id==='token')S.lastTok=S.opened;
  const item=itemFor(r);if(!dupe){const q=S.locker[item.name]||(S.locker[item.name]={n:0});q.n++}res.push({k,dupe,at:S.opened,item});
  S.log.unshift({k,dupe,at:S.opened,item});
 }
 S.log.length=Math.min(S.log.length,60);
 return res;
}
function open2(n){const pt=probs()[1];const res=open(n);ui.tokExp+=pt*n;const p=probs();p.forEach((v,j)=>S.expAll[j]+=v*n);return res}
function show(res,n){
 const ch=$('#chest');
 if(n===1){
  const h=res[0];
  if(h){const r=R[h.k];$('#beam').setAttribute('fill',r.c);
   $('#result').innerHTML=`<div style="font-size:30px">${r.i}</div><b style="color:${r.c}">${h.item.name}</b><div class="mute">${h.item.type}</div>${h.dupe?'<div class="mute">Already owned this week — no new reward</div>':'<div class="mute">New treasure!</div>'}`}
  else{$('#beam').setAttribute('fill','#9db4d6');$('#result').innerHTML='<b class="mute">Just regular loot</b><div class="mute">No treasure this time</div>'}
  fxOpen(h?R[h.k]:null,false,h&&h.item);
 }else{
  const c={};res.forEach(h=>{const id=R[h.k].id;c[id]=(c[id]||0)+1});
  const chips=R.filter(r=>c[r.id]).map(r=>`<span class="chip" style="color:${r.c}">${r.i} ${c[r.id]}× ${r.name}</span>`).join('');
  $('#result').innerHTML=`<b>Opened ${fmt(n)} chests</b><div>${chips||'<span class="mute">No treasures</span>'}</div>`;
  const best=res.map(h=>h.k).sort((a,b)=>a-b)[0];
  $('#beam').setAttribute('fill',best!==undefined?R[best].c:'#9db4d6');fxOpen(best!==undefined?R[best]:null,true,best!==undefined?res.find(h=>h.k===best).item:null);
 }
}

/* ---- actions called from Vue ---- */
export function openN(n){stop();show(open2(n),n)}
function stop(){if(timer){clearInterval(timer);timer=null}ui.auto=false}
export function toggleAuto(){
 if(timer){stop();return}
 ui.auto=true;
 timer=setInterval(()=>{
  const res=open2(2500);
  const t=res.find(h=>R[h.k].id==='token');
  if(t){stop();$('#beam').setAttribute('fill','#ff8a1f');
   $('#result').innerHTML=`<div style="font-size:30px">🪙</div><b style="color:#ff8a1f">Pirate Shop Access!</b><div class="mute">Found on chest #${fmt(t.at)}${t.dupe?' (already owned)':''}</div>`;
   fxOpen(R[1],false,t.item)}
 },40);
}
export function newWeek(){S.owned.clear();$('#result').innerHTML='<span class="mute">New week — weekly treasures can drop again.</span>'}
export function resetAll(){stop();Object.assign(S,fresh());ui.tokExp=0;$('#result').innerHTML='<span class="mute">Open a chest to see what drops.</span>'}

let P=[],raf=0,fxT=0;const fxc=$('#fx');
function burst(c,n,coins){
 const st=$('.stage'),sr=st.getBoundingClientRect(),cr=$('#chest').getBoundingClientRect();
 fxc.width=sr.width;fxc.height=sr.height;
 const ox=cr.left-sr.left+cr.width*.5,oy=cr.top-sr.top+cr.height*.4;
 for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2,v=4+Math.random()*10;
  P.push({x:ox,y:oy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,s:2+Math.random()*4,c:Math.random()<.5?c:'#ffd23f',coin:coins&&Math.random()<.45,rot:Math.random()*6})}
 if(!raf)loop();
}
function loop(){
 const x=fxc.getContext('2d');x.clearRect(0,0,fxc.width,fxc.height);
 P=P.filter(p=>p.l>0&&p.y<fxc.height+20);
 for(const p of P){p.x+=p.vx;p.y+=p.vy;p.vy+=.28;p.vx*=.99;p.l-=.01;p.rot+=.25;
  x.globalAlpha=Math.max(p.l,0);x.fillStyle=p.c;
  if(p.coin){x.save();x.translate(p.x,p.y);x.scale(Math.max(Math.abs(Math.cos(p.rot)),.15),1);x.beginPath();x.arc(0,0,p.s+2,0,7);x.fill();x.restore()}
  else{x.beginPath();x.arc(p.x,p.y,p.s*Math.max(p.l,.2),0,7);x.fill()}}
 x.globalAlpha=1;raf=P.length?requestAnimationFrame(loop):0;
}
function fxOpen(r,big,item){
 const ch=$('#chest'),res=$('#result'),st=$('.stage'),tr=!!r,c=r?r.c:'#ffd23f';
 const sup=r&&(r.id==='gold'||r.id==='token');
 clearTimeout(fxT);ch.classList.remove('open','intro','tcharge',...R.map(x=>'cv-'+x.id));clearInterval(rgT);
 st.classList.remove('lit','tch');res.classList.add('hide');
 ['banner','ghost'].forEach(i=>$('#'+i).classList.remove('go'));$('#dim').classList.remove('on');
 st.style.setProperty('--c',c);res.style.setProperty('--c',c);
 if(!tr)$('#beam').setAttribute('fill','#ffd23f');
 const dur=tr?(big?1300:DUR[r.id]):0;
 if(tr){ch.style.setProperty('--dur',dur+'ms');void ch.getBoundingClientRect();ch.classList.add('tcharge','cv-'+r.id);st.classList.add('tch');sfxCharge(dur);if(r.id==='gold'&&!big)rgT=setInterval(ring,800)}
 fxT=setTimeout(()=>{
  ch.classList.remove('tcharge',...R.map(x=>'cv-'+x.id));clearInterval(rgT);st.classList.remove('tch');ch.classList.add('open');
  res.classList.remove('hide','pop');void res.offsetWidth;res.classList.add('pop');
  if(tr){st.classList.add('lit');ring();burst(c,sup?200:90,true);banner(r,big,item);sfx(r);sfxType(r);loot();specialFx(r);showcase(r,item,big);
   const f=$('#flash');f.style.setProperty('--c','#fff');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
   document.body.classList.add('quake');setTimeout(()=>document.body.classList.remove('quake'),550)}
  else{loot();sfx(null)}
  fxT=setTimeout(()=>{ch.classList.remove('open');st.classList.remove('lit')},tr?(sup?4200:2400):1600);
 },tr?dur:260);
}
function ring(){const g=$('#ring');g.classList.remove('go');void g.offsetWidth;g.classList.add('go')}
function loot(){const L=$('#loot'),ic=['🔫','🛡️','🧪','🍎','💣','🪓'],rc=['#9db4d6','#3ddc97','#4db8ff','#b46bff','#ff8a1f'];
 L.innerHTML='';for(let i=0;i<4;i++){const e=document.createElement('span');e.textContent=ic[Math.random()*ic.length|0];e.style.cssText=`--dx:${(i-1.5)*54}px;--dy:${40+Math.random()*30}px;--rc:${rc[Math.random()*rc.length|0]};animation-delay:${i*70}ms`;L.appendChild(e)}
 setTimeout(()=>L.innerHTML='',1700)}
let AC;
let dimT=0,CP=[],craf=0;const cf=$('#conf');
const EMB=`<svg class="emb" viewBox="0 0 120 120"><defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a0"/><stop offset="1" stop-color="#ffa800"/></linearGradient></defs><polygon points="118.0,60.0 95.3,67.0 113.6,82.2 89.9,80.0 101.0,101.0 80.0,89.9 82.2,113.6 67.0,95.3 60.0,118.0 53.0,95.3 37.8,113.6 40.0,89.9 19.0,101.0 30.1,80.0 6.4,82.2 24.7,67.0 2.0,60.0 24.7,53.0 6.4,37.8 30.1,40.0 19.0,19.0 40.0,30.1 37.8,6.4 53.0,24.7 60.0,2.0 67.0,24.7 82.2,6.4 80.0,30.1 101.0,19.0 89.9,40.0 113.6,37.8 95.3,53.0" fill="#ffd23f" opacity=".85"/><rect x="24" y="24" width="72" height="72" rx="6" fill="url(#eg)" stroke="#fff8cc" stroke-width="4"/><rect x="32" y="32" width="56" height="56" rx="3" fill="#ffbe1a" stroke="#9a5800" stroke-width="2"/><circle cx="60" cy="60" r="21" fill="#fff6c9" stroke="#9a5800" stroke-width="3"/><text x="60" y="70" text-anchor="middle" font-size="30" font-weight="900" font-style="italic" fill="#9a5800" font-family="Barlow Condensed,Arial,sans-serif">F</text></svg>`;
function confetti(n){cf.width=innerWidth;cf.height=innerHeight;const cx=cf.width/2,cy=cf.height*.36,col=['#ffd23f','#ffb300','#fff3b0','#ffffff'];
 for(let i=0;i<n;i++){const a=Math.random()*6.283,v=3+Math.random()*13;CP.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.7-2,r:Math.random()*6,vr:(Math.random()-.5)*.4,s:5+Math.random()*11,l:1,c:col[Math.random()*4|0]})}
 if(!craf)cloop()}
function cloop(){const x=cf.getContext('2d');x.clearRect(0,0,cf.width,cf.height);CP=CP.filter(p=>p.l>0&&p.y<cf.height+30);
 for(const p of CP){p.x+=p.vx;p.y+=p.vy;p.vy+=.11;p.vx*=.985;p.r+=p.vr;p.l-=.006;x.save();x.globalAlpha=Math.min(1,p.l*1.6);x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.beginPath();x.moveTo(0,-p.s);x.lineTo(p.s*.7,p.s*.6);x.lineTo(-p.s*.7,p.s*.6);x.closePath();x.fill();x.restore()}
 craf=CP.length?requestAnimationFrame(cloop):0}
function banner(r,big,item){const b=$('#banner'),g=$('#ghost'),sp=r.id==='gold'||r.id==='token',nm=(item?item.name:r.name).toUpperCase(),d=r.id==='gold'?6.6:sp?4.8:3;
 b.style.setProperty('--bd',d+'s');g.style.setProperty('--bd',d+'s');
 b.firstChild.innerHTML=EMB+`<small>${big?'BEST OF THE BATCH \u00b7 ':''}YOU FOUND</small><span class="tt">${nm}</span><i class="wing l"></i><i class="wing r"></i>`;
 g.textContent=nm;
 [b,g].forEach(e=>{e.classList.remove('go');void e.offsetWidth;e.classList.add('go')});
 clearTimeout(dimT);$('#dim').classList.add('on');dimT=setTimeout(()=>$('#dim').classList.remove('on'),d*900);
 confetti(sp?170:90);
 if(r.id==='token')$('#result').innerHTML='<div style="font-size:30px">\u{1FA99}</div><b style="color:#ffc83d">Pirate Shop Access (2026) + (2027)</b><div class="mute">Your whole squad gets it too. Item Shop \u2192 \u201cPlunder the Item Shop\u201d \u2192 Activate Now. 2026 token must be activated by Dec 15, 2026.</div>'}
function tone(f,t,d,type,v,f2){if(ui.muted)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const n=AC.currentTime+t,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(AC.destination);o.start(n);o.stop(n+d)}catch(e){}}
function sfxCharge(ms){const d=ms/1000;for(let t=0;t<d;t+=.085)tone(1700+Math.random()*1500,t,.05,'square',.011);tone(80,0,d,'sawtooth',.035,640);tone(160,0,d,'square',.014,1300);for(let t=0;t<d;t+=.18)tone(900+t*520,t,.12,'sine',.02)}
function sfx(r){if(!r){tone(140,0,.3,'sawtooth',.04,70);tone(660,.1,.2,'triangle',.05);tone(880,.08,.28,'triangle',.05);return}const sp=r.id==='gold'||r.id==='token',b=sp?523:r.id==='giz'?392:440;tone(300,0,.55,'sawtooth',.09,40);(sp?[0,4,7,12]:[0,7]).forEach((n,i)=>tone(b*2**(n/12),.08+i*.09,.6,'triangle',.08));if(sp)for(let i=0;i<8;i++)tone(1200+i*350,.2+i*.06,.15,'sine',.03)}
addEventListener('keydown',e=>{if(e.repeat||e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key.toLowerCase(),N=[1,10,100,1000,10000],q=n=>document.querySelector(`[data-n="${n}"]`).click();
 if(k===' '||k==='enter'){if(e.target.tagName==='BUTTON')return;e.preventDefault();q(1)}
 else if(k>='1'&&k<='5')q(N[+k-1]);else if(k==='a')$('#auto').click();else if(k==='m')$('#mute').click()});
addEventListener('pointermove',e=>{const r=$('#chest').getBoundingClientRect(),cl=v=>Math.max(-1,Math.min(1,v/300)),dx=cl(e.clientX-r.left-r.width/2),dy=cl(e.clientY-r.top-r.height*.5);
 document.querySelectorAll('#chest .eye').forEach(g=>g.style.translate=`${dx*3.5}px ${dy*3.5}px`)});
const DUR={gold:4600,token:3400,veh:2800,pick:2200,jam:2600,load:1900,giz:1400};
let rgT=0,shD=0,shT=0;
const GD='<defs><linearGradient id="ga" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#f6b800"/><stop offset="1" stop-color="#b86f00"/></linearGradient></defs>',ST='stroke="#6b3d00" stroke-width="3" stroke-linejoin="round"';
const ART={
outfit:`<svg viewBox="0 0 200 200">${GD}<g fill="url(#ga)" ${ST}><circle cx="100" cy="42" r="20"/><rect x="76" y="66" width="48" height="62" rx="14"/><rect x="52" y="70" width="20" height="60" rx="10" transform="rotate(12 62 70)"/><rect x="128" y="70" width="20" height="60" rx="10" transform="rotate(-12 138 70)"/><rect x="80" y="124" width="18" height="64" rx="8"/><rect x="102" y="124" width="18" height="64" rx="8"/></g></svg>`,
pick:`<svg viewBox="0 0 200 200">${GD}<g ${ST} transform="rotate(35 100 100)"><rect x="94" y="40" width="12" height="150" rx="5" fill="#8a5a2b"/><path d="M24 78Q100 6 176 78Q100 46 24 78Z" fill="url(#ga)"/></g></svg>`,
back:`<svg viewBox="0 0 200 200">${GD}<g ${ST}><path d="M72 48Q100 14 128 48" fill="none" stroke-width="8"/><rect x="55" y="45" width="90" height="125" rx="26" fill="url(#ga)"/><rect x="70" y="98" width="60" height="50" rx="12" fill="#1fa89c"/><path d="M78 124q10-14 22 0t22 0" stroke="#fff" stroke-width="4" fill="none"/></g></svg>`,
veh:`<svg viewBox="0 0 200 200">${GD}<g ${ST}><path d="M10 138L42 112 84 100 134 102 172 122 192 132V154H10Z" fill="url(#ga)"/><path d="M58 112L90 103 124 104 150 122 60 122Z" fill="#bfe3ff"/></g><g fill="#222" stroke="#aaa" stroke-width="3"><circle cx="54" cy="154" r="18"/><circle cx="150" cy="154" r="18"/></g><g fill="url(#ga)"><circle class="vin" cx="54" cy="154" r="8"/><circle class="vin" cx="150" cy="154" r="8"/></g></svg>`,
jam:`<svg viewBox="0 0 200 200">${GD}<g class="vin"><circle cx="100" cy="100" r="80" fill="#14141c" stroke="#444" stroke-width="3"/><circle cx="100" cy="100" r="60" fill="none" stroke="#2c2c3a" stroke-width="2"/><circle cx="100" cy="100" r="42" fill="none" stroke="#2c2c3a" stroke-width="2"/><circle cx="100" cy="100" r="24" fill="url(#ga)"/><circle cx="100" cy="100" r="4" fill="#14141c"/></g></svg>`,
load:`<svg viewBox="0 0 200 200">${GD}<rect x="22" y="30" width="156" height="140" rx="6" fill="url(#ga)" ${ST}/><rect x="34" y="42" width="132" height="116" fill="#2b4c9a"/><circle cx="130" cy="78" r="16" fill="#ffd23f"/><path d="M34 130q22-18 44 0t44 0 44 0V158H34Z" fill="#1d7ec9"/><path d="M34 146q22-14 44 0t44 0 44 0V158H34Z" fill="#0d4f8a"/></svg>`,
token:`<svg viewBox="0 0 200 200">${GD}<circle cx="100" cy="100" r="74" fill="url(#ga)" ${ST}/><circle cx="100" cy="100" r="56" fill="none" stroke="#9a5800" stroke-width="4"/><text x="100" y="128" text-anchor="middle" font-size="78" fill="#7a4a00">☠</text></svg>`};
const giz=e=>`<svg viewBox="0 0 200 200"><polygon points="100,14 176,56 176,144 100,186 24,144 24,56" fill="#10223f" stroke="#8fd3ff" stroke-width="4"/><text x="100" y="128" text-anchor="middle" font-size="80">${e}</text></svg>`;
function showcase(r,item,big){if(!item)return;const el=$('#show'),sup=r.id==='gold'||r.id==='token';
 const t={gold:'outfit',token:'token',veh:'veh',pick:item.type==='Pickaxe'?'pick':'back',jam:'jam',load:'load',giz:'giz'}[r.id];
 clearTimeout(shD);clearTimeout(shT);el.classList.remove('on');
 shD=setTimeout(()=>{el.style.setProperty('--c',r.c);
  el.innerHTML=`<div class="ic a-${t}${sup?' sup':''}"><div class="rays2"></div><div class="art">${t==='giz'?giz(item.e):ART[t]}${t==='jam'?'<div class="eq"><i></i><i></i><i></i><i></i><i></i></div>':''}</div><div class="tg">${item.type}${sup?' · Supreme':''}</div><div class="nm">${item.name}</div><div class="sb">${item.sub||''}</div></div>`;
  void el.offsetWidth;el.classList.add('on');shT=setTimeout(()=>el.classList.remove('on'),r.id==='gold'?10000:sup?8000:5200)},r.id==='gold'?1500:900)}
function specialFx(r){const id=r.id,rg=$('#ring'),st=$('.stage');rg.style.borderColor=(id==='gold'||id==='token')?'#fff':r.c;
 if(id==='jam'||id==='gold')[1,2,3].forEach(i=>setTimeout(ring,i*(id==='gold'?350:200)));
 if(id==='veh'){st.classList.add('speed');setTimeout(()=>st.classList.remove('speed'),900)}
 if(id==='pick')burst('#ff8a1f',60,false);if(id==='giz')burst('#8fd3ff',40,false);
 if(id==='gold'){confetti(260);document.body.classList.add('quake');setTimeout(()=>document.body.classList.remove('quake'),550)}}
function sfxType(r){const i=r.id;
 if(i==='veh'){tone(60,0,.9,'sawtooth',.07,300);tone(400,.5,.25,'square',.03)}
 else if(i==='pick'){tone(1500,0,.4,'triangle',.07,900);tone(2300,.02,.3,'sine',.05)}
 else if(i==='jam')[0,.25,.5,.75].forEach(t=>{tone(120,t,.15,'sine',.12,40);tone(900,t+.125,.05,'square',.02)});
 else if(i==='load')tone(200,0,.4,'sawtooth',.03,1800);
 else if(i==='giz')[0,3,7,12,15].forEach((n,k)=>tone(880*2**(n/12),k*.07,.2,'sine',.05));
 else if(i==='gold'){[0,4,7,12,16,19].forEach((n,k)=>tone(392*2**(n/12),k*.12,.9,'triangle',.07));for(let k=0;k<14;k++)tone(2000+Math.random()*2500,.2+k*.07,.1,'sine',.025)}}
$('#show').onclick=()=>$('#show').classList.remove('on');
addEventListener('keydown',e=>{if(e.key==='Escape')$('#show').classList.remove('on')});
$('#chest').classList.add('intro');setTimeout(()=>$('#chest').classList.remove('intro'),1000);
