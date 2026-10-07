/* ============================================================
 * الصفحة: الرئيسية
 * الترحيب ونظرة عامة وبطاقات الوحدات (العميد/الوكيل) أو مؤشرات الوحدة (المنسق).
 * ============================================================ */

function welcomePanel(){
 if(U.role==='staff'){const t=todo(),r=returned();
  if(!t.length&&!r.length)return `<div class="welcome"><h3>كل مؤشراتك مُدخلة لهذا الربع</h3><p>لا توجد مهام متبقية عليك حاليًا في ${P().l}. تابع أي تحديث من تبويب «المؤشرات».</p></div>`;
  return `<div class="welcome"><h3>ما تبقى عليك في ${P().l}</h3><p>${t.length} مؤشرًا يحتاج إدخال قياس${r.length?` \u00b7 ${r.length} أُعيد إليك للتعديل`:''}</p>
  <div class="wlist">${r.map(k=>`<div class="wrow" data-k="${k.code}"><span>\ud83d\udd34 ${k.name}</span>${bd('أُعيد','b-bd')}</div>`).join('')}${t.filter(k=>!r.includes(k)).map(k=>`<div class="wrow" data-k="${k.code}"><span>\ud83d\udfe1 ${k.name}</span>${bd('مطلوب إدخال','b-nr')}</div>`).join('')}</div></div>`}
 if(U.role==='deputy'||U.role==='dean'){const q=queue();
  if(!q.length)return `<div class="welcome"><h3>مرحبًا ${RN[U.role]}، لا شيء بانتظارك</h3><p>لا توجد سجلات بحاجة اعتمادك حاليًا في ${P().l}.</p></div>`;
  return `<div class="welcome"><h3>مرحبًا ${RN[U.role]}، لديك ${q.length} سجلاً بانتظار اعتمادك</h3><p>اضغط أي سجل لمراجعته واعتماده أو إعادته.</p><div class="wlist">${q.slice(0,6).map(k=>`<div class="wrow" data-k="${k.code}"><span>${k.name}</span><span class="crumb">${k.e.name}</span></div>`).join('')}</div>${q.length>6?`<p class="crumb" style="margin-top:8px">+${q.length-6} أخرى — <a href="#" onclick="go('queue');return false" style="color:var(--navy);font-weight:700">افتح الطابور كاملاً</a></p>`:''}</div>`}
 return '';}

function home(){const ks=KPIS.filter(k=>inSc(k.e)),q=queue(),unit=U.role==='staff',e=unit?eOf(U.ent):null;
 const pub=ks.filter(k=>{const m=meas(k);return m&&m.st==='published'}).length;
 const unread=returned().length+q.length;
 const pct=ks.length?Math.round(100*pub/ks.length):0;
 const who=unit?'منسق '+e.name:U.role==='deputy'?AG[U.ag].replace('وكالة','وكيل'):'عميد عمادة الدراسات العليا';
 let h=`<div class="bar" style="margin-bottom:6px"><h2>مرحبًا، ${who}</h2><span class="crumb">${unit?e.code+' \u00b7 '+AG[e.ag]:''}</span></div>
 <h3 style="margin:14px 0 10px">نظرة عامة</h3>
 <div class="stats">
 
 ${(U.role==='deputy'||U.role==='dean')?`<div class="gcard" onclick="go('queue')">${svgGauge(q.length?Math.min(100,Math.round(q.length/ks.length*100)):0,'var(--gold)')}<span>${q.length} بانتظار اعتمادك</span></div>`:''}
 <div class="gcard" onclick="go('kpis')">${svgGauge(pct,'var(--teal)')}<span>اكتمال الفترة ضمن نطاقك</span></div>
 ${U.role==='staff'?`<div class="gcard" onclick="go('kpis')">${svgGauge(todo().length+returned().length?Math.round(returned().length/(todo().length+returned().length||1)*100):0,'var(--danger)')}<span>${returned().length} أُعيدت للتعديل</span></div><div class="gcard" onclick="go('kpis')">${svgGauge(ks.length?Math.round(todo().length/ks.length*100):0,'var(--gold)')}<span>${todo().length} مطلوب إدخالها</span></div>`:''}
 <div class="st" onclick="go('periods')"><b style="font-size:17px">${pst()}</b><span>حالة ${P().l}</span></div></div>
 ${unit?welcomePanel():''}`;
 h+=unit?`<h3>مؤشرات الوحدة</h3><div class="kg" id="kk">${ks.map(kCard).join('')}</div>`:groups(U.role==='dean'?['DEAN']:null,true);
 $('#m').innerHTML=h;document.querySelectorAll('#m .gcard').forEach(g=>{const s=g.textContent,n=/تنبيه|مقروءة/.test(s)?'bell':/اعتماد/.test(s)?'doc':/اكتمال|إكمال|منشور/.test(s)?'check':'target';g.insertAdjacentHTML('afterbegin',`<i class="ib ${n}">${ic(n,18)}</i>`)});bindK($('#m'));bindE($('#m'));$('#m').querySelectorAll('.wrow[data-k]').forEach(w=>w.onclick=()=>kModal(w.dataset.k))}
