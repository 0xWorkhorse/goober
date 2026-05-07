(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function s(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(r){if(r.ep)return;r.ep=!0;const n=s(r);fetch(r.href,n)}})();const P=Object.freeze({body:["blob","lump","stack"],eyes:["googly","beady","cyclops"],mouth:["fangs","underbite","grin"],horns:["nubs","curly","antennae"],arms:["stubs","noodle","crab"],feet:["paws","tentacles","wheels"]}),R=Object.freeze(Object.keys(P)),u=Object.freeze([{primary:"#ff6b9d",accent:"#ffd166",outline:"#3a1c4a"},{primary:"#7ec4cf",accent:"#f6c453",outline:"#1d3557"},{primary:"#a3d977",accent:"#f25c54",outline:"#264653"},{primary:"#c490e4",accent:"#9bf6ff",outline:"#3d2c5e"},{primary:"#ffa07a",accent:"#3ddc97",outline:"#3b1c32"},{primary:"#74c0fc",accent:"#ff8cc6",outline:"#1b3a4b"},{primary:"#ffd166",accent:"#06d6a0",outline:"#3d2914"},{primary:"#ef476f",accent:"#ffd166",outline:"#2b1d2e"},{primary:"#8ac926",accent:"#1982c4",outline:"#1a2d12"},{primary:"#b8b8ff",accent:"#ffafcc",outline:"#2e1a47"},{primary:"#fb6f92",accent:"#ffe5ec",outline:"#3d1a2c"},{primary:"#9381ff",accent:"#fbff12",outline:"#1d1a3a"}]),I=Object.freeze({hp:{base:3e3,perPoint:200,label:"health"},attack:{base:25,perPoint:3,label:"attack power"},defense:{base:0,perPoint:2,label:"defense"},speed:{base:100,perPoint:5,label:"speed"},crit:{base:5,perPoint:2,label:"crit chance"},abilityPower:{base:100,perPoint:8,label:"ability power"}});Object.freeze(Object.keys(I));const T=Object.freeze({damage:[{id:"slam",cooldownMs:6e3,damage:80,targets:1,vfx:"impact_amber"},{id:"cleave",cooldownMs:7e3,damage:60,targets:3,vfx:"arc_red"},{id:"pierce",cooldownMs:5e3,damage:100,targets:1,vfx:"spear_purple"},{id:"stomp",cooldownMs:8e3,damage:50,targets:5,vfx:"shockwave_brown"}],aoe:[{id:"inferno",cooldownMs:9e3,damage:70,targets:"all",vfx:"fire_red"},{id:"frost_nova",cooldownMs:1e4,damage:50,targets:"all",effect:{kind:"slow",durationMs:2e3},vfx:"ice_blue"},{id:"lightning",cooldownMs:8e3,damage:60,targets:"all",vfx:"bolt_yellow"},{id:"poison_cloud",cooldownMs:11e3,damage:30,targets:"all",effect:{kind:"dot",durationMs:5e3,tickDamage:8},vfx:"cloud_green"}],utility:[{id:"roar",cooldownMs:1e4,damage:0,targets:"self",effect:{kind:"attack_buff",durationMs:5e3,amount:.5},vfx:"roar_purple"},{id:"heal",cooldownMs:12e3,damage:0,targets:"self",effect:{kind:"heal_pct",amount:.3},vfx:"heal_green"},{id:"enrage",cooldownMs:15e3,damage:0,targets:"self",effect:{kind:"speed_buff",durationMs:8e3,amount:.5},vfx:"rage_red"},{id:"shield",cooldownMs:14e3,damage:0,targets:"self",effect:{kind:"shield",amount:300},vfx:"shield_blue"}]}),S=Object.freeze(Object.values(T).flat().reduce((e,t)=>(e[t.id]=t,e),{})),z=60,B=200,F=10,Z=25,U=3e3,K=Object.freeze(["en","es","pt","ja","ko"]),G="en",v="0 0 220 280",l="#1a1614",A="#3a342f",$="#fdfaf3",o=`fill="none" stroke="${l}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`,d=`fill="none" stroke="${A}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`,c=`fill="${$}" stroke="${l}" stroke-width="3.4" stroke-linejoin="round"`;function j(){return`<defs>
    <filter id="brm-wobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
      <feDisplacementMap in="SourceGraphic" scale="1.6" />
    </filter>
    <filter id="brm-wobble-thin" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" />
      <feDisplacementMap in="SourceGraphic" scale="1.2" />
    </filter>
  </defs>`}const L={blob:{anchors:{eyes:[110,130],mouth:[110,175],horns:[110,70],arms:[[60,150],[160,150]],feet:[110,240]},render:e=>`
      <path d="M 60 90 C 40 70, 90 50, 110 80 C 130 50, 180 70, 170 110 C 195 150, 170 220, 110 215 C 60 220, 25 165, 60 90 Z" ${c} />
      <ellipse cx="86" cy="135" rx="14" ry="9" fill="${e.accent}" opacity="0.32" />
    `},lump:{anchors:{eyes:[110,120],mouth:[110,165],horns:[110,60],arms:[[58,160],[162,160]],feet:[110,240]},render:e=>`
      <path d="M 110 60 C 70 60, 50 130, 60 195 C 65 230, 155 230, 160 195 C 170 130, 150 60, 110 60 Z" ${c} />
      <path d="M 88 142 q 8 -4 18 0" ${d} />
      <ellipse cx="84" cy="155" rx="11" ry="7" fill="${e.accent}" opacity="0.32" />
    `},stack:{anchors:{eyes:[110,105],mouth:[110,135],horns:[110,50],arms:[[60,200],[160,200]],feet:[110,245]},render:e=>`
      <rect x="56" y="70" width="108" height="80" rx="14" ${c} />
      <rect x="46" y="160" width="128" height="80" rx="14" ${c} />
      <line x1="56" y1="150" x2="164" y2="150" ${d} />
      <ellipse cx="78" cy="195" rx="12" ry="7" fill="${e.accent}" opacity="0.32" />
    `}},b={googly:(e,t)=>`
    <g class="brm-eyes">
      <circle cx="${e-14}" cy="${t}" r="8" ${o} />
      <circle cx="${e+14}" cy="${t}" r="8" ${o} />
      <circle cx="${e-13}" cy="${t+1}" r="2.6" fill="${l}" />
      <circle cx="${e+15}" cy="${t+1}" r="2.6" fill="${l}" />
      <path d="M ${e-22} ${t-12} q 12 6 22 0" ${o} />
      <path d="M ${e+8} ${t-12} q 12 6 22 0" ${o} />
    </g>
  `,beady:(e,t)=>`
    <g class="brm-eyes">
      <circle cx="${e-12}" cy="${t}" r="3.2" fill="${l}" />
      <circle cx="${e+12}" cy="${t}" r="3.2" fill="${l}" />
      <path d="M ${e-22} ${t-12} q 12 -4 22 0" ${o} />
      <path d="M ${e+8} ${t-12} q -12 -4 22 0" ${o} />
    </g>
  `,cyclops:(e,t)=>`
    <g class="brm-eyes">
      <circle cx="${e}" cy="${t}" r="14" ${o} />
      <circle cx="${e+2}" cy="${t+1}" r="4" fill="${l}" />
      <circle cx="${e+4}" cy="${t-2}" r="1.5" fill="${$}" />
      <path d="M ${e-18} ${t-18} q 18 -4 36 0" ${o} />
    </g>
  `},m={fangs:(e,t)=>`
    <g class="brm-mouth">
      <path d="M ${e-22} ${t} q 22 14 44 0 q -22 16 -44 0 z" fill="${l}" stroke="${l}" stroke-width="2.4" stroke-linejoin="round" />
      <path d="M ${e-8} ${t+2} l 2 8 l 4 -8 z" fill="${$}" stroke="${l}" stroke-width="1.6" />
      <path d="M ${e+4} ${t+2} l 2 8 l 4 -8 z" fill="${$}" stroke="${l}" stroke-width="1.6" />
    </g>
  `,underbite:(e,t)=>`
    <g class="brm-mouth">
      <path d="M ${e-22} ${t} q 22 4 44 0" ${o} />
      <rect x="${e-9}" y="${t+1}" width="6" height="9" rx="1" fill="${$}" stroke="${l}" stroke-width="2" />
      <rect x="${e+3}" y="${t+1}" width="6" height="9" rx="1" fill="${$}" stroke="${l}" stroke-width="2" />
    </g>
  `,grin:(e,t)=>`
    <g class="brm-mouth">
      <path d="M ${e-24} ${t-2} q 24 22 48 -2" ${o} />
      <path d="M ${e-16} ${t+6} q 16 6 32 0" ${d} />
    </g>
  `},p={nubs:(e,t)=>`
    <g class="brm-horns">
      <path d="M ${e-18} ${t+6} q -3 -16 9 -18 q 8 0 8 14" ${o} />
      <path d="M ${e+18} ${t+6} q 3 -16 -9 -18 q -8 0 -8 14" ${o} />
    </g>
  `,curly:(e,t)=>`
    <g class="brm-horns">
      <path d="M ${e-14} ${t+6} Q ${e-28} ${t-8}, ${e-22} ${t-22} Q ${e-12} ${t-28}, ${e-12} ${t-14}" ${o} />
      <path d="M ${e+14} ${t+6} Q ${e+28} ${t-8}, ${e+22} ${t-22} Q ${e+12} ${t-28}, ${e+12} ${t-14}" ${o} />
    </g>
  `,antennae:(e,t,s)=>`
    <g class="brm-horns">
      <path d="M ${e-10} ${t+4} q -8 -16 -16 -32" ${o} />
      <path d="M ${e+10} ${t+4} q 8 -16 16 -32" ${o} />
      <circle cx="${e-26}" cy="${t-28}" r="5" fill="${s.accent}" stroke="${l}" stroke-width="2.4" />
      <circle cx="${e+26}" cy="${t-28}" r="5" fill="${s.accent}" stroke="${l}" stroke-width="2.4" />
    </g>
  `},g={stubs:e=>{const[[t,s],[a,r]]=e;return`
      <g class="brm-arms">
        <line x1="${t}" y1="${s}" x2="${t-22}" y2="${s+18}" ${o} />
        <line x1="${a}" y1="${r}" x2="${a+22}" y2="${r+18}" ${o} />
        <circle cx="${t-22}" cy="${s+18}" r="4" fill="${$}" stroke="${l}" stroke-width="2.4" />
        <circle cx="${a+22}" cy="${r+18}" r="4" fill="${$}" stroke="${l}" stroke-width="2.4" />
      </g>
    `},noodle:e=>{const[[t,s],[a,r]]=e;return`
      <g class="brm-arms">
        <path d="M ${t} ${s} q -22 14 -10 32 q 14 10 -4 26" ${o} />
        <path d="M ${a} ${r} q 22 14 10 32 q -14 10 4 26" ${o} />
        <circle cx="${t-14}" cy="${s+58}" r="4" fill="${$}" stroke="${l}" stroke-width="2.4" />
        <circle cx="${a+14}" cy="${r+58}" r="4" fill="${$}" stroke="${l}" stroke-width="2.4" />
      </g>
    `},crab:e=>{const[[t,s],[a,r]]=e;return`
      <g class="brm-arms">
        <line x1="${t}" y1="${s}" x2="${t-14}" y2="${s+16}" ${o} />
        <path d="M ${t-12} ${s+14} L ${t-26} ${s+10} L ${t-22} ${s+22} L ${t-28} ${s+22} L ${t-22} ${s+30} L ${t-12} ${s+26} Z" ${c} />
        <line x1="${a}" y1="${r}" x2="${a+14}" y2="${r+16}" ${o} />
        <path d="M ${a+12} ${r+14} L ${a+26} ${r+10} L ${a+22} ${r+22} L ${a+28} ${r+22} L ${a+22} ${r+30} L ${a+12} ${r+26} Z" ${c} />
      </g>
    `}},y={paws:(e,t)=>`
    <g class="brm-feet">
      <line x1="${e-18}" y1="${t-30}" x2="${e-18}" y2="${t-4}" ${o} />
      <line x1="${e+18}" y1="${t-30}" x2="${e+18}" y2="${t-4}" ${o} />
      <ellipse cx="${e-18}" cy="${t}" rx="13" ry="5" ${c} />
      <ellipse cx="${e+18}" cy="${t}" rx="13" ry="5" ${c} />
    </g>
  `,tentacles:(e,t)=>`
    <g class="brm-feet">
      <path d="M ${e-26} ${t-30} q -6 18 0 32 q 6 6 14 4" ${o} />
      <path d="M ${e} ${t-30} q -6 22 4 36" ${o} />
      <path d="M ${e+26} ${t-30} q 6 18 0 32 q -6 6 -14 4" ${o} />
    </g>
  `,wheels:(e,t)=>`
    <g class="brm-feet">
      <circle cx="${e-22}" cy="${t-4}" r="12" ${c} />
      <circle cx="${e+22}" cy="${t-4}" r="12" ${c} />
      <line x1="${e-32}" y1="${t-4}" x2="${e-12}" y2="${t-4}" ${d} />
      <line x1="${e-22}" y1="${t-14}" x2="${e-22}" y2="${t+6}" ${d} />
      <line x1="${e+12}" y1="${t-4}" x2="${e+32}" y2="${t-4}" ${d} />
      <line x1="${e+22}" y1="${t-14}" x2="${e+22}" y2="${t+6}" ${d} />
      <circle cx="${e-22}" cy="${t-4}" r="2.4" fill="${l}" />
      <circle cx="${e+22}" cy="${t-4}" r="2.4" fill="${l}" />
    </g>
  `};function N(e,t){if(e<5)return"";const s=Math.min(1,(e-4)/6),a=t.accent||"#d56a3e",r=e>=8?Array.from({length:6},(n,i)=>{const f=110+Math.cos(i*1.04)*95,h=140+Math.sin(i*1.04)*100;return`<circle cx="${f.toFixed(1)}" cy="${h.toFixed(1)}" r="3" fill="${a}" opacity="0.75" />`}).join(""):"";return`
    <g class="brm-aura" style="pointer-events:none">
      <ellipse cx="110" cy="140" rx="100" ry="110"
        fill="none" stroke="${a}" stroke-width="${(2+s*2).toFixed(1)}"
        stroke-dasharray="4 8" opacity="${(.55+s*.3).toFixed(2)}">
        <animateTransform attributeName="transform" type="rotate"
          from="0 110 140" to="360 110 140" dur="20s" repeatCount="indefinite" />
      </ellipse>
      ${r}
    </g>
  `}function D(e){return e<3?"":`
    <g class="brm-scars" filter="url(#brm-wobble-thin)">
      <path d="M 80 130 l 14 -8" ${o} />
      <path d="M 78 138 l 10 -2" ${o} />
      ${e>=6?`<path d="M 145 120 l -8 14 M 140 122 l -4 10" ${o} />`:""}
      ${e>=9?`<path d="M 100 175 l 18 4" ${o} />`:""}
    </g>
  `}function C(e){if(e<4)return"";const t=e>=4?`
    <g class="brm-crown" filter="url(#brm-wobble)">
      <path d="M 80 50 L 90 30 L 100 45 L 110 25 L 120 45 L 130 30 L 140 50 Z"
        fill="${$}" stroke="${l}" stroke-width="3" stroke-linejoin="round" />
      <circle cx="110" cy="36" r="3" fill="#d56a3e" stroke="${l}" stroke-width="1.6" />
    </g>
  `:"",s=e>=7?`
    <path class="brm-cape" d="M 60 80 q -20 60 -10 130 l 30 -8 q -8 -50 8 -110 z"
      fill="#c63d2f" stroke="${l}" stroke-width="3" filter="url(#brm-wobble)" opacity="0.92" />
  `:"",a=e>=10?`
    <g class="brm-trophy" transform="translate(150 130)">
      <path d="M -8 0 l 0 -8 l 16 0 l 0 8 a 8 8 0 0 1 -16 0 z" fill="#e8b347" stroke="${l}" stroke-width="2" />
    </g>
  `:"";return t+s+a}function H(e,t={}){var M,w,_,k,x;const s=u[e.paletteIdx%u.length]||u[0],a=L[e.body]||L.blob,r=t.className?` class="${t.className}"`:"",n=t.idle===!1?"":" brm-idle",i=t.level||1,f=((M=y[e.feet])==null?void 0:M.call(y,...a.anchors.feet,s))??"",h=((w=g[e.arms])==null?void 0:w.call(g,a.anchors.arms,s))??"",O=((_=m[e.mouth])==null?void 0:_.call(m,...a.anchors.mouth,s))??"",q=((k=b[e.eyes])==null?void 0:k.call(b,...a.anchors.eyes,s))??"",E=((x=p[e.horns])==null?void 0:x.call(p,...a.anchors.horns,s))??"";return`<svg viewBox="${v}" xmlns="http://www.w3.org/2000/svg"${r}>
    ${j()}
    ${N(i,s)}
    <g class="brm-monster${n}" filter="url(#brm-wobble)">
      ${f}
      ${a.render(s)}
      ${h}
      ${O}
      ${q}
      ${E}
    </g>
    ${D(i)}
    ${C(i)}
  </svg>`}const Q=Object.freeze({body:"blob",eyes:"googly",mouth:"fangs",horns:"antennae",arms:"noodle",feet:"tentacles",paletteIdx:4});export{T as A,G as D,U as H,F as M,R as P,z as R,K as S,B as a,Z as b,S as c,Q as d,I as e,P as f,u as g,H as r};
