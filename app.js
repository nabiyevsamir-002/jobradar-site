
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
    // on-site search over inlined titles
    var box=document.getElementById("jrSearch"), out=document.getElementById("jrResults");
    var data=window.__JOBS||[], none=window.__noneText||"";
    if(box&&out){
      box.addEventListener("input",function(){
        var q=box.value.trim().toLowerCase();
        if(q.length<2){out.innerHTML="";return;}
        var r=[];
        for(var i=0;i<data.length&&r.length<20;i++){
          if(data[i][0].toLowerCase().indexOf(q)>=0) r.push(data[i]);
        }
        if(!r.length){out.innerHTML='<div class="sr">'+none+'</div>';return;}
        out.innerHTML=r.map(function(j){
          var u=j[1]||"https://t.me/JobRadarAzBot";
          return '<a class="sr" href="'+u+'">'+j[0].replace(/[<>&]/g,function(c){
            return {"<":"&lt;",">":"&gt;","&":"&amp;"}[c];})+'</a>';
        }).join("");
      });
    }
    // PWA
    if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js").catch(function(){});}
  }catch(e){}
})();
