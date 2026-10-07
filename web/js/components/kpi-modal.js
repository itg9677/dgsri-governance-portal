/* ============================================================
 * نافذة تفاصيل المؤشر
 * تفاصيل المؤشر: القيم، آلية الحساب، مسار الحوكمة، بيانات القياس، الدليل، تعديل المستهدف، سجل التدقيق.
 * ============================================================ */

function kModal(code){const k=KPIS.find(x=>x.code===code),m=meas(k),st=m?m.st:'none',acts=actions(k,m),pct=k.ct==='ratio'||k.ct==='score';
 const link=LINKS[k.lk];
 const calc=!m?'—':k.ct==='ratio'?`${m.num??m.v} / ${m.den??100} \u00d7 100 = ${m.v.toFixed(1)}%`:k.ct==='score'?`${m.v}%`:k.ct==='days'?`${FM.days} = ${m.v} يوم`:`${FM.count} = ${m.v}`;
 const dataFields=!m?'':k.ct==='ratio'?`<div class="field"><span>تحقيق المستهدف</span><b>${m.v}</b></div><div class="field"><span>المستهدف الكلي</span><b>100</b></div>`:`<div class="field"><span>القيمة المُدخلة</span><b>${m.v}${pct?'%':''}</b></div>`;
 const evBtn=!m?'':m.evData?`<a class="btn o" href="${m.evData}" download="${m.ev}" style="display:inline-block">\u2b07 تنزيل الدليل</a>`:m.ev?`<span class="crumb">${m.ev} — ملف تجريبي (seed)، لا يتوفر تنزيل فعلي</span>`:'<span class="crumb">لا يوجد دليل مرفق</span>';
 const interp=m&&m.note?m.note:m&&m.rs==='action'?'النتيجة أقل من المستهدف — يُرجى مراجعة الملاحظات وتنفيذ خطة تحسين.':m&&m.rs==='near'?'قريب من المستهدف — تابع الأداء خلال الفترة القادمة.':m?'لا يوجد انحراف عن المستهدف.':'—';
 const fl=(l,v,c)=>`<div class="kx" style="border-right-color:${c}"><span>${l}</span><b>${v}</b></div>`,V=x=>m?x:'—',pc=pct?'%':'';
 const F=k.ct==='ratio'?[['البسط — العدد المتحقق',V(m&&(m.num??m.v)),'var(--teal)'],['المقام — الإجمالي',V(m&&(m.den??100)),'var(--navy)']]:[['القيمة المُدخلة',V(m&&m.v+pc),'var(--teal)'],['نوع القياس',{count:'عدد',days:'عدد أيام',score:'درجة'}[k.ct]||'نسبة','var(--navy)']];
 F.push(['النتيجة المحسوبة آليًا',V(m&&(k.ct==='ratio'?m.v.toFixed(1):m.v)+pc),'var(--teal)'],['المستهدف المعتمد',(m?m.t:tgt(k))+pc,'var(--gold)']);
 const plc={published:'ok',returned:'bad',agency_approved:'nv'}[st]||'';
 const canUp=acts.some(a=>a[0]==='entry'),canTg=((U.role==='deputy'&&k.e.ag===U.ag)||U.role==='dean')&&!DB.lock[S.per];
 mo('',`<div class="kh"><div><h2>${k.name}</h2><div class="kcode">${k.code} \u00b7 ${k.e.name}</div></div><div class="kpills"><span class="pl ${plc}">الحالة: ${WFT[st]}</span><span class="pl pt">الفترة: ${P().l}</span></div></div>
 ${m&&m.ret?`<div class="note r">سبب الإعادة: ${m.ret}</div>`:''}
 <div class="kd">
  <aside class="card ka"><h3>آلية الحساب والاعتماد</h3><div class="crumb">معادلة المؤشر</div><div class="calcbox">${calc}</div><h3>مسار الحوكمة</h3><div class="vstep">${STEPS.map((s,n)=>`<div class="vrow ${n<WFI[st]?'d':n===WFI[st]&&st!=='none'?'c':''}"><div class="vnum">${n+1}</div><div><b>${s[0]}</b><span>${s[1]}</span></div></div>`).join('')}</div></aside>
  <div class="kmain">
   <div class="ks">${fl('الربط الاستراتيجي','<span style="font-size:14px;color:var(--gold);font-weight:700">'+linkTxt(k)+'</span>','var(--gold)')}${fl('نسبة تحقيق المستهدف',(m?m.pct:0)+'%','var(--purple)')}${fl('المستهدف',(m?m.t:tgt(k))+pc,'var(--navy)')}${fl('القيمة الحالية',V(m&&m.v+pc),'var(--teal)')}</div>
   <div class="card kmeas"><h3>بيانات القياس</h3><p class="crumb" style="margin-top:-4px">تُدخل الوحدة الأرقام الأساسية فقط، ويحسب النظام النتيجة تلقائيًا</p>
    <div class="kf">${F.map(f=>fl(...f)).join('')}</div>
    ${canTg?`<div style="margin:-4px 0 14px"><button class="btn o" id="tgb">تعديل المستهدف</button><div id="tga" style="display:none;margin-top:8px"><label>المستهدف الجديد${pct?' (%)':''}</label><input type="number" id="tgi" min="0" ${pct?'max="100"':''} value="${m?m.t:tgt(k)}"><div class="crumb" style="margin-top:4px">يسري المستهدف الجديد على الفترة الحالية والفترات القادمة فقط، ولا يعدّل الفترات السابقة.</div><div class="acts" style="margin-top:8px"><button class="btn" id="tgs">حفظ المستهدف</button></div></div></div>`:''}
    <div class="kb2"><div><h4>دليل الإثبات</h4><div class="kev"><span>${m&&m.ev?m.ev:'لا يوجد دليل مرفق'}</span><div class="evb">${m&&m.ev?`<button class="btn o" onclick="dlEv('${code}')">تنزيل الملف المرفق</button>`:''}${canUp?`<button class="btn" onclick="entryForm('${code}')">${m&&m.ev?'استبدال الملف':'رفع الملف'}</button>`:''}</div></div></div>
    <div><h4>التفسير والإجراء التصحيحي</h4><div class="kev" style="line-height:1.6">${interp}</div></div></div>
   </div>
  </div>
 </div>
 <div class="klinks"><b>روابط المؤشر</b>${bd('مؤشر جامعي مباشر','b-in')} ${bd('استراتيجي داعم','b-pv')} ${bd('استراتيجي مباشر','b-nr')}<span class="crumb">يُحفظ نوع الربط ورمز الهدف أو المؤشر المرجعي داخل بطاقة المؤشر لسهولة التتبع والتقارير.</span></div>
 <div id="ra" style="display:none;margin-top:12px"><label>سبب الإعادة (إلزامي)</label><textarea id="rr" rows="2"></textarea><div class="acts"><button class="btn r" id="rc">تأكيد الإعادة</button></div></div>
 <div class="acts" id="ab">${acts.map(a=>`<button class="btn ${a[2]}" data-a="${a[0]}">${a[1]}</button>`).join('')||`<span class="crumb">${pst()!=='مفتوحة'?'الفترة '+pst()+' — للقراءة فقط':'لا إجراء مطلوب منك على هذا السجل'}</span>`}</div>
 ${m?`<h3 style="margin-top:14px">سجل التدقيق</h3>${m.h.map(x=>`<div class="dr"><span>${x[0]} \u00b7 ${x[1]}</span><b>${x[2]}</b></div>`).join('')}`:''}`);
 $('.mc').classList.add('wide');if($('#tgb')){$('#tgb').onclick=()=>{$('#tga').style.display='block'};$('#tgs').onclick=()=>{const v=parseFloat($('#tgi').value);if(isNaN(v)||v<=0||(pct&&v>100)){toast('أدخل مستهدفًا صحيحًا');return}LIVE.setTarget(code,v,$('#tgs'))}}document.querySelectorAll('#ab [data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='entry')entryForm(code);else if(a==='return'){$('#ra').style.display='block';$('#rc').onclick=()=>doAct(code,'return',$('#rr').value)}else doAct(code,'approve')})}
