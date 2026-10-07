/* ============================================================
 * النافذة المنبثقة
 * فتح النافذة mo() وإغلاقها cl() وربط أزرار الإغلاق.
 * ============================================================ */

function mo(t,h){document.querySelector('.mc').classList.remove('wide');$('#mt').textContent=t;$('#mb').innerHTML=h;$('#mo').classList.add('on')}

const cl=()=>$('#mo').classList.remove('on');

$('#mx').onclick=cl;$('#mo').onclick=e=>{if(e.target.id==='mo')cl()};document.addEventListener('click',e=>{const r=$('#res');if(r&&!e.target.closest('.sw'))r.classList.remove('on')});
