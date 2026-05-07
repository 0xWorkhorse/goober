(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))l(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const $ of s.addedNodes)$.tagName==="LINK"&&$.rel==="modulepreload"&&l($)}).observe(document,{childList:!0,subtree:!0});function r(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function l(o){if(o.ep)return;o.ep=!0;const s=r(o);fetch(o.href,s)}})();const M=Object.freeze({body:["blob","lump","stack"],eyes:["googly","beady","cyclops"],mouth:["fangs","underbite","grin"],horns:["nubs","curly","antennae"],arms:["stubs","noodle","crab"],feet:["paws","tentacles","wheels"]}),Q=Object.freeze(Object.keys(M)),g=Object.freeze([{primary:"#ff6b9d",accent:"#ffd166",outline:"#3a1c4a"},{primary:"#7ec4cf",accent:"#f6c453",outline:"#1d3557"},{primary:"#a3d977",accent:"#f25c54",outline:"#264653"},{primary:"#c490e4",accent:"#9bf6ff",outline:"#3d2c5e"},{primary:"#ffa07a",accent:"#3ddc97",outline:"#3b1c32"},{primary:"#74c0fc",accent:"#ff8cc6",outline:"#1b3a4b"},{primary:"#ffd166",accent:"#06d6a0",outline:"#3d2914"},{primary:"#ef476f",accent:"#ffd166",outline:"#2b1d2e"},{primary:"#8ac926",accent:"#1982c4",outline:"#1a2d12"},{primary:"#b8b8ff",accent:"#ffafcc",outline:"#2e1a47"},{primary:"#fb6f92",accent:"#ffe5ec",outline:"#3d1a2c"},{primary:"#9381ff",accent:"#fbff12",outline:"#1d1a3a"}]),O=Object.freeze({hp:{base:3e3,perPoint:200,label:"health"},attack:{base:25,perPoint:3,label:"attack power"},defense:{base:0,perPoint:2,label:"defense"},speed:{base:100,perPoint:5,label:"speed"},crit:{base:5,perPoint:2,label:"crit chance"},abilityPower:{base:100,perPoint:8,label:"ability power"}});Object.freeze(Object.keys(O));const L=Object.freeze({damage:[{id:"slam",cooldownMs:6e3,damage:80,targets:1,vfx:"impact_amber"},{id:"cleave",cooldownMs:7e3,damage:60,targets:3,vfx:"arc_red"},{id:"pierce",cooldownMs:5e3,damage:100,targets:1,vfx:"spear_purple"},{id:"stomp",cooldownMs:8e3,damage:50,targets:5,vfx:"shockwave_brown"}],aoe:[{id:"inferno",cooldownMs:9e3,damage:70,targets:"all",vfx:"fire_red"},{id:"frost_nova",cooldownMs:1e4,damage:50,targets:"all",effect:{kind:"slow",durationMs:2e3},vfx:"ice_blue"},{id:"lightning",cooldownMs:8e3,damage:60,targets:"all",vfx:"bolt_yellow"},{id:"poison_cloud",cooldownMs:11e3,damage:30,targets:"all",effect:{kind:"dot",durationMs:5e3,tickDamage:8},vfx:"cloud_green"}],utility:[{id:"roar",cooldownMs:1e4,damage:0,targets:"self",effect:{kind:"attack_buff",durationMs:5e3,amount:.5},vfx:"roar_purple"},{id:"heal",cooldownMs:12e3,damage:0,targets:"self",effect:{kind:"heal_pct",amount:.3},vfx:"heal_green"},{id:"enrage",cooldownMs:15e3,damage:0,targets:"self",effect:{kind:"speed_buff",durationMs:8e3,amount:.5},vfx:"rage_red"},{id:"shield",cooldownMs:14e3,damage:0,targets:"self",effect:{kind:"shield",amount:300},vfx:"shield_blue"}]}),E=Object.freeze(Object.values(L).flat().reduce((e,t)=>(e[t.id]=t,e),{})),P=60,A=200,I=10,T=25,j=3e3,D=Object.freeze(["en","es","pt","ja","ko"]),R="en",v="0 0 200 300",b={blob:{anchors:{eyes:[100,145],mouth:[100,185],horns:[100,110],arms:[[55,175],[145,175]],feet:[100,240]},render:e=>`
      <ellipse cx="100" cy="180" rx="65" ry="60"
        fill="${e.primary}" stroke="${e.outline}" stroke-width="4"/>
      <ellipse cx="80" cy="165" rx="20" ry="14" fill="${e.accent}" opacity="0.45"/>
    `},lump:{anchors:{eyes:[100,130],mouth:[100,175],horns:[100,90],arms:[[50,180],[150,180]],feet:[100,250]},render:e=>`
      <path d="M 100 110
               C 60 110, 45 165, 50 215
               C 55 260, 145 260, 150 215
               C 155 165, 140 110, 100 110 Z"
            fill="${e.primary}" stroke="${e.outline}" stroke-width="4"/>
      <ellipse cx="82" cy="155" rx="18" ry="13" fill="${e.accent}" opacity="0.4"/>
    `},stack:{anchors:{eyes:[100,110],mouth:[100,140],horns:[100,70],arms:[[55,200],[145,200]],feet:[100,250]},render:e=>`
      <circle cx="100" cy="125" r="48" fill="${e.primary}" stroke="${e.outline}" stroke-width="4"/>
      <circle cx="100" cy="215" r="55" fill="${e.primary}" stroke="${e.outline}" stroke-width="4"/>
      <circle cx="85" cy="115" r="12" fill="${e.accent}" opacity="0.4"/>
    `}},i={googly:(e,t,r)=>`
    <g class="brm-eyes">
      <circle cx="${e-15}" cy="${t}" r="11" fill="#fff" stroke="${r.outline}" stroke-width="3"/>
      <circle cx="${e+15}" cy="${t}" r="11" fill="#fff" stroke="${r.outline}" stroke-width="3"/>
      <circle cx="${e-13}" cy="${t+2}" r="5" fill="${r.outline}"/>
      <circle cx="${e+17}" cy="${t+1}" r="5" fill="${r.outline}"/>
    </g>
  `,beady:(e,t,r)=>`
    <g class="brm-eyes">
      <circle cx="${e-13}" cy="${t}" r="4" fill="${r.outline}"/>
      <circle cx="${e+13}" cy="${t}" r="4" fill="${r.outline}"/>
      <circle cx="${e-11}" cy="${t-1}" r="1.2" fill="#fff"/>
      <circle cx="${e+15}" cy="${t-1}" r="1.2" fill="#fff"/>
    </g>
  `,cyclops:(e,t,r)=>`
    <g class="brm-eyes">
      <circle cx="${e}" cy="${t}" r="18" fill="#fff" stroke="${r.outline}" stroke-width="3"/>
      <circle cx="${e+3}" cy="${t+1}" r="9" fill="${r.outline}"/>
      <circle cx="${e+6}" cy="${t-2}" r="2.5" fill="#fff"/>
    </g>
  `},n={fangs:(e,t,r)=>`
    <g class="brm-mouth">
      <path d="M ${e-22} ${t} Q ${e} ${t+14}, ${e+22} ${t}"
            fill="none" stroke="${r.outline}" stroke-width="3" stroke-linecap="round"/>
      <polygon points="${e-10},${t+4} ${e-6},${t+4} ${e-8},${t+14}"
               fill="#fff" stroke="${r.outline}" stroke-width="2"/>
      <polygon points="${e+6},${t+4} ${e+10},${t+4} ${e+8},${t+14}"
               fill="#fff" stroke="${r.outline}" stroke-width="2"/>
    </g>
  `,underbite:(e,t,r)=>`
    <g class="brm-mouth">
      <path d="M ${e-24} ${t} Q ${e} ${t+4}, ${e+24} ${t}"
            fill="${r.outline}" stroke="${r.outline}" stroke-width="3"/>
      <rect x="${e-11}" y="${t+3}" width="6" height="8" fill="#fff" stroke="${r.outline}" stroke-width="2"/>
      <rect x="${e+5}" y="${t+3}" width="6" height="8" fill="#fff" stroke="${r.outline}" stroke-width="2"/>
    </g>
  `,grin:(e,t,r)=>`
    <g class="brm-mouth">
      <path d="M ${e-26} ${t-2} Q ${e} ${t+18}, ${e+26} ${t-2}"
            fill="${r.accent}" stroke="${r.outline}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M ${e-22} ${t+1} Q ${e} ${t+13}, ${e+22} ${t+1}"
            fill="none" stroke="${r.outline}" stroke-width="2" opacity="0.6"/>
    </g>
  `},a={nubs:(e,t,r)=>`
    <g class="brm-horns">
      <ellipse cx="${e-16}" cy="${t+8}" rx="9" ry="11" fill="${r.accent}" stroke="${r.outline}" stroke-width="3"/>
      <ellipse cx="${e+16}" cy="${t+8}" rx="9" ry="11" fill="${r.accent}" stroke="${r.outline}" stroke-width="3"/>
    </g>
  `,curly:(e,t,r)=>`
    <g class="brm-horns" fill="none" stroke="${r.outline}" stroke-width="4" stroke-linecap="round">
      <path d="M ${e-18} ${t+12} Q ${e-30} ${t-4}, ${e-22} ${t-18} Q ${e-14} ${t-24}, ${e-14} ${t-12}"/>
      <path d="M ${e+18} ${t+12} Q ${e+30} ${t-4}, ${e+22} ${t-18} Q ${e+14} ${t-24}, ${e+14} ${t-12}"/>
    </g>
  `,antennae:(e,t,r)=>`
    <g class="brm-horns">
      <line x1="${e-14}" y1="${t+10}" x2="${e-22}" y2="${t-22}"
            stroke="${r.outline}" stroke-width="3" stroke-linecap="round"/>
      <line x1="${e+14}" y1="${t+10}" x2="${e+22}" y2="${t-22}"
            stroke="${r.outline}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${e-22}" cy="${t-24}" r="6" fill="${r.accent}" stroke="${r.outline}" stroke-width="3"/>
      <circle cx="${e+22}" cy="${t-24}" r="6" fill="${r.accent}" stroke="${r.outline}" stroke-width="3"/>
    </g>
  `},d={stubs:(e,t)=>{const[[r,l],[o,s]]=e;return`
      <g class="brm-arms">
        <rect x="${r-10}" y="${l-6}" width="14" height="22" rx="6"
              fill="${t.primary}" stroke="${t.outline}" stroke-width="3"/>
        <rect x="${o-4}" y="${s-6}" width="14" height="22" rx="6"
              fill="${t.primary}" stroke="${t.outline}" stroke-width="3"/>
      </g>
    `},noodle:(e,t)=>{const[[r,l],[o,s]]=e;return`
      <g class="brm-arms" fill="none" stroke="${t.outline}" stroke-width="6" stroke-linecap="round">
        <path d="M ${r+4} ${l} Q ${r-18} ${l+14}, ${r-4} ${l+32} Q ${r+8} ${l+44}, ${r-6} ${l+56}"/>
        <path d="M ${o-4} ${s} Q ${o+18} ${s+14}, ${o+4} ${s+32} Q ${o-8} ${s+44}, ${o+6} ${s+56}"/>
      </g>
      <g fill="none" stroke="${t.primary}" stroke-width="3" stroke-linecap="round">
        <path d="M ${r+4} ${l} Q ${r-18} ${l+14}, ${r-4} ${l+32} Q ${r+8} ${l+44}, ${r-6} ${l+56}"/>
        <path d="M ${o-4} ${s} Q ${o+18} ${s+14}, ${o+4} ${s+32} Q ${o-8} ${s+44}, ${o+6} ${s+56}"/>
      </g>
    `},crab:(e,t)=>{const[[r,l],[o,s]]=e;return`
      <g class="brm-arms">
        <line x1="${r+6}" y1="${l}" x2="${r-12}" y2="${l+18}" stroke="${t.outline}" stroke-width="6" stroke-linecap="round"/>
        <path d="M ${r-10} ${l+16} L ${r-22} ${l+12} L ${r-18} ${l+22} L ${r-24} ${l+22} L ${r-18} ${l+30} L ${r-10} ${l+28} Z"
              fill="${t.accent}" stroke="${t.outline}" stroke-width="3" stroke-linejoin="round"/>
        <line x1="${o-6}" y1="${s}" x2="${o+12}" y2="${s+18}" stroke="${t.outline}" stroke-width="6" stroke-linecap="round"/>
        <path d="M ${o+10} ${s+16} L ${o+22} ${s+12} L ${o+18} ${s+22} L ${o+24} ${s+22} L ${o+18} ${s+30} L ${o+10} ${s+28} Z"
              fill="${t.accent}" stroke="${t.outline}" stroke-width="3" stroke-linejoin="round"/>
      </g>
    `}},f={paws:(e,t,r)=>`
    <g class="brm-feet">
      <ellipse cx="${e-22}" cy="${t}" rx="18" ry="10" fill="${r.primary}" stroke="${r.outline}" stroke-width="3"/>
      <ellipse cx="${e+22}" cy="${t}" rx="18" ry="10" fill="${r.primary}" stroke="${r.outline}" stroke-width="3"/>
      <line x1="${e-30}" y1="${t}" x2="${e-30}" y2="${t+6}" stroke="${r.outline}" stroke-width="2"/>
      <line x1="${e-22}" y1="${t}" x2="${e-22}" y2="${t+6}" stroke="${r.outline}" stroke-width="2"/>
      <line x1="${e-14}" y1="${t}" x2="${e-14}" y2="${t+6}" stroke="${r.outline}" stroke-width="2"/>
      <line x1="${e+14}" y1="${t}" x2="${e+14}" y2="${t+6}" stroke="${r.outline}" stroke-width="2"/>
      <line x1="${e+22}" y1="${t}" x2="${e+22}" y2="${t+6}" stroke="${r.outline}" stroke-width="2"/>
      <line x1="${e+30}" y1="${t}" x2="${e+30}" y2="${t+6}" stroke="${r.outline}" stroke-width="2"/>
    </g>
  `,tentacles:(e,t,r)=>`
    <g class="brm-feet" fill="none" stroke="${r.outline}" stroke-width="6" stroke-linecap="round">
      <path d="M ${e-30} ${t-6} Q ${e-36} ${t+12}, ${e-28} ${t+26}"/>
      <path d="M ${e} ${t-6} Q ${e-6} ${t+14}, ${e+4} ${t+28}"/>
      <path d="M ${e+30} ${t-6} Q ${e+36} ${t+12}, ${e+28} ${t+26}"/>
    </g>
    <g fill="none" stroke="${r.primary}" stroke-width="3" stroke-linecap="round">
      <path d="M ${e-30} ${t-6} Q ${e-36} ${t+12}, ${e-28} ${t+26}"/>
      <path d="M ${e} ${t-6} Q ${e-6} ${t+14}, ${e+4} ${t+28}"/>
      <path d="M ${e+30} ${t-6} Q ${e+36} ${t+12}, ${e+28} ${t+26}"/>
    </g>
  `,wheels:(e,t,r)=>`
    <g class="brm-feet">
      <circle cx="${e-24}" cy="${t+6}" r="14" fill="${r.accent}" stroke="${r.outline}" stroke-width="3"/>
      <circle cx="${e+24}" cy="${t+6}" r="14" fill="${r.accent}" stroke="${r.outline}" stroke-width="3"/>
      <circle cx="${e-24}" cy="${t+6}" r="3" fill="${r.outline}"/>
      <circle cx="${e+24}" cy="${t+6}" r="3" fill="${r.outline}"/>
      <line x1="${e-36}" y1="${t+6}" x2="${e-12}" y2="${t+6}" stroke="${r.outline}" stroke-width="2"/>
      <line x1="${e-24}" y1="${t-6}" x2="${e-24}" y2="${t+18}" stroke="${r.outline}" stroke-width="2"/>
      <line x1="${e+12}" y1="${t+6}" x2="${e+36}" y2="${t+6}" stroke="${r.outline}" stroke-width="2"/>
      <line x1="${e+24}" y1="${t-6}" x2="${e+24}" y2="${t+18}" stroke="${r.outline}" stroke-width="2"/>
    </g>
  `};function S(e,t={}){var c,u,h,k,m;const r=g[e.paletteIdx%g.length],l=b[e.body]||b.blob,o=t.className?` class="${t.className}"`:"",s=t.idle===!1?"":" brm-idle",$=((c=f[e.feet])==null?void 0:c.call(f,...l.anchors.feet,r))??"",w=((u=d[e.arms])==null?void 0:u.call(d,l.anchors.arms,r))??"",y=((h=n[e.mouth])==null?void 0:h.call(n,...l.anchors.mouth,r))??"",_=((k=i[e.eyes])==null?void 0:k.call(i,...l.anchors.eyes,r))??"",p=((m=a[e.horns])==null?void 0:m.call(a,...l.anchors.horns,r))??"";return`<svg viewBox="${v}" xmlns="http://www.w3.org/2000/svg"${o}>
    <g class="brm-monster${s}">
      ${$}
      ${l.render(r)}
      ${w}
      ${y}
      ${_}
      ${p}
    </g>
  </svg>`}const B=Object.freeze({body:"blob",eyes:"googly",mouth:"fangs",horns:"antennae",arms:"noodle",feet:"tentacles",paletteIdx:4});export{L as A,R as D,j as H,I as M,Q as P,P as R,D as S,A as a,T as b,E as c,B as d,O as e,M as f,g,S as r};
