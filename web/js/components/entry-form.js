/* ============================================================
 * نموذج إدخال القياس
 * نموذج المنسق: البسط والمقام أو القيمة، الدليل، الملاحظات، وخطوة التأكيد.
 * ============================================================ */

function entryForm(code){const k=KPIS.find(x=>x.code===code),old=meas(k),r=k.ct==='ratio';
 mo('إدخال قياس — '+P().l,`<div class="kr"><span>${k.code}</span><span>${k.e.name}</span></div><h3 style="margin-top:6px">${k.name}</h3>${old&&old.ret?`<div class="note r">سبب الإعادة: ${old.ret}</div>`:''}
 <div class="note g">المعادلة: ${FM[k.ct]} \u00b7 المستهدف الأولي: ${tgt(k)}${k.ct==='ratio'||k.ct==='score'?'%':''}</div>
 ${r?`<label>تحقيق المستهدف</label><input type="number" id="fn" min="0"><label>المستهدف الكلي</label><input type="number" id="fd" min="0">`:`<label>القيمة</label><input type="number" id="fv" min="0" step="0.1">`}
 <div id="pv" style="margin-top:8px;font-size:13.5px;color:var(--navy)"></div>
 <label>الدليل (إلزامي)</label><input type="file" id="fe"><label>ملاحظات</label><textarea id="fo" rows="2"></textarea>
 <div class="note">بعد الإرسال يذهب السجل مباشرة لاعتماد الوكيل/العميد (لا توجد مراجعة وسيطة في هذا الإصدار).</div>
 <div id="step1"><div class="acts"><button class="btn" id="fs">إرسال لاعتماد الوكالة</button><button class="btn o" onclick="cl()">إلغاء</button></div></div>
 <div id="step2" style="display:none"><div class="note r">⚠ تأكيد الإرسال: لن تتمكن من تعديل هذا القياس بعد اعتماد الوكالة/العميد إلا بمراجعة جديدة. تأكد من صحة الرقم والدليل المرفق.</div><div class="acts"><button class="btn" id="fc">تأكيد الإرسال نهائيًا</button><button class="btn o" id="fback">رجوع للتعديل</button></div></div>`);
 const calc=()=>{let v=r?($('#fd').value>0?$('#fn').value/$('#fd').value*100:NaN):parseFloat($('#fv').value);return v};
 const up=()=>{const v=calc();$('#pv').innerHTML=isNaN(v)?'':`النتيجة المحسوبة تلقائيًا: <b>${(+v).toFixed(1)}${r||k.ct==='score'?'%':''}</b>`};
 document.querySelectorAll('#mb input[type=number]').forEach(i=>i.oninput=up);
 $('#fs').onclick=()=>{let v=calc();const f=$('#fe').files[0];
  if(isNaN(v)||v<0){toast('أدخل قيمًا صحيحة');return}if(r&&+$('#fn').value>+$('#fd').value){toast('تحقيق المستهدف لا يجب أن يتجاوز المستهدف الكلي');return}
  if(!f&&!(old&&old.ev)){toast('إرفاق الدليل إلزامي قبل الإرسال');return}
  $('#step1').style.display='none';$('#step2').style.display='block'};
 $('#fback').onclick=()=>{$('#step2').style.display='none';$('#step1').style.display='block'};
 $('#fc').onclick=()=>{const f=$('#fe').files[0];LIVE.submit(code,{num:r?+$('#fn').value:null,den:r?+$('#fd').value:null,val:r?null:+$('#fv').value,file:f,note:$('#fo').value,btn:$('#fc')})}}
