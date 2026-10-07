/* ============================================================
 * التنقل بين الصفحات
 * go() للانتقال وback() للرجوع.
 * ============================================================ */

function go(p,ent,tab,push=true){if(push)H.push({...S});S={...S,page:p,ent:ent||null,tab:tab||'ov'};render();scrollTo(0,0)}

const back=()=>{if(H.length){S=H.pop();render()}else go('home',null,null,false)};
