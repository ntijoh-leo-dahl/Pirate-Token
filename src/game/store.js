import { reactive, shallowRef } from 'vue'

export const R=[
{id:'gold',name:'Weekly Gold Outfit',n:1562500,c:'#ffd23f',once:1,i:'👑'},
{id:'token',name:'Pirate Shop Access',n:137500,c:'#ff8a1f',once:1,i:'🪙'},
{id:'veh',name:'Weekly Vehicle & Decal',n:7813,c:'#b46bff',once:1,i:'🚗'},
{id:'pick',name:'Weekly Pickaxe / Back Bling',n:568,c:'#4db8ff',once:1,i:'⛏️'},
{id:'jam',name:'Weekly Jam Track',n:391,c:'#3ddc97',once:1,i:'🎵'},
{id:'load',name:'Weekly Loading Screen',n:272,c:'#9db4d6',once:1,i:'🖼️'},
{id:'giz',name:'Gizmo',n:127,c:'#d5deec',once:0,i:'🔧'}];

export const MODES={normal:{l:'Normal match',b:{}},hour:{l:'Treasure Hour (1.5×)',b:{token:1.5,gold:7.5,veh:10}},max:{l:'Treasure Hour (2×)',b:{token:2,gold:10,veh:10}}};

export const WK={1:{n:'A$AP Rocky',d:'Nov 1–8',gold:'Solid Gold A$AP Rocky',pick:['Solid Gold Gauntlets','Pickaxe'],jam:'No Trespassing',load:'Plunder in Paradise',veh:'Gold Mercedes-AMG G 63 G-Wagon'},
2:{n:'Lil Uzi Vert',d:'Nov 8–15',gold:'Solid Gold Lil Uzi Vert',pick:['Lil’ Uzi Crew','Back Bling'],jam:'London',load:'So Kawaii',veh:'Gold Cadillac CT5-V Blackwing'},
3:{n:'Hatsune Miku',d:'Nov 15–22',gold:'Solid Gold Hatsune Miku',pick:['Miku’s Takarabako','Back Bling'],jam:'PPPP',load:'May Fortune Find You',veh:'Gold Chevrolet Corvette ZR1'},
4:{n:'Kasane Teto',d:'Nov 22–29',gold:'Solid Gold Kasane Teto',pick:['Rogue Wave and Tidewalker','Back Bling'],jam:'Sea Shanty',load:'Oscar’s Wraps',veh:'Gold Lamborghini Urus SE'}};
export const GZ=[['Sprite Locator','📡'],['Lucky Locator','🍀'],['Portable Extractor','⛏️'],['Extraction Accelerator','⚡'],['Golden Firework','🎆']];

/** UI state (was: mode, W, #once checkbox, auto button label, mute flag, token-probability accumulator) */
export const ui=reactive({mode:'normal',W:4,once:true,auto:false,muted:false,tokExp:0});

/** Set after the DOM-driven engine module has been loaded (see App.vue) */
export const engine=shallowRef(null);

export const fresh=()=>({opened:0,hits:Object.fromEntries(R.map(r=>[r.id,0])),dupes:Object.fromEntries(R.map(r=>[r.id,0])),owned:new Set(),log:[],locker:{},exp:0,sinceTok:0,tokP:0,lastTok:0,expAll:R.map(()=>0)});
export const S=reactive(fresh());

export const fmt=n=>Math.round(n).toLocaleString('en-US');
export const probs=()=>R.map(r=>(1/r.n)*(MODES[ui.mode].b[r.id]||1));

export function setWeek(k){ui.W=+k;S.owned.clear()}

export function itemFor(r,prev){const w=WK[ui.W],o=' · 1 in '+fmt(r.n),tag=`Week ${ui.W} · ${w.n}`;
 if(r.id==='gold')return{name:w.gold,type:'Outfit',sub:tag+o};
 if(r.id==='token')return{name:'Pirate Shop Access',type:'Item Shop Token',sub:'(2026) + (2027) · 14 days free each'};
 if(r.id==='veh')return{name:w.veh,type:'Vehicle & Decal',sub:tag+o};
 if(r.id==='pick')return{name:w.pick[0],type:w.pick[1],sub:tag+o};
 if(r.id==='jam')return{name:w.jam,type:'Jam Track',sub:tag+o};
 if(r.id==='load')return{name:w.load,type:'Loading Screen',sub:tag+o};
 const g=prev?null:GZ[Math.random()*5|0];return g?{name:g[0],type:'Gizmo',sub:'Treasure Hunters · '+o.slice(3),e:g[1]}:{name:'Any of 5 Gizmos',type:'Gizmo'}}
