/* ============================================================
 * الصفحة: الفترات
 * أرباع السنة وإقفالها وفتحها.
 * ============================================================ */

function periods(){$('#m').innerHTML=`<div class="bar"><h2>الفترات ${P().year}</h2></div><div class="tw"><table><tr><th>الفترة</th><th>من</th><th>إلى</th><th>الحالة</th></tr>${PER.map(p=>{const s=pst(p.id);return`<tr data-i="${p.id}"><td>${p.l}</td><td>${p.s}</td><td>${p.e}</td><td>${bd(s,s==='مقفلة'?'b-gy':s==='مفتوحة'?'b-ok':'b-nr')}</td></tr>`}).join('')}</table></div><div class="note g">تُنشأ الفترات الأربع (أرباع السنة) تلقائيًا مع بداية كل سنة، ولا تحتاج أي إدخال. المطلوب فقط فتح الفترة للإدخال وإقفالها بعد الاعتماد.</div><div class="note">${(U.role==='dean'||U.role==='deputy')?'اضغط الفترة لإقفالها أو فتحها (الفتح بسبب موثق، حصرًا للعميد).':'إقفال وفتح الفترات من صلاحية العميد/الوكيل.'}</div>`;
 $('#m').querySelectorAll('tr[data-i]').forEach(r=>r.onclick=()=>{const id=r.dataset.i;if(U.role!=='dean'&&U.role!=='deputy'){S.per=id;render();return}
  const lk=DB.lock[id],pend=KPIS.filter(k=>{const m=DB.m[k.code+'|'+id];return m&&m.st!=='published'}).length;
  mo(PER.find(p=>p.id===id).l,`${lk?'<label>سبب الفتح (إلزامي \u2014 حصرًا للعميد \u2014 يُسجَّل في التدقيق)</label><textarea id="ur" rows="2"></textarea>':`<div class="note ${pend?'r':'g'}">${pend?'يوجد '+pend+' سجل غير منشور — لا يمكن الإقفال قبل نشرها أو أرشفتها.':'كل السجلات منشورة — يمكن الإقفال.'}</div>`}<div class="acts"><button class="btn" id="lk" ${!lk&&pend?'disabled':''}>${lk?'فتح الفترة':'إقفال الفترة'}</button><button class="btn o" onclick="S.per='${id}';cl();render()">عرض بيانات الفترة</button></div>`);
  $('#lk').onclick=()=>LIVE.lock(id,!!lk,($('#ur')||{}).value,$('#lk'))})}
