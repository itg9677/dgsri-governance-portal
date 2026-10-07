/* ============================================================
 * الصفحة: طابور الاعتماد
 * السجلات بانتظار اعتماد الوكيل/العميد.
 * ============================================================ */

function queuePg(){const q=queue(),t=U.role==='dean'?'العميد':'الوكيل';
 $('#m').innerHTML=`<div class="bar"><h2>طابور اعتماد ${t}</h2></div><div class="note">المُدخِل لا يعتمد ما أدخله. الاعتماد هنا خطوة واحدة مباشرة (لا توجد مراجعة وسيطة في v3.4)، ويُنشر السجل تلقائيًا فور الاعتماد. الإعادة تتطلب سببًا مكتوبًا.</div>${q.length?`<div class="acts" style="margin:0 0 12px"><button class="btn" id="all" ${pst()!=='مفتوحة'?'disabled':''}>اعتماد الكل (${q.length})</button></div>`:''}
 <div class="tw"><table><tr><th>المؤشر</th><th>الكيان</th><th>القيمة</th><th>الحالة</th></tr>${q.map(k=>{const m=meas(k);return`<tr data-i="${k.code}"><td>${k.name}</td><td>${k.e.name}</td><td>${m.v}</td><td>${bd(WFT[m.st],'b-nr')}</td></tr>`}).join('')||'<tr><td colspan="4">لا شيء بانتظار اعتمادك — أحسنت </td></tr>'}</table></div>`;
 $('#m').querySelectorAll('tr[data-i]').forEach(r=>r.onclick=()=>kModal(r.dataset.i));
 if($('#all'))$('#all').onclick=()=>LIVE.approveAll(q.map(k=>k.code),$('#all'))}
