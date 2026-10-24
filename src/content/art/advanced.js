(function () {
  "use strict";

  const base = window.ChapterArt;
  if (!base) return;

  const scenes = {
    13: `
      <rect x="24" y="24" width="78" height="55" rx="8" fill="#d7efc8" stroke="#aed394" stroke-width="2" transform="rotate(-5 63 52)"/>
      <rect x="48" y="16" width="91" height="67" rx="10" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <path d="M48 29c0-7 6-13 13-13h65c7 0 13 6 13 13v8H48z" fill="#58cc02"/>
      <rect x="59" y="18" width="18" height="4" rx="2" fill="#eaf8df"/>
      <g stroke="#dcebd8" stroke-width="2">
        <path d="M58 44h71M58 55h71M58 66h71M58 77h71"/>
        <path d="M83 37v44M108 37v44"/>
      </g>
      <rect x="25" y="86" width="92" height="14" rx="5" fill="#eaf8df" stroke="#b7dda2" stroke-width="1.5"/>
      <rect x="30" y="89" width="25" height="8" rx="3" fill="#58cc02"/>
      <rect x="58" y="89" width="25" height="8" rx="3" fill="#b7e98c"/>
      <rect x="86" y="89" width="25" height="8" rx="3" fill="#fff" stroke="#b7dda2"/>
      <circle cx="140" cy="45" r="6" fill="#ffc800"/>
      <path d="M137 45l2 2 4-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    14: `
      <rect x="30" y="12" width="104" height="86" rx="7" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <rect x="42" y="24" width="80" height="9" rx="3" fill="#58cc02"/>
      <rect x="42" y="41" width="80" height="44" fill="#fbfdf9" stroke="#dcebd8" stroke-width="1.5" stroke-dasharray="3 3"/>
      <path d="M42 53h80M42 65h80M62 41v44M88 41v44" stroke="#e6f0df" stroke-width="1.5"/>
      <path d="M42 27v49" stroke="#58cc02" stroke-width="1.2" stroke-dasharray="2 2"/>
      <path d="M118 27v49" stroke="#58cc02" stroke-width="1.2" stroke-dasharray="2 2"/>
      <path d="M37 24v44" stroke="#ffc800" stroke-width="1.2" stroke-dasharray="2 2"/>
      <path d="M127 24v44" stroke="#ffc800" stroke-width="1.2" stroke-dasharray="2 2"/>
      <rect x="124" y="14" width="34" height="25" rx="6" fill="#eaf8df" stroke="#b7dda2" stroke-width="1.5"/>
      <path d="M132 22h18M132 28h18" stroke="#86b76d" stroke-width="2" stroke-linecap="round"/>
      <path d="M136 35l-3 6h12l-3-6" fill="#b7e98c" stroke="#78a962" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="132" cy="75" r="3" fill="#ffc800"/>
      <path d="M132 73v4M130 75h4" stroke="#fff" stroke-width="1" stroke-linecap="round"/>
    `,
    15: `
      <rect x="22" y="18" width="76" height="70" rx="10" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <g fill="#dcebd8">
        <rect x="33" y="31" width="22" height="12" rx="3"/>
        <rect x="61" y="31" width="22" height="12" rx="3"/>
        <rect x="33" y="49" width="22" height="12" rx="3"/>
        <rect x="61" y="49" width="22" height="12" rx="3"/>
      </g>
      <rect x="61" y="49" width="22" height="12" rx="3" fill="#b7e98c"/>
      <rect x="40" y="37" width="22" height="12" rx="3" fill="#ffc800" opacity=".85"/>
      <rect x="104" y="19" width="45" height="28" rx="7" fill="#eaf8df" stroke="#58cc02" stroke-width="2"/>
      <path d="M112 29h28M112 36h18" stroke="#86b76d" stroke-width="2" stroke-linecap="round"/>
      <rect x="105" y="54" width="43" height="35" rx="7" fill="#fff" stroke="#b7dda2" stroke-width="2"/>
      <path d="M113 64l7 7-7 7" fill="none" stroke="#58cc02" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M126 64h14M126 71h14M126 78h9" stroke="#c7ddba" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="137" cy="45" r="4" fill="#58cc02"/>
    `,
    16: `
      <rect x="18" y="25" width="112" height="61" rx="9" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <rect x="18" y="25" width="112" height="15" rx="8" fill="#58cc02"/>
      <path d="M44 25v61M70 25v61M96 25v61" stroke="#dcebd8" stroke-width="1.5"/>
      <path d="M18 40h112M18 54h112M18 68h112" stroke="#dcebd8" stroke-width="1.5"/>
      <path d="M61 32h13l-5 6v5l-3 2v-7z" fill="#fff" stroke="#2e6b3d" stroke-width="1.2"/>
      <path d="M39 49h22M39 62h15M39 76h18M65 49h22M65 62h18M91 49h22M91 62h14M91 76h21" stroke="#9fc88a" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="137" y="20" width="14" height="36" rx="5" fill="#eaf8df" stroke="#b7dda2" stroke-width="1.5"/>
      <path d="M144 25v20M140 41l4 5 4-5" fill="none" stroke="#58cc02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="144" cy="71" r="15" fill="#fff6d6" stroke="#efd06a" stroke-width="2"/>
      <path d="M138 70h12M144 64v12" stroke="#d39d00" stroke-width="2" stroke-linecap="round"/>
      <path d="M35 88h78" stroke="#b7dda2" stroke-width="3" stroke-linecap="round"/>
    `,
    17: `
      <rect x="18" y="14" width="103" height="78" rx="11" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <path d="M32 73V28M32 73h76" fill="none" stroke="#c7ddba" stroke-width="2" stroke-linecap="round"/>
      <rect x="42" y="56" width="13" height="17" rx="3" fill="#b7e98c"/>
      <rect x="62" y="44" width="13" height="29" rx="3" fill="#86db4e"/>
      <rect x="82" y="34" width="13" height="39" rx="3" fill="#58cc02"/>
      <path d="M38 55l18-12 19 7 19-19 12 6" fill="none" stroke="#ffc800" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="56" cy="43" r="3" fill="#ffc800"/>
      <circle cx="75" cy="50" r="3" fill="#ffc800"/>
      <circle cx="94" cy="31" r="3" fill="#ffc800"/>
      <rect x="126" y="28" width="29" height="53" rx="6" fill="#eaf8df" stroke="#9fc88a" stroke-width="1.5"/>
      <circle cx="140" cy="45" r="13" fill="#fff" stroke="#58cc02" stroke-width="2"/>
      <path d="M140 45V32a13 13 0 0 1 8 23z" fill="#58cc02"/>
      <path d="M132 65h16M132 71h10" stroke="#9fc88a" stroke-width="2" stroke-linecap="round"/>
    `,
    18: `
      <rect x="16" y="19" width="89" height="67" rx="9" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <rect x="16" y="19" width="89" height="14" rx="7" fill="#58cc02"/>
      <path d="M43 19v67M70 19v67M16 46h89M16 60h89M16 74h89" stroke="#dcebd8" stroke-width="1.5"/>
      <rect x="22" y="27" width="15" height="5" rx="2" fill="#eaf8df"/>
      <rect x="49" y="27" width="15" height="5" rx="2" fill="#eaf8df"/>
      <rect x="76" y="27" width="15" height="5" rx="2" fill="#eaf8df"/>
      <rect x="22" y="51" width="15" height="5" rx="2" fill="#b7e98c"/>
      <rect x="49" y="51" width="15" height="5" rx="2" fill="#b7e98c"/>
      <rect x="76" y="51" width="15" height="5" rx="2" fill="#b7e98c"/>
      <rect x="22" y="65" width="15" height="5" rx="2" fill="#ffc800"/>
      <rect x="49" y="65" width="15" height="5" rx="2" fill="#ffc800"/>
      <rect x="112" y="17" width="38" height="17" rx="5" fill="#eaf8df" stroke="#b7dda2" stroke-width="1.5"/>
      <rect x="112" y="39" width="38" height="17" rx="5" fill="#fff" stroke="#b7dda2" stroke-width="1.5"/>
      <rect x="112" y="61" width="38" height="17" rx="5" fill="#fff" stroke="#b7dda2" stroke-width="1.5"/>
      <path d="M119 25h17M119 47h23M119 69h18" stroke="#86b76d" stroke-width="2" stroke-linecap="round"/>
      <path d="M132 34v5M132 56v5" stroke="#58cc02" stroke-width="2" stroke-dasharray="2 2"/>
    `,
    19: `
      <rect x="20" y="17" width="99" height="73" rx="11" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <path d="M34 78V28M34 78h70" fill="none" stroke="#c7ddba" stroke-width="2" stroke-linecap="round"/>
      <circle cx="76" cy="52" r="24" fill="#f8fff3" stroke="#58cc02" stroke-width="3"/>
      <circle cx="76" cy="52" r="13" fill="#eaf8df" stroke="#86db4e" stroke-width="2"/>
      <circle cx="76" cy="52" r="4" fill="#58cc02"/>
      <path d="M76 18v13M76 73v13M42 52h13M97 52h13" stroke="#b7dda2" stroke-width="2" stroke-linecap="round"/>
      <rect x="126" y="27" width="28" height="55" rx="14" fill="#eaf8df" stroke="#9fc88a" stroke-width="1.5"/>
      <rect x="132" y="35" width="16" height="8" rx="4" fill="#58cc02"/>
      <path d="M140 31v50" stroke="#b7dda2" stroke-width="2" stroke-linecap="round"/>
      <path d="M132 80l8 7 8-7" fill="none" stroke="#58cc02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="129" cy="17" r="6" fill="#ffc800"/>
      <path d="M126 17l2 2 4-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    20: `
      <rect x="20" y="18" width="130" height="25" rx="8" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <rect x="21" y="18" width="31" height="25" rx="7" fill="#58cc02"/>
      <text x="36" y="35" text-anchor="middle" fill="#fff" font-size="12" font-weight="800" font-family="Consolas, monospace">fx</text>
      <rect x="59" y="26" width="39" height="7" rx="3.5" fill="#86db4e"/>
      <rect x="103" y="26" width="21" height="7" rx="3.5" fill="#b7e98c"/>
      <rect x="128" y="26" width="14" height="7" rx="3.5" fill="#ffc800"/>
      <g fill="#eaf8df" stroke="#b7dda2" stroke-width="1.5">
        <rect x="27" y="57" width="34" height="22" rx="6"/>
        <rect x="66" y="57" width="34" height="22" rx="6"/>
        <rect x="105" y="57" width="34" height="22" rx="6"/>
      </g>
      <path d="M35 65h18M35 71h12M74 65h18M74 71h10M113 65h18M113 71h14" stroke="#86b76d" stroke-width="2" stroke-linecap="round"/>
      <path d="M61 43v9M100 43v9M139 43v9" stroke="#9fc88a" stroke-width="2" stroke-dasharray="2 2"/>
      <path d="M49 94h72" stroke="#b7dda2" stroke-width="3" stroke-linecap="round"/>
      <circle cx="85" cy="94" r="4" fill="#58cc02"/>
      <circle cx="117" cy="94" r="4" fill="#ffc800"/>
    `,
    21: `
      <rect x="17" y="18" width="85" height="69" rx="9" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <rect x="17" y="18" width="85" height="13" rx="6" fill="#58cc02"/>
      <path d="M45 18v69M73 18v69M17 44h85M17 57h85M17 70h85" stroke="#dcebd8" stroke-width="1.5"/>
      <rect x="24" y="26" width="15" height="4" rx="2" fill="#eaf8df"/>
      <rect x="52" y="26" width="15" height="4" rx="2" fill="#eaf8df"/>
      <rect x="80" y="26" width="15" height="4" rx="2" fill="#eaf8df"/>
      <rect x="24" y="49" width="15" height="4" rx="2" fill="#b7e98c"/>
      <rect x="52" y="49" width="15" height="4" rx="2" fill="#b7e98c"/>
      <rect x="80" y="49" width="15" height="4" rx="2" fill="#b7e98c"/>
      <path d="M111 20c11 5 17 15 15 27-2 11-9 20-20 24-7 2-14 1-20-2" fill="none" stroke="#58cc02" stroke-width="3" stroke-linecap="round"/>
      <path d="M109 26l6-6 7 7" fill="none" stroke="#58cc02" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <g fill="#eaf8df" stroke="#b7dda2" stroke-width="1.2">
        <rect x="106" y="38" width="18" height="11" rx="3"/>
        <rect x="126" y="38" width="18" height="11" rx="3"/>
        <rect x="106" y="52" width="18" height="11" rx="3"/>
        <rect x="126" y="52" width="18" height="11" rx="3"/>
      </g>
      <path d="M111 43h8M111 57h8M131 43h8M131 57h8" stroke="#86b76d" stroke-width="2" stroke-linecap="round"/>
      <path d="M34 88h50" stroke="#b7dda2" stroke-width="3" stroke-linecap="round"/>
    `,
    22: `
      <rect x="20" y="20" width="124" height="63" rx="11" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <rect x="31" y="31" width="54" height="31" rx="4" fill="#eaf8df" stroke="#9fc88a" stroke-width="1.5"/>
      <path d="M31 41h54M48 31v31M66 31v31" stroke="#b7dda2" stroke-width="1.2"/>
      <path d="M40 50l8-7 7 4 11-8" fill="none" stroke="#58cc02" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="96" y="31" width="37" height="12" rx="4" fill="#ffc800"/>
      <rect x="96" y="48" width="37" height="12" rx="4" fill="#b7e98c"/>
      <path d="M104 37h20M104 54h14" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 91h98" stroke="#9fc88a" stroke-width="4" stroke-linecap="round"/>
      <path d="M42 91v-6M84 91v-11M128 91v-6" stroke="#9fc88a" stroke-width="3" stroke-linecap="round"/>
      <circle cx="137" cy="17" r="7" fill="#eaf8df" stroke="#58cc02" stroke-width="2"/>
      <path d="M134 17l2 2 4-5" fill="none" stroke="#2e9e34" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `,
  };

  function svg(number) {
    const chapterNumber = Math.max(1, Number(number) || 1);
    if (chapterNumber <= 12) return base.svg(chapterNumber);
    const scene = scenes[chapterNumber] || scenes[13];
    return `
      <svg class="chapter-art-svg" viewBox="0 0 168 112" aria-hidden="true" focusable="false">
        <rect x="1" y="1" width="166" height="110" rx="24" fill="#eaf8df" stroke="#d8ebcb" stroke-width="2"/>
        <circle cx="145" cy="18" r="21" fill="#d7f1c6" opacity=".72"/>
        <path d="M2 91c18-8 33-6 48 0s32 9 49 1 27-7 36-4 20 7 32 4v19H2z" fill="#b7e98c"/>
        ${scene}
      </svg>
    `;
  }

  window.ChapterArt = { svg };
})();
