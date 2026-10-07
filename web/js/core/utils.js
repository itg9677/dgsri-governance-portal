/* ============================================================
 * أدوات مساعدة
 * اختصار DOM ‏($)، شارة الحالة، تنسيق التاريخ، الشعار، سطر بيانات، إشعار منبثق (toast).
 * ============================================================ */

const fmtD=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)?new Date(x).toLocaleDateString('ar-SA-u-nu-latn',{day:'numeric',month:'long',year:'numeric'}):x;

const $=s=>document.querySelector(s),bd=(t,c)=>`<span class="b ${c}">${t}</span>`;

function toast(t){const x=$('#ts');x.textContent=t;x.style.display='block';setTimeout(()=>x.style.display='none',2600)}

const dr=a=>a.map(([l,v])=>`<div class="dr"><span>${l}</span><b>${v}</b></div>`).join('');

const logoH=()=>`<img src="assets/logo.gif" alt="شعار جامعة القصيم">`;
