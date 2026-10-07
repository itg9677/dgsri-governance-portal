/* ============================================================
 * مجموعات الوحدات
 * بطاقة الوحدة بالرسم البياني (uCard) وتجميعها حسب الوكالة.
 * ============================================================ */

function uCard(e){const ks=KPIS.filter(k=>k.e===e),h=health(e),col={achieved:'var(--teal)',near:'var(--gold)',action:'var(--danger)'},ms=ks.map(k=>meas(k)),done=ms.filter(Boolean),avg=done.length?Math.round(done.reduce((s,m)=>s+Math.min(m.pct,100),0)/done.length):0,pub=ms.filter(m=>m&&m.st==='published').length;
 return`<div class="uc" data-c="${e.code}">${h!=='complete'?`<span class="hdot ${h==='needs_follow_up'?'nf':'pa'}" title="${h==='needs_follow_up'?'يحتاج متابعة — سجل أُعيد':'بانتظار الاعتماد'}"></span>`:''}<div class="uh"><div><span class="tp">${ic(TI[e.t],13)} ${TT[e.t]}</span><h4>${e.name}</h4><div class="cd">${e.code}</div></div>${done.length?svgGauge(avg,avg>=90?'var(--teal)':avg>=70?'var(--gold)':'var(--danger)',58):'<span class="cd">لا قياسات</span>'}</div>
 <div class="ub">${ks.map((k,i)=>{const m=ms[i];return`<div class="bc" title="${k.name}"><span class="bv">${m?m.pct+'%':'—'}</span><div class="bt">${m?`<i style="height:${Math.min(m.pct,100)}%;background:${col[m.rs]}"></i>`:''}</div><span class="bl">م${k.i}</span></div>`}).join('')}</div>
 <div class="uf"><span>${AG[e.ag].replace(" مباشرة","")}</span><span>${pub}/4 منشور</span></div></div>`}

const bindE=r=>r.querySelectorAll('[data-c]').forEach(c=>c.onclick=()=>go('ent',c.dataset.c));

const LEG='<div class="leg"><span><i style="background:var(--teal)"></i>محقق</span><span><i style="background:var(--gold)"></i>قريب من المستهدف</span><span><i style="background:var(--danger)"></i>يحتاج إجراء</span><span>ارتفاع العمود = نسبة تحقيق المستهدف (م1–م4 مؤشرات الوحدة) · الدائرة = المتوسط</span></div>';

function groups(only,fixed){return LEG+Object.entries(AG).filter(([a])=>(!only||only.includes(a))&&scope().some(e=>e.ag===a)).map(([a,n])=>{const L=scope().filter(e=>e.ag===a);if(fixed)return`<section class="gfix"><h3>${a==='DEAN'?'الوحدات المرتبطة بالعميد':n}<span class="cnt">${L.length}</span></h3><div class="ucs">${L.map(uCard).join('')}</div></section>`;return`<details class="g"><summary>${n}<span class="cnt">${L.length}</span></summary><div class="ucs">${L.map(uCard).join('')}</div></details>`}).join('')}
