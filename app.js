
(function(){
  try{
    var root=document.documentElement, alt=window.__alt||{}, lang=window.__lang||"az";
    // theme (persisted; falls back to the OS setting)
    var TK="jr_theme", saved=null;
    try{saved=localStorage.getItem(TK);}catch(e){}
    if(saved==="dark"||saved==="light") root.setAttribute("data-theme",saved);
    var tb=document.getElementById("themeToggle");
    if(tb) tb.addEventListener("click",function(){
      var cur=root.getAttribute("data-theme");
      var dark=cur? cur==="dark" : matchMedia("(prefers-color-scheme:dark)").matches;
      var next=dark?"light":"dark";
      root.setAttribute("data-theme",next);
      try{localStorage.setItem(TK,next);}catch(e){}
      if(window.__jrRadarSync) window.__jrRadarSync();
    });
    // language: remember the toggle; auto-route on first visit
    var LK="jr_lang", pref=null;
    try{pref=localStorage.getItem(LK);}catch(e){}
    var lt=document.getElementById("langToggle");
    if(lt) lt.addEventListener("click",function(){
      try{localStorage.setItem(LK, lt.getAttribute("data-lang")||"");}catch(e){}
    });
    if(pref && pref!==lang && alt[pref] && alt[pref]!==location.pathname){
      location.replace(alt[pref]); return;
    }
    if(!pref){
      var nl=(navigator.language||"").toLowerCase();
      if(nl.indexOf("ru")===0 && lang!=="ru" && alt.ru && alt.ru!==location.pathname){
        location.replace(alt.ru); return;
      }
    }
    function esc(x){return (x||"").replace(/[<>&"]/g,function(c){
      return {"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;"}[c];});}
    // on-site search with facet filters (all / web / telegram / today)
    var box=document.getElementById("jrSearch"), out=document.getElementById("jrResults");
    var data=window.__JOBS||[], none=window.__noneText||"", flt="all";
    function runSearch(){
      if(!out) return;
      var q=box?box.value.trim().toLowerCase():"";
      if(q.length<2 && flt==="all"){out.innerHTML="";return;}
      var r=[];
      for(var i=0;i<data.length&&r.length<20;i++){
        var d=data[i];
        if(q.length>=2 && d[0].toLowerCase().indexOf(q)<0) continue;
        if(flt==="web" && d[2]!=="web") continue;
        if(flt==="tg" && d[2]!=="tg") continue;
        if(flt==="today" && d[3]!==1) continue;
        r.push(d);
      }
      if(!r.length){out.innerHTML='<div class="sr">'+none+'</div>';return;}
      out.innerHTML=r.map(function(j){
        return '<a class="sr" href="'+(j[1]||"https://t.me/JobRadarAzBot")+'">'+esc(j[0])+'</a>';
      }).join("");
    }
    if(box) box.addEventListener("input",runSearch);
    var fbox=document.getElementById("jrFilters");
    if(fbox) fbox.addEventListener("click",function(e){
      var b=e.target.closest(".fchip"); if(!b) return;
      flt=b.getAttribute("data-f")||"all";
      [].forEach.call(fbox.querySelectorAll(".fchip"),function(x){x.classList.toggle("on",x===b);});
      runSearch();
    });

    // saved jobs (localStorage, shared across pages) + recently viewed
    function getL(k){try{return JSON.parse(localStorage.getItem(k)||"[]");}catch(e){return [];}}
    function setL(k,v){try{localStorage.setItem(k,JSON.stringify(v.slice(0,60)));}catch(e){}}
    var SK="jr_saved";
    function savedHas(u,t){var l=getL(SK);for(var i=0;i<l.length;i++)if(l[i].u===u&&l[i].t===t)return true;return false;}
    function miniCard(o){return '<a class="job" href="'+esc(o.u)+'"><div class="top"></div><h3>'+esc(o.t)+'</h3></a>';}
    function renderL(wrapId,boxId,key){
      var w=document.getElementById(wrapId),b=document.getElementById(boxId); if(!b) return;
      var l=getL(key); if(!l.length){if(w)w.hidden=true;return;} if(w)w.hidden=false;
      b.innerHTML=l.map(miniCard).join("");
    }
    [].forEach.call(document.querySelectorAll(".star"),function(st){
      var t=st.getAttribute("data-jt")||"",u=st.getAttribute("data-ju")||"";
      if(savedHas(u,t)){st.classList.add("on");st.textContent="★";}
      function toggle(e){
        if(e){e.preventDefault();e.stopPropagation();}
        var l=getL(SK),f=-1;
        for(var i=0;i<l.length;i++)if(l[i].u===u&&l[i].t===t){f=i;break;}
        if(f>=0){l.splice(f,1);st.classList.remove("on");st.textContent="☆";}
        else{l.unshift({t:t,u:u});st.classList.add("on");st.textContent="★";}
        setL(SK,l);renderL("jrSavedWrap","jrSaved",SK);
      }
      st.addEventListener("click",toggle);
      st.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){toggle(e);}});
    });
    renderL("jrSavedWrap","jrSaved",SK);
    var RK="jr_recent", jj=document.getElementById("jrJob");
    if(jj){var t=jj.getAttribute("data-t")||"",u=jj.getAttribute("data-u")||"";
      if(t&&u){var rl=getL(RK).filter(function(o){return o.u!==u;});rl.unshift({t:t,u:u});setL(RK,rl.slice(0,8));}}
    renderL("jrRecentWrap","jrRecent",RK);

    // interactive profile builder -> deep-links into the bot
    var bwrap=document.getElementById("jrBuilder"),bout=document.getElementById("jrBuilderOut");
    if(bwrap&&window.__CATS){
      var T=window.__T||{},BOTU=window.__BOT||"https://t.me/JobRadarAzBot";
      bwrap.innerHTML=window.__CATS.slice(0,14).map(function(c){
        return '<button class="bchip" type="button" data-k="'+esc(c[0])+'" data-n="'+esc(c[2])+
          '" data-c="'+c[3]+'"><span>'+c[1]+'</span> '+esc(c[2])+' <span class="c">'+c[3]+'</span></button>';
      }).join("");
      bwrap.addEventListener("click",function(e){
        var b=e.target.closest(".bchip"); if(!b) return;
        [].forEach.call(bwrap.querySelectorAll(".bchip"),function(x){x.classList.toggle("on",x===b);});
        var k=b.getAttribute("data-k"),n=b.getAttribute("data-n"),c=b.getAttribute("data-c");
        bout.hidden=false;
        bout.innerHTML='<span class="big">'+esc(c)+'</span><span class="lbl">'+esc(n)+' · '+esc(T.found||"")+
          '</span><a class="btn" href="'+BOTU+"?start="+esc((T.start||"field_")+k)+'">'+esc(T.cta||"Telegram")+'</a>';
      });
    }
    // hero radar — the signature: a live sweep that lights up job "contacts"
    var cv=document.getElementById("jrRadar");
    if(cv && cv.getContext){
      var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
      var ctx=cv.getContext("2d"), R,cx,cy, COL={};
      function readColors(){
        var cs=getComputedStyle(root);
        COL.radar=(cs.getPropertyValue("--radar")||"#5b93f0").trim();
        COL.signal=(cs.getPropertyValue("--signal")||"#ffb020").trim();
        COL.ink=(cs.getPropertyValue("--text")||"#e9eefb").trim();
        COL.faint=(cs.getPropertyValue("--faint")||"#66759a").trim();
        COL.brand=(cs.getPropertyValue("--brand")||"#3b82f6").trim();
      }
      window.__jrRadarSync=readColors;
      function size(){
        var dpr=Math.min(window.devicePixelRatio||1,2);
        var s=Math.max(220, cv.getBoundingClientRect().width);
        cv.width=s*dpr; cv.height=s*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
        R=s/2-4; cx=s/2; cy=s/2;
      }
      var RINGS=[{f:.34,l:"jobsearch.az"},{f:.60,l:"smartjob.az"},{f:.83,l:"Telegram"},{f:1,l:""}];
      var BLIPS=[{a:-1.15,r:.42,lit:.6},{a:.55,r:.7,lit:.3},{a:2.1,r:.5,lit:.15},
        {a:3.5,r:.78,lit:.5},{a:4.5,r:.33,lit:.2},{a:-2.4,r:.88,lit:.4},{a:1.55,r:.9,lit:.25}];
      var sweep=-Math.PI/2;
      function polar(a,rf){return [cx+Math.cos(a)*R*rf, cy+Math.sin(a)*R*rf];}
      function hex(c,al){ // color already hex/rgb; wrap alpha via globalAlpha instead
        return c;
      }
      function draw(){
        ctx.clearRect(0,0,cx*2,cy*2);
        var g=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
        g.addColorStop(0,"rgba(59,130,246,.10)");
        g.addColorStop(.7,"rgba(59,130,246,.04)");
        g.addColorStop(1,"rgba(59,130,246,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.fill();
        ctx.font='500 10px "IBM Plex Mono",monospace'; ctx.textAlign="center";
        RINGS.forEach(function(rg){
          ctx.beginPath(); ctx.arc(cx,cy,R*rg.f,0,Math.PI*2);
          ctx.strokeStyle=COL.radar; ctx.globalAlpha=rg.f===1?.5:.22; ctx.lineWidth=rg.f===1?1.5:1; ctx.stroke();
          ctx.globalAlpha=1;
          if(rg.l){ctx.fillStyle=COL.faint; ctx.fillText(rg.l, cx, cy-R*rg.f-5);}
        });
        ctx.strokeStyle=COL.radar; ctx.globalAlpha=.14; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(cx-R,cy); ctx.lineTo(cx+R,cy);
        ctx.moveTo(cx,cy-R); ctx.lineTo(cx,cy+R); ctx.stroke(); ctx.globalAlpha=1;
        if(!reduce){
          ctx.save(); ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,sweep-.9,sweep); ctx.closePath();
          var e=polar(sweep,1), lg=ctx.createLinearGradient(cx,cy,e[0],e[1]);
          lg.addColorStop(0,"rgba(91,147,240,0)"); lg.addColorStop(1,"rgba(91,147,240,.28)");
          ctx.fillStyle=lg; ctx.fill(); ctx.restore();
          ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(e[0],e[1]);
          ctx.strokeStyle="rgba(120,170,255,.55)"; ctx.lineWidth=1.5; ctx.stroke();
        }
        BLIPS.forEach(function(b){
          var p=polar(b.a,b.r), lit=b.lit;
          if(lit>.05){
            var rr=3+lit*9, bg=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],rr);
            bg.addColorStop(0,"rgba(255,176,32,"+(.5*lit)+")"); bg.addColorStop(1,"rgba(255,176,32,0)");
            ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(p[0],p[1],rr,0,7); ctx.fill();
          }
          ctx.beginPath(); ctx.arc(p[0],p[1],2.6,0,7);
          ctx.fillStyle=COL.signal; ctx.globalAlpha=lit>.05?1:.4; ctx.fill(); ctx.globalAlpha=1;
        });
        ctx.beginPath(); ctx.arc(cx,cy,3.2,0,7); ctx.fillStyle=COL.ink; ctx.fill();
      }
      function tick(){
        sweep+=.018; if(sweep>Math.PI*1.5) sweep-=Math.PI*2;
        BLIPS.forEach(function(b){
          var d=Math.abs(((sweep-b.a+Math.PI*3)%(Math.PI*2))-Math.PI); d=Math.PI-d;
          if(d<.12) b.lit=1; else b.lit=Math.max(.12,b.lit-.006);
        });
        draw(); requestAnimationFrame(tick);
      }
      readColors(); size(); draw();
      window.addEventListener("resize",function(){size();draw();});
      if(reduce){BLIPS.forEach(function(b){b.lit=Math.max(b.lit,.7);}); draw();}
      else requestAnimationFrame(tick);
    }
    // PWA
    if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js").catch(function(){});}
  }catch(e){}
})();
