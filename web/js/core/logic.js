/* ============================================================
 * منطق الأعمال
 * المستهدف، نتيجة القياس ونسبة التحقق، نطاق صلاحية المستخدم، طابور الاعتماد، حالة الفترة، صحة الوحدة.
 * ============================================================ */

const tgt=(k,p)=>{const e=((DB&&DB.tg)||{})[k.code];if(typeof e==='number')return e;if(!Array.isArray(e))return (k.base??TG[k.ct]);const ix=PER.findIndex(x=>x.id===(p||S.per));let r;e.forEach(x=>{if(x.i<=ix)r=x.v});return r??(k.base??TG[k.ct])};

const lkc=k=>k.plan||'';

const linkTxt=k=>LINKS[k.lk]+(lkc(k)?` <span dir="ltr" class="lkc">${lkc(k)}</span>`:'');

const eOf=c=>E.find(e=>e.code===c);

const P=()=>PER.find(p=>p.id===S.per)||PER[PER.length-1]||{l:'',year:''};

const pst=(id=S.per)=>{const p=PER.find(x=>x.id===id);return DB.lock[id]?'مقفلة':(p&&p.s>new Date().toISOString().slice(0,10))?'لم تبدأ':'مفتوحة'};

function meas(k,p=S.per){const m=DB.m[k.code+'|'+p];if(!m)return null;const t=tgt(k,p),pct=Math.round(k.ct==='days'?t/m.v*100:m.v/t*100);return{...m,t,pct,rs:pct>=100?'achieved':pct>=90?'near':'action'}}

const scope=()=>U.role==='staff'?E.filter(e=>e.code===U.ent):U.role==='deputy'?E.filter(e=>e.ag===U.ag):E;

const inSc=e=>scope().includes(e);

function queue(){if(U.role!=='deputy'&&U.role!=='dean')return[];return KPIS.filter(k=>{const m=meas(k);return m&&m.st==='evidence_attached'&&(U.role==='deputy'?k.e.ag===U.ag:k.e.ag==='DEAN')})}

const returned=()=>U.role==='staff'?KPIS.filter(k=>k.e.code===U.ent&&meas(k)&&meas(k).st==='returned'):[];

const todo=()=>U.role==='staff'?KPIS.filter(k=>k.e.code===U.ent&&(!meas(k)||meas(k).st==='returned')&&pst()==='مفتوحة'):[];

function canEdit(k){return U.role==='staff'&&k.e.code===U.ent&&pst()==='مفتوحة'}

function health(e){const ks=KPIS.filter(k=>k.e===e);if(ks.some(k=>{const m=meas(k);return m&&m.st==='returned'}))return'needs_follow_up';if(ks.some(k=>{const m=meas(k);return m&&m.st==='evidence_attached'}))return'pending_approval';return'complete'}
