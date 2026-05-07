(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&a(d)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();const Me=1,C=Object.freeze({HELLO_PANEL:"hello_panel",HELLO_OVERLAY:"hello_overlay",START_NEW_MONSTER:"start_new_monster",PICK_APPEARANCE:"pick_appearance",REQUEST_ABILITY_ROLL:"request_ability_roll",PICK_ABILITIES:"pick_abilities",ALLOCATE_STARTING_STATS:"allocate_starting_stats",CONFIRM_MONSTER:"confirm_monster",START_LOBBY:"start_lobby",CAST_ABILITY:"cast_ability",END_FIGHT_FORCE:"end_fight_force",ALLOCATE_LEVEL_STATS:"allocate_level_stats",REROLL_ABILITY:"reroll_ability",REPLACE_ABILITY:"replace_ability",CONFIRM_LEVEL_UP:"confirm_level_up",REVIVE_MONSTER:"revive_monster",ABANDON_MONSTER:"abandon_monster",SET_LOCALE:"set_locale"}),I=Object.freeze({WELCOME:"welcome",STATE_DELTA:"state_delta",PHASE_CHANGE:"phase_change",ABILITY_ROLL:"ability_roll",MONSTER_UPDATED:"monster_updated",RESULTS:"results",RUN_OVER:"run_over",IRC_STATUS:"irc_status",ERROR:"error"}),T=Object.freeze({CREATION:"creation",IDLE:"idle",LOBBY:"lobby",FIGHT:"fight",RESULTS:"results",LEVEL_UP:"level_up",DEATH:"death"}),ke=Object.freeze({body:["blob","lump","stack"],eyes:["googly","beady","cyclops"],mouth:["fangs","underbite","grin"],horns:["nubs","curly","antennae"],arms:["stubs","noodle","crab"],feet:["paws","tentacles","wheels"]}),Se=Object.freeze(Object.keys(ke)),W=Object.freeze([{primary:"#ff6b9d",accent:"#ffd166",outline:"#3a1c4a"},{primary:"#7ec4cf",accent:"#f6c453",outline:"#1d3557"},{primary:"#a3d977",accent:"#f25c54",outline:"#264653"},{primary:"#c490e4",accent:"#9bf6ff",outline:"#3d2c5e"},{primary:"#ffa07a",accent:"#3ddc97",outline:"#3b1c32"},{primary:"#74c0fc",accent:"#ff8cc6",outline:"#1b3a4b"},{primary:"#ffd166",accent:"#06d6a0",outline:"#3d2914"},{primary:"#ef476f",accent:"#ffd166",outline:"#2b1d2e"},{primary:"#8ac926",accent:"#1982c4",outline:"#1a2d12"},{primary:"#b8b8ff",accent:"#ffafcc",outline:"#2e1a47"},{primary:"#fb6f92",accent:"#ffe5ec",outline:"#3d1a2c"},{primary:"#9381ff",accent:"#fbff12",outline:"#1d1a3a"}]),ee=Object.freeze({hp:{base:3e3,perPoint:200,label:"health"},attack:{base:25,perPoint:3,label:"attack power"},defense:{base:0,perPoint:2,label:"defense"},speed:{base:100,perPoint:5,label:"speed"},crit:{base:5,perPoint:2,label:"crit chance"},abilityPower:{base:100,perPoint:8,label:"ability power"}}),U=Object.freeze(Object.keys(ee)),ue=10,Z=3,Ae=30,j=Object.freeze({damage:[{id:"slam",cooldownMs:6e3,damage:80,targets:1,vfx:"impact_amber"},{id:"cleave",cooldownMs:7e3,damage:60,targets:3,vfx:"arc_red"},{id:"pierce",cooldownMs:5e3,damage:100,targets:1,vfx:"spear_purple"},{id:"stomp",cooldownMs:8e3,damage:50,targets:5,vfx:"shockwave_brown"}],aoe:[{id:"inferno",cooldownMs:9e3,damage:70,targets:"all",vfx:"fire_red"},{id:"frost_nova",cooldownMs:1e4,damage:50,targets:"all",effect:{kind:"slow",durationMs:2e3},vfx:"ice_blue"},{id:"lightning",cooldownMs:8e3,damage:60,targets:"all",vfx:"bolt_yellow"},{id:"poison_cloud",cooldownMs:11e3,damage:30,targets:"all",effect:{kind:"dot",durationMs:5e3,tickDamage:8},vfx:"cloud_green"}],utility:[{id:"roar",cooldownMs:1e4,damage:0,targets:"self",effect:{kind:"attack_buff",durationMs:5e3,amount:.5},vfx:"roar_purple"},{id:"heal",cooldownMs:12e3,damage:0,targets:"self",effect:{kind:"heal_pct",amount:.3},vfx:"heal_green"},{id:"enrage",cooldownMs:15e3,damage:0,targets:"self",effect:{kind:"speed_buff",durationMs:8e3,amount:.5},vfx:"rage_red"},{id:"shield",cooldownMs:14e3,damage:0,targets:"self",effect:{kind:"shield",amount:300},vfx:"shield_blue"}]}),Q=Object.freeze(Object.values(j).flat().reduce((t,e)=>(t[e.id]=e,t),{})),Ie=3,Re=1,Oe=5;function Pe(t){return Oe*2**t}const He=Object.freeze(["en","es","pt","ja","ko"]),se="en";function Be(t={}){const e={};for(const n of U){const a=ee[n],s=t[n]||0;e[n]=a.base+s*a.perPoint}return e}function Ne(t,e){const n=He.includes(t)?t:se,a=e[n]||e[se]||{},s=e[se]||{};function i(r,l){return l.split(".").reduce((f,c)=>f==null?f:f[c],r)}function d(r,l){return typeof r!="string"?r:Object.entries(l).reduce((f,[c,p])=>f.replaceAll(`{${c}}`,String(p)),r)}return{locale:n,t(r,l={}){const f=i(a,r)??i(s,r);return f==null?r:d(f,l)}}}const R="#1a1614",De="#3a342f",b=`fill="none" stroke="${R}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`,V=`fill="none" stroke="${De}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`,D=`fill="#fdfaf3" stroke="${R}" stroke-width="3.4" stroke-linejoin="round"`,qe="0 0 220 280";function je(){return`
    <filter id="sketchy" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="sketchy-alt" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  `}function Te(t,e,n,a=18,s=1){const i=e-a,d=e+a,r=6*s,l=2.2*s;return t==="defeated"?`
      <g data-part="eyes">
        <path d="M${i-r},${n-r} l${r*2},${r*2} M${i+r},${n-r} l${-r*2},${r*2}" ${b} />
        <path d="M${d-r},${n-r} l${r*2},${r*2} M${d+r},${n-r} l${-r*2},${r*2}" ${b} />
      </g>`:t==="happy"?`
      <g data-part="eyes">
        <path d="M${i-r},${n+1} q${r},-${r*1.3} ${r*2},0" ${b} />
        <path d="M${d-r},${n+1} q${r},-${r*1.3} ${r*2},0" ${b} />
      </g>`:t==="hurt"?`
      <g data-part="eyes">
        <path d="M${i-r},${n-r*.7} l${r*1.4},${r*.7} l${-r*1.4},${r*.7}" ${b} />
        <path d="M${d+r},${n-r*.7} l${-r*1.4},${r*.7} l${r*1.4},${r*.7}" ${b} />
      </g>`:`
    <g data-part="eyes">
      <g data-part="eye-left">
        <ellipse cx="${i}" cy="${n}" rx="${r}" ry="${r*1.05}" ${b} filter="url(#sketchy)" />
        <circle cx="${i+.6}" cy="${n+.4}" r="${l}" fill="${R}" />
      </g>
      <g data-part="eye-right">
        <ellipse cx="${d}" cy="${n}" rx="${r*.95}" ry="${r}" ${b} filter="url(#sketchy)" />
        <circle cx="${d-.4}" cy="${n+.6}" r="${l}" fill="${R}" />
      </g>
    </g>`}function _e(t,e,n,a=18){const s=e-a,i=e+a;return t==="angry"?`
      <g data-part="brows">
        <path d="M${s-8},${n-4} L${s+7},${n+3}" ${b} />
        <path d="M${i+8},${n-4} L${i-7},${n+3}" ${b} />
      </g>`:t==="worry"||t==="hurt"?`
      <g data-part="brows">
        <path d="M${s-7},${n+2} q7,-6 14,-1" ${b} />
        <path d="M${i+7},${n+2} q-7,-6 -14,-1" ${b} />
      </g>`:""}function X(t,e,n,a=28){if(t==="happy")return`<g data-part="mouth"><path d="M${e-a/2},${n} q${a/2},${a*.5} ${a},0" ${b} filter="url(#sketchy)" /></g>`;if(t==="hurt"||t==="worry")return`<g data-part="mouth"><path d="M${e-a/2},${n+4} q${a/2},-${a*.45} ${a},0" ${b} filter="url(#sketchy)" /></g>`;if(t==="defeated")return`<g data-part="mouth"><ellipse cx="${e}" cy="${n+2}" rx="${a*.25}" ry="${a*.18}" ${b} /></g>`;const s=5,i=a/s;let d=`M${e-a/2},${n}`;for(let r=0;r<s;r++)d+=` l${i/2},-4 l${i/2},4`;return`
    <g data-part="mouth">
      <rect x="${e-a/2-2}" y="${n-6}" width="${a+4}" height="12" rx="1.5" ${b} filter="url(#sketchy)" />
      <path d="${d}" ${b} />
    </g>`}function F(t,{cx:e,ey:n,my:a,gap:s=18,mw:i=28,by:d=null}){const r=d??n-13;return`
    <g data-part="head">
      ${_e(t,e,r,s)}
      ${Te(t,e,n,s)}
      ${X(t,e,a,i)}
    </g>`}function P(t,e,n,a,s){const i=a*Math.PI/180,d=t+Math.sin(i)*n,r=e+Math.cos(i)*n;return`
    <g data-part="arm-${s}" style="transform-origin:${t}px ${e}px">
      <line x1="${t}" y1="${e}" x2="${d.toFixed(1)}" y2="${r.toFixed(1)}" ${b} filter="url(#sketchy)" />
      <ellipse cx="${d.toFixed(1)}" cy="${r.toFixed(1)}" rx="4.5" ry="3" ${b} />
    </g>`}function J(t,e,n,a,s){const i=a*Math.PI/180,d=t+Math.sin(i)*n,r=e+Math.cos(i)*n,l=s==="l"?-3:3;return`
    <g data-part="leg-${s}" style="transform-origin:${t}px ${e}px">
      <line x1="${t}" y1="${e}" x2="${d.toFixed(1)}" y2="${r.toFixed(1)}" ${b} filter="url(#sketchy)" />
      <ellipse cx="${(d+l).toFixed(1)}" cy="${(r+2).toFixed(1)}" rx="8" ry="3.5" ${b} filter="url(#sketchy)" />
    </g>`}function G(t=208){return`
    <g data-part="legs">
      ${J(92,t,26,-15,"l")}
      ${J(128,t,26,20,"r")}
    </g>`}function Ue(t){return t==="normal"?"":t==="poison"?`
      <svg viewBox="0 0 220 280" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
        <g filter="url(#sketchy-alt)">
          <path d="M 70 220 q 2 10 0 18 q -2 -8 0 -18 z" fill="#9ec472" stroke="#1f3a14" stroke-width="2.0" />
          <path d="M 150 215 q 2 12 0 22 q -2 -10 0 -22 z" fill="#9ec472" stroke="#1f3a14" stroke-width="2.0" />
          <circle cx="60" cy="180" r="3" fill="none" stroke="#1f3a14" stroke-width="2.0" />
          <circle cx="170" cy="160" r="2.4" fill="none" stroke="#1f3a14" stroke-width="2.0" />
          <circle cx="180" cy="195" r="2" fill="none" stroke="#1f3a14" stroke-width="2.0" />
        </g>
      </svg>`:t==="fire"?`
      <svg viewBox="0 0 220 280" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
        <g style="animation:flame-flicker 0.4s steps(3) infinite" filter="url(#sketchy-alt)">
          <path d="M 80 50 q -4 -18 4 -26 q -1 12 7 16 q 5 -10 0 -20 q 10 10 5 26 z" fill="#ff8a3d" stroke="#5a1f10" stroke-width="2.2" />
          <path d="M 130 40 q -3 -14 3 -22 q -1 10 6 13 q 4 -8 0 -16 q 8 8 4 22 z" fill="#ffb066" stroke="#5a1f10" stroke-width="2.2" />
          <path d="M 110 30 q -2 -10 2 -16 q 0 8 4 10 q 2 -6 0 -12 q 6 6 2 16 z" fill="#ffd28a" stroke="#5a1f10" stroke-width="2.0" />
        </g>
      </svg>`:t==="ice"?`
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
      </svg>`:t==="shadow"?`
      <svg viewBox="0 0 220 280" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
        <g style="animation:wisp 2.4s ease-in-out infinite" filter="url(#sketchy-alt)">
          <path d="M 60 60 q 6 -10 0 -20 q -10 10 0 20" fill="none" stroke="#7a6a90" stroke-width="2.4" />
          <path d="M 160 50 q 8 -8 2 -18 q -12 8 -2 18" fill="none" stroke="#9080a8" stroke-width="2.2" />
          <path d="M 100 30 q 4 -10 -2 -16 q -8 8 2 16" fill="none" stroke="#7a6a90" stroke-width="2.0" />
        </g>
      </svg>`:""}const te={bean:{name:"Bean Guy",tagline:"Grumpy little kidney",defaultExpr:"angry",render(t){return`
        ${G(208)}
        <g data-part="body">
          <path d="M 70 90 C 55 60, 90 45, 110 50 C 125 53, 130 65, 138 60 C 155 50, 175 75, 168 110 C 165 130, 160 145, 165 165 C 170 195, 145 220, 110 218 C 75 220, 55 195, 60 165 C 65 140, 78 120, 70 90 Z" ${D} filter="url(#sketchy)" />
          <path d="M 105 178 l 5 6 l 5 -6" ${V} />
        </g>
        <g data-part="arms">
          ${P(66,140,22,-10,"l")}
          ${P(170,135,22,15,"r")}
        </g>
        <g data-part="head">
          <g data-part="hair">
            <path d="M 92 55 l 4 -10 l 5 8 l 5 -10 l 5 9 l 5 -8 l 4 10" ${b} />
          </g>
          ${_e(t,110,82,16)}
          ${Te(t,110,95,16)}
          ${X(t,112,130,32)}
        </g>`}},box:{name:"Box Head",tagline:"Furious cardboard cryptid",defaultExpr:"angry",render(t){return`
        ${G(214)}
        <g data-part="body">
          <rect x="55" y="60" width="115" height="160" rx="14" ${D} filter="url(#sketchy)" />
          <line x1="55" y1="105" x2="170" y2="105" ${V} />
        </g>
        <g data-part="arms">
          ${P(58,140,22,-25,"l")}
          ${P(170,140,22,25,"r")}
        </g>
        ${F(t,{cx:113,ey:140,my:175,gap:20,mw:32,by:122})}`}},egg:{name:"Worry Egg",tagline:"Anxious about everything",defaultExpr:"worry",render(t){return`
        ${G(210)}
        <g data-part="body">
          <path d="M 110 50 C 70 50, 40 130, 50 180 C 60 220, 160 220, 170 180 C 180 130, 150 50, 110 50 Z" ${D} filter="url(#sketchy)" />
          <path d="M 110 195 l 6 8 l -6 6 l 6 8" ${V} />
        </g>
        <g data-part="arms">
          ${P(56,150,22,-15,"l")}
          ${P(164,150,22,15,"r")}
        </g>
        ${F(t,{cx:110,ey:130,my:170,gap:14,mw:24,by:115})}`}},cloud:{name:"Cloud Moss",tagline:"Soft. Mostly harmless.",defaultExpr:"happy",render(t){return`
        <g data-part="legs">
          <line x1="100" y1="195" x2="92" y2="235" ${b} filter="url(#sketchy)" />
          <line x1="140" y1="195" x2="148" y2="235" ${b} filter="url(#sketchy)" />
          <ellipse cx="88" cy="238" rx="9" ry="3.5" ${b} filter="url(#sketchy)" />
          <ellipse cx="152" cy="238" rx="9" ry="3.5" ${b} filter="url(#sketchy)" />
        </g>
        <g data-part="body">
          <path d="M 50 130 C 35 110, 55 80, 80 90 C 85 65, 130 60, 140 85 C 165 70, 195 95, 185 125 C 210 130, 200 175, 175 180 C 165 210, 105 215, 80 195 C 50 195, 35 165, 50 130 Z" ${D} filter="url(#sketchy)" />
        </g>
        ${F(t,{cx:120,ey:138,my:175,gap:26,mw:30,by:120})}`}},spike:{name:"Spike Pup",tagline:"Stabby triangle goblin",defaultExpr:"angry",render(t){return`
        ${G(210)}
        <g data-part="body">
          <path d="M 60 200 L 110 60 L 160 200 Z" ${D} filter="url(#sketchy)" />
          <line x1="60" y1="200" x2="160" y2="200" ${b} />
        </g>
        ${F(t,{cx:110,ey:150,my:180,gap:16,mw:22,by:135})}`}},slug:{name:"Slug Nub",tagline:"Slow but emotionally available",defaultExpr:"worry",render(t){return`
        <g data-part="body">
          <path d="M 30 200 C 20 160, 40 120, 75 115 C 110 85, 165 95, 185 130 C 210 160, 200 215, 30 215 Z" ${D} filter="url(#sketchy)" />
          <path d="M 65 130 q 5 12 0 30" ${V} />
        </g>
        <g data-part="head">
          <line x1="78" y1="115" x2="70" y2="95" ${b} />
          <line x1="92" y1="113" x2="100" y2="93" ${b} />
          <circle cx="68" cy="92" r="3" fill="${R}" />
          <circle cx="102" cy="91" r="3" fill="${R}" />
          ${X(t,95,165,22)}
        </g>`}},lanky:{name:"Lanky Larry",tagline:"Tall idiot, kind heart",defaultExpr:"happy",render(t){return`
        <g data-part="legs">
          ${J(98,220,30,-8,"l")}
          ${J(122,220,30,8,"r")}
        </g>
        <g data-part="body">
          <rect x="80" y="80" width="60" height="150" rx="20" ${D} filter="url(#sketchy)" />
        </g>
        <g data-part="arms">
          ${P(82,110,30,-5,"l")}
          ${P(138,110,30,5,"r")}
        </g>
        ${F(t,{cx:110,ey:120,my:165,gap:14,mw:22,by:105})}`}},gloop:{name:"Gloop",tagline:"One-eyed potato man",defaultExpr:"angry",render(t){return`
        ${G(212)}
        <g data-part="body">
          <path d="M 60 100 C 50 60, 100 50, 110 60 C 130 55, 175 80, 170 130 C 165 175, 145 215, 110 218 C 75 215, 50 175, 60 100 Z" ${D} filter="url(#sketchy)" />
        </g>
        <g data-part="arms">
          ${P(60,145,22,-15,"l")}
          ${P(170,140,22,18,"r")}
        </g>
        <g data-part="head">
          ${t==="angry"?`
            <path d="M 92 100 L 130 105" ${b} />
          `:""}
          <g data-part="eyes">
            <ellipse cx="113" cy="125" rx="20" ry="22" ${b} filter="url(#sketchy)" />
            <circle cx="115" cy="128" r="8" fill="${R}" />
            <circle cx="118" cy="124" r="2.5" fill="#fdfaf3" />
          </g>
          ${X(t,113,175,30)}
        </g>`}}},xe=Object.freeze(Object.keys(te));function ze(t){return te[t]||null}function Fe(t,e={}){const n=te[t];if(!n)return"";const a=e.expr||n.defaultExpr,s=e.variant||"normal",i=e.anim?`anim-${e.anim}`:e.idle===!1?"":"anim-idle anim-blink",d=e.level||1;return`
    <div class="sprite-stage ${i}" data-variant="${s}" data-preset="${t}" style="position:relative;width:100%;height:100%;">
      <svg viewBox="${qe}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
        <defs>${je()}</defs>
        <g data-part="root">
          ${n.render(a)}
          ${Ge(d)}
        </g>
      </svg>
      ${Ue(s)}
    </div>`}function Ge(t){let e="";if(t>=3&&(e+=`<g class="brm-scars" filter="url(#sketchy-alt)">
      <path d="M 78 130 l 14 -8" ${b} />
      <path d="M 76 138 l 10 -2" ${b} />
      ${t>=6?`<path d="M 145 120 l -8 14 M 140 122 l -4 10" ${b} />`:""}
    </g>`),t>=5){const n=Math.min(1,(t-4)/6);e+=`<g class="brm-aura" style="pointer-events:none">
      <ellipse cx="110" cy="140" rx="100" ry="110" fill="none" stroke="#d56a3e" stroke-width="${(2+n*2).toFixed(1)}" stroke-dasharray="4 8" opacity="${(.55+n*.3).toFixed(2)}">
        <animateTransform attributeName="transform" type="rotate" from="0 110 140" to="360 110 140" dur="20s" repeatCount="indefinite" />
      </ellipse>
    </g>`}return t>=7&&(e+=`
      <g class="brm-crown" filter="url(#sketchy)">
        <path d="M 80 30 L 90 10 L 100 25 L 110 5 L 120 25 L 130 10 L 140 30 Z" fill="#fdfaf3" stroke="${R}" stroke-width="3" stroke-linejoin="round" />
        <circle cx="110" cy="16" r="3" fill="#d56a3e" stroke="${R}" stroke-width="1.6" />
      </g>
      <path class="brm-cape" d="M 50 70 q -20 60 -10 130 l 30 -8 q -8 -50 8 -110 z" fill="#c63d2f" stroke="${R}" stroke-width="3" filter="url(#sketchy)" opacity="0.92" />`),t>=10&&(e+=`<g class="brm-trophy" transform="translate(155 130)">
      <path d="M -8 0 l 0 -8 l 16 0 l 0 8 a 8 8 0 0 1 -16 0 z" fill="#e8b347" stroke="${R}" stroke-width="2" />
    </g>`),e}const Ce=Object.freeze(Object.fromEntries(Object.entries(te).map(([t,e])=>[t,{name:e.name,tagline:e.tagline,defaultExpr:e.defaultExpr}]))),Ke={cleave:"cleave",enrage:"enrage",frost_nova:"frost nova",heal:"heal",inferno:"inferno",lightning:"lightning",pierce:"pierce",poison_cloud:"poison cloud",roar:"roar",shield:"shield",slam:"slam",stomp:"stomp"},Ye={attack:["!attack","!atk","!a"],block:["!block","!b"],heal:["!heal","!h"],join:["!join","!fight"]},Ve={defeat:"Boss wins!",victory:"Chat wins!"},We={countdown:"Fight starts in {seconds}s",joining:"Type !join to fight!"},Ze={abandon_monster:"Start a new monster",ability_cooldown:"{seconds}s",abilityPower:"ability power",allocate_starting:"Allocate {points} starting points",attack:"attack power",confirm_monster:"Confirm",create_monster:"Create a new monster",crit:"crit chance",death_title:"Your monster has fallen",defense:"defense",graveyard_title:"Monster Graveyard",hp:"health",level_up_title:"Allocate {points} stat points",monster_name_placeholder:"Name your monster",open_lobby:"Open lobby",reroll_ability:"Reroll ({tokens} left)",revive:"Revive ({cost} legacy)",speed:"speed",start_lobby:"Open lobby"},Xe={boss_defeated:"{monsterName} has been defeated! Drops to: {names}",boss_victorious:"{monsterName} stands victorious. GG.",chatter_down:"{name} has fallen.",chatter_joined:"{name} joined the fight!",fight_starting:"The fight begins! Type !attack to fight, !heal to heal allies, !block to defend.",roster_full:"Roster full — try the next fight!"},Qe={abilities:Ke,commands:Ye,fight:Ve,lobby:We,panel:Ze,system_chat:Xe},Je={cleave:"tajo",enrage:"enfurecer",frost_nova:"nova de hielo",heal:"curar",inferno:"infierno",lightning:"rayo",pierce:"perforar",poison_cloud:"nube tóxica",roar:"rugido",shield:"escudo",slam:"golpe",stomp:"pisotón"},et={attack:["!atacar","!a"],block:["!bloquear","!b"],heal:["!curar","!c"],join:["!pelea","!unirse"]},tt={defeat:"¡El monstruo gana!",victory:"¡Chat gana!"},nt={countdown:"La pelea empieza en {seconds}s",joining:"¡Escribe !pelea para luchar!"},at={abandon_monster:"Empezar un nuevo monstruo",ability_cooldown:"{seconds}s",abilityPower:"poder de habilidad",allocate_starting:"Asigna {points} puntos iniciales",attack:"poder de ataque",confirm_monster:"Confirmar",create_monster:"Crear un nuevo monstruo",crit:"prob. crítico",death_title:"Tu monstruo ha caído",defense:"defensa",graveyard_title:"Cementerio de monstruos",hp:"salud",level_up_title:"Asigna {points} puntos de stats",monster_name_placeholder:"Nombra a tu monstruo",open_lobby:"Abrir sala",reroll_ability:"Reroll ({tokens} restantes)",revive:"Revivir ({cost} de legado)",speed:"velocidad",start_lobby:"Abrir sala"},st={boss_defeated:"¡{monsterName} ha sido derrotado! Botín para: {names}",boss_victorious:"{monsterName} sigue en pie. GG.",chatter_down:"{name} ha caído.",chatter_joined:"¡{name} se unió a la pelea!",fight_starting:"¡Comienza la pelea! Escribe !atacar para luchar, !curar para sanar, !bloquear para defenderte.",roster_full:"Sala llena — ¡intenta en la próxima!"},ot={abilities:Je,commands:et,fight:tt,lobby:nt,panel:at,system_chat:st},rt={cleave:"talho",enrage:"enfurecer",frost_nova:"nova de gelo",heal:"curar",inferno:"inferno",lightning:"raio",pierce:"perfurar",poison_cloud:"nuvem tóxica",roar:"rugido",shield:"escudo",slam:"porrada",stomp:"pisotão"},it={attack:["!atacar","!a"],block:["!bloquear","!b"],heal:["!curar","!c"],join:["!entrar","!luta"]},lt={defeat:"Monstro venceu!",victory:"Chat venceu!"},dt={countdown:"Luta começa em {seconds}s",joining:"Digite !entrar pra lutar!"},ct={abandon_monster:"Começar um novo monstro",ability_cooldown:"{seconds}s",abilityPower:"poder de habilidade",allocate_starting:"Distribua {points} pontos iniciais",attack:"poder de ataque",confirm_monster:"Confirmar",create_monster:"Criar um novo monstro",crit:"chance de crítico",death_title:"Seu monstro caiu",defense:"defesa",graveyard_title:"Cemitério de monstros",hp:"vida",level_up_title:"Distribua {points} pontos de stats",monster_name_placeholder:"Nomeie seu monstro",open_lobby:"Abrir sala",reroll_ability:"Trocar ({tokens} restantes)",revive:"Reviver ({cost} de legado)",speed:"velocidade",start_lobby:"Abrir sala"},pt={boss_defeated:"{monsterName} foi derrotado! Drop pra: {names}",boss_victorious:"{monsterName} segue de pé. GG.",chatter_down:"{name} caiu.",chatter_joined:"{name} entrou na luta!",fight_starting:"Bora! !atacar pra atacar, !curar pra curar, !bloquear pra defender.",roster_full:"Sala lotada — entra na próxima!"},ft={abilities:rt,commands:it,fight:lt,lobby:dt,panel:ct,system_chat:pt},ht={cleave:"なぎ払い",enrage:"激怒",frost_nova:"フロストノヴァ",heal:"回復",inferno:"インフェルノ",lightning:"雷撃",pierce:"貫通",poison_cloud:"毒霧",roar:"咆哮",shield:"シールド",slam:"叩きつけ",stomp:"踏みつけ"},ut={attack:["!こうげき","!a"],block:["!ぼうぎょ","!b"],heal:["!かいふく","!h"],join:["!さんか","!fight"]},mt={defeat:"ボスの勝ち！",victory:"チャットの勝ち！"},gt={countdown:"あと{seconds}秒で開始",joining:"!さんか でバトル参加！"},bt={abandon_monster:"新しいモンスターを作る",ability_cooldown:"{seconds}秒",abilityPower:"アビリティ威力",allocate_starting:"{points}ポイントを配分",attack:"攻撃力",confirm_monster:"決定",create_monster:"モンスター作成",crit:"クリ率",death_title:"モンスターが倒れた",defense:"防御",graveyard_title:"モンスター墓場",hp:"HP",level_up_title:"{points}ポイントを振り分け",monster_name_placeholder:"モンスター名",open_lobby:"ロビーを開く",reroll_ability:"リロール（残り{tokens}）",revive:"復活（レガシー{cost}）",speed:"速さ",start_lobby:"ロビーを開く"},yt={boss_defeated:"{monsterName}を倒した！戦利品：{names}",boss_victorious:"{monsterName}は健在。GG。",chatter_down:"{name}がやられた。",chatter_joined:"{name}参戦！",fight_starting:"戦闘開始！!こうげき で攻撃、!かいふく で回復、!ぼうぎょ で防御。",roster_full:"枠がいっぱい — 次回に！"},$t={abilities:ht,commands:ut,fight:mt,lobby:gt,panel:bt,system_chat:yt},vt={cleave:"베기",enrage:"분노",frost_nova:"서리 노바",heal:"회복",inferno:"인페르노",lightning:"번개",pierce:"관통",poison_cloud:"독구름",roar:"포효",shield:"보호막",slam:"내려찍기",stomp:"짓밟기"},kt={attack:["!공격","!a"],block:["!방어","!b"],heal:["!힐","!h"],join:["!참가","!fight"]},Tt={defeat:"보스 승리!",victory:"채팅 승리!"},_t={countdown:"{seconds}초 후 시작",joining:"!참가 입력해서 같이 싸우자!"},xt={abandon_monster:"새 몬스터 만들기",ability_cooldown:"{seconds}초",abilityPower:"스킬 위력",allocate_starting:"시작 포인트 {points}개 분배",attack:"공격력",confirm_monster:"확인",create_monster:"새 몬스터 생성",crit:"치명타 확률",death_title:"몬스터가 쓰러졌다",defense:"방어력",graveyard_title:"몬스터 무덤",hp:"체력",level_up_title:"스탯 포인트 {points}개 분배",monster_name_placeholder:"몬스터 이름",open_lobby:"로비 열기",reroll_ability:"리롤 ({tokens} 남음)",revive:"부활 (레거시 {cost})",speed:"속도",start_lobby:"로비 열기"},Ct={boss_defeated:"{monsterName} 처치! 드롭: {names}",boss_victorious:"{monsterName}는 아직 건재. GG.",chatter_down:"{name} 쓰러짐.",chatter_joined:"{name} 참전!",fight_starting:"전투 시작! !공격 으로 공격, !힐 로 회복, !방어 로 방어.",roster_full:"로비 꽉 참 — 다음에 다시 시도!"},Lt={abilities:vt,commands:kt,fight:Tt,lobby:_t,panel:xt,system_chat:Ct},wt={en:Qe,es:ot,pt:ft,ja:$t,ko:Lt};function Et(){var n;const e=new URLSearchParams(((n=globalThis.location)==null?void 0:n.search)||"").get("lang")||"en";return Ne(e,wt)}const Mt={creation:"Creation",idle:"Idle",lobby:"Lobby open",fight:"Fight",results:"Results",level_up:"Victory — level up",death:"Defeated"};function St({phase:t,me:e,connected:n,ircStatus:a="connected",onGraveyard:s,onLogout:i}){const d=o("div","topbar");return d.innerHTML=`
    <div class="brand">BossRaid<small>v0.4</small></div>
    <span class="phase-chip"><span class="blip"></span>${(Mt[t]||t||"").toUpperCase()}</span>
    <span style="flex:1"></span>
    <span class="who">@${E((e==null?void 0:e.login)||"demo")}</span>
    <span class="conn-pill ${n?"":"bad"}"><span class="dot"></span>${n?"live":"reconnecting…"}</span>
    <button class="btn tiny ghost" data-act="graveyard">🪦 graveyard</button>
    <button class="btn tiny ghost" data-act="logout">sign out</button>
  `,d.querySelector('[data-act="graveyard"]').addEventListener("click",()=>s==null?void 0:s()),d.querySelector('[data-act="logout"]').addEventListener("click",()=>i==null?void 0:i()),d}class At{constructor(){this.root=o("div","pulse-ribbon"),this.row=o("div","pulse-row"),this.root.appendChild(this.row),this.messages=[],this.cap=32,this.seed()}seed(){const e=["kelp_lord !attack","vapor !join","mr_jam !heal","linda44 !attack","glub !block"];for(const n of e){const[a,s]=n.split(" ");this.messages.push({who:a,cmd:s})}this.render()}push({login:e,action:n}){if(!n)return;const a="!"+n;this.messages.push({who:e,cmd:a}),this.messages.length>this.cap&&this.messages.shift(),this.render()}render(){const e=this.messages.concat(this.messages).map(n=>`<span class="pulse-msg"><span class="who">${E(n.who)}</span><span class="cmd">${E(n.cmd)}</span></span>`).join("");this.row.innerHTML=e}}function o(t,e){const n=document.createElement(t);return e&&(n.className=e),n}function E(t){return String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}const It="0 0 220 280",x="#1a1614",Rt="#3a342f",O="#fdfaf3",y=`fill="none" stroke="${x}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`,q=`fill="none" stroke="${Rt}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`,H=`fill="${O}" stroke="${x}" stroke-width="3.4" stroke-linejoin="round"`;function Ot(){return`<defs>
    <filter id="brm-wobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
      <feDisplacementMap in="SourceGraphic" scale="1.6" />
    </filter>
    <filter id="brm-wobble-thin" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" />
      <feDisplacementMap in="SourceGraphic" scale="1.2" />
    </filter>
  </defs>`}const me={blob:{anchors:{eyes:[110,130],mouth:[110,175],horns:[110,70],arms:[[60,150],[160,150]],feet:[110,240]},render:t=>`
      <path d="M 60 90 C 40 70, 90 50, 110 80 C 130 50, 180 70, 170 110 C 195 150, 170 220, 110 215 C 60 220, 25 165, 60 90 Z" ${H} />
      <ellipse cx="86" cy="135" rx="14" ry="9" fill="${t.accent}" opacity="0.32" />
    `},lump:{anchors:{eyes:[110,120],mouth:[110,165],horns:[110,60],arms:[[58,160],[162,160]],feet:[110,240]},render:t=>`
      <path d="M 110 60 C 70 60, 50 130, 60 195 C 65 230, 155 230, 160 195 C 170 130, 150 60, 110 60 Z" ${H} />
      <path d="M 88 142 q 8 -4 18 0" ${q} />
      <ellipse cx="84" cy="155" rx="11" ry="7" fill="${t.accent}" opacity="0.32" />
    `},stack:{anchors:{eyes:[110,105],mouth:[110,135],horns:[110,50],arms:[[60,200],[160,200]],feet:[110,245]},render:t=>`
      <rect x="56" y="70" width="108" height="80" rx="14" ${H} />
      <rect x="46" y="160" width="128" height="80" rx="14" ${H} />
      <line x1="56" y1="150" x2="164" y2="150" ${q} />
      <ellipse cx="78" cy="195" rx="12" ry="7" fill="${t.accent}" opacity="0.32" />
    `}},oe={googly:(t,e)=>`
    <g class="brm-eyes">
      <circle cx="${t-14}" cy="${e}" r="8" ${y} />
      <circle cx="${t+14}" cy="${e}" r="8" ${y} />
      <circle cx="${t-13}" cy="${e+1}" r="2.6" fill="${x}" />
      <circle cx="${t+15}" cy="${e+1}" r="2.6" fill="${x}" />
      <path d="M ${t-22} ${e-12} q 12 6 22 0" ${y} />
      <path d="M ${t+8} ${e-12} q 12 6 22 0" ${y} />
    </g>
  `,beady:(t,e)=>`
    <g class="brm-eyes">
      <circle cx="${t-12}" cy="${e}" r="3.2" fill="${x}" />
      <circle cx="${t+12}" cy="${e}" r="3.2" fill="${x}" />
      <path d="M ${t-22} ${e-12} q 12 -4 22 0" ${y} />
      <path d="M ${t+8} ${e-12} q -12 -4 22 0" ${y} />
    </g>
  `,cyclops:(t,e)=>`
    <g class="brm-eyes">
      <circle cx="${t}" cy="${e}" r="14" ${y} />
      <circle cx="${t+2}" cy="${e+1}" r="4" fill="${x}" />
      <circle cx="${t+4}" cy="${e-2}" r="1.5" fill="${O}" />
      <path d="M ${t-18} ${e-18} q 18 -4 36 0" ${y} />
    </g>
  `},re={fangs:(t,e)=>`
    <g class="brm-mouth">
      <path d="M ${t-22} ${e} q 22 14 44 0 q -22 16 -44 0 z" fill="${x}" stroke="${x}" stroke-width="2.4" stroke-linejoin="round" />
      <path d="M ${t-8} ${e+2} l 2 8 l 4 -8 z" fill="${O}" stroke="${x}" stroke-width="1.6" />
      <path d="M ${t+4} ${e+2} l 2 8 l 4 -8 z" fill="${O}" stroke="${x}" stroke-width="1.6" />
    </g>
  `,underbite:(t,e)=>`
    <g class="brm-mouth">
      <path d="M ${t-22} ${e} q 22 4 44 0" ${y} />
      <rect x="${t-9}" y="${e+1}" width="6" height="9" rx="1" fill="${O}" stroke="${x}" stroke-width="2" />
      <rect x="${t+3}" y="${e+1}" width="6" height="9" rx="1" fill="${O}" stroke="${x}" stroke-width="2" />
    </g>
  `,grin:(t,e)=>`
    <g class="brm-mouth">
      <path d="M ${t-24} ${e-2} q 24 22 48 -2" ${y} />
      <path d="M ${t-16} ${e+6} q 16 6 32 0" ${q} />
    </g>
  `},ie={nubs:(t,e)=>`
    <g class="brm-horns">
      <path d="M ${t-18} ${e+6} q -3 -16 9 -18 q 8 0 8 14" ${y} />
      <path d="M ${t+18} ${e+6} q 3 -16 -9 -18 q -8 0 -8 14" ${y} />
    </g>
  `,curly:(t,e)=>`
    <g class="brm-horns">
      <path d="M ${t-14} ${e+6} Q ${t-28} ${e-8}, ${t-22} ${e-22} Q ${t-12} ${e-28}, ${t-12} ${e-14}" ${y} />
      <path d="M ${t+14} ${e+6} Q ${t+28} ${e-8}, ${t+22} ${e-22} Q ${t+12} ${e-28}, ${t+12} ${e-14}" ${y} />
    </g>
  `,antennae:(t,e,n)=>`
    <g class="brm-horns">
      <path d="M ${t-10} ${e+4} q -8 -16 -16 -32" ${y} />
      <path d="M ${t+10} ${e+4} q 8 -16 16 -32" ${y} />
      <circle cx="${t-26}" cy="${e-28}" r="5" fill="${n.accent}" stroke="${x}" stroke-width="2.4" />
      <circle cx="${t+26}" cy="${e-28}" r="5" fill="${n.accent}" stroke="${x}" stroke-width="2.4" />
    </g>
  `},le={stubs:t=>{const[[e,n],[a,s]]=t;return`
      <g class="brm-arms">
        <line x1="${e}" y1="${n}" x2="${e-22}" y2="${n+18}" ${y} />
        <line x1="${a}" y1="${s}" x2="${a+22}" y2="${s+18}" ${y} />
        <circle cx="${e-22}" cy="${n+18}" r="4" fill="${O}" stroke="${x}" stroke-width="2.4" />
        <circle cx="${a+22}" cy="${s+18}" r="4" fill="${O}" stroke="${x}" stroke-width="2.4" />
      </g>
    `},noodle:t=>{const[[e,n],[a,s]]=t;return`
      <g class="brm-arms">
        <path d="M ${e} ${n} q -22 14 -10 32 q 14 10 -4 26" ${y} />
        <path d="M ${a} ${s} q 22 14 10 32 q -14 10 4 26" ${y} />
        <circle cx="${e-14}" cy="${n+58}" r="4" fill="${O}" stroke="${x}" stroke-width="2.4" />
        <circle cx="${a+14}" cy="${s+58}" r="4" fill="${O}" stroke="${x}" stroke-width="2.4" />
      </g>
    `},crab:t=>{const[[e,n],[a,s]]=t;return`
      <g class="brm-arms">
        <line x1="${e}" y1="${n}" x2="${e-14}" y2="${n+16}" ${y} />
        <path d="M ${e-12} ${n+14} L ${e-26} ${n+10} L ${e-22} ${n+22} L ${e-28} ${n+22} L ${e-22} ${n+30} L ${e-12} ${n+26} Z" ${H} />
        <line x1="${a}" y1="${s}" x2="${a+14}" y2="${s+16}" ${y} />
        <path d="M ${a+12} ${s+14} L ${a+26} ${s+10} L ${a+22} ${s+22} L ${a+28} ${s+22} L ${a+22} ${s+30} L ${a+12} ${s+26} Z" ${H} />
      </g>
    `}},de={paws:(t,e)=>`
    <g class="brm-feet">
      <line x1="${t-18}" y1="${e-30}" x2="${t-18}" y2="${e-4}" ${y} />
      <line x1="${t+18}" y1="${e-30}" x2="${t+18}" y2="${e-4}" ${y} />
      <ellipse cx="${t-18}" cy="${e}" rx="13" ry="5" ${H} />
      <ellipse cx="${t+18}" cy="${e}" rx="13" ry="5" ${H} />
    </g>
  `,tentacles:(t,e)=>`
    <g class="brm-feet">
      <path d="M ${t-26} ${e-30} q -6 18 0 32 q 6 6 14 4" ${y} />
      <path d="M ${t} ${e-30} q -6 22 4 36" ${y} />
      <path d="M ${t+26} ${e-30} q 6 18 0 32 q -6 6 -14 4" ${y} />
    </g>
  `,wheels:(t,e)=>`
    <g class="brm-feet">
      <circle cx="${t-22}" cy="${e-4}" r="12" ${H} />
      <circle cx="${t+22}" cy="${e-4}" r="12" ${H} />
      <line x1="${t-32}" y1="${e-4}" x2="${t-12}" y2="${e-4}" ${q} />
      <line x1="${t-22}" y1="${e-14}" x2="${t-22}" y2="${e+6}" ${q} />
      <line x1="${t+12}" y1="${e-4}" x2="${t+32}" y2="${e-4}" ${q} />
      <line x1="${t+22}" y1="${e-14}" x2="${t+22}" y2="${e+6}" ${q} />
      <circle cx="${t-22}" cy="${e-4}" r="2.4" fill="${x}" />
      <circle cx="${t+22}" cy="${e-4}" r="2.4" fill="${x}" />
    </g>
  `};function Pt(t,e){if(t<5)return"";const n=Math.min(1,(t-4)/6),a=e.accent||"#d56a3e",s=t>=8?Array.from({length:6},(i,d)=>{const r=110+Math.cos(d*1.04)*95,l=140+Math.sin(d*1.04)*100;return`<circle cx="${r.toFixed(1)}" cy="${l.toFixed(1)}" r="3" fill="${a}" opacity="0.75" />`}).join(""):"";return`
    <g class="brm-aura" style="pointer-events:none">
      <ellipse cx="110" cy="140" rx="100" ry="110"
        fill="none" stroke="${a}" stroke-width="${(2+n*2).toFixed(1)}"
        stroke-dasharray="4 8" opacity="${(.55+n*.3).toFixed(2)}">
        <animateTransform attributeName="transform" type="rotate"
          from="0 110 140" to="360 110 140" dur="20s" repeatCount="indefinite" />
      </ellipse>
      ${s}
    </g>
  `}function Ht(t){return t<3?"":`
    <g class="brm-scars" filter="url(#brm-wobble-thin)">
      <path d="M 80 130 l 14 -8" ${y} />
      <path d="M 78 138 l 10 -2" ${y} />
      ${t>=6?`<path d="M 145 120 l -8 14 M 140 122 l -4 10" ${y} />`:""}
      ${t>=9?`<path d="M 100 175 l 18 4" ${y} />`:""}
    </g>
  `}function Bt(t){if(t<4)return"";const e=t>=4?`
    <g class="brm-crown" filter="url(#brm-wobble)">
      <path d="M 80 50 L 90 30 L 100 45 L 110 25 L 120 45 L 130 30 L 140 50 Z"
        fill="${O}" stroke="${x}" stroke-width="3" stroke-linejoin="round" />
      <circle cx="110" cy="36" r="3" fill="#d56a3e" stroke="${x}" stroke-width="1.6" />
    </g>
  `:"",n=t>=7?`
    <path class="brm-cape" d="M 60 80 q -20 60 -10 130 l 30 -8 q -8 -50 8 -110 z"
      fill="#c63d2f" stroke="${x}" stroke-width="3" filter="url(#brm-wobble)" opacity="0.92" />
  `:"",a=t>=10?`
    <g class="brm-trophy" transform="translate(150 130)">
      <path d="M -8 0 l 0 -8 l 16 0 l 0 8 a 8 8 0 0 1 -16 0 z" fill="#e8b347" stroke="${x}" stroke-width="2" />
    </g>
  `:"";return e+n+a}function fe(t={},e={}){var u,h,m,g,$;if(t.presetKey&&ze(t.presetKey))return Fe(t.presetKey,{expr:t.expr,variant:t.variant,idle:e.idle,anim:e.anim,level:e.level||1});const n=W[(t.paletteIdx||0)%W.length]||W[0],a=me[t.body]||me.blob,s=e.className?` class="${e.className}"`:"",i=e.idle===!1?"":" brm-idle",d=e.level||1,r=((u=de[t.feet])==null?void 0:u.call(de,...a.anchors.feet,n))??"",l=((h=le[t.arms])==null?void 0:h.call(le,a.anchors.arms,n))??"",f=((m=re[t.mouth])==null?void 0:m.call(re,...a.anchors.mouth,n))??"",c=((g=oe[t.eyes])==null?void 0:g.call(oe,...a.anchors.eyes,n))??"",p=(($=ie[t.horns])==null?void 0:$.call(ie,...a.anchors.horns,n))??"";return`<svg viewBox="${It}" xmlns="http://www.w3.org/2000/svg"${s}>
    ${Ot()}
    ${Pt(d,n)}
    <g class="brm-monster${i}" filter="url(#brm-wobble)">
      ${r}
      ${a.render(n)}
      ${l}
      ${f}
      ${c}
      ${p}
    </g>
    ${Ht(d)}
    ${Bt(d)}
  </svg>`}const Nt=Object.freeze({body:"blob",eyes:"googly",mouth:"fangs",horns:"antennae",arms:"noodle",feet:"tentacles",paletteIdx:4});function K({left:t,center:e,right:n}){const a=o("div","dash"),s=o("div","dash-col");s.appendChild(t);const i=o("div","dash-col center");i.appendChild(e.stage),e.overlays&&i.appendChild(e.overlays);const d=o("div","dash-col");return d.appendChild(n),a.append(s,i,d),a}function Y(t,e={}){const n=o("div");n.style.cssText="flex:1;display:flex;align-items:center;justify-content:center;position:relative;width:100%;";const a=o("div");a.style.cssText="width: min(72%, 460px); aspect-ratio: 0.78; position: relative;",a.innerHTML=fe(t||Nt,e);const s=a.firstElementChild;return s&&(s.style.cssText="width:100%;height:100%;display:block;"),n.appendChild(a),{stage:n,sprite:a}}function ne(t,e){if(!e||e.status==="dead")return"death";switch(t){case T.LOBBY:return"walk";case T.FIGHT:return"idle";case T.RESULTS:return"idle";case T.LEVEL_UP:return"idle";case T.DEATH:return"death";case T.CREATION:return"spawn";case T.IDLE:default:return"idle"}}function Dt(t,e={}){const n=o("div","banner-strip");return n.style.cssText=`position:absolute;top:18px;left:50%;transform:translateX(-50%) rotate(-0.6deg);${e.style||""}`,n.textContent=t,n}function qt(t,e){t.innerHTML="";const n=e.state.monster,a=n?Pe(n.timesRevived||0):0,s=e.legacyPoints??0,i=(()=>{const c=o("div");return c.innerHTML=`
      <h4>Run summary</h4>
      <div class="stat-block"><span>peak level</span><span class="val">${(n==null?void 0:n.peakLevel)||(n==null?void 0:n.level)||1}</span></div>
      <div class="stat-block"><span>total wins</span><span class="val">${(n==null?void 0:n.wins)||0}</span></div>
      <div class="stat-block"><span>times revived</span><span class="val">${(n==null?void 0:n.timesRevived)||0}</span></div>
      <div class="stat-block"><span>legacy balance</span><span class="val">${s}</span></div>
    `,c})(),d=(()=>{const c=o("div");c.innerHTML="<h4>Choose your fate</h4>";const p=o("p");p.style.cssText="font-family:var(--font-marker);font-size:13px;color:var(--ink-2);margin:0;",p.textContent=`Revive comes back at half max HP. Costs ${a} legacy point${a===1?"":"s"}.`,c.appendChild(p);const u=o("button","btn primary giant");u.style.cssText="align-self:stretch;margin-top:8px;",u.textContent=`Revive (${a})`,u.disabled=s<a,u.addEventListener("click",()=>e.send(C.REVIVE_MONSTER,{})),c.appendChild(u);const h=o("button","btn danger");return h.textContent="✗ start a new monster",h.addEventListener("click",()=>e.send(C.ABANDON_MONSTER,{})),c.appendChild(h),c})(),{stage:r}=Y(n==null?void 0:n.appearance,{level:(n==null?void 0:n.level)||1,anim:"death"}),l=o("div"),f=o("div");f.style.cssText="position:absolute;top:50%;left:50%;transform:translate(-50%, -90%);text-align:center;",f.innerHTML=`<h1 class="banner big defeat">${E(n==null?void 0:n.name)||"Your monster"} has fallen.</h1>`,l.appendChild(f),t.appendChild(K({left:i,center:{stage:r,overlays:l},right:d}))}function jt(t,e){t.innerHTML="";const n=e.state.monster;if(!n)return;const a=Ut(e),s=Ft(e),d=(e.state.events||[]).some(f=>f.kind==="BOSS_ABILITY"||f.kind==="BOSS_BASIC_ATTACK"||f.kind==="BOSS_CRIT")?"attack":ne(e.state.phase,n),{stage:r}=Y(n.appearance,{level:n.level||1,anim:d}),l=zt(e);t.appendChild(K({left:a,center:{stage:r,overlays:l},right:s}))}function Ut(t){var r;const e=o("div");e.innerHTML="<h4>Top damage</h4>";const n=[...t.state.chatters||[]].sort((l,f)=>f.damageDealt-l.damageDealt).slice(0,6);for(const l of n){const f=o("div","stat-block"),c=l.pfpUrl||`https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(l.login)}&backgroundType=solid&backgroundColor=fdfaf3`;f.innerHTML=`<span class="pfp-row"><span class="pfp-mini"><img src="${E(c)}" alt="" loading="lazy"/></span><span style="color:var(--accent-3)">${E(l.login)}</span></span><span class="val">${l.damageDealt||0}</span>`,e.appendChild(f)}if(!n.length){const l=o("p");l.style.cssText="font-family:var(--font-marker);color:var(--ink-2);font-size:13px;margin:0;",l.textContent="no damage yet — hold tight",e.appendChild(l)}const a=o("h4");a.style.marginTop="12px",a.textContent="Pulse",e.appendChild(a);const s=o("div","stat-block");s.innerHTML=`<span>active joiners</span><span class="val">${((r=t.state.chatters)==null?void 0:r.length)||0}</span>`;const i=o("div","stat-block"),d=(t.state.chatters||[]).reduce((l,f)=>l+(f.damageDealt||0),0);return i.innerHTML=`<span>damage taken</span><span class="val">${d}</span>`,e.append(s,i),e}function zt(t){var u;const e=o("div");e.style.cssText="position:absolute;inset:0;pointer-events:none;";const n=o("div");n.style.cssText="position:absolute;top:18px;left:6%;right:6%;";const a=o("div");a.style.cssText="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px;";const s=t.state.monster;a.innerHTML=`
    <span style="font-family:var(--font-hand);font-size:24px">${E((s==null?void 0:s.name)||"")}</span>
    <span class="lvl-badge">Lv ${(s==null?void 0:s.level)||1} · ${(s==null?void 0:s.wins)||0} wins</span>
  `,n.appendChild(a);const i=o("div","hpbar"),d=t.state.maxBossHP>0?t.state.bossHP/t.state.maxBossHP*100:0,r=o("div","fill");r.style.width=d+"%";const l=o("div","pips");for(let h=0;h<10;h++)l.appendChild(o("i"));const f=o("div","label");f.textContent=`${Math.round(t.state.bossHP||0)} / ${Math.round(t.state.maxBossHP||0)} HP`,i.append(r,l,f),n.appendChild(i),e.appendChild(n);const c=o("div");c.style.cssText="position:absolute;top:14px;right:14px;text-align:center;",c.innerHTML=`
    <div class="timer-label">TIME LEFT</div>
    <div class="timer">${Yt(t.state.timeLeftMs||0)}</div>
  `,e.appendChild(c);for(const[h,m]of(t.state.events||[]).slice(-4).entries())if(m.kind==="CHATTER_ATTACK"||m.kind==="BOSS_BASIC_ATTACK"||m.kind==="BOSS_CRIT"||m.kind==="BOSS_ABILITY"){const g=m.dmg||m.damageDealt;if(!g)continue;const $=m.kind==="BOSS_CRIT",v=m.kind==="CHATTER_ATTACK"||m.kind==="BOSS_ABILITY",M=Kt(h),S=o("div","flying-num");S.style.cssText=`top:${M.top};left:${M.left};font-size:${$?44:v?36:28}px;color:${$?"var(--hp)":v?"var(--accent)":"var(--ink)"};transform:rotate(${M.rot}deg);`,S.textContent=$?`CRIT −${g}`:`−${g}`,e.appendChild(S)}const p=o("div","lurker-ribbon");return p.innerHTML=`type <span class="cmd-sample">!attack</span> to join · ${((u=t.state.chatters)==null?void 0:u.length)||0} fighting`,e.appendChild(p),e}function Ft(t){var l;const e=o("div");e.innerHTML=`
    <h4>Streamer cast</h4>
    <p style="font-family:var(--font-marker);font-size:13px;color:var(--ink-2);margin:0;">
      Hit your monster's specials — overlay reacts.
    </p>
  `;const n=o("div","ability-grid"),a=t.state.monster,s=(a==null?void 0:a.abilityIds)||[];for(let f=0;f<3;f++){const c=s[f],p=c?Q[c]:null,u=(l=t.state.cooldowns)==null?void 0:l[f],h=(u==null?void 0:u.remainingMs)||0,m=(p==null?void 0:p.cooldownMs)||1,g=h>0?1-h/m:1,$=!p||t.state.phase!==T.FIGHT||h>0?"1":"0",v=o("div","ability");v.dataset.disabled=$,v.innerHTML=`
      ${Gt(g,h>0?Math.ceil(h/1e3)+"s":"✓")}
      <span class="name">${p?p.id.replace("_"," "):"—"}</span>
      <span class="meta">${p?p.damage>0?"dmg "+p.damage:"utility":"empty"}</span>
      <span class="key">${["Q","W","E"][f]}</span>
    `,v.addEventListener("click",()=>{$!=="1"&&t.send(C.CAST_ABILITY,{slot:f})}),n.appendChild(v)}e.appendChild(n);const i=o("h4");i.style.marginTop="12px",i.textContent="OBS preview",e.appendChild(i);const d=o("div");d.style.cssText="background:transparent;border:2.4px dashed var(--ink-2);border-radius:8px;padding:10px;font-family:var(--font-marker);font-size:13px;color:var(--ink-2);",d.innerHTML='transparent · 1920×1080<br><span style="color:var(--accent-2)">● live</span> on Browser Source',e.appendChild(d);const r=o("button","btn ghost tiny");return r.style.marginTop="8px",r.textContent="⏹ force end fight",r.addEventListener("click",()=>t.send(C.END_FIGHT_FORCE,{})),e.appendChild(r),e}function Gt(t,e){const n=2*Math.PI*18;return`<svg class="cooldown-ring" viewBox="0 0 44 44">
    <circle cx="22" cy="22" r="18" fill="none" stroke="#e5dfd0" stroke-width="4" />
    <circle cx="22" cy="22" r="18" fill="none" stroke="#d56a3e" stroke-width="4"
      stroke-linecap="round"
      stroke-dasharray="${n}" stroke-dashoffset="${n*(1-t)}"
      transform="rotate(-90 22 22)" />
    <text x="22" y="26" text-anchor="middle" font-family="Kalam, cursive" font-size="13" fill="#1a1614">${E(e)}</text>
  </svg>`}function Kt(t){const e=[{top:"24%",left:"32%",rot:-8},{top:"40%",left:"70%",rot:6},{top:"60%",left:"24%",rot:-4},{top:"32%",left:"60%",rot:4}];return e[t%e.length]}function Yt(t){if(!t||t<0)return"0:00";const e=Math.ceil(t/1e3);return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}async function Vt(t,e){t.innerHTML=`
    <div class="dash-single">
      <h2 style="font-family:var(--font-hand);font-weight:700;font-size:36px;margin:0">Loading graveyard…</h2>
    </div>
  `;let n;try{const r=await fetch("/api/graveyard");if(!r.ok)throw new Error("http_"+r.status);n=await r.json()}catch{n={monsters:e.demoGraveyard||Wt()}}const a=n.monsters||[];t.innerHTML="";const s=o("div","dash-single"),i=o("div");i.style.cssText="display:flex;justify-content:space-between;align-items:flex-start;",i.innerHTML=`
    <div>
      <span class="banner-strip">memorial wall</span>
      <h2 style="font-family:var(--font-hand);font-weight:700;font-size:38px;margin:6px 0 0">Monster Graveyard</h2>
      <p style="font-family:var(--font-marker);font-size:14px;color:var(--ink-2);margin:4px 0 0">${a.length} past monster${a.length===1?"":"s"}</p>
    </div>
  `;const d=o("button","btn ghost");if(d.textContent="← back",d.addEventListener("click",()=>{e.showGraveyard=!1,e.rerender()}),i.appendChild(d),s.appendChild(i),a.length){const r=o("div","graveyard-grid");for(const l of a){const f=o("div","tomb"),c=l.diedAt?new Date(l.diedAt).toLocaleDateString():"retired",p=o("div");p.innerHTML=fe(l.appearance,{idle:!1,level:l.peakLevel||l.level||1}),f.append(p);const u=o("h3");u.textContent=l.name,f.appendChild(u);const h=o("div","meta");h.textContent=`${l.status==="dead"?`Lv ${l.peakLevel||l.level}`:"retired"} · ${l.wins||0} wins`;const m=o("div","meta");if(m.textContent=l.status==="dead"?"🪦 "+E(c):"🪶 retired",f.append(h,m),l.timesRevived){const g=o("div","meta");g.textContent=`Revived ${l.timesRevived}×`,f.appendChild(g)}r.appendChild(f)}s.appendChild(r)}else{const r=o("p");r.style.cssText="font-family:var(--font-marker);color:var(--ink-2);font-size:16px;",r.textContent="No fallen monsters yet — keep playing.",s.appendChild(r)}t.appendChild(s)}function Wt(){return[{name:"Borb the Bean",status:"dead",appearance:{body:"blob",eyes:"googly",mouth:"fangs",horns:"antennae",arms:"noodle",feet:"tentacles",paletteIdx:4},level:7,peakLevel:7,wins:6,timesRevived:1,diedAt:Date.now()-1e3*60*60*24*4},{name:"Wally Box",status:"dead",appearance:{body:"stack",eyes:"beady",mouth:"underbite",horns:"curly",arms:"crab",feet:"wheels",paletteIdx:7},level:4,peakLevel:5,wins:3,timesRevived:0,diedAt:Date.now()-1e3*60*60*24*9},{name:"Yolkrid",status:"retired",appearance:{body:"lump",eyes:"cyclops",mouth:"grin",horns:"nubs",arms:"stubs",feet:"paws",paletteIdx:11},level:2,peakLevel:3,wins:1,timesRevived:0}]}function Zt(t,e){e.levelUi||(e.levelUi={delta:en(),rerollSlot:null,rerollOptions:null});const n=e.levelUi;e.pendingAbilityRoll&&(n.rerollOptions=e.pendingAbilityRoll,n.rerollSlot=e.pendingAbilityRollSlot??n.rerollSlot,e.pendingAbilityRoll=null,e.pendingAbilityRollSlot=null),t.innerHTML="";const a=e.state.monster;if(!a)return;const s=Xt(e,n),i=Qt(e,n),{stage:d}=Y(a.appearance,{level:a.level||1,anim:ne("level_up",a)}),r=o("div"),l=o("div");l.style.cssText="position:absolute;top:18px;left:50%;transform:translateX(-50%);";const f=a.level>=10?"TROPHY UNLOCKED":a.level>=7?"CROWN + CAPE":a.level>=5?"AURA UNLOCKED":a.level>=3?"SCARS GAINED":"LEVEL UP";l.innerHTML=`<span class="phase-chip victory"><span class="blip"></span>LEVEL ${a.level} — ${f}</span>`,r.appendChild(l);const c=o("div");c.style.cssText="position:absolute;bottom:24px;left:24px;display:flex;flex-direction:column;gap:6px;";for(const[u,h]of[[3,"scars"],[5,"glow aura"],[7,"crown + cape"],[10,"trophy pin"]]){const m=a.level>=u,g=o("span","lvl-badge");g.style.cssText=`opacity:${m?1:.45};${m?"background:#fff7c2;":""}`,g.textContent=`${m?"✓":"—"} lv ${u} · ${h}`,c.appendChild(g)}r.appendChild(c);const p=o("div","sticky");p.style.cssText="position:absolute;bottom:24px;right:24px;",p.innerHTML="it's earning a<br>reputation 👑",r.appendChild(p),t.appendChild(K({left:s,center:{stage:d,overlays:r},right:i}))}function Xt(t,e){var d;const n=o("div"),a=t.state.monster,s=Z-Le(e.delta);n.innerHTML=`<h4>+${Z} stat points <span style="color:var(--accent)">· ${s} left</span></h4>`;for(const r of U){const l=ee[r],f=(((d=a==null?void 0:a.statPointsSpent)==null?void 0:d[r])||0)+(e.delta[r]||0),c=l.base+f*l.perPoint,p=o("div","alloc-row"),u=o("div");u.innerHTML=`
      <div class="alloc-label">${Jt(r)}</div>
      <div style="font-size:11px;color:var(--ink-2);">+${l.perPoint}/pt</div>
    `;const h=o("span","alloc-derived");h.textContent=c;const m=o("div","alloc-pts"),g=o("button","btn tiny");g.textContent="−",g.disabled=(e.delta[r]||0)===0,g.addEventListener("click",()=>{e.delta[r]--,t.rerender()});const $=o("button","btn tiny primary");$.textContent="+",$.disabled=s===0||f>=Ae,$.addEventListener("click",()=>{e.delta[r]=(e.delta[r]||0)+1,t.rerender()}),m.append(g,$),p.append(u,h,m),n.appendChild(p)}const i=o("p");return i.style.cssText="font-family:var(--font-marker);color:var(--ink-2);font-size:13px;margin:6px 0 0;",i.textContent=s===0?"allocation complete.":`spend all ${Z} points to continue.`,n.appendChild(i),n}function Qt(t,e){var r;const n=o("div"),a=t.state.monster;n.innerHTML=`<h4>Reroll one ability · <span style="color:var(--accent)">${(a==null?void 0:a.rerollTokens)||0} token(s)</span></h4>`;for(let l=0;l<Ie;l++){const f=(r=a==null?void 0:a.abilityIds)==null?void 0:r[l],c=f?Q[f]:null,p=o("div","stat-block"),u=e.rerollSlot===l;u&&(p.style.outline="2.4px solid var(--accent)"),p.innerHTML=`<span style="text-transform:capitalize">${c?c.id.replace("_"," "):"—"}${u?' <em style="color:var(--accent)">· rerolling</em>':""}</span><span class="val">⚔</span>`,n.appendChild(p)}const s=o("button","btn");if(s.textContent="↻ roll a new ability",s.disabled=!(((a==null?void 0:a.rerollTokens)||0)>0),s.addEventListener("click",()=>{const l=(a.abilityIds||[]).length>0?1:0;t.pendingAbilityRollSlot=l,t.send(C.REROLL_ABILITY,{slot:l})}),n.appendChild(s),e.rerollOptions&&e.rerollSlot!=null){const l=o("p");l.style.cssText="font-family:var(--font-marker);font-size:13px;margin:6px 0 0;",l.innerHTML=`Pick one to replace slot <b>${e.rerollSlot+1}</b>:`,n.appendChild(l);const f=o("div");f.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:6px;";for(const c of e.rerollOptions){const p=o("div","stat-block");p.style.cssText="cursor:pointer;background:var(--paper);",p.innerHTML=`<span style="text-transform:capitalize">${c.id.replace("_"," ")}</span><span class="val">${c.damage>0?c.damage:"util"}</span>`,p.addEventListener("click",()=>{t.send(C.REPLACE_ABILITY,{slot:e.rerollSlot,abilityId:c.id}),e.rerollSlot=null,e.rerollOptions=null,t.rerender()}),f.appendChild(p)}n.appendChild(f)}const i=o("button","btn primary giant");i.style.cssText="margin-top:auto;align-self:stretch;",i.textContent="⚔ Next fight →";const d=Z-Le(e.delta);return i.disabled=d!==0,i.addEventListener("click",()=>{t.send(C.ALLOCATE_LEVEL_STATS,{spent:e.delta}),t.send(C.CONFIRM_LEVEL_UP,{}),t.levelUi=null}),n.appendChild(i),n}function Jt(t){return{hp:"HP",attack:"ATK",defense:"DEF",speed:"SPD",crit:"CRT",abilityPower:"AP"}[t]||t.toUpperCase()}function en(){return U.reduce((t,e)=>(t[e]=0,t),{})}function Le(t){return U.reduce((e,n)=>e+(t[n]||0),0)}function tn(t,e){var f;t.innerHTML="";const n=e.state.monster;if(!n||n.status!=="active"){const c=o("div");c.className="dash-single",c.innerHTML=`
      <h1 class="banner big">No monster yet.</h1>
      <p style="font-family:var(--font-marker);font-size:16px">Pick one to start fighting.</p>
    `;const p=o("button","btn primary giant");p.textContent="Pick a monster →",p.addEventListener("click",()=>e.send(C.START_NEW_MONSTER,{})),c.appendChild(p),t.appendChild(c);return}const a=e.state.phase===T.LOBBY,s=Be(n.statPointsSpent||{}),i=a?on(e):nn(n,s),d=a?rn(e):sn(e),{stage:r}=Y(n.appearance,{level:n.level||1,anim:ne(e.state.phase,n)}),l=o("div");if(l.appendChild(Dt(`${n.name||"monster"} · Lv ${n.level||1} · ${n.wins||0} wins`)),a){const c=o("div","chat-nudge");c.style.cssText="position:absolute;bottom:24px;left:24px;",c.innerHTML=`chat: type <code>!join</code> in the next ${Math.ceil((e.state.timeLeftMs||0)/1e3)}s`,l.appendChild(c)}else{const c=!!((f=n.appearance)!=null&&f.presetKey);c?(l.appendChild(hn(e)),e.editingSlot&&l.appendChild(un(e,n))):(l.appendChild(cn(e)),e.editingSlot&&l.appendChild(mn(e,n)));const p=o("div","sticky");p.style.cssText="position:absolute;bottom:24px;right:24px;",p.innerHTML=c?"click a dot to<br>swap monster, vibe,<br>or mood":"click any dot to<br>swap that part",l.appendChild(p)}t.appendChild(K({left:i,center:{stage:r,overlays:l},right:d}))}function nn(t,e){const n=o("div"),a=o("h4");a.textContent="Abilities",n.appendChild(a);for(const i of t.abilityIds||[]){const d=o("div","stat-block");d.innerHTML=`<span style="text-transform:capitalize">${i.replace("_"," ")}</span><span class="val">⚔</span>`,n.appendChild(d)}const s=o("h4");s.style.marginTop="10px",s.textContent="Stats",n.appendChild(s);for(const i of U){const d=o("div","stat-block");d.innerHTML=`<span>${an(i)}</span><span class="val">${e[i]}</span>`,n.appendChild(d)}return n}function an(t){return{hp:"HP",attack:"ATK",defense:"DEF",speed:"SPD",crit:"CRT",abilityPower:"AP"}[t]||t.toUpperCase()}function sn(t){const e=o("div");e.innerHTML=`
    <h4>Lobby setup</h4>
    <div class="stat-block"><span>Lobby length</span><span class="val">30s</span></div>
    <div class="stat-block"><span>Fight length</span><span class="val">2:00</span></div>
    <div class="stat-block"><span>Min joiners</span><span class="val">5</span></div>
  `;const n=o("button","btn primary giant");n.style.cssText="margin-top:auto;align-self:stretch;",n.textContent="⚔ Open lobby",n.addEventListener("click",()=>t.send(C.START_LOBBY,{})),e.appendChild(n);const a=o("p");a.style.cssText="font-family:var(--font-marker);font-size:13px;color:var(--ink-2);text-align:center;margin:6px 0 0;",a.textContent="chat will see the join banner instantly",e.appendChild(a);const s=o("div");s.style.cssText="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;";const i=o("button","btn ghost tiny");return i.textContent="↻ pick a new monster",i.addEventListener("click",()=>t.send(C.START_NEW_MONSTER,{})),s.append(i),e.appendChild(s),e}function on(t){var s;const e=o("div"),n=((s=t.state.chatters)==null?void 0:s.length)||0;e.innerHTML=`<h4>Joiners <span style="color:var(--accent)">· ${n}</span></h4>`;const a=o("div");a.style.cssText="display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start;overflow:auto;max-height:380px;";for(const i of(t.state.chatters||[]).slice(0,28)){const d=o("span","pulse-msg");d.style.cssText="padding:2px 10px 2px 4px;font-size:13px;display:inline-flex;align-items:center;gap:6px;";const r=i.pfpUrl||`https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(i.login)}&backgroundType=solid&backgroundColor=fdfaf3`;d.innerHTML=`<span class="pfp-mini" style="width:20px;height:20px;box-shadow:none;"><img src="${E(r)}" alt="" loading="lazy"/></span><span class="who">${E(i.login)}</span>`,a.appendChild(d)}if(n>28){const i=o("span","pulse-msg");i.style.cssText="padding:2px 10px;font-size:13px;background:var(--paper-2);",i.textContent=`+ ${n-28} more`,a.appendChild(i)}return e.appendChild(a),e}function rn(t){var r;const e=o("div"),n=ln(t.state.timeLeftMs||0);e.innerHTML=`
    <h4>Time left</h4>
    <div style="display:flex;align-items:center;gap:14px;">
      <div>
        <div class="timer-label">LOBBY CLOSES IN</div>
        <div class="timer">${n}</div>
      </div>
    </div>
    <h4 style="margin-top:14px">Quick actions</h4>
  `;const a=o("button","btn");a.textContent="⚔ start now",a.addEventListener("click",()=>{});const s=o("button","btn ghost");s.textContent="cancel",s.addEventListener("click",()=>t.send(C.END_FIGHT_FORCE,{})),e.append(a,s);const i=o("h4");i.style.marginTop="14px",i.textContent="Bonuses unlocked",e.appendChild(i);const d=((r=t.state.chatters)==null?void 0:r.length)||0;for(const[l,f]of[[5,"fight enabled"],[10,"+10% loot"],[25,"rare drop"],[100,"legendary"]]){const c=o("div","stat-block"+(d>=l?"":" muted"));c.innerHTML=`<span>${l}+ joiners</span><span class="val">${d>=l?"✓ "+f:"— "+f}</span>`,e.appendChild(c)}return e}function ln(t){if(!t||t<0)return"0:00";const e=Math.ceil(t/1e3);return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}const dn={horns:{top:"4%",left:"50%",transform:"translateX(-50%)"},eyes:{top:"32%",left:"50%",transform:"translateX(-50%)"},mouth:{top:"52%",left:"50%",transform:"translateX(-50%)"},arms:{top:"50%",left:"4%"},feet:{bottom:"4%",left:"50%",transform:"translateX(-50%)"},body:{top:"50%",right:"4%"}};function cn(t,e){const n=o("div");n.style.cssText="position:absolute;inset:0;pointer-events:none;";const a=o("div");a.style.cssText="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:min(72%, 460px);aspect-ratio:0.78;pointer-events:none;";for(const s of Se){const i=o("div","slot-dot"+(t.editingSlot===s?" active":""));i.dataset.slot=s,i.title=s,i.textContent="+",i.style.pointerEvents="auto",Object.assign(i.style,dn[s]||{top:"50%",left:"50%"}),i.addEventListener("click",()=>{t.editingSlot=t.editingSlot===s?null:s,t.rerender()}),a.appendChild(i)}return n.appendChild(a),n}const pn=["monster","vibe","mood"],fn={monster:{top:"4%",left:"50%",transform:"translateX(-50%)"},vibe:{top:"50%",left:"4%"},mood:{top:"50%",right:"4%"}};function hn(t,e){const n=o("div");n.style.cssText="position:absolute;inset:0;pointer-events:none;";const a=o("div");a.style.cssText="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:min(72%, 460px);aspect-ratio:0.78;pointer-events:none;";for(const s of pn){const i=o("div","slot-dot"+(t.editingSlot===s?" active":""));i.dataset.slot=s,i.title=s,i.textContent="+",i.style.pointerEvents="auto",Object.assign(i.style,fn[s]||{top:"50%",left:"50%"}),i.addEventListener("click",()=>{t.editingSlot=t.editingSlot===s?null:s,t.rerender()}),a.appendChild(i)}return n.appendChild(a),n}function un(t,e){var r,l,f;const n=t.editingSlot,a=o("div","slot-popover");a.style.cssText="top:50%;left:60%;transform:translate(-10%, -50%);";const s=o("button","btn tiny ghost");s.style.cssText="position:absolute;top:6px;right:8px;",s.textContent="✕",s.addEventListener("click",()=>{t.editingSlot=null,t.rerender()});const i=o("div","title");i.textContent=n.toUpperCase(),a.append(s,i);const d=o("div","opts");if(n==="monster")for(const c of xe){const p=Ce[c],u=o("button","opt"+(((r=e.appearance)==null?void 0:r.presetKey)===c?" on":""));u.textContent=p.name,u.title=p.tagline,u.addEventListener("click",()=>{t.send(C.PICK_APPEARANCE,{appearance:{...e.appearance,presetKey:c,expr:p.defaultExpr}})}),d.appendChild(u)}else if(n==="vibe")for(const c of["normal","poison","fire","ice","shadow"]){const p=o("button","opt"+((((l=e.appearance)==null?void 0:l.variant)||"normal")===c?" on":""));p.textContent=c,p.addEventListener("click",()=>{t.send(C.PICK_APPEARANCE,{appearance:{...e.appearance,variant:c}})}),d.appendChild(p)}else if(n==="mood")for(const c of["idle","angry","happy","worry"]){const p=o("button","opt"+((((f=e.appearance)==null?void 0:f.expr)||"angry")===c?" on":""));p.textContent=c,p.addEventListener("click",()=>{t.send(C.PICK_APPEARANCE,{appearance:{...e.appearance,expr:c}})}),d.appendChild(p)}return a.appendChild(d),a}function mn(t,e){var d,r;const n=t.editingSlot,a=ke[n]||[],s=o("div","slot-popover");s.style.cssText="top:50%;left:60%;transform:translate(-10%, -50%);";const i=o("button","btn tiny ghost");if(i.style.cssText="position:absolute;top:6px;right:8px;",i.textContent="✕",i.addEventListener("click",()=>{t.editingSlot=null,t.rerender()}),n==="body"){const l=o("div","title");l.textContent="BODY SHAPE",s.append(i,l);const f=o("div","opts");for(const u of a){const h=o("button","opt"+(((d=e.appearance)==null?void 0:d.body)===u?" on":""));h.textContent=u,h.addEventListener("click",()=>{t.send(C.PICK_APPEARANCE,{appearance:{...e.appearance,body:u}})}),f.appendChild(h)}s.appendChild(f);const c=o("div","title");c.style.marginTop="6px",c.textContent="ACCENT PALETTE",s.appendChild(c);const p=o("div","palette");W.forEach((u,h)=>{var g;const m=o("button",((g=e.appearance)==null?void 0:g.paletteIdx)===h?"on":"");m.style.background=`linear-gradient(90deg, ${u.primary} 50%, ${u.accent} 50%)`,m.addEventListener("click",()=>{t.send(C.PICK_APPEARANCE,{appearance:{...e.appearance,paletteIdx:h}})}),p.appendChild(m)}),s.appendChild(p)}else{const l=o("div","title");l.textContent=n.toUpperCase(),s.append(i,l);const f=o("div","opts");for(const c of a){const p=o("button","opt"+(((r=e.appearance)==null?void 0:r[n])===c?" on":""));p.textContent=c,p.addEventListener("click",()=>{t.send(C.PICK_APPEARANCE,{appearance:{...e.appearance,[n]:c}})}),f.appendChild(p)}s.appendChild(f)}return s}function gn(t,e){var g;t.innerHTML="";const n=((g=e.me)==null?void 0:g.channelId)||"demo",a=`${location.origin}/overlay/?channelId=${encodeURIComponent(n)}`,s=o("div","dash-single");s.style.cssText="display:grid;grid-template-columns:1.1fr 1fr;gap:36px;padding:36px 44px;";const i=o("div");i.style.cssText="display:flex;flex-direction:column;gap:22px;";const d=o("div");d.innerHTML=`
    <span class="banner-strip">one-time setup</span>
    <h2 style="font-family:var(--font-hand);font-weight:700;font-size:42px;margin:8px 0 0">Add the overlay to OBS.</h2>
    <p style="font-family:var(--font-marker);font-size:16px;color:var(--ink-2);margin:6px 0 0">
      One click here, one paste in OBS. We'll wait.
    </p>
  `,i.appendChild(d);const r=o("div","obs-url");r.innerHTML=`<code id="brm-overlay-url">${E(a)}</code>`;const l=o("button","btn primary lg");l.style.boxShadow="none",l.textContent="📋 Copy URL",l.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),l.textContent="✓ Copied!"}catch{l.textContent="✓ Copied!"}setTimeout(()=>{l.textContent="📋 Copy URL"},2200)}),r.appendChild(l),i.appendChild(r);const f=o("div");f.style.cssText="display:grid;gap:24px;margin-top:8px;",[["In OBS, right-click your scene → Add → Browser Source",'name it "BossRaid" or whatever feels right'],["Paste the URL into the URL field","width 1920, height 1080. don't touch the rest"],["That's it. We'll detect it within 5 seconds.","● connection appears in the topbar above ↑"]].forEach(([$,v],M)=>{const S=o("div","obs-step");S.innerHTML=`
      <span class="num">${M+1}</span>
      <p class="head">${E($)}</p>
      <p class="sub">${v}</p>
    `,f.appendChild(S)}),i.appendChild(f);const p=o("div");p.style.cssText="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:8px;";const u=o("button","btn primary lg");u.textContent="Done — take me to the panel →",u.addEventListener("click",()=>{e.obsAcknowledged=!0,e.rerender()});const h=o("button","btn ghost");h.textContent="skip — I'll do this later",h.addEventListener("click",()=>{e.obsAcknowledged=!0,e.rerender()}),p.append(u,h),i.appendChild(p);const m=o("div","obs-preview");m.innerHTML=`
    <div class="titlebar">
      <span class="led" style="background:#e35d4e"></span>
      <span class="led" style="background:#e8b347"></span>
      <span class="led" style="background:#3fa86a"></span>
      <span style="margin-left:12px">OBS Studio — 30.1.2</span>
    </div>
    <div class="body">
      <div class="scene-row" style="background:#1f1d18">📺 Scene · Just Chatting</div>
      <div class="scene-row">┣ 🎥 Webcam</div>
      <div class="scene-row">┣ 🎮 Game Capture</div>
      <div class="scene-row added">
        ┣ 🌐 Browser Source · BossRaid
        <div style="position:absolute;right:-90px;top:50%;transform:translateY(-50%) rotate(-2deg);background:var(--accent);color:var(--paper);padding:4px 10px;border-radius:6px;font-family:var(--font-marker);font-size:13px;border:2.4px solid var(--paper)">← here!</div>
      </div>
      <div class="urlbox">
        <div style="margin-bottom:6px">URL:</div>
        <div class="urlval">${E(a)}<span style="animation:brm-blip 0.8s infinite">▌</span></div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <span style="background:#26241f;padding:4px 8px;border-radius:4px">W: 1920</span>
          <span style="background:#26241f;padding:4px 8px;border-radius:4px">H: 1080</span>
        </div>
      </div>
    </div>
    <div class="footer">● connected · streaming overlay</div>
  `,s.append(i,m),t.appendChild(s)}function bn(t,e){e.pickUi||(e.pickUi={candidates:ge(),seed:1});const n=e.pickUi;t.innerHTML="";const a=o("div","dash-single"),s=o("div");s.innerHTML=`
    <span class="banner-strip">step 2 of 2</span>
    <h2 style="font-family:var(--font-hand);font-weight:700;font-size:48px;margin:8px 0 0">Pick your fighter.</h2>
    <p style="font-family:var(--font-marker);font-size:16px;color:var(--ink-2);margin:4px 0 0;">
      Tweak parts and stats after your first run — see how chat reacts first.
    </p>
  `,a.appendChild(s);const i=o("div","pick-grid");n.candidates.forEach((c,p)=>{const u=o("div","pick-card"+(p===1?" featured":"")),h=o("div","preview");h.innerHTML=fe({presetKey:c.presetKey,expr:c.expr,variant:c.variant},{level:1,anim:"spawn"});const m=o("div","name");m.textContent=c.name;const g=o("div");g.style.cssText="font-family:var(--font-marker);font-size:13px;color:var(--ink-2);text-align:center;margin-top:-2px;font-style:italic;",g.textContent=c.tagline;const $=o("div","stat-row");$.innerHTML=`
      <span class="chip">HP ${pe(c,"hp")}</span>
      <span class="chip">ATK ${pe(c,"attack")}</span>
      <span class="chip">DEF ${pe(c,"defense")}</span>
    `;const v=o("div","stat-row");v.innerHTML=c.abilityIds.map(S=>`<span class="chip ability">${E(S.replace("_"," "))}</span>`).join("");const M=o("button","btn primary lg");if(M.style.cssText="margin-top:10px;align-self:stretch;",M.textContent=`Fight with ${c.name.split(" ")[0]} →`,M.addEventListener("click",()=>be(e,c)),u.append(h,m,g,$,v,M),p===1){const S=o("div","sticky");S.style.cssText="position:absolute;top:-16px;right:-12px;font-size:15px;",S.innerHTML="chat seems to like<br>tanks 🛡",u.appendChild(S)}u.addEventListener("click",S=>{S.target.closest("button")||be(e,c)}),i.appendChild(u)}),a.appendChild(i);const d=o("div");d.style.cssText="display:flex;gap:12px;align-items:center;flex-wrap:wrap;";const r=o("button","btn ghost");r.textContent="↻ reroll all",r.addEventListener("click",()=>{n.candidates=ge(),n.seed++,e.rerender()});const l=o("button","btn ghost");l.textContent="＋ build from scratch",l.addEventListener("click",()=>{e.useFullCreator=!0,e.rerender()});const f=o("span");f.style.cssText="margin-left:auto;font-family:var(--font-marker);font-size:14px;color:var(--ink-2);",f.textContent="Tip: hit ⏎ to fight with the highlighted one",d.append(r,l,f),a.appendChild(d),t.appendChild(a)}function ge(){const t=yn([...xe]).slice(0,3),e=[{hp:6,attack:1,defense:0,speed:1,crit:1,abilityPower:1},{hp:8,attack:0,defense:2,speed:0,crit:0,abilityPower:0},{hp:4,attack:3,defense:0,speed:1,crit:2,abilityPower:0}];return t.map((n,a)=>{const s=Ce[n];return{presetKey:n,name:s.name,tagline:s.tagline,expr:s.defaultExpr,variant:"normal",abilityIds:$n(),spent:e[a]}})}function yn(t){for(let e=t.length-1;e>0;e--){const n=Math.random()*(e+1)|0;[t[e],t[n]]=[t[n],t[e]]}return t}function $n(){return[ce(j.damage),ce(j.aoe),ce(j.utility)].map(t=>t.id)}function ce(t){return t[Math.random()*t.length|0]}function pe(t,e){const n=ee[e];return n.base+(t.spent[e]||0)*n.perPoint}function be(t,e){t.send(C.START_NEW_MONSTER,{}),setTimeout(()=>{t.send(C.PICK_APPEARANCE,{appearance:{presetKey:e.presetKey,expr:e.expr,variant:e.variant,body:"blob",eyes:"googly",mouth:"fangs",horns:"antennae",arms:"noodle",feet:"tentacles",paletteIdx:0}}),t.send(C.PICK_ABILITIES,{abilityIds:e.abilityIds}),t.send(C.ALLOCATE_STARTING_STATS,{spent:vn(e.spent)}),t.send(C.CONFIRM_MONSTER,{name:e.name}),t.pickUi=null},60)}function vn(t){const e=Object.values(t).reduce((a,s)=>a+(s||0),0);if(e===ue)return t;const n={...t};return n.hp=(n.hp||0)+(ue-e),n}function kn(t,e){t.innerHTML="";const n=e.state.monster,a=e.lastResults||{},s=!!a.victory,i=(()=>{var u;const p=o("div");p.innerHTML="<h4>Top damage</h4>";for(const h of(a.mvpChatters||[]).slice(0,6)){const m=o("div","stat-block"),g=h.pfpUrl||`https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(h.login)}&backgroundType=solid&backgroundColor=fdfaf3`;m.innerHTML=`<span class="pfp-row"><span class="pfp-mini"><img src="${E(g)}" alt="" loading="lazy"/></span><span style="color:var(--accent-3)">${E(h.login)}</span></span><span class="val">${h.damageDealt||0}</span>`,p.appendChild(m)}if(!((u=a.mvpChatters)!=null&&u.length)){const h=o("p");h.style.cssText="font-family:var(--font-marker);color:var(--ink-2);font-size:13px;margin:0;",h.textContent="no contenders this round",p.appendChild(h)}return p})(),d=(()=>{const p=o("div");p.innerHTML=`
      <h4>Round summary</h4>
      <div class="stat-block"><span>duration</span><span class="val">${Math.round((a.durationMs||0)/100)/10}s</span></div>
      <div class="stat-block"><span>total damage</span><span class="val">${a.totalDamage||0}</span></div>
      <div class="stat-block"><span>monster level</span><span class="val">${a.monsterLevel??"—"}</span></div>
    `;const u=o("p");return u.style.cssText="font-family:var(--font-marker);color:var(--ink-2);font-size:13px;margin:8px 0 0;",u.textContent=s?"one for the graveyard 🪦":"next fight loading…",p.appendChild(u),p})(),r=s?"death":ne("results",n),{stage:l}=Y(n==null?void 0:n.appearance,{level:(n==null?void 0:n.level)||1,anim:r}),f=o("div"),c=o("div");c.style.cssText="position:absolute;top:50%;left:50%;transform:translate(-50%, -90%);text-align:center;",c.innerHTML=`<h1 class="banner big ${s?"victory":"defeat"}">${s?"Chat wins!":"Boss wins!"}</h1>`,f.appendChild(c),t.appendChild(K({left:i,center:{stage:l,overlays:f},right:d}))}const ye=["pog_lord","kappa_kween","lurker99","5Head","ninja42","streamerfan","EmoteGoblin","pizzaqueen","noscope","bitsby","glassoakapril","omegamax","lily7000","darklurker","thirdtimer","speedrunBae","midnightdev","happybatato","TwitchFartson","lazerlemur"];function B(t){return t[Math.random()*t.length|0]}function $e(t){return`https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(t)}&backgroundType=solid&backgroundColor=fdfaf3`}function Tn(){const t=["blob","lump","stack"],e=["googly","beady","cyclops"],n=["fangs","underbite","grin"],a=["nubs","curly","antennae"],s=["stubs","noodle","crab"],i=["paws","tentacles","wheels"];return{body:B(t),eyes:B(e),mouth:B(n),horns:B(a),arms:B(s),feet:B(i),paletteIdx:Math.random()*12|0}}function ve({name:t="Bloop",level:e=1,status:n="active"}={}){const a=j.damage,s=j.aoe,i=j.utility;return{id:"demo_mon_"+Math.random().toString(36).slice(2,8),channelId:"demo",name:t,status:n,appearance:Tn(),abilityIds:[B(a).id,B(s).id,B(i).id],statPointsSpent:U.reduce((d,r)=>(d[r]=0,d),{hp:4,attack:2,defense:1,speed:0,crit:3,abilityPower:0}),level:e,wins:e-1,rerollTokens:Re,timesRevived:0,peakLevel:e,diedAt:null}}function _n(t,e){let n=ve(),a=[],s=3e3,i=3e3,d=T.IDLE,r=0,l={},f=null,c=0,p=null;function u(L,w){return{v:Me,type:L,payload:w}}function h(L,w){setTimeout(()=>e(u(L,w)),0)}function m(){return{channelId:"demo",phase:d,locale:"en",monster:n,chatters:a,bossHP:s,maxBossHP:i,cooldowns:l,legacyPoints:c,ircStatus:"connected"}}function g(L=[]){h(I.STATE_DELTA,{phase:d,timeLeftMs:Math.max(0,r-Date.now()),bossHP:s,maxBossHP:i,bossShield:0,chatters:a,cooldowns:l,events:L,legacyPoints:c,monster:n})}function $(L,w={}){d=L,h(I.PHASE_CHANGE,{phase:L,...w}),h(I.STATE_DELTA,{...m(),timeLeftMs:w.durationMs||0,events:[]})}const v={LOBBY:4e3,FIGHT:12e3,RESULTS:2500,LEVEL_UP:6e3};function M(){a=[],s=i,l={},r=Date.now()+v.LOBBY,$(T.LOBBY,{durationMs:v.LOBBY,timeLeftMs:v.LOBBY});let L=0;const w=8+(Math.random()*6|0),_=setInterval(()=>{if(L>=w||d!==T.LOBBY){clearInterval(_);return}const k=ye[L%ye.length];a.push({login:k,hp:100,maxHp:100,blockedUntilMs:0,damageDealt:0,pfpUrl:$e(k)}),g([{kind:"CHATTER_JOINED",chatterId:k}]),L++},280);p=setTimeout(S,v.LOBBY)}function S(){r=Date.now()+v.FIGHT,$(T.FIGHT,{durationMs:v.FIGHT,timeLeftMs:v.FIGHT});const L=setInterval(()=>{if(d!==T.FIGHT){clearInterval(L);return}const w=[];for(const _ of a)if(!(_.hp<=0)&&Math.random()<.35){const k=25+(Math.random()*15|0);s=Math.max(0,s-k),_.damageDealt+=k,w.push({kind:"CHATTER_ATTACK",chatterId:_.login,dmg:k})}if(Math.random()<.4){const _=a.filter(k=>k.hp>0);if(_.length){const k=_[Math.random()*_.length|0],A=20+(Math.random()*10|0),z=Math.random()<.15,N=z?A*2:A;k.hp=Math.max(0,k.hp-N),w.push({kind:z?"BOSS_CRIT":"BOSS_BASIC_ATTACK",chatterId:k.login,dmg:N}),k.hp<=0&&w.push({kind:"CHATTER_DOWN",chatterId:k.login})}}if(Math.random()<.07){const _=n.abilityIds[Math.random()*n.abilityIds.length|0],k=Q[_];if(k&&(w.push({kind:"BOSS_ABILITY",abilityId:_,vfx:k.vfx,isCrit:!1,damageDealt:k.damage}),k.damage>0))for(const A of a)A.hp>0&&(A.hp=Math.max(0,A.hp-k.damage),A.hp<=0&&w.push({kind:"CHATTER_DOWN",chatterId:A.login}))}if(Math.random()<.05&&a.length){const _=a[Math.random()*a.length|0];w.push({kind:"HERO_SPOTLIGHT",chatterId:_.login,durationMs:3e3})}if(g(w),s<=0){clearInterval(L),ae("chat");return}if(Date.now()>=r){clearInterval(L),ae(s<i*.3?"chat":"boss");return}},600)}function ae(L){const w=[...a].sort((_,k)=>k.damageDealt-_.damageDealt).slice(0,5);f={fightId:"demo_fight_"+Date.now(),victory:L==="chat",victoryFor:L,mvpChatters:w.map(_=>({login:_.login,damageDealt:_.damageDealt,pfpUrl:_.pfpUrl||$e(_.login)})),durationMs:v.FIGHT,totalDamage:a.reduce((_,k)=>_+k.damageDealt,0),monsterLevel:n.level},h(I.RESULTS,f),L==="chat"?(n={...n,status:"dead",diedAt:Date.now()},c+=5):(n={...n,level:n.level+1,wins:n.wins+1,peakLevel:Math.max(n.peakLevel,n.level+1),rerollTokens:n.rerollTokens+1},c+=1),h(I.MONSTER_UPDATED,{monster:n}),r=Date.now()+v.RESULTS,$(T.RESULTS,{durationMs:v.RESULTS,timeLeftMs:v.RESULTS}),p=setTimeout(()=>{n.status==="dead"?$(T.DEATH):(r=Date.now()+v.LEVEL_UP,$(T.LEVEL_UP,{points:3}),p=setTimeout(he,v.LEVEL_UP))},v.RESULTS)}function he(){n.statPointsSpent={...n.statPointsSpent,attack:(n.statPointsSpent.attack||0)+3},h(I.MONSTER_UPDATED,{monster:n}),$(T.IDLE),p=setTimeout(M,1500)}setTimeout(()=>{h(I.WELCOME,m()),p=setTimeout(M,2e3)},100);function we(L,w){switch(L){case"start_lobby":clearTimeout(p),M();return;case"cast_ability":{const _=w.slot,k=n.abilityIds[_],A=Q[k];if(!A||d!==T.FIGHT)return;l={...l,[_]:{abilityId:k,readyAt:Date.now()+A.cooldownMs,remainingMs:A.cooldownMs}};const z=[{kind:"BOSS_ABILITY",abilityId:k,vfx:A.vfx,isCrit:!1,damageDealt:A.damage}];if(A.damage>0)for(const N of a)N.hp>0&&(N.hp=Math.max(0,N.hp-A.damage),N.hp<=0&&z.push({kind:"CHATTER_DOWN",chatterId:N.login}));g(z);return}case"end_fight_force":clearTimeout(p),ae("aborted");return;case"confirm_level_up":clearTimeout(p),he();return;case"abandon_monster":case"start_new_monster":n=ve(),h(I.MONSTER_UPDATED,{monster:n}),$(T.IDLE),p=setTimeout(M,1500);return;case"revive_monster":c=Math.max(0,c-5),n={...n,status:"active",timesRevived:n.timesRevived+1},h(I.MONSTER_UPDATED,{monster:n}),$(T.IDLE),p=setTimeout(M,1500);return;default:return}}function Ee(){p&&clearTimeout(p)}return{send:we,close:Ee}}async function xn(t){Et();let e;e={channelId:"demo",login:"demo_streamer",displayName:"Demo Streamer",locale:"en"};const n={phase:T.IDLE,monster:null,chatters:[],bossHP:0,maxBossHP:0,timeLeftMs:0,cooldowns:{},events:[],connected:!1,victory:!1};let a=null;const s={state:n,me:e,send:null,rerender:null,pickUi:null,levelUi:null,editingSlot:null,pendingAbilityRoll:null,pendingAbilityRollSlot:null,legacyPoints:0,showGraveyard:!1,showObs:!1,obsAcknowledged:!1,useFullCreator:!1};t.innerHTML="";const i=o("main","brm-app"),d=o("div"),r=o("div","brm-view"),l=new At;i.append(d,r,l.root),t.appendChild(i);const p=_n("demo://",m=>{u(m),n.connected=!0,h()});function u(m){switch(m.type){case I.WELCOME:case I.STATE_DELTA:case I.PHASE_CHANGE:Object.assign(n,m.payload),m.payload.legacyPoints!=null&&(s.legacyPoints=m.payload.legacyPoints);for(const g of m.payload.events||[])g.kind==="CHATTER_JOINED"?l.push({login:g.chatterId,action:"join"}):g.kind==="CHATTER_ATTACK"?l.push({login:g.chatterId,action:"attack"}):g.kind==="CHATTER_HEAL"?l.push({login:g.chatterId,action:"heal"}):g.kind==="CHATTER_BLOCK"&&l.push({login:g.chatterId,action:"block"});return;case I.MONSTER_UPDATED:n.monster=m.payload.monster;return;case I.RESULTS:a=m.payload;return;case I.ABILITY_ROLL:s.pendingAbilityRoll=m.payload.options,m.payload.slot!=null&&(s.pendingAbilityRollSlot=m.payload.slot);return;case I.ERROR:console.warn("server error:",m.payload);return;default:return}}function h(){var g;const m=($,v)=>p.send($,v);if(s.send=m,s.rerender=h,s.lastResults=a,d.innerHTML="",d.appendChild(St({phase:n.phase,me:e,connected:n.connected,onGraveyard:()=>{s.showGraveyard=!0,h()},onLogout:async()=>{await fetch("/auth/logout",{method:"POST"}).catch(()=>{}),location.href="/"}})),!s.obsAcknowledged&&((g=n.monster)==null?void 0:g.status)==="active"&&Cn(d,s),s.showGraveyard){Vt(r,s);return}if(s.showObs){gn(r,s);return}switch(n.phase){case T.IDLE:case T.LOBBY:tn(r,s);break;case T.FIGHT:jt(r,s);break;case T.RESULTS:kn(r,s);break;case T.LEVEL_UP:Zt(r,s);break;case T.DEATH:qt(r,s);break;case T.CREATION:bn(r,s);break;default:r.innerHTML=`<div class="dash-single"><h2>State: ${n.phase}</h2></div>`}}h()}function Cn(t,e){const n=o("div");n.style.cssText="background:#fff7c2;border-bottom:2.4px solid var(--ink);padding:8px 18px;display:flex;align-items:center;gap:14px;font-family:var(--font-marker);font-size:14px;",n.innerHTML=`
    <span>📺 First time? Add the overlay to OBS.</span>
    <button class="btn tiny" data-act="show-obs">Show me how</button>
    <button class="btn tiny ghost" data-act="dismiss">later</button>
  `,n.querySelector('[data-act="show-obs"]').addEventListener("click",()=>{e.showObs=!0,e.rerender()}),n.querySelector('[data-act="dismiss"]').addEventListener("click",()=>{e.obsAcknowledged=!0,e.rerender()}),t.appendChild(n)}xn(document.getElementById("root"));
