/* ============================================================
 * السجلات التفصيلية
 * نافذة سجل الكيان وحقول إدخاله (إدخال السجلات غير مربوط بالقاعدة بعد).
 * ============================================================ */

const fld=c=>/تاريخ/.test(c)?`<label>${c}</label><input type="date" class="ri2">`:/ضمن الزمن/.test(c)?`<label>${c}</label><select class="f ri2"><option value="">اختر…</option><option>نعم</option><option>لا</option></select>`:/نسبة الإنجاز/.test(c)?`<label>${c} (%)</label><input type="number" min="0" max="100" class="ri2">`:/الميزانية/.test(c)?`<label>${c} (ريال)</label><input type="number" min="0" class="ri2">`:`<label>${c}</label><input type="text" class="ri2">`;

const regsHtml=e=>e.paths.length?`<div class="card"><h3>المسارات الفعلية للكيان</h3><div class="chips">${e.paths.map((p,i)=>`<span class="chip" data-p="${i}">${PL[p.k]}<em>${(DB.reg[e.code+'|'+p.k]||[]).length}</em></span>`).join('')}</div><p class="crumb">الرقم = عدد الإدخالات المسجلة</p></div>`:'<div class="note">لا مسارات سجلات لهذا الكيان — كل مهامه مرتبطة بمؤشرات مباشرة.</div>';

const bindReg=(r,e)=>r.querySelectorAll('[data-p]').forEach(c=>c.onclick=()=>regModal(e,e.paths[+c.dataset.p]));

function regModal(e,p){const key=e.code+'|'+p.k,rows=DB.reg[key]||[],can=false,cols=PC[p.k];
 const draw=()=>mo(PL[p.k]+' — '+e.name,`<p class="crumb">سجل: ${e.code}-REG0${e.paths.indexOf(p)+1} \u00b7 ${p.n} مهمة رسمية</p>${rows.length?`<div class="tw"><table><tr>${cols.map(c=>`<th>${c}</th>`).join('')}<th>الحالة</th></tr>${rows.map(r=>`<tr>${r.map(x=>`<td>${x?fmtD(x):'—'}</td>`).join('')}<td>${bd('مُدخل','b-nr')}</td></tr>`).join('')}</table></div>`:'<div class="note">لا إدخالات في هذه الفترة.</div>'}
 ${can?`<h3>إدخال جديد</h3>${cols.map(fld).join('')}<div class="acts"><button class="btn" id="sv">حفظ الإدخال</button></div>`:'<div class="crumb">إدخال السجلات التفصيلية سيُفعَّل في دفعة قادمة.</div>'}`);
 draw();const bindSave=()=>{const b=$('#sv');if(b)b.onclick=()=>{const v=[...document.querySelectorAll('.ri2')].map(i=>i.value);if(!v.some(x=>x.trim())){toast('أدخل بيانات واحدة على الأقل');return}rows.push(v);DB.reg[key]=rows;save();draw();bindSave();toast('حُفظ الإدخال')}};bindSave()}
