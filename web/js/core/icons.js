/* ============================================================
 * الأيقونات
 * مجموعة أيقونات SVG خطية ودوال عرضها داخل الشارات.
 * ============================================================ */

const IC={home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',queue:'M9 4h6v3H9zM7 5H5v16h14V5h-2M9 12h6M9 16h4',units:'M12 3v5M12 8v3M5 15v-4h14v4M3 15h4v5H3zM10 15h4v5h-4zM17 15h4v5h-4z',kpis:'M5 20V10M12 20V4M19 20v-7',periods:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',reports:'M12 3v9h9A9 9 0 1 1 12 3zM15 3.500A9 9 0 0 1 20.500 9H15z',regs:'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',cmt:'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.500 2.700-5.500 6-5.500s6 2 6 5.500M16 6a3 3 0 0 1 0 5.500M18 15c2 .6 3 2.200 3 5',bell:'M6 16v-5a6 6 0 0 1 12 0v5l1.500 2h-15zM10 20a2 2 0 0 0 4 0',check:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.500l3 3 5-6',clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',warn:'M12 3l10 18H2zM12 10v5M12 18v.01',bank:'M3 9l9-5 9 5M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18',target:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',doc:'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.500-6 8-6s8 2 8 6',link:'M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1'};

const ic=(n,s=18)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n]}"/></svg>`;

const TI={OFF:'user',DEP:'units',CTR:'bank',UNT:'cmt'},WFIC={published:'check',evidence_attached:'clock',agency_approved:'check',returned:'warn',none:'doc'},RSIC={achieved:'check',near:'clock',action:'warn'};

const bdi=(x,c,i)=>`<span class="b ${c}">${ic(i,13)}${x}</span>`;
