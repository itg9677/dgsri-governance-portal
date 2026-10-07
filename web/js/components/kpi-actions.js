/* ============================================================
 * إجراءات المؤشر
 * الأزرار المتاحة حسب الدور والحالة، التنفيذ (اعتماد/إعادة)، وتنزيل الدليل.
 * ============================================================ */

function actions(k,m){const a=[];if(pst()!=='مفتوحة')return a;
 if(canEdit(k)&&(!m||m.st==='returned'))a.push(['entry',m?'إعادة إدخال القياس':'إدخال القياس','']);
 if(m&&m.st==='evidence_attached'){const can=(U.role==='deputy'&&k.e.ag===U.ag)||(U.role==='dean'&&k.e.ag==='DEAN');if(can)a.push(['approve','اعتماد ونشر',''],['return','إعادة للمنسق','r'])}
 return a}

function doAct(code,a,reason){LIVE.act(code,a,reason)}

function dlEv(code){LIVE.download(code)}
