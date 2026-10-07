/* ============================================================
 * الإشعارات
 * نافذة الجرس: السجلات المُعادة أو بانتظار الاعتماد.
 * ============================================================ */

function bell(){const q=queue(),r=returned();mo('الإشعارات',[...r.map(k=>`<div class="dr" style="cursor:pointer" data-k="${k.code}"><span>أُعيد إليك</span><b>${k.name}</b></div>`),...q.map(k=>`<div class="dr" style="cursor:pointer" data-k="${k.code}"><span>بانتظار اعتمادك</span><b>${k.name}</b></div>`)].join('')||'<div class="note g">لا إشعارات جديدة.</div>');document.querySelectorAll('#mb [data-k]').forEach(x=>x.onclick=()=>kModal(x.dataset.k))}
