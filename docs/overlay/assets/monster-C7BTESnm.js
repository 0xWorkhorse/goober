(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))a(l);new MutationObserver(l=>{for(const i of l)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function r(l){const i={};return l.integrity&&(i.integrity=l.integrity),l.referrerPolicy&&(i.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?i.credentials="include":l.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(l){if(l.ep)return;l.ep=!0;const i=r(l);fetch(l.href,i)}})();const B=Object.freeze({body:["blob","lump","stack"],eyes:["googly","beady","cyclops"],mouth:["fangs","underbite","grin"],horns:["nubs","curly","antennae"],arms:["stubs","noodle","crab"],feet:["paws","tentacles","wheels"]}),ae=Object.freeze(Object.keys(B)),q=Object.freeze([{primary:"#ff6b9d",accent:"#ffd166",outline:"#3a1c4a"},{primary:"#7ec4cf",accent:"#f6c453",outline:"#1d3557"},{primary:"#a3d977",accent:"#f25c54",outline:"#264653"},{primary:"#c490e4",accent:"#9bf6ff",outline:"#3d2c5e"},{primary:"#ffa07a",accent:"#3ddc97",outline:"#3b1c32"},{primary:"#74c0fc",accent:"#ff8cc6",outline:"#1b3a4b"},{primary:"#ffd166",accent:"#06d6a0",outline:"#3d2914"},{primary:"#ef476f",accent:"#ffd166",outline:"#2b1d2e"},{primary:"#8ac926",accent:"#1982c4",outline:"#1a2d12"},{primary:"#b8b8ff",accent:"#ffafcc",outline:"#2e1a47"},{primary:"#fb6f92",accent:"#ffe5ec",outline:"#3d1a2c"},{primary:"#9381ff",accent:"#fbff12",outline:"#1d1a3a"}]),R=Object.freeze({hp:{base:3e3,perPoint:200,label:"health"},attack:{base:25,perPoint:3,label:"attack power"},defense:{base:0,perPoint:2,label:"defense"},speed:{base:100,perPoint:5,label:"speed"},crit:{base:5,perPoint:2,label:"crit chance"},abilityPower:{base:100,perPoint:8,label:"ability power"}});Object.freeze(Object.keys(R));const Z=Object.freeze({damage:[{id:"slam",cooldownMs:6e3,damage:80,targets:1,vfx:"impact_amber"},{id:"cleave",cooldownMs:7e3,damage:60,targets:3,vfx:"arc_red"},{id:"pierce",cooldownMs:5e3,damage:100,targets:1,vfx:"spear_purple"},{id:"stomp",cooldownMs:8e3,damage:50,targets:5,vfx:"shockwave_brown"}],aoe:[{id:"inferno",cooldownMs:9e3,damage:70,targets:"all",vfx:"fire_red"},{id:"frost_nova",cooldownMs:1e4,damage:50,targets:"all",effect:{kind:"slow",durationMs:2e3},vfx:"ice_blue"},{id:"lightning",cooldownMs:8e3,damage:60,targets:"all",vfx:"bolt_yellow"},{id:"poison_cloud",cooldownMs:11e3,damage:30,targets:"all",effect:{kind:"dot",durationMs:5e3,tickDamage:8},vfx:"cloud_green"}],utility:[{id:"roar",cooldownMs:1e4,damage:0,targets:"self",effect:{kind:"attack_buff",durationMs:5e3,amount:.5},vfx:"roar_purple"},{id:"heal",cooldownMs:12e3,damage:0,targets:"self",effect:{kind:"heal_pct",amount:.3},vfx:"heal_green"},{id:"enrage",cooldownMs:15e3,damage:0,targets:"self",effect:{kind:"speed_buff",durationMs:8e3,amount:.5},vfx:"rage_red"},{id:"shield",cooldownMs:14e3,damage:0,targets:"self",effect:{kind:"shield",amount:300},vfx:"shield_blue"}]}),le=Object.freeze(Object.values(Z).flat().reduce((e,t)=>(e[t.id]=t,e),{})),se=60,ie=200,ne=10,oe=25,$e=3e3,ce=Object.freeze(["en","es","pt","ja","ko"]),de="en",d="#1a1614",G="#3a342f",n=`fill="none" stroke="${d}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`,k=`fill="none" stroke="${G}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`,p=`fill="#fdfaf3" stroke="${d}" stroke-width="3.4" stroke-linejoin="round"`,K="0 0 220 280";function H(){return`
    <filter id="sketchy" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="sketchy-alt" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  `}function N(e,t,r,a=18,l=1){const i=t-a,o=t+a,s=6*l,g=2.2*l;return e==="defeated"?`
      <g data-part="eyes">
        <path d="M${i-s},${r-s} l${s*2},${s*2} M${i+s},${r-s} l${-s*2},${s*2}" ${n} />
        <path d="M${o-s},${r-s} l${s*2},${s*2} M${o+s},${r-s} l${-s*2},${s*2}" ${n} />
      </g>`:e==="happy"?`
      <g data-part="eyes">
        <path d="M${i-s},${r+1} q${s},-${s*1.3} ${s*2},0" ${n} />
        <path d="M${o-s},${r+1} q${s},-${s*1.3} ${s*2},0" ${n} />
      </g>`:e==="hurt"?`
      <g data-part="eyes">
        <path d="M${i-s},${r-s*.7} l${s*1.4},${s*.7} l${-s*1.4},${s*.7}" ${n} />
        <path d="M${o+s},${r-s*.7} l${-s*1.4},${s*.7} l${s*1.4},${s*.7}" ${n} />
      </g>`:`
    <g data-part="eyes">
      <g data-part="eye-left">
        <ellipse cx="${i}" cy="${r}" rx="${s}" ry="${s*1.05}" ${n} filter="url(#sketchy)" />
        <circle cx="${i+.6}" cy="${r+.4}" r="${g}" fill="${d}" />
      </g>
      <g data-part="eye-right">
        <ellipse cx="${o}" cy="${r}" rx="${s*.95}" ry="${s}" ${n} filter="url(#sketchy)" />
        <circle cx="${o-.4}" cy="${r+.6}" r="${g}" fill="${d}" />
      </g>
    </g>`}function F(e,t,r,a=18){const l=t-a,i=t+a;return e==="angry"?`
      <g data-part="brows">
        <path d="M${l-8},${r-4} L${l+7},${r+3}" ${n} />
        <path d="M${i+8},${r-4} L${i-7},${r+3}" ${n} />
      </g>`:e==="worry"||e==="hurt"?`
      <g data-part="brows">
        <path d="M${l-7},${r+2} q7,-6 14,-1" ${n} />
        <path d="M${i+7},${r+2} q-7,-6 -14,-1" ${n} />
      </g>`:""}function x(e,t,r,a=28){if(e==="happy")return`<g data-part="mouth"><path d="M${t-a/2},${r} q${a/2},${a*.5} ${a},0" ${n} filter="url(#sketchy)" /></g>`;if(e==="hurt"||e==="worry")return`<g data-part="mouth"><path d="M${t-a/2},${r+4} q${a/2},-${a*.45} ${a},0" ${n} filter="url(#sketchy)" /></g>`;if(e==="defeated")return`<g data-part="mouth"><ellipse cx="${t}" cy="${r+2}" rx="${a*.25}" ry="${a*.18}" ${n} /></g>`;const l=5,i=a/l;let o=`M${t-a/2},${r}`;for(let s=0;s<l;s++)o+=` l${i/2},-4 l${i/2},4`;return`
    <g data-part="mouth">
      <rect x="${t-a/2-2}" y="${r-6}" width="${a+4}" height="12" rx="1.5" ${n} filter="url(#sketchy)" />
      <path d="${o}" ${n} />
    </g>`}function m(e,{cx:t,ey:r,my:a,gap:l=18,mw:i=28,by:o=null}){const s=o??r-13;return`
    <g data-part="head">
      ${F(e,t,s,l)}
      ${N(e,t,r,l)}
      ${x(e,t,a,i)}
    </g>`}function h(e,t,r,a,l){const i=a*Math.PI/180,o=e+Math.sin(i)*r,s=t+Math.cos(i)*r;return`
    <g data-part="arm-${l}" style="transform-origin:${e}px ${t}px">
      <line x1="${e}" y1="${t}" x2="${o.toFixed(1)}" y2="${s.toFixed(1)}" ${n} filter="url(#sketchy)" />
      <ellipse cx="${o.toFixed(1)}" cy="${s.toFixed(1)}" rx="4.5" ry="3" ${n} />
    </g>`}function M(e,t,r,a,l){const i=a*Math.PI/180,o=e+Math.sin(i)*r,s=t+Math.cos(i)*r,g=l==="l"?-3:3;return`
    <g data-part="leg-${l}" style="transform-origin:${e}px ${t}px">
      <line x1="${e}" y1="${t}" x2="${o.toFixed(1)}" y2="${s.toFixed(1)}" ${n} filter="url(#sketchy)" />
      <ellipse cx="${(o+g).toFixed(1)}" cy="${(s+2).toFixed(1)}" rx="8" ry="3.5" ${n} filter="url(#sketchy)" />
    </g>`}function b(e=208){return`
    <g data-part="legs">
      ${M(92,e,26,-15,"l")}
      ${M(128,e,26,20,"r")}
    </g>`}function U(e){return e==="normal"?"":e==="poison"?`
      <svg viewBox="0 0 220 280" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
        <g filter="url(#sketchy-alt)">
          <path d="M 70 220 q 2 10 0 18 q -2 -8 0 -18 z" fill="#9ec472" stroke="#1f3a14" stroke-width="2.0" />
          <path d="M 150 215 q 2 12 0 22 q -2 -10 0 -22 z" fill="#9ec472" stroke="#1f3a14" stroke-width="2.0" />
          <circle cx="60" cy="180" r="3" fill="none" stroke="#1f3a14" stroke-width="2.0" />
          <circle cx="170" cy="160" r="2.4" fill="none" stroke="#1f3a14" stroke-width="2.0" />
          <circle cx="180" cy="195" r="2" fill="none" stroke="#1f3a14" stroke-width="2.0" />
        </g>
      </svg>`:e==="fire"?`
      <svg viewBox="0 0 220 280" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
        <g style="animation:flame-flicker 0.4s steps(3) infinite" filter="url(#sketchy-alt)">
          <path d="M 80 50 q -4 -18 4 -26 q -1 12 7 16 q 5 -10 0 -20 q 10 10 5 26 z" fill="#ff8a3d" stroke="#5a1f10" stroke-width="2.2" />
          <path d="M 130 40 q -3 -14 3 -22 q -1 10 6 13 q 4 -8 0 -16 q 8 8 4 22 z" fill="#ffb066" stroke="#5a1f10" stroke-width="2.2" />
          <path d="M 110 30 q -2 -10 2 -16 q 0 8 4 10 q 2 -6 0 -12 q 6 6 2 16 z" fill="#ffd28a" stroke="#5a1f10" stroke-width="2.0" />
        </g>
      </svg>`:e==="ice"?`
      <svg viewBox="0 0 220 280" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
        <g filter="url(#sketchy-alt)">
          <g transform="translate(50 70)">
            <path d="M -8 0 L 8 0 M 0 -8 L 0 8 M -6 -6 L 6 6 M -6 6 L 6 -6" stroke="#143a4a" stroke-width="2.0" />
          </g>
          <g transform="translate(170 110)" style="animation:sparkle 1.6s ease-in-out infinite">
            <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke="#143a4a" stroke-width="2.0" />
          </g>
          <path d="M 60 160 l 6 6 l -3 8 l 7 4" fill="none" stroke="#143a4a" stroke-width="2.0" />
          <path d="M 158 180 l -4 6 l 6 4 l -2 8" fill="none" stroke="#143a4a" stroke-width="2.0" />
        </g>
      </svg>`:e==="shadow"?`
      <svg viewBox="0 0 220 280" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
        <g style="animation:wisp 2.4s ease-in-out infinite" filter="url(#sketchy-alt)">
          <path d="M 60 60 q 6 -10 0 -20 q -10 10 0 20" fill="none" stroke="#7a6a90" stroke-width="2.4" />
          <path d="M 160 50 q 8 -8 2 -18 q -12 8 -2 18" fill="none" stroke="#9080a8" stroke-width="2.2" />
          <path d="M 100 30 q 4 -10 -2 -16 q -8 8 2 16" fill="none" stroke="#7a6a90" stroke-width="2.0" />
        </g>
      </svg>`:""}const w={bean:{name:"Bean Guy",tagline:"Grumpy little kidney",defaultExpr:"angry",render(e){return`
        ${b(208)}
        <g data-part="body">
          <path d="M 70 90 C 55 60, 90 45, 110 50 C 125 53, 130 65, 138 60 C 155 50, 175 75, 168 110 C 165 130, 160 145, 165 165 C 170 195, 145 220, 110 218 C 75 220, 55 195, 60 165 C 65 140, 78 120, 70 90 Z" ${p} filter="url(#sketchy)" />
          <path d="M 105 178 l 5 6 l 5 -6" ${k} />
        </g>
        <g data-part="arms">
          ${h(66,140,22,-10,"l")}
          ${h(170,135,22,15,"r")}
        </g>
        <g data-part="head">
          <g data-part="hair">
            <path d="M 92 55 l 4 -10 l 5 8 l 5 -10 l 5 9 l 5 -8 l 4 10" ${n} />
          </g>
          ${F(e,110,82,16)}
          ${N(e,110,95,16)}
          ${x(e,112,130,32)}
        </g>`}},box:{name:"Box Head",tagline:"Furious cardboard cryptid",defaultExpr:"angry",render(e){return`
        ${b(214)}
        <g data-part="body">
          <rect x="55" y="60" width="115" height="160" rx="14" ${p} filter="url(#sketchy)" />
          <line x1="55" y1="105" x2="170" y2="105" ${k} />
        </g>
        <g data-part="arms">
          ${h(58,140,22,-25,"l")}
          ${h(170,140,22,25,"r")}
        </g>
        ${m(e,{cx:113,ey:140,my:175,gap:20,mw:32,by:122})}`}},egg:{name:"Worry Egg",tagline:"Anxious about everything",defaultExpr:"worry",render(e){return`
        ${b(210)}
        <g data-part="body">
          <path d="M 110 50 C 70 50, 40 130, 50 180 C 60 220, 160 220, 170 180 C 180 130, 150 50, 110 50 Z" ${p} filter="url(#sketchy)" />
          <path d="M 110 195 l 6 8 l -6 6 l 6 8" ${k} />
        </g>
        <g data-part="arms">
          ${h(56,150,22,-15,"l")}
          ${h(164,150,22,15,"r")}
        </g>
        ${m(e,{cx:110,ey:130,my:170,gap:14,mw:24,by:115})}`}},cloud:{name:"Cloud Moss",tagline:"Soft. Mostly harmless.",defaultExpr:"happy",render(e){return`
        <g data-part="legs">
          <line x1="100" y1="195" x2="92" y2="235" ${n} filter="url(#sketchy)" />
          <line x1="140" y1="195" x2="148" y2="235" ${n} filter="url(#sketchy)" />
          <ellipse cx="88" cy="238" rx="9" ry="3.5" ${n} filter="url(#sketchy)" />
          <ellipse cx="152" cy="238" rx="9" ry="3.5" ${n} filter="url(#sketchy)" />
        </g>
        <g data-part="body">
          <path d="M 50 130 C 35 110, 55 80, 80 90 C 85 65, 130 60, 140 85 C 165 70, 195 95, 185 125 C 210 130, 200 175, 175 180 C 165 210, 105 215, 80 195 C 50 195, 35 165, 50 130 Z" ${p} filter="url(#sketchy)" />
        </g>
        ${m(e,{cx:120,ey:138,my:175,gap:26,mw:30,by:120})}`}},spike:{name:"Spike Pup",tagline:"Stabby triangle goblin",defaultExpr:"angry",render(e){return`
        ${b(210)}
        <g data-part="body">
          <path d="M 60 200 L 110 60 L 160 200 Z" ${p} filter="url(#sketchy)" />
          <line x1="60" y1="200" x2="160" y2="200" ${n} />
        </g>
        ${m(e,{cx:110,ey:150,my:180,gap:16,mw:22,by:135})}`}},slug:{name:"Slug Nub",tagline:"Slow but emotionally available",defaultExpr:"worry",render(e){return`
        <g data-part="body">
          <path d="M 30 200 C 20 160, 40 120, 75 115 C 110 85, 165 95, 185 130 C 210 160, 200 215, 30 215 Z" ${p} filter="url(#sketchy)" />
          <path d="M 65 130 q 5 12 0 30" ${k} />
        </g>
        <g data-part="head">
          <line x1="78" y1="115" x2="70" y2="95" ${n} />
          <line x1="92" y1="113" x2="100" y2="93" ${n} />
          <circle cx="68" cy="92" r="3" fill="${d}" />
          <circle cx="102" cy="91" r="3" fill="${d}" />
          ${x(e,95,165,22)}
        </g>`}},lanky:{name:"Lanky Larry",tagline:"Tall idiot, kind heart",defaultExpr:"happy",render(e){return`
        <g data-part="legs">
          ${M(98,220,30,-8,"l")}
          ${M(122,220,30,8,"r")}
        </g>
        <g data-part="body">
          <rect x="80" y="80" width="60" height="150" rx="20" ${p} filter="url(#sketchy)" />
        </g>
        <g data-part="arms">
          ${h(82,110,30,-5,"l")}
          ${h(138,110,30,5,"r")}
        </g>
        ${m(e,{cx:110,ey:120,my:165,gap:14,mw:22,by:105})}`}},gloop:{name:"Gloop",tagline:"One-eyed potato man",defaultExpr:"angry",render(e){return`
        ${b(212)}
        <g data-part="body">
          <path d="M 60 100 C 50 60, 100 50, 110 60 C 130 55, 175 80, 170 130 C 165 175, 145 215, 110 218 C 75 215, 50 175, 60 100 Z" ${p} filter="url(#sketchy)" />
        </g>
        <g data-part="arms">
          ${h(60,145,22,-15,"l")}
          ${h(170,140,22,18,"r")}
        </g>
        <g data-part="head">
          ${e==="angry"?`
            <path d="M 92 100 L 130 105" ${n} />
          `:""}
          <g data-part="eyes">
            <ellipse cx="113" cy="125" rx="20" ry="22" ${n} filter="url(#sketchy)" />
            <circle cx="115" cy="128" r="8" fill="${d}" />
            <circle cx="118" cy="124" r="2.5" fill="#fdfaf3" />
          </g>
          ${x(e,113,175,30)}
        </g>`}}};Object.freeze(Object.keys(w));function Y(e){return w[e]||null}function Q(e,t={}){const r=w[e];if(!r)return"";const a=t.expr||r.defaultExpr,l=t.variant||"normal",i=t.anim?`anim-${t.anim}`:t.idle===!1?"":"anim-idle anim-blink",o=t.level||1;return`
    <div class="sprite-stage ${i}" data-variant="${l}" data-preset="${e}" style="position:relative;width:100%;height:100%;">
      <svg viewBox="${K}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
        <defs>${H()}</defs>
        <g data-part="root">
          ${r.render(a)}
          ${V(o)}
        </g>
      </svg>
      ${U(l)}
    </div>`}function V(e){let t="";if(e>=3&&(t+=`<g class="brm-scars" filter="url(#sketchy-alt)">
      <path d="M 78 130 l 14 -8" ${n} />
      <path d="M 76 138 l 10 -2" ${n} />
      ${e>=6?`<path d="M 145 120 l -8 14 M 140 122 l -4 10" ${n} />`:""}
    </g>`),e>=5){const r=Math.min(1,(e-4)/6);t+=`<g class="brm-aura" style="pointer-events:none">
      <ellipse cx="110" cy="140" rx="100" ry="110" fill="none" stroke="#d56a3e" stroke-width="${(2+r*2).toFixed(1)}" stroke-dasharray="4 8" opacity="${(.55+r*.3).toFixed(2)}">
        <animateTransform attributeName="transform" type="rotate" from="0 110 140" to="360 110 140" dur="20s" repeatCount="indefinite" />
      </ellipse>
    </g>`}return e>=7&&(t+=`
      <g class="brm-crown" filter="url(#sketchy)">
        <path d="M 80 30 L 90 10 L 100 25 L 110 5 L 120 25 L 130 10 L 140 30 Z" fill="#fdfaf3" stroke="${d}" stroke-width="3" stroke-linejoin="round" />
        <circle cx="110" cy="16" r="3" fill="#d56a3e" stroke="${d}" stroke-width="1.6" />
      </g>
      <path class="brm-cape" d="M 50 70 q -20 60 -10 130 l 30 -8 q -8 -50 8 -110 z" fill="#c63d2f" stroke="${d}" stroke-width="3" filter="url(#sketchy)" opacity="0.92" />`),e>=10&&(t+=`<g class="brm-trophy" transform="translate(155 130)">
      <path d="M -8 0 l 0 -8 l 16 0 l 0 8 a 8 8 0 0 1 -16 0 z" fill="#e8b347" stroke="${d}" stroke-width="2" />
    </g>`),t}Object.freeze(Object.fromEntries(Object.entries(w).map(([e,t])=>[e,{name:t.name,tagline:t.tagline,defaultExpr:t.defaultExpr}])));const W="0 0 220 280",c="#1a1614",X="#3a342f",f="#fdfaf3",$=`fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`,y=`fill="none" stroke="${X}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`,u=`fill="${f}" stroke="${c}" stroke-width="3.4" stroke-linejoin="round"`;function J(){return`<defs>
    <filter id="brm-wobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
      <feDisplacementMap in="SourceGraphic" scale="1.6" />
    </filter>
    <filter id="brm-wobble-thin" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" />
      <feDisplacementMap in="SourceGraphic" scale="1.2" />
    </filter>
  </defs>`}const j={blob:{anchors:{eyes:[110,130],mouth:[110,175],horns:[110,70],arms:[[60,150],[160,150]],feet:[110,240]},render:e=>`
      <path d="M 60 90 C 40 70, 90 50, 110 80 C 130 50, 180 70, 170 110 C 195 150, 170 220, 110 215 C 60 220, 25 165, 60 90 Z" ${u} />
      <ellipse cx="86" cy="135" rx="14" ry="9" fill="${e.accent}" opacity="0.32" />
    `},lump:{anchors:{eyes:[110,120],mouth:[110,165],horns:[110,60],arms:[[58,160],[162,160]],feet:[110,240]},render:e=>`
      <path d="M 110 60 C 70 60, 50 130, 60 195 C 65 230, 155 230, 160 195 C 170 130, 150 60, 110 60 Z" ${u} />
      <path d="M 88 142 q 8 -4 18 0" ${y} />
      <ellipse cx="84" cy="155" rx="11" ry="7" fill="${e.accent}" opacity="0.32" />
    `},stack:{anchors:{eyes:[110,105],mouth:[110,135],horns:[110,50],arms:[[60,200],[160,200]],feet:[110,245]},render:e=>`
      <rect x="56" y="70" width="108" height="80" rx="14" ${u} />
      <rect x="46" y="160" width="128" height="80" rx="14" ${u} />
      <line x1="56" y1="150" x2="164" y2="150" ${y} />
      <ellipse cx="78" cy="195" rx="12" ry="7" fill="${e.accent}" opacity="0.32" />
    `}},_={googly:(e,t)=>`
    <g class="brm-eyes">
      <circle cx="${e-14}" cy="${t}" r="8" ${$} />
      <circle cx="${e+14}" cy="${t}" r="8" ${$} />
      <circle cx="${e-13}" cy="${t+1}" r="2.6" fill="${c}" />
      <circle cx="${e+15}" cy="${t+1}" r="2.6" fill="${c}" />
      <path d="M ${e-22} ${t-12} q 12 6 22 0" ${$} />
      <path d="M ${e+8} ${t-12} q 12 6 22 0" ${$} />
    </g>
  `,beady:(e,t)=>`
    <g class="brm-eyes">
      <circle cx="${e-12}" cy="${t}" r="3.2" fill="${c}" />
      <circle cx="${e+12}" cy="${t}" r="3.2" fill="${c}" />
      <path d="M ${e-22} ${t-12} q 12 -4 22 0" ${$} />
      <path d="M ${e+8} ${t-12} q -12 -4 22 0" ${$} />
    </g>
  `,cyclops:(e,t)=>`
    <g class="brm-eyes">
      <circle cx="${e}" cy="${t}" r="14" ${$} />
      <circle cx="${e+2}" cy="${t+1}" r="4" fill="${c}" />
      <circle cx="${e+4}" cy="${t-2}" r="1.5" fill="${f}" />
      <path d="M ${e-18} ${t-18} q 18 -4 36 0" ${$} />
    </g>
  `},L={fangs:(e,t)=>`
    <g class="brm-mouth">
      <path d="M ${e-22} ${t} q 22 14 44 0 q -22 16 -44 0 z" fill="${c}" stroke="${c}" stroke-width="2.4" stroke-linejoin="round" />
      <path d="M ${e-8} ${t+2} l 2 8 l 4 -8 z" fill="${f}" stroke="${c}" stroke-width="1.6" />
      <path d="M ${e+4} ${t+2} l 2 8 l 4 -8 z" fill="${f}" stroke="${c}" stroke-width="1.6" />
    </g>
  `,underbite:(e,t)=>`
    <g class="brm-mouth">
      <path d="M ${e-22} ${t} q 22 4 44 0" ${$} />
      <rect x="${e-9}" y="${t+1}" width="6" height="9" rx="1" fill="${f}" stroke="${c}" stroke-width="2" />
      <rect x="${e+3}" y="${t+1}" width="6" height="9" rx="1" fill="${f}" stroke="${c}" stroke-width="2" />
    </g>
  `,grin:(e,t)=>`
    <g class="brm-mouth">
      <path d="M ${e-24} ${t-2} q 24 22 48 -2" ${$} />
      <path d="M ${e-16} ${t+6} q 16 6 32 0" ${y} />
    </g>
  `},v={nubs:(e,t)=>`
    <g class="brm-horns">
      <path d="M ${e-18} ${t+6} q -3 -16 9 -18 q 8 0 8 14" ${$} />
      <path d="M ${e+18} ${t+6} q 3 -16 -9 -18 q -8 0 -8 14" ${$} />
    </g>
  `,curly:(e,t)=>`
    <g class="brm-horns">
      <path d="M ${e-14} ${t+6} Q ${e-28} ${t-8}, ${e-22} ${t-22} Q ${e-12} ${t-28}, ${e-12} ${t-14}" ${$} />
      <path d="M ${e+14} ${t+6} Q ${e+28} ${t-8}, ${e+22} ${t-22} Q ${e+12} ${t-28}, ${e+12} ${t-14}" ${$} />
    </g>
  `,antennae:(e,t,r)=>`
    <g class="brm-horns">
      <path d="M ${e-10} ${t+4} q -8 -16 -16 -32" ${$} />
      <path d="M ${e+10} ${t+4} q 8 -16 16 -32" ${$} />
      <circle cx="${e-26}" cy="${t-28}" r="5" fill="${r.accent}" stroke="${c}" stroke-width="2.4" />
      <circle cx="${e+26}" cy="${t-28}" r="5" fill="${r.accent}" stroke="${c}" stroke-width="2.4" />
    </g>
  `},C={stubs:e=>{const[[t,r],[a,l]]=e;return`
      <g class="brm-arms">
        <line x1="${t}" y1="${r}" x2="${t-22}" y2="${r+18}" ${$} />
        <line x1="${a}" y1="${l}" x2="${a+22}" y2="${l+18}" ${$} />
        <circle cx="${t-22}" cy="${r+18}" r="4" fill="${f}" stroke="${c}" stroke-width="2.4" />
        <circle cx="${a+22}" cy="${l+18}" r="4" fill="${f}" stroke="${c}" stroke-width="2.4" />
      </g>
    `},noodle:e=>{const[[t,r],[a,l]]=e;return`
      <g class="brm-arms">
        <path d="M ${t} ${r} q -22 14 -10 32 q 14 10 -4 26" ${$} />
        <path d="M ${a} ${l} q 22 14 10 32 q -14 10 4 26" ${$} />
        <circle cx="${t-14}" cy="${r+58}" r="4" fill="${f}" stroke="${c}" stroke-width="2.4" />
        <circle cx="${a+14}" cy="${l+58}" r="4" fill="${f}" stroke="${c}" stroke-width="2.4" />
      </g>
    `},crab:e=>{const[[t,r],[a,l]]=e;return`
      <g class="brm-arms">
        <line x1="${t}" y1="${r}" x2="${t-14}" y2="${r+16}" ${$} />
        <path d="M ${t-12} ${r+14} L ${t-26} ${r+10} L ${t-22} ${r+22} L ${t-28} ${r+22} L ${t-22} ${r+30} L ${t-12} ${r+26} Z" ${u} />
        <line x1="${a}" y1="${l}" x2="${a+14}" y2="${l+16}" ${$} />
        <path d="M ${a+12} ${l+14} L ${a+26} ${l+10} L ${a+22} ${l+22} L ${a+28} ${l+22} L ${a+22} ${l+30} L ${a+12} ${l+26} Z" ${u} />
      </g>
    `}},E={paws:(e,t)=>`
    <g class="brm-feet">
      <line x1="${e-18}" y1="${t-30}" x2="${e-18}" y2="${t-4}" ${$} />
      <line x1="${e+18}" y1="${t-30}" x2="${e+18}" y2="${t-4}" ${$} />
      <ellipse cx="${e-18}" cy="${t}" rx="13" ry="5" ${u} />
      <ellipse cx="${e+18}" cy="${t}" rx="13" ry="5" ${u} />
    </g>
  `,tentacles:(e,t)=>`
    <g class="brm-feet">
      <path d="M ${e-26} ${t-30} q -6 18 0 32 q 6 6 14 4" ${$} />
      <path d="M ${e} ${t-30} q -6 22 4 36" ${$} />
      <path d="M ${e+26} ${t-30} q 6 18 0 32 q -6 6 -14 4" ${$} />
    </g>
  `,wheels:(e,t)=>`
    <g class="brm-feet">
      <circle cx="${e-22}" cy="${t-4}" r="12" ${u} />
      <circle cx="${e+22}" cy="${t-4}" r="12" ${u} />
      <line x1="${e-32}" y1="${t-4}" x2="${e-12}" y2="${t-4}" ${y} />
      <line x1="${e-22}" y1="${t-14}" x2="${e-22}" y2="${t+6}" ${y} />
      <line x1="${e+12}" y1="${t-4}" x2="${e+32}" y2="${t-4}" ${y} />
      <line x1="${e+22}" y1="${t-14}" x2="${e+22}" y2="${t+6}" ${y} />
      <circle cx="${e-22}" cy="${t-4}" r="2.4" fill="${c}" />
      <circle cx="${e+22}" cy="${t-4}" r="2.4" fill="${c}" />
    </g>
  `};function ee(e,t){if(e<5)return"";const r=Math.min(1,(e-4)/6),a=t.accent||"#d56a3e",l=e>=8?Array.from({length:6},(i,o)=>{const s=110+Math.cos(o*1.04)*95,g=140+Math.sin(o*1.04)*100;return`<circle cx="${s.toFixed(1)}" cy="${g.toFixed(1)}" r="3" fill="${a}" opacity="0.75" />`}).join(""):"";return`
    <g class="brm-aura" style="pointer-events:none">
      <ellipse cx="110" cy="140" rx="100" ry="110"
        fill="none" stroke="${a}" stroke-width="${(2+r*2).toFixed(1)}"
        stroke-dasharray="4 8" opacity="${(.55+r*.3).toFixed(2)}">
        <animateTransform attributeName="transform" type="rotate"
          from="0 110 140" to="360 110 140" dur="20s" repeatCount="indefinite" />
      </ellipse>
      ${l}
    </g>
  `}function te(e){return e<3?"":`
    <g class="brm-scars" filter="url(#brm-wobble-thin)">
      <path d="M 80 130 l 14 -8" ${$} />
      <path d="M 78 138 l 10 -2" ${$} />
      ${e>=6?`<path d="M 145 120 l -8 14 M 140 122 l -4 10" ${$} />`:""}
      ${e>=9?`<path d="M 100 175 l 18 4" ${$} />`:""}
    </g>
  `}function re(e){if(e<4)return"";const t=e>=4?`
    <g class="brm-crown" filter="url(#brm-wobble)">
      <path d="M 80 50 L 90 30 L 100 45 L 110 25 L 120 45 L 130 30 L 140 50 Z"
        fill="${f}" stroke="${c}" stroke-width="3" stroke-linejoin="round" />
      <circle cx="110" cy="36" r="3" fill="#d56a3e" stroke="${c}" stroke-width="1.6" />
    </g>
  `:"",r=e>=7?`
    <path class="brm-cape" d="M 60 80 q -20 60 -10 130 l 30 -8 q -8 -50 8 -110 z"
      fill="#c63d2f" stroke="${c}" stroke-width="3" filter="url(#brm-wobble)" opacity="0.92" />
  `:"",a=e>=10?`
    <g class="brm-trophy" transform="translate(150 130)">
      <path d="M -8 0 l 0 -8 l 16 0 l 0 8 a 8 8 0 0 1 -16 0 z" fill="#e8b347" stroke="${c}" stroke-width="2" />
    </g>
  `:"";return t+r+a}function fe(e={},t={}){var O,P,I,S,T;if(e.presetKey&&Y(e.presetKey))return Q(e.presetKey,{expr:e.expr,variant:e.variant,idle:t.idle,anim:t.anim,level:t.level||1});const r=q[(e.paletteIdx||0)%q.length]||q[0],a=j[e.body]||j.blob,l=t.className?` class="${t.className}"`:"",i=t.idle===!1?"":" brm-idle",o=t.level||1,s=((O=E[e.feet])==null?void 0:O.call(E,...a.anchors.feet,r))??"",g=((P=C[e.arms])==null?void 0:P.call(C,a.anchors.arms,r))??"",z=((I=L[e.mouth])==null?void 0:I.call(L,...a.anchors.mouth,r))??"",A=((S=_[e.eyes])==null?void 0:S.call(_,...a.anchors.eyes,r))??"",D=((T=v[e.horns])==null?void 0:T.call(v,...a.anchors.horns,r))??"";return`<svg viewBox="${W}" xmlns="http://www.w3.org/2000/svg"${l}>
    ${J()}
    ${ee(o,r)}
    <g class="brm-monster${i}" filter="url(#brm-wobble)">
      ${s}
      ${a.render(r)}
      ${g}
      ${z}
      ${A}
      ${D}
    </g>
    ${te(o)}
    ${re(o)}
  </svg>`}const he=Object.freeze({body:"blob",eyes:"googly",mouth:"fangs",horns:"antennae",arms:"noodle",feet:"tentacles",paletteIdx:4});export{Z as A,de as D,$e as H,ne as M,ae as P,se as R,ce as S,ie as a,oe as b,le as c,he as d,R as e,B as f,q as g,fe as r};
