(function () {
  "use strict";

  const scenes = {
    1: `
      <rect x="22" y="14" width="86" height="76" rx="12" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <path d="M93 14h4c5 0 9 4 9 9v6z" fill="#d7f0c8"/>
      <rect x="34" y="28" width="39" height="7" rx="3.5" fill="#306a40"/>
      <rect x="34" y="43" width="56" height="4" rx="2" fill="#dcebd8"/>
      <rect x="34" y="52" width="45" height="4" rx="2" fill="#dcebd8"/>
      <path d="M34 63h57" stroke="#dcebd8" stroke-width="2" stroke-dasharray="3 4"/>
      <rect x="34" y="70" width="34" height="10" rx="4" fill="#58cc02"/>
      <rect x="72" y="70" width="18" height="10" rx="4" fill="#ddf3cb"/>
      <rect x="111" y="43" width="41" height="39" rx="9" fill="#fff" stroke="#58cc02" stroke-width="2"/>
      <rect x="119" y="51" width="25" height="9" rx="3" fill="#eaf8df"/>
      <circle cx="121" cy="69" r="3" fill="#b7e98c"/>
      <circle cx="132" cy="69" r="3" fill="#b7e98c"/>
      <circle cx="143" cy="69" r="3" fill="#b7e98c"/>
      <rect x="119" y="75" width="8" height="4" rx="2" fill="#58cc02"/>
      <path d="M122 31c4-7 11-10 18-10-1 7-6 12-15 13z" fill="#58cc02"/>
    `,
    2: `
      <rect x="20" y="14" width="105" height="77" rx="13" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <path d="M33 27v51h78" fill="none" stroke="#d6e7cf" stroke-width="2" stroke-linecap="round"/>
      <path d="M35 48h68" stroke="#f1c84a" stroke-width="2" stroke-dasharray="4 4"/>
      <rect x="38" y="61" width="13" height="17" rx="4" fill="#b7e98c"/>
      <rect x="58" y="49" width="13" height="29" rx="4" fill="#86db4e"/>
      <rect x="78" y="39" width="13" height="39" rx="4" fill="#58cc02"/>
      <rect x="98" y="29" width="13" height="49" rx="4" fill="#2e9e34"/>
      <circle cx="137" cy="65" r="18" fill="#eaf8df" stroke="#58cc02" stroke-width="3"/>
      <path d="M137 65V47a18 18 0 0 1 14 29z" fill="#58cc02"/>
      <circle cx="137" cy="65" r="2.5" fill="#fff"/>
    `,
    3: `
      <rect x="18" y="15" width="87" height="32" rx="12" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <circle cx="35" cy="31" r="9" fill="#58cc02"/>
      <circle cx="35" cy="31" r="3" fill="#fff"/>
      <rect x="51" y="25" width="38" height="5" rx="2.5" fill="#477259"/>
      <rect x="51" y="35" width="25" height="4" rx="2" fill="#d9ead4"/>
      <path d="M62 47v13h44v12" fill="none" stroke="#8dbd70" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="82" y="71" width="65" height="27" rx="11" fill="#fff6d6" stroke="#efd06a" stroke-width="2"/>
      <circle cx="98" cy="84" r="8" fill="#ffc800"/>
      <circle cx="98" cy="84" r="3" fill="#fff6d6"/>
      <rect x="112" y="79" width="24" height="4" rx="2" fill="#9b803c"/>
      <rect x="112" y="87" width="16" height="3" rx="1.5" fill="#d9c891"/>
    `,
    4: `
      <path d="M31 18h106l-34 37v22l-29 13V55z" fill="#fff" stroke="#bcdcaa" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M48 30h72M57 41h53" stroke="#d8ecd0" stroke-width="3" stroke-linecap="round"/>
      <circle cx="51" cy="12" r="5" fill="#58cc02"/>
      <circle cx="75" cy="9" r="4" fill="#86db4e"/>
      <circle cx="99" cy="12" r="6" fill="#ffc800"/>
      <circle cx="123" cy="9" r="4" fill="#1cb0f6"/>
      <rect x="104" y="67" width="40" height="25" rx="7" fill="#eaf8df" stroke="#58cc02" stroke-width="2"/>
      <rect x="111" y="73" width="26" height="4" rx="2" fill="#58cc02"/>
      <rect x="111" y="81" width="17" height="4" rx="2" fill="#b7e98c"/>
    `,
    5: `
      <rect x="17" y="22" width="134" height="25" rx="12" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <rect x="29" y="31" width="13" height="8" rx="3" fill="#58cc02"/>
      <rect x="48" y="31" width="13" height="8" rx="3" fill="#b7e98c"/>
      <rect x="67" y="31" width="13" height="8" rx="3" fill="#1cb0f6"/>
      <rect x="86" y="31" width="13" height="8" rx="3" fill="#ffc800"/>
      <rect x="105" y="31" width="13" height="8" rx="3" fill="#86db4e"/>
      <rect x="124" y="31" width="13" height="8" rx="3" fill="#d8ecd0"/>
      <path d="M84 48v10M45 58H21M84 58H45M84 58h39M123 58h24" fill="none" stroke="#8dbd70" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"/>
      <rect x="22" y="63" width="42" height="24" rx="8" fill="#58cc02"/>
      <rect x="63" y="63" width="42" height="24" rx="8" fill="#e8f8db" stroke="#b7dda2" stroke-width="2"/>
      <rect x="104" y="63" width="42" height="24" rx="8" fill="#fff2bd" stroke="#efd06a" stroke-width="2"/>
      <text x="43" y="80" text-anchor="middle" fill="#fff" font-size="13" font-weight="800" font-family="Consolas, monospace">A</text>
      <text x="84" y="80" text-anchor="middle" fill="#2e6b3d" font-size="13" font-weight="800" font-family="Consolas, monospace">26</text>
      <text x="125" y="80" text-anchor="middle" fill="#805d00" font-size="13" font-weight="800" font-family="Consolas, monospace">07</text>
    `,
    6: `
      <rect x="17" y="24" width="57" height="61" rx="10" fill="#d7efc8" stroke="#aed394" stroke-width="2" transform="rotate(-6 45 54)"/>
      <rect x="30" y="15" width="61" height="68" rx="11" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <rect x="39" y="28" width="35" height="5" rx="2.5" fill="#477259"/>
      <rect x="39" y="40" width="42" height="4" rx="2" fill="#dcebd8"/>
      <rect x="36" y="50" width="48" height="12" rx="4" fill="#eaf8df"/>
      <rect x="39" y="58" width="42" height="4" rx="2" fill="#b7e98c"/>
      <rect x="39" y="68" width="30" height="4" rx="2" fill="#dcebd8"/>
      <path d="M94 50h10" stroke="#8dbd70" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"/>
      <rect x="103" y="34" width="51" height="47" rx="9" fill="#fff" stroke="#58cc02" stroke-width="2"/>
      <path d="M103 43c0-5 4-9 9-9h33c5 0 9 4 9 9z" fill="#58cc02"/>
      <rect x="110" y="51" width="34" height="9" rx="3" fill="#eaf8df"/>
      <rect x="110" y="65" width="28" height="4" rx="2" fill="#dcebd8"/>
      <rect x="110" y="73" width="20" height="4" rx="2" fill="#dcebd8"/>
      <circle cx="100" cy="30" r="5" fill="#ffc800"/>
    `,
    7: `
      <rect x="24" y="18" width="99" height="73" rx="14" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <path d="M24 32c0-8 6-14 14-14h71c8 0 14 6 14 14v7H24z" fill="#58cc02"/>
      <path d="M43 12v12M70 12v12M97 12v12" stroke="#2e6b3d" stroke-width="3" stroke-linecap="round"/>
      <g fill="#d9ead4">
        <circle cx="38" cy="51" r="4"/><circle cx="54" cy="51" r="4"/><circle cx="70" cy="51" r="4"/><circle cx="86" cy="51" r="4"/><circle cx="102" cy="51" r="4"/>
        <circle cx="38" cy="66" r="4"/><circle cx="54" cy="66" r="4"/><circle cx="70" cy="66" r="4"/><circle cx="86" cy="66" r="4"/>
        <circle cx="38" cy="81" r="4"/><circle cx="54" cy="81" r="4"/><circle cx="70" cy="81" r="4"/>
      </g>
      <rect x="96" y="59" width="19" height="15" rx="5" fill="#ffc800"/>
      <circle cx="135" cy="72" r="18" fill="#f8fff3" stroke="#58cc02" stroke-width="4"/>
      <path d="M135 61v11l7 5" fill="none" stroke="#2e9e34" stroke-width="3" stroke-linecap="round"/>
    `,
    8: `
      <circle cx="135" cy="23" r="17" fill="#fff" stroke="#58cc02" stroke-width="3"/>
      <circle cx="131" cy="18" r="3" fill="none" stroke="#2e9e34" stroke-width="2.4"/>
      <circle cx="140" cy="27" r="3" fill="none" stroke="#2e9e34" stroke-width="2.4"/>
      <path d="M142 15l-13 17" stroke="#2e9e34" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M20 41h76v48H20z" fill="#fff" stroke="#9fc88a" stroke-width="2" stroke-linejoin="round"/>
      <path d="M17 41l6-16h70l6 16z" fill="#58cc02" stroke="#2e6b3d" stroke-width="2" stroke-linejoin="round"/>
      <path d="M31 25l-5 16M48 25l-2 16M65 25l2 16M82 25l5 16" stroke="#b7e98c" stroke-width="3"/>
      <rect x="32" y="53" width="19" height="18" rx="4" fill="#d9f2ff" stroke="#8ecfe8" stroke-width="2"/>
      <rect x="61" y="53" width="23" height="36" rx="4" fill="#eaf8df" stroke="#aed394" stroke-width="2"/>
      <circle cx="77" cy="72" r="2" fill="#477259"/>
      <g stroke="#9d7400" stroke-width="2">
        <circle cx="112" cy="81" r="9" fill="#ffc800"/>
        <circle cx="127" cy="81" r="9" fill="#ffc800"/>
        <circle cx="119" cy="68" r="9" fill="#ffda58"/>
      </g>
    `,
    9: `
      <rect x="30" y="66" width="32" height="24" rx="7" fill="#b7e98c" stroke="#93c777" stroke-width="2"/>
      <rect x="68" y="48" width="32" height="42" rx="7" fill="#58cc02" stroke="#2e9e34" stroke-width="2"/>
      <rect x="106" y="37" width="32" height="53" rx="7" fill="#ffc800" stroke="#d39d00" stroke-width="2"/>
      <path d="M46 76h0M84 58v0M122 47v0" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <path d="M84 34l4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1z" fill="#58cc02"/>
      <path d="M122 64h29M122 75h29M122 86h29" stroke="#b7d6a6" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="132" cy="64" r="4" fill="#ffc800"/>
      <circle cx="144" cy="75" r="4" fill="#58cc02"/>
      <circle cx="128" cy="86" r="4" fill="#1cb0f6"/>
    `,
    10: `
      <rect x="23" y="16" width="113" height="67" rx="12" fill="#fff" stroke="#cfe7c0" stroke-width="2"/>
      <path d="M37 67l22-15 17 7 20-11 20 5" fill="none" stroke="#58cc02" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="37" cy="67" r="4" fill="#2e9e34"/>
      <circle cx="59" cy="52" r="4" fill="#86db4e"/>
      <circle cx="76" cy="59" r="4" fill="#ffc800"/>
      <circle cx="96" cy="48" r="4" fill="#58cc02"/>
      <circle cx="116" cy="53" r="4" fill="#2e9e34"/>
      <path d="M79 83v11M79 94l-10 12M79 94l10 12" stroke="#7e9d6b" stroke-width="3" stroke-linecap="round"/>
      <rect x="139" y="66" width="19" height="24" rx="5" fill="#fff" stroke="#9fc88a" stroke-width="2"/>
      <path d="M158 71h4v8h-4M139 71h-4v8h4" fill="none" stroke="#9fc88a" stroke-width="2"/>
      <path d="M145 63c0-5 7-6 7-1" fill="none" stroke="#8dbd70" stroke-width="2" stroke-linecap="round"/>
    `,
    11: `
      <rect x="18" y="55" width="47" height="32" rx="6" fill="#ddf2cd" stroke="#86b76d" stroke-width="2"/>
      <rect x="65" y="29" width="53" height="36" rx="6" fill="#fff" stroke="#9fc88a" stroke-width="2"/>
      <rect x="112" y="54" width="39" height="33" rx="6" fill="#b7e98c" stroke="#86b76d" stroke-width="2"/>
      <path d="M35 55v32M83 29v36M129 54v33" stroke="#fff6c8" stroke-width="6" opacity=".8"/>
      <path d="M18 68h47M65 43h53M112 68h39" stroke="#7eae64" stroke-width="1.5" opacity=".55"/>
      <rect x="117" y="10" width="36" height="32" rx="7" fill="#fff" stroke="#58cc02" stroke-width="2"/>
      <path d="M125 19h20M125 26h13" stroke="#9fc88a" stroke-width="3" stroke-linecap="round"/>
      <path d="M125 33v5M129 33v5M134 33v7M139 33v5M144 33v7" stroke="#2e6b3d" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 26h20M30 33h13M30 40h17" stroke="#b7d6a6" stroke-width="3" stroke-linecap="round"/>
    `,
    12: `
      <path d="M21 20Q84 43 147 20" fill="none" stroke="#7eae64" stroke-width="2"/>
      <path d="M35 24l6 12 7-10z" fill="#58cc02"/>
      <path d="M65 30l6 12 7-9z" fill="#ffc800"/>
      <path d="M96 29l6 12 7-9z" fill="#1cb0f6"/>
      <path d="M125 23l6 12 7-10z" fill="#86db4e"/>
      <path d="M23 54l42-27 42 27z" fill="#58cc02" stroke="#2e6b3d" stroke-width="2" stroke-linejoin="round"/>
      <rect x="34" y="53" width="62" height="34" rx="3" fill="#fff" stroke="#9fc88a" stroke-width="2"/>
      <rect x="58" y="63" width="16" height="24" rx="3" fill="#eaf8df" stroke="#9fc88a" stroke-width="2"/>
      <rect x="114" y="53" width="37" height="34" rx="7" fill="#fff" stroke="#9fc88a" stroke-width="2"/>
      <path d="M123 63h18M123 70h18M123 77h11" stroke="#c7ddba" stroke-width="3" stroke-linecap="round"/>
      <circle cx="141" cy="49" r="10" fill="#ffc800" stroke="#d39d00" stroke-width="2"/>
      <circle cx="141" cy="49" r="4" fill="#d39d00"/>
      <circle cx="111" cy="30" r="3" fill="#ffc800"/>
      <circle cx="126" cy="15" r="2.5" fill="#58cc02"/>
    `,
  };

  function svg(number) {
    const chapterNumber = Math.min(12, Math.max(1, Number(number) || 1));
    const scene = scenes[chapterNumber] || scenes[1];
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
