/* ============================================================
 * بطاقة المؤشر
 * بطاقة المؤشر المعروضة في قوائم المؤشرات وصفحة الوحدة.
 * ============================================================ */

function kCard(k){const m=meas(k),pc=(k.ct==='ratio'||k.ct==='score')?'%':k.ct==='days'?' يوم':'',rs=m?RSB[m.rs]:['لم يُدخل','b-gy'],st=m?m.st:'none';
 return`<div class="kp" data-k="${k.code}"><div class="kph"><span class="kpc">${k.code}</span>${bdi(rs[0],rs[1],m?RSIC[m.rs]:'doc')}</div><h4>${k.name}</h4><div class="kpn"><div><span>الحالي</span><b>${m?m.v+pc:'—'}</b></div><div><span>المستهدف</span><b>${tgt(k)}${pc}</b></div><div><span>التحقق</span><b>${m?m.pct+'%':'—'}</b></div></div><div class="kpl"><span>${ic('link',13)} ربط الخطة: <b>${linkTxt(k)}</b></span>${bdi(WFT[st],WFB[st],WFIC[st])}</div></div>`}

const bindK=r=>r.querySelectorAll('[data-k]').forEach(c=>c.onclick=()=>kModal(c.dataset.k));
