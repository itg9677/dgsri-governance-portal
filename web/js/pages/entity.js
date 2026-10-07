/* ============================================================
 * الصفحة: تفاصيل الوحدة
 * نظرة عامة ومؤشرات الأداء والسجلات لكيان واحد.
 * ============================================================ */

function ent(){const e=eOf(S.ent);if(!e||!inSc(e)){home();return}const ks=KPIS.filter(k=>k.e===e);
 const tabs=[['ov','نظرة عامة'],['kp','مؤشرات الأداء (4)'],['rg','السجلات والمسارات']];
 let h=`<div class="bar"><h2>${e.name}</h2>${bd(TT[e.t],'b-in')}<span class="crumb">${e.code} \u00b7 ${AG[e.ag]}</span></div><div class="tabs">${tabs.map(t=>`<button class="${S.tab===t[0]?'on':''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`;
 if(S.tab==='ov')h+=`<div class="stats"><div class="st"><b>4</b><span>مؤشرات</span></div><div class="st"><b>${e.paths.length}</b><span>مسارات فعلية</span></div></div><div class="card"><h3>حالات المؤشرات</h3>${dist(ks)}</div>`;
 if(S.tab==='kp')h+=`<div class="kg">${ks.map(kCard).join('')}</div>`;
 if(S.tab==='rg')h+=regsHtml(e);
 $('#m').innerHTML=h;$('#m').querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;render()});bindK($('#m'));bindReg($('#m'),e)}
