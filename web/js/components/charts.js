/* ============================================================
 * الرسوم البيانية
 * الدائرة المئوية svgGauge وتوزيع حالات المؤشرات.
 * ============================================================ */

function dist(ks){const c={published:0,evidence_attached:0,agency_approved:0,returned:0,none:0};ks.forEach(k=>{const m=meas(k);c[m?m.st:'none']++});const col={published:'#049CA0',evidence_attached:'#C9A227',agency_approved:'#78C9C9',returned:'#B42318',none:'#E8F0F0'};const n=ks.length||1;
 return`<div class="dist">${Object.keys(c).map(s=>`<div style="width:${c[s]/n*100}%;background:${col[s]}" title="${WFT[s]}"></div>`).join('')}</div><div class="lg">${Object.keys(c).map(s=>`<span><i style="background:${col[s]}"></i>${WFT[s]} (${c[s]})</span>`).join('')}</div>`}

function svgGauge(pct,color,size=70){const p=Math.max(0,Math.min(100,pct)),r=size/2-6,c=2*Math.PI*r,off=c*(1-p/100);
 return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${size/2} ${size/2})"/><text x="50%" y="53%" text-anchor="middle" font-size="${size*.24}" font-weight="700" fill="var(--navy)" font-family="Tajawal">${p}%</text></svg>`}
