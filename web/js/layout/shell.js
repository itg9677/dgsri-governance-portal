/* ============================================================
 * الهيكل العام
 * الترويسة، القائمة الجانبية (شجرة الوحدات)، البحث، خريطة الصفحات PG، والدالة render().
 * ============================================================ */

let NO=false,OP={};   // حالة قائمة الوحدات الجانبية (مفتوحة/مغلقة)

function nav(){const q=queue().length,r=U.role,items=[['home','الرئيسية'],...((r==='deputy'||r==='dean')?[['queue','طابور الاعتماد',q]]:[]),['kpis','المؤشرات'],...(r==='staff'?[['regs','السجلات']]:[['units','الوحدات']]),...(r==='dean'?[['cmt','اللجان'],['periods','الفترات']]:[]),...(r==='deputy'?[['periods','الفترات']]:[]),['reports','التقارير']];return items}

const PG={home,ent,kpis,queue:queuePg,units,regs,cmt,periods,reports};

function render(){if(!U){loginPg();return}
 const e=U.ent?eOf(U.ent):null,n=queue().length+returned().length;
 if(S.page==='ent'&&S.ent){const z=eOf(S.ent);NO=true;OP['A_'+z.ag]=true;if(z.ag==='DEAN')OP[z.t==='CTR'?'C':'O']=true}
 const mk=(id,l,body,lv)=>`<div class="sr l${lv}" data-o="${id}"><span>${l}</span><span class="arw${OP[id]?' on':''}">▾</span></div><div class="sc${OP[id]?' on':''}">${body}</div>`,un=z=>`<div class="su${S.ent===z.code?' on':''}" data-u="${z.code}">${z.name}</div>`;
 const scopeSel=U.role!=='staff'?`<div class="nsub${NO?' on':''}" id="usub">${Object.entries(AG).filter(([a])=>scope().some(z=>z.ag===a)).map(([a,n2])=>{const L=scope().filter(z=>z.ag===a);if(a==='DEAN'){const C=L.filter(z=>z.t==='CTR'),O=L.filter(z=>z.t!=='CTR');return mk('A_DEAN',n2,(C.length?mk('C','المراكز',C.map(un).join(''),2):'')+(O.length?mk('O','وحدات العميد',O.map(un).join(''),2):''),1)}return mk('A_'+a,n2,L.map(un).join(''),1)}).join('')}</div>`:'';
 $('#app').innerHTML=`<header><div class="logo" onclick="go('home',null,null,false)">${logoH()}<span>بوابة الحوكمة<small>عمادة الدراسات العليا والبحث العلمي</small></span></div>
 <div class="sw"><input id="q" placeholder="ابحث بالاسم أو الكود…"><b>\ud83d\udd0d</b><div class="res" id="res"></div></div>
 <div class="hr"><select id="ps">${PER.map(p=>`<option value="${p.id}" ${p.id===S.per?'selected':''}>${p.l}${DB.lock[p.id]?' \ud83d\udd12':''}</option>`).join('')}</select><span class="bell" id="bl">\ud83d\udd14${n?`<i>${n}</i>`:''}</span><span class="who">${RN[U.role]}${e?' — '+e.name:U.ag?' — '+AG[U.ag]:''}</span><button class="back" id="lo">خروج</button></div></header>
 <div class="wrap"><nav>${nav().map(x=>`<button data-n="${x[0]}" class="${S.page===x[0]||(S.page==='ent'&&(x[0]==='units'))?'on':''}"><span class="nl">${ic(({queue:'queue',regs:'regs'})[x[0]]||x[0],18)}${x[1]}</span>${x[2]?`<em>${x[2]}</em>`:''}${x[0]==='units'&&scopeSel?`<span class="arw${NO?' on':''}">▾</span>`:''}</button>${x[0]==='units'?scopeSel:''}`).join('')}</nav><main id="m"></main></div>`;
 $('#ps').onchange=x=>{S.per=x.target.value;render()};$('#bl').onclick=bell;$('#lo').onclick=()=>LIVE.logout();
 document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{if(b.dataset.n==='units'&&$('#usub')){NO=!NO;if(S.page!=='units'){H=[];go('units',null,null,false)}else{$('#usub').classList.toggle('on',NO);b.querySelector('.arw').classList.toggle('on',NO)}return}H=[];go(b.dataset.n,null,null,false)});
 document.querySelectorAll('.sr').forEach(r=>r.onclick=()=>{const id=r.dataset.o;OP[id]=!OP[id];r.querySelector('.arw').classList.toggle('on',OP[id]);r.nextElementSibling.classList.toggle('on',OP[id])});
 document.querySelectorAll('.su').forEach(s=>s.onclick=()=>{H=[];go('ent',s.dataset.u,null,false)});
 (PG[S.page]||home)();if(S.page!=='home'){$('#m').insertAdjacentHTML('afterbegin',`<div class="bar"><button class="back" id="bk">\u2192 رجوع</button><span class="crumb">الرئيسية${S.ent?' \u203a '+eOf(S.ent).name:''}</span></div>`);$('#bk').onclick=back}
 $('#q').oninput=x=>{const q=x.target.value.trim().toLowerCase(),r=$('#res');if(!q){r.classList.remove('on');return}
  const a=scope().filter(z=>z.code.toLowerCase().includes(q)||z.name.includes(q)).slice(0,6).map(z=>`<div class="ri" data-e="${z.code}"><span>${z.name}</span><small>${z.code}</small></div>`),
  b=KPIS.filter(k=>inSc(k.e)&&(k.code.toLowerCase().includes(q)||(k.real&&k.name.includes(q)))).slice(0,6).map(k=>`<div class="ri" data-k="${k.code}"><span>${k.name}</span><small>${k.code}</small></div>`);
  r.innerHTML=[...a,...b].join('')||'<div class="ri">لا نتائج</div>';r.classList.add('on');
  r.querySelectorAll('[data-e]').forEach(z=>z.onclick=()=>{if(U.role==='staff')go('home');else go('ent',z.dataset.e);r.classList.remove('on')});r.querySelectorAll('[data-k]').forEach(z=>z.onclick=()=>{kModal(z.dataset.k);r.classList.remove('on')})}}
