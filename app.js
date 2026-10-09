(function(){
"use strict";
const SB_URL="https://evuslqsbalugcyfqwhfg.supabase.co",SB_KEY="sb_publishable_dLxNrjdQhMVRQrBI39Hkog_9TxuF1z4";
const ORIGIN=location.origin;
const COLLS=["creators","briefs","offers","change_requests","link_sends","events"];
const NICHES=["Skincare","Body care","Haircare","Makeup","Fitness","Fashion","Food","Travel","Tech careers","Hosting","Parenting","Other"];
const CATS=["Skincare","Body care","Haircare","Makeup","Fitness","Fashion","Food","Travel","Tech","Home","Skin lightening","Weight loss","Crypto and trading","Betting","Teeth whitening","Alcohol","Other"];
const BLOCK=["Skin lightening","Weight loss","Crypto and trading","Betting","Teeth whitening","Alcohol"];
const AGES=["18 to 24","18 to 34","25 to 44","35 plus"];
const CITIES=["Delhi","Mumbai","Bengaluru","Pune","Hyderabad","Chennai","Kolkata","Jaipur","Chandigarh","Ahmedabad","Lucknow"];
const PAYDAYS=[7,15,30,45,60,90];
const CONTRACT=["contract_sent","creator_confirmed","brand_confirmed","locked","change_requested"];
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// key, label, singular, plural
const FORMATS=[["reel","Reel","reel","reels"],["story","Story","story","stories"],["post","Post or carousel","post","posts"],["ugc","UGC video","UGC video","UGC videos"]];
const DECLINE=[["fee","Fee too low"],["category","Not my category"],["barter","Barter only"],["timing","Bad timing"],["brand","Not this brand"],["other","Something else"]];
const OFFER_TYPES=[["paid","Paid"],["barter","Barter"],["unclear","Not clear yet"]];
const DAY=864e5;
const ICON={
 inbox:'<path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
 doc:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
 send:'<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
 plus:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>',
 home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
 rank:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 check:'<path d="M20 6L9 17l-5-5"/>',
 back:'<path d="M15 5l-7 7 7 7"/>'
};
const PAL=[["#ffb648","#ff6a4d"],["#ff6a4d","#e0337f"],["#e0337f","#8e44ad"],["#2bb6a3","#1f6feb"],["#f7971e","#e8590c"],["#7bc67b","#2f9e6e"],["#ff8fb1","#c2185b"],["#36b3d9","#1c6e8c"],["#a06cd5","#5f3dc4"],["#ef6f6c","#b8325a"]];

/* ---------- state ---------- */
const S={}; COLLS.forEach(c=>{S[c]={};});
let mode="connecting",pending=false,teamKey=null;
const ui={role:"home",tab:{creator:"offers",brand:"send",team:"pilot"},token:null,setup:false,editRules:false,justSetup:false,
  deal:null,dealSide:null,brandCode:"",found:null,findTried:false,draft:{},err:{},sent:null,showDemo:true,
  picks:{},changeOpen:false,msg:{},offFilter:"all",busy:false,tips:new Set(),declining:null,src:"",page:"",
  viewed:new Set(),once:new Set(),ranked:new Set(),started:{},lastField:{},abandoned:new Set()};

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const inr=n=>"₹"+Math.round(Number(n)||0).toLocaleString("en-IN");
const fmtD=iso=>{if(!iso)return "Not set";const p=String(iso).slice(0,10).split("-").map(Number);return p[2]+" "+MON[p[1]-1]+" "+p[0];};
const addDays=(iso,n)=>{const p=String(iso).slice(0,10).split("-").map(Number);return new Date(Date.UTC(p[0],p[1]-1,p[2]+Number(n||0))).toISOString().slice(0,10);};
const ago=iso=>{const m=Math.max(0,Math.round((Date.now()-Date.parse(iso))/60000));if(m<60)return m+" min ago";const h=Math.round(m/60);if(h<48)return h+" h ago";return Math.round(h/24)+" days ago";};
const mins=iso=>Math.round((Date.now()-Date.parse(iso))/60000);
const T=iso=>Date.parse(iso);
const all=c=>S[c];
const rows=c=>Object.entries(all(c)).map(([id,d])=>Object.assign({id},d));
const hash=s=>{let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return h;};
const grad=k=>{const p=PAL[hash(k)%PAL.length];return "background:linear-gradient(135deg,"+p[0]+","+p[1]+")";};
const ini=s=>(String(s||"?").replace(/[^A-Za-z0-9]/g,"")[0]||"?").toUpperCase();
const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+ICON[n]+'</svg>';
const av=(label,key,cls)=>'<span class="av '+(cls||"")+'"><span class="in" style="'+grad(key)+'">'+esc(ini(label))+'</span></span>';
const opt=(arr,v)=>arr.map(x=>'<option'+(String(x)===String(v)?" selected":"")+'>'+esc(x)+'</option>').join("");
const plain=s=>String(s||"").replace(/ \(dummy\)$/,"");
const firstName=s=>plain(s).split(" ")[0]||"there";
const plural=(n,one,many)=>n+" "+(Number(n)===1?one:many);
function store(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}}
function recall(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function sstore(k,v){try{sessionStorage.setItem(k,v);}catch(e){}}
function srecall(k){try{return sessionStorage.getItem(k);}catch(e){return null;}}
function toast(t){const el=$("#toast");el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{el.hidden=true;},2600);}
function D(form){return ui.draft[form]||(ui.draft[form]={});}
const ANON=(()=>{let a=recall("mingle.anon");if(!a){a="a-"+Date.now().toString(36)+Math.random().toString(36).slice(2,8);store("mingle.anon",a);}return a;})();

/* ---------- rules ---------- */
function terms(o,b){return Object.assign({},b||{},(o&&o.terms)||{});}
const dueDate=t=>t.is_barter||!t.post_date?null:addDays(t.post_date,t.payment_days);
const feeTxt=t=>t.is_barter?"Barter, product worth "+inr(t.barter_value_inr):inr(t.fee_inr);
function fit(c,b){
  const miss=[],chk=[];
  const blocked=(c.blocked_categories||[]).map(x=>String(x).toLowerCase());
  if(blocked.includes(String(b.category||"").toLowerCase()))miss.push(b.category+" is on your list of things you don't promote");
  if(!b.is_barter&&Number(b.fee_inr)<Number(c.min_fee_inr))miss.push(inr(b.fee_inr)+" is below your "+inr(c.min_fee_inr)+" minimum");
  if(b.is_barter&&c.barter_rule==="never")miss.push("Barter only, and you don't take barter");
  if(b.is_barter&&c.barter_rule!=="never"&&Number(b.barter_value_inr)<Number(c.barter_floor_inr||0))miss.push("Barter product worth "+inr(b.barter_value_inr)+" for "+b.deliverables+". Your minimum is "+inr(c.barter_floor_inr));
  if(b.usage_type==="paid"&&c.paid_ads_extra)chk.push("Wants to run it as a paid ad for "+b.usage_days+" days. You charge extra for that");
  if(!b.is_barter&&Number(b.payment_days)>Number(c.max_pay_days))chk.push("Pays "+b.payment_days+" days after posting. You accept up to "+c.max_pay_days);
  if(String(b.claims||"").trim())chk.push("Asks you to say: ‘"+String(b.claims).trim()+"’. Check you are comfortable saying it");
  if(miss.length)return{result:"misses",reasons:miss.concat(chk)};
  if(chk.length)return{result:"check",reasons:chk};
  return{result:"fits",reasons:["Meets your fee, category, usage and payment rules"]};
}
function match(c,b){
  let s=0;const yes=[],no=[];const eq=(x,y)=>String(x||"").trim().toLowerCase()===String(y||"").trim().toLowerCase();
  if(eq(c.niche,b.target_niche)){s+=40;yes.push("Niche "+c.niche);}else no.push("Niche "+(c.niche||"not set"));
  if(eq(c.top_city,b.target_city)){s+=25;yes.push("Top city "+c.top_city+" ("+(c.top_city_share||0)+"%)");}else no.push("Top city "+(c.top_city||"not set"));
  if(eq(c.age_band,b.target_age_band)){s+=15;yes.push("Age "+c.age_band);}else no.push("Age "+(c.age_band||"not set"));
  const budget=b.is_barter?Number(b.barter_value_inr):Number(b.fee_inr);
  if(Number(c.min_fee_inr)<=budget){s+=10;yes.push("Rate "+inr(c.min_fee_inr)+" within budget");}else no.push("Rate "+inr(c.min_fee_inr)+", over the "+inr(budget)+" budget");
  const tot=Number(c.total_posts)||0,on=Number(c.on_time_posts)||0;
  if(tot>0){const p=Math.round(10*on/tot);s+=p;(p>=8?yes:no).push("Posted on time "+on+" of "+tot);}else{s+=5;no.push("New: no deals on record yet");}
  return{score:s,yes,no};
}
// The seven agreed terms: deliverables, fee, where it runs, revisions, post date, payment date, claims (blank means none).
function termsComplete(t){
  return [String(t.deliverables||"").trim(),t.is_barter?Number(t.barter_value_inr)>0:Number(t.fee_inr)>0,t.usage_type==="paid"?Number(t.usage_days)>0:!!t.usage_type,
    t.revision_rounds!=null&&t.revision_rounds!=="",!!t.post_date,t.is_barter||Number(t.payment_days)>0,true].filter(Boolean).length;
}
function delivText(cnt){
  const parts=FORMATS.filter(f=>Number(cnt[f[0]])>0).map(f=>plural(Number(cnt[f[0]]),f[2],f[3]));
  return parts.length>1?parts.slice(0,-1).join(", ")+" and "+parts[parts.length-1]:(parts[0]||"");
}

/* ---------- data layer: Supabase functions ---------- */
const ERR={missing_fields:"Some required fields are missing.",handle_taken:"That handle is already on Mingle. If it is yours, open it with your private link.",unknown_handle:"This link is not active. Ask the creator for their current link.",not_allowed:"Not allowed."};
async function rpc(fn,args,o){
  let r;
  try{r=await fetch(SB_URL+"/rest/v1/rpc/"+fn,{method:"POST",keepalive:!!(o&&o.keepalive),headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify(args||{})});}
  catch(e){if(mode!=="offline"){mode="offline";setBanner();}throw{code:"offline",message:"Can't reach Mingle right now. Check your connection and try again."};}
  const t=await r.text();let j=null;try{j=t?JSON.parse(t):null;}catch(e){}
  if(mode!=="live"){mode="live";setBanner();}
  if(!r.ok){const code=(j&&j.message)||"error";throw{code,message:ERR[code]||"Something went wrong. Please try again."};}
  return j;
}
// Every event carries who and where: anon_id, is_team (left out of every metric), page, and creator or brand ids when known.
function ev(name,props,o){
  const base={anon_id:ANON,is_team:!!teamKey||ui.role==="team",page:ui.page||""};
  const me=ui.role==="creator"?meC():null;
  if(me){base.creator_id=me.handle;if(me.demo)base.demo=true;}
  if(ui.brandCode)base.brand_id=ui.brandCode;
  rpc("log_event",{p_name:name,p_props:Object.assign(base,props||{})},o).catch(()=>{});
}
function load(p){
  COLLS.forEach(c=>{const o={};((p&&p[c])||[]).forEach(d=>{if(d)o[c==="creators"?d.handle:d.id]=d;});S[c]=o;});
}
let seq=0;
async function refresh(){
  const my=++seq;ui.loading=true;let p=null;
  try{
    if(ui.deal&&ui.dealTok){
      p=await rpc("deal_get",{p_offer:ui.deal,p_token:ui.dealTok});
      ui.dealSide=p?p.side:null;
      if(p&&ui.fromLink){ui.fromLink=false;ui.role=p.side;if(p.side==="creator"){ui.token=ui.dealTok;store("mingle.token",ui.dealTok);}else{ui.brandCode=ui.dealTok;D("bc").code=ui.dealTok;}}
    }
    else if(ui.role==="team"&&teamKey)p=await rpc("team_dump",{p_key:teamKey});
    else if(ui.role==="creator"&&ui.token){p=await rpc("creator_me",{p_token:ui.token});ui.badToken=!p;}
    else if(ui.role==="brand"&&ui.tab.brand==="contracts"&&ui.brandCode){p=await rpc("brand_contracts",{p_code:ui.brandCode});ui.codeFound=!!(p&&p.found);}
    else if(ui.role==="brand"&&ui.found){const c=await rpc("public_creator",{p_handle:ui.found});p={creators:c?[c]:[]};}
  }catch(e){
    if(e.code==="not_allowed"&&ui.role==="team"){teamKey=null;store("mingle.team",null);}
    else if(e.code!=="offline")toast(e.message);
  }
  if(my!==seq)return;
  load(p);ui.loading=false;schedule();
}
function schedule(){
  const a=document.activeElement;
  if(a&&a.closest&&a.closest("#view")&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)){pending=true;return;}
  if(schedule.r)return;
  // a hidden page gets no animation frames, so fall back to a timer there
  const draw=()=>{schedule.r=0;render();};schedule.r=document.hidden?setTimeout(draw,0):requestAnimationFrame(draw);
}
document.addEventListener("focusout",()=>setTimeout(()=>{const a=document.activeElement;if(pending&&!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)))render();},60));
function go(path){try{history.replaceState(null,"",path);}catch(e){}}
const rolePath=()=>ui.role==="home"?"/":"/"+ui.role;

async function init(){
  readRoute();
  const t=recall("mingle.token");if(t&&!ui.token){ui.token=t;if(ui.role==="home"&&!ui.deal)ui.role="creator";}
  const k=recall("mingle.team");if(k)teamKey=k;
  render();
  rpc("public_creator",{p_handle:"-"}).catch(()=>{});
  await refresh();
  if(ui.autoFind){ui.autoFind=false;await act.find();}
  setInterval(()=>{if(document.visibilityState==="visible")refresh();},15000);
}
function readRoute(){
  const parts=location.pathname.split("/").filter(Boolean).map(x=>{try{return decodeURIComponent(x);}catch(e){return x;}});
  const q=new URLSearchParams(location.search);
  ui.src=q.get("s")||"";
  if(parts[0]==="c"&&parts[1]){ui.role="brand";ui.tab.brand="send";D("find").handle=parts[1];ui.autoFind=true;ui.src=ui.src||"creator_link";}
  else if(parts[0]==="brief"){ui.role="brand";ui.tab.brand="campaign";ui.src=ui.src||"campaign";}
  else if(parts[0]==="brand"){ui.role="brand";}
  else if(parts[0]==="creator"){ui.role="creator";}
  else if(parts[0]==="me"&&parts[1]){ui.role="creator";ui.token=parts[1];store("mingle.token",parts[1]);}
  else if(parts[0]==="deal"&&parts[1]&&q.get("t")){ui.deal=parts[1];ui.dealTok=q.get("t");ui.fromLink=true;}
  else if(parts[0]==="team"){ui.role="team";}
}

/* ---------- lookups ---------- */
const meC=()=>ui.token?rows("creators").find(c=>c.private_token===ui.token)||null:null;
const byHandle=h=>all("creators")[String(h||"").toLowerCase().replace(/^@/,"").trim()]||null;
const briefOf=o=>all("briefs")[o.brief_id]||{};
const isContract=o=>CONTRACT.includes(o.status);
const vis=r=>ui.showDemo||!r.demo;

/* ---------- shell ---------- */
function setBanner(){
  const b=$("#banner");
  const t={connecting:["","Connecting to Mingle…"],live:["live","Names ending in (dummy) are demo data."],offline:["local","Can't reach Mingle right now. Check your connection and try again."]}[mode];
  b.className="banner "+t[0];b.textContent=t[1];
}
function tabsFor(){
  if(ui.deal||ui.role==="home")return null;
  if(ui.role==="creator")return meC()?[["offers","Offers","inbox"],["contracts","Terms","doc"],["link","My link","send"],["profile","Profile","user"]]:null;
  if(ui.role==="brand")return[["send","Send brief","send"],["campaign","Campaign","plus"],["contracts","Terms","doc"]];
  return teamKey?[["pilot","Pilot","rank"],["today","Verify","check"],["campaigns","Campaigns","list"],["offers","Deals","doc"],["log","Links","send"]]:null;
}
function pageKey(){
  if(ui.deal)return "terms";
  if(ui.role==="home")return "home";
  if(ui.role==="creator"){const me=meC();return me?"creator_"+ui.tab.creator+(ui.editRules?"_edit":""):ui.setup?"creator_setup":ui.token?"":"creator_gate";}
  if(ui.role==="brand"){if(ui.sent)return "brief_sent";if(ui.tab.brand==="send")return ui.found?"brief_link":"brand_find";return ui.tab.brand==="campaign"?"campaign_brief":"brand_terms";}
  return teamKey?"team_"+ui.tab.team:"team_gate";
}
function render(){
  pending=false;setBanner();ui.page=pageKey();
  document.querySelectorAll(".role button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===ui.role)));
  document.body.dataset.role=ui.role;
  let html;
  if(ui.deal)html=dealView();
  else if(ui.role==="home")html=homeView();
  else if(ui.role==="creator")html=creatorView();
  else if(ui.role==="brand")html=brandView();
  else html=teamView();
  $("#view").innerHTML=html;
  const tabs=tabsFor(),nav=$("#tabbar");
  if(!tabs){nav.hidden=true;nav.innerHTML="";document.body.classList.remove("has-tabs");}
  else{
    nav.hidden=false;document.body.classList.add("has-tabs");nav.style.gridTemplateColumns="repeat("+tabs.length+",1fr)";
    const cur=ui.tab[ui.role];
    nav.innerHTML=tabs.map(t=>{const b=badge(t[0]);return '<button class="tab" data-act="tab" data-v="'+t[0]+'"'+(cur===t[0]?' aria-current="page"':'')+'>'+ic(t[2])+'<span>'+t[1]+'</span>'+(b?'<span class="badge">'+b+'</span>':'')+'</button>';}).join("");
  }
  ["brief","camp"].forEach(progress);
  after();
}
function badge(t){
  if(ui.role==="creator"&&t==="offers"){const me=meC();return me?rows("offers").filter(o=>o.creator_id===me.handle&&o.status==="new"&&!o.interested).length:0;}
  if(ui.role==="creator"&&t==="contracts"){const me=meC();return me?rows("offers").filter(o=>o.creator_id===me.handle&&(o.status==="contract_sent"||o.status==="change_requested"||o.status==="brand_confirmed")).length:0;}
  if(ui.role==="team"&&t==="today")return rows("creators").filter(c=>!c.verified&&vis(c)).length;
  if(ui.role==="team"&&t==="offers")return rows("offers").filter(o=>vis(o)&&(o.status==="new"||o.status==="change_requested"||(o.interested&&!isContract(o)))).length;
  return 0;
}
// analytics that depend on what is on screen, sent after the screen is drawn
function after(){
  if(mode==="connecting"||ui.loading&&ui.role!=="home")return;
  const key=ui.page+"|"+(ui.found||"")+"|"+(ui.deal||"");
  if(ui.page&&ui.lastPage!==key){
    ui.lastPage=key;
    const p={page:ui.page};
    if(ui.page==="brief_link"&&ui.found){p.creator_handle=ui.found;p.source="creator_link";}
    else if(ui.page==="campaign_brief")p.source="campaign";
    else if(ui.src)p.source=ui.src;
    const me=ui.role==="creator"?meC():null;if(me)p.creator_handle=me.handle;
    ev("page_viewed",p);
  }
  if(ui.role==="creator"&&ui.tab.creator==="offers"&&!ui.deal){const me=meC();if(me)rows("offers").filter(o=>o.creator_id===me.handle).forEach(o=>{if(!ui.viewed.has(o.id)){ui.viewed.add(o.id);const b=briefOf(o),t=terms(o,b),f=fit(me,t);
    ev("offer_viewed",{offer_id:o.id,fit_status:f.result,fit_result:f.result,reasons:f.reasons,fee:t.is_barter?0:Number(t.fee_inr),barter_value:t.is_barter?Number(t.barter_value_inr):0,format:t.deliverables,minutes_since_offer_arrived:mins(o.created_at),source:b.source||"",demo:!!o.demo});}});}
  if(ui.role==="team"&&teamKey&&ui.tab.team==="campaigns"){rows("briefs").filter(b=>b.source==="campaign"&&vis(b)).forEach(b=>{if(ui.ranked.has(b.id))return;ui.ranked.add(b.id);const r=ranked(b);
    ev("creators_ranked",{brief_id:b.id,n_ranked:r.length,fit_scores:r.slice(0,8).map(x=>x.score),verified_on:r.slice(0,8).map(x=>String(x.c.verified_at||"").slice(0,10)),actor:"team",demo:!!b.demo});});}
}

/* ---------- form fields ---------- */
function F(form,k,label,type,o){
  o=o||{};const v=D(form)[k];const id=form+"-"+k;const hint=o.hint?' <span class="hint">'+esc(o.hint)+'</span>':"";
  const lab='<label for="'+id+'">'+esc(label)+hint+'</label>',L=o.tip?'<div class="lblrow">'+lab+o.tip+'</div>':lab;
  if(type==="select")return '<div class="field">'+L+'<select id="'+id+'" data-f="'+form+'.'+k+'"'+(o.rr?' data-rr':'')+'>'+(o.blank?'<option value="">Choose</option>':'')+opt(o.options,v==null?o.def:v)+'</select></div>';
  if(type==="textarea")return '<div class="field">'+L+'<textarea id="'+id+'" data-f="'+form+'.'+k+'" placeholder="'+esc(o.ph||"")+'">'+esc(v||"")+'</textarea></div>';
  return '<div class="field">'+L+'<input id="'+id+'" type="'+(type||"text")+'" data-f="'+form+'.'+k+'" value="'+esc(v==null?(o.def==null?"":o.def):v)+'" placeholder="'+esc(o.ph||"")+'"'+(o.list?' list="'+o.list+'"':'')+(type==="number"?' inputmode="numeric" min="0"':'')+(o.ro?' readonly':'')+(o.auto?' autocomplete="'+o.auto+'"':'')+'></div>';
}
function CK(form,k,label){return '<label class="check"><input type="checkbox" data-f="'+form+'.'+k+'"'+(D(form)[k]?" checked":"")+'><span>'+label+'</span></label>';}
function RD(form,k,val,label,rr){return '<label class="radio"><input type="radio" name="'+form+'-'+k+'" value="'+esc(val)+'" data-f="'+form+'.'+k+'"'+(rr?' data-rr':'')+(String(D(form)[k])===String(val)?" checked":"")+'><span>'+label+'</span></label>';}
const errBox=k=>ui.err[k]?'<p class="status warn" role="alert">'+esc(ui.err[k])+'</p>':"";
const cityList='<datalist id="cities">'+CITIES.map(c=>'<option value="'+c+'">').join("")+'</datalist>';
const chipPick=(a,v,label,on)=>'<button type="button" class="chip" data-act="'+a+'" data-v="'+esc(v)+'" aria-pressed="'+!!on+'">'+esc(label)+'</button>';
// tap-to-explain: a "?" button that opens a plain-language line under a term
function tip(key,text){const open=ui.tips.has(key);return '<button type="button" class="tipbtn" data-act="tip" data-v="'+esc(key)+'" aria-expanded="'+open+'" aria-label="What does this mean?">?</button>'+(open?'<span class="tiptext">'+esc(text)+'</span>':'');}
// "you" wording on the creator's own offers; neutral wording on agreed terms, which both sides read
const usageTip=(t,both)=>t.usage_type==="paid"?(both?"Besides the creator's page, the brand can run the video as an ad from its own account for ":"Besides your page, the brand can run your video as an ad from their own account for ")+t.usage_days+" days. After that it must stop. Creators usually charge extra for this.":(both?"The brand can share or repost the post as it is, but cannot run it as an ad from its account.":"The brand can share or repost your post as it is, but cannot run it as an ad from their account.");
const revTip=(t,both)=>{const n=Number(t.revision_rounds),times=n===1?"once":"up to "+n+" times";return n>0?(both?"Before posting, the brand can ask the creator to re-edit the video "+times+".":"Before you post, the brand can ask you to re-edit the video "+times+".")+" Anything more, or any change after posting, is a new request.":(both?"The brand sees the video before it is posted but cannot ask for re-edits.":"The brand sees your video before you post but cannot ask for re-edits.");};

/* ---------- home: pick your side ---------- */
function homeView(){
  return '<section class="hero home"><p class="eyebrow">For part-time creators and the small brands that hire them</p><h1>Brand deals that <em>fit your audience</em>, agreed before anyone films.</h1>'+
  '<p class="lead">Brands send one complete brief: fee, what to make, where it runs, post date and payment date. Creators see every offer sorted against their own rules. Both sides confirm the terms before filming.</p></section>'+
  '<div class="panel"><div class="choose">'+
   '<article class="persona"><span class="ptag">I\'m a creator</span><h2>Fewer offers, better ones</h2><ul class="ticks"><li>Set your fee and rules once</li><li>Every offer sorted: Fits, Check or Misses, with the reason</li><li>Terms locked before you film, payment date included</li></ul>'+
    '<div class="btncol"><button class="btn primary wide" data-act="startSetup">Set up my profile, 2 min</button><button class="btn wide" data-act="goCreator">I have a private code</button></div></article>'+
   '<article class="persona"><span class="ptag b">I\'m a brand</span><h2>A short list you can trust</h2><ul class="ticks"><li>Brief a creator who sent you their Mingle link</li><li>Or post a campaign: we rank verified creators by audience fit, never followers</li><li>One standard brief, terms both sides confirm</li></ul>'+
    '<div class="btncol"><button class="btn dark wide" data-act="goBrand" data-v="send">Send a brief to a creator</button><button class="btn wide" data-act="goBrand" data-v="campaign">Post a campaign brief</button></div></article>'+
  '</div>'+
  '<section class="how" aria-label="How Mingle works"><h2>How it works</h2><ol><li><b>The creator shares a link.</b><span>Instead of negotiating in DMs, the creator replies with their Mingle link.</span></li><li><b>The brand sends one complete brief.</b><span>A brief cannot go out without fee, deliverables, usage, post date and payment terms.</span></li><li><b>Both sides confirm the terms.</b><span>Terms lock only when both confirm, before filming. Changes are dated requests, not DMs.</span></li></ol></section>'+
  '<div class="card demo"><p class="muted"><b>Trying Mingle out?</b> See the creator side as Riya (dummy), code <b>riya-demo</b>, or the brand side by briefing her.</p><div class="btnrow"><button class="btn sm" data-act="demoCreator">Open demo creator</button><button class="btn sm" data-act="demoBrand">Brief the demo creator</button></div></div>'+
  '</div>';
}

/* ---------- creator ---------- */
function creatorView(){
  const me=meC();
  if(ui.token&&!me&&!ui.setup)return ui.badToken&&!ui.loading?gate("This page is private. Use the link we sent you on WhatsApp."):'<div class="panel"><p class="muted">Loading your offers…</p></div>';
  if(!me)return ui.setup?setupForm(false):gate(ui.err.gate);
  if(ui.tab.creator==="offers")return creatorOffers(me);
  if(ui.tab.creator==="contracts")return creatorContracts(me);
  if(ui.tab.creator==="link")return creatorLink(me);
  return ui.editRules?setupForm(true,me):creatorProfile(me);
}
function gate(err){
  return '<section class="hero"><h1>Brand deals that <em>fit your audience</em>, with terms locked before you film.</h1><p class="muted">Set your rules once. Every brief arrives complete and sorted: fits, check, or misses.</p></section>'+
  '<div class="panel form">'+
  '<div class="card"><h2>Open my offers</h2>'+F("gate","code","Private code","text",{ph:"From your private link",auto:"off"})+(err?'<p class="status warn" role="alert">'+esc(err)+'</p>':"")+'<button class="btn dark wide" data-act="openCode">Open</button></div>'+
  '<div class="card"><h2>New to Mingle?</h2><p class="muted">Set up your profile and rules in about 2 minutes. You get a link to send brands and a private code for your offers.</p><button class="btn primary wide" data-act="startSetup">Set up my profile</button></div>'+
  '<div class="card"><p class="muted">Trying Mingle out? Open the demo creator, Riya (dummy), whose private code is <b>riya-demo</b>.</p><button class="btn wide" data-act="demoCreator">Open demo creator</button></div>'+
  '</div>';
}
function setupForm(edit,me){
  const f=D("setup");
  if(f.barter_rule==null)Object.assign(f,{barter_rule:"value",max_pay_days:"30",paid_ads_extra:true,blocked:[],niche:"Skincare",age_band:"18 to 34"});
  const chips=BLOCK.concat((f.blocked||[]).filter(x=>!BLOCK.includes(x)));
  return (edit?'<div class="back"><button class="iconbtn" data-act="cancelEdit" aria-label="Back">'+ic("back")+'</button><b>Edit my rules</b></div>':'<section class="hero"><h1>Set up your <em>Mingle</em></h1><p class="muted">Three short steps. Brands see your verified audience, not just followers, and your rules sort every offer for you.</p></section>')+
  '<div class="panel form">'+
  '<div class="card"><h3><span class="stepn">1</span>About you</h3>'+
    F("setup","name","Your name","text",{ph:"First name is fine",auto:"given-name"})+
    '<div class="row2">'+F("setup","handle","Instagram handle","text",{ph:"without @",ro:edit,auto:"off"})+F("setup","whatsapp","WhatsApp","text",{ph:"+91",auto:"tel"})+'</div>'+
    '<div class="row2">'+F("setup","niche","Niche","select",{options:NICHES})+F("setup","followers","Followers","number",{ph:"9200"})+'</div>'+
    F("setup","offers_per_month","Brand offers you get in a month","number",{ph:"4"})+
  '</div>'+
  '<div class="card"><h3><span class="stepn">2</span>Your audience</h3><p class="muted">From your Instagram insights. Send us the screenshot on WhatsApp; we check it on a short call and mark you verified.</p>'+
    '<div class="row2">'+F("setup","top_city","Top city","text",{list:"cities",ph:"Delhi"})+F("setup","top_city_share","Share in top city","number",{hint:"%",ph:"31"})+'</div>'+
    F("setup","age_band","Main age band","select",{options:AGES})+cityList+
  '</div>'+
  '<div class="card"><h3><span class="stepn">3</span>Your rules</h3><p class="muted">Mingle checks every offer against these. Offers that miss are shown as advice; you always decide.</p>'+
    F("setup","min_fee_inr","Lowest fee per reel","number",{hint:"₹",ph:"8000"})+
    '<div class="field"><span class="lbl">Barter</span>'+RD("setup","barter_rule","value","I take barter if the product is worth at least",true)+(f.barter_rule==="value"?F("setup","barter_floor_inr","Barter minimum","number",{hint:"₹",ph:"2000"}):"")+RD("setup","barter_rule","never","I never take barter",true)+'</div>'+
    '<div class="field"><span class="lbl">Categories I don\'t promote</span><div class="chips">'+chips.map(x=>'<button type="button" class="chip block" data-act="toggleBlock" data-v="'+esc(x)+'" aria-pressed="'+(f.blocked||[]).includes(x)+'">'+esc(x)+'</button>').join("")+'</div>'+
    '<div class="row"><input type="text" data-f="setup.custom" aria-label="Add your own category" placeholder="Add your own" value="'+esc(f.custom||"")+'"><button type="button" class="btn sm" data-act="addBlock">Add</button></div></div>'+
    F("setup","max_pay_days","I want to be paid within (days after posting)","select",{options:[15,30,45,60]})+
    CK("setup","paid_ads_extra","I charge extra if the brand runs my video as a paid ad")+
    CK("setup","consent","I agree Mingle may show my verified audience numbers to brands I send my link to")+
  '</div>'+errBox("setup")+
  '<button class="btn primary wide" data-act="saveSetup"'+(ui.busy?" disabled":"")+'>'+(edit?"Save my rules":"Create my Mingle")+'</button>'+
  (edit?"":'<button class="btn wide" data-act="cancelSetup">Back</button>')+
  '</div>';
}
function creatorHead(me){
  return '<div class="phead mehead">'+av(me.handle,me.handle)+'<div class="who"><b>@'+esc(me.handle)+(me.verified?'<span class="tick" aria-label="verified">✓</span>':'')+'</b><span class="sub">'+(me.verified?"Verified audience":"Verification pending")+' · '+esc(me.niche||"")+'</span></div></div>';
}
function offerCard(o,me){
  const b=briefOf(o),t=terms(o,b),f=fit(me,t);
  const src=b.source==="campaign"?"Campaign invite":"Your Mingle link";
  const due=dueDate(t);
  let foot="";
  if(o.status==="declined")foot='<p class="status bad">You declined this offer.</p>'+(ui.msg["decline:"+o.id]?'<p class="muted">Paste this polite reply to the brand:</p>'+msgBox("decline:"+o.id,ui.msg["decline:"+o.id]):"");
  else if(isContract(o))foot='<p class="status '+(o.status==="locked"?"ok":"info")+'">'+(o.status==="locked"?"Terms locked on "+fmtD(o.locked_at):"Agreed terms ready to review")+'</p><button class="btn dark wide" data-act="openDeal" data-v="'+o.id+'" data-side="creator">Review agreed terms</button>';
  else if(o.interested)foot='<p class="status info">You said yes. We are writing up the agreed terms and send them within 12 hours of your yes.</p>';
  else if(ui.declining===o.id)foot='<div class="declinebox"><p class="lbl">Why are you passing? <span class="hint">Only our team sees this</span></p><div class="chips">'+DECLINE.map(([k,l])=>chipPick("declineReason",k,l,D("dec")[o.id]===k)).join("")+'</div>'+
    '<div class="btnrow"><button class="btn dark" data-act="decline" data-v="'+o.id+'"'+(D("dec")[o.id]?"":" disabled")+'>Decline politely</button><button class="btn" data-act="cancelDecline">Keep it</button></div></div>';
  else foot='<div class="btnrow"><button class="btn primary" data-act="interested" data-v="'+o.id+'">I\'m interested</button><button class="btn" data-act="startDecline" data-v="'+o.id+'">Decline politely</button></div>';
  return '<article class="post '+f.result+'">'+
   '<div class="phead">'+av(b.brand_name,b.brand_name,"sq")+'<div class="who"><b>'+esc(b.brand_name)+'</b><span class="sub">'+src+' · '+ago(o.created_at)+'</span></div><span class="pill '+f.result+'">'+({fits:"Fits",check:"Check",misses:"Misses"})[f.result]+'</span></div>'+
   '<div class="media" style="'+grad(b.product+b.brand_name)+'"><h3>'+esc(b.product)+'</h3><span class="tag">'+esc(t.deliverables)+'</span></div>'+
   '<div class="pbody"><div class="feeline"><b>'+feeTxt(t)+'</b><span>'+(t.is_barter?"No cash fee":"Paid by "+fmtD(due)+", "+esc(t.payment_days)+" days after posting")+'</span></div>'+
   '<ul class="reasons">'+f.reasons.map(r=>'<li>'+esc(r)+'</li>').join("")+'</ul>'+
   '<dl class="terms"><dt>Category</dt><dd>'+esc(t.category)+'</dd><dt>Post on</dt><dd>'+fmtD(t.post_date)+'</dd><dt>Runs</dt><dd>'+(t.usage_type==="paid"?"Your page plus paid ads, "+esc(t.usage_days)+" days":"Your page only")+tip("use:"+o.id,usageTip(t))+'</dd><dt>Revisions</dt><dd>'+esc(t.revision_rounds)+' round'+(Number(t.revision_rounds)===1?"":"s")+tip("rev:"+o.id,revTip(t))+'</dd></dl>'+
   foot+'</div></article>';
}
function creatorOffers(me){
  const mine=rows("offers").filter(o=>o.creator_id===me.handle).sort((a,b)=>b.created_at.localeCompare(a.created_at));
  const handled=o=>o.status==="declined"||o.interested||isContract(o);
  const groups=[["fits","Fits your rules"],["check","Check before you reply"],["misses","Misses your rules"]];
  let out=creatorHead(me)+(ui.justSetup?'<div class="panel" style="padding-bottom:0"><p class="status ok">You\'re on Mingle. Send your link to the next brand that DMs you.</p></div>':"");
  if(!mine.length)return out+'<div class="panel"><div class="card"><h3>No offers yet</h3><p class="muted">Paste your link in your next reply to a brand. Their brief lands here, sorted by your rules.</p><button class="btn dark wide" data-act="tab" data-v="link">Get my link</button></div></div>';
  const open=mine.filter(o=>!handled(o)),cnt={fits:0,check:0,misses:0};open.forEach(o=>{cnt[fit(me,terms(o,briefOf(o))).result]++;});
  out+='<div class="panel" style="padding-bottom:0"><div class="summary" role="group" aria-label="Your open offers">'+groups.map(([k])=>{const inner='<b>'+cnt[k]+'</b><span>'+({fits:"Fit",check:"To check",misses:"Miss"})[k]+'</span>';return cnt[k]?'<button class="sumc '+k+'" data-act="jump" data-v="g-'+k+'">'+inner+'</button>':'<div class="sumc zero '+k+'">'+inner+'</div>';}).join("")+'</div></div><div class="panel wide">';
  if(!open.length)out+='<p class="group-h">No open offers</p><p class="muted wfull">Everything is handled. New briefs from your link land here, sorted by your rules.</p>';
  for(const [k,label] of groups){
    const list=open.filter(o=>fit(me,terms(o,briefOf(o))).result===k);
    if(list.length)out+='<p class="group-h" id="g-'+k+'">'+label+' ('+list.length+')'+(k==="misses"?' <span class="hint">Advice only. You can still say yes.</span>':'')+'</p>'+list.map(o=>offerCard(o,me)).join("");
  }
  const h=mine.filter(handled);
  if(h.length)out+='<p class="group-h">Handled ('+h.length+')</p>'+h.map(o=>offerCard(o,me)).join("");
  return out+'</div>';
}
function creatorContracts(me){
  const list=rows("offers").filter(o=>o.creator_id===me.handle&&isContract(o));
  return creatorHead(me)+'<div class="panel">'+(list.length?list.map(o=>dealRow(o,"creator")).join(""):'<div class="card"><h3>No agreed terms yet</h3><p class="muted">When you say yes to an offer, our team writes up the agreed terms within 12 hours and they appear here.</p></div>')+'</div>';
}
function dealRow(o,side){
  const b=briefOf(o),c=byHandle(o.creator_id)||{handle:o.creator_id},t=terms(o,b),due=dueDate(t);
  const st=statusLabel(o);
  return '<button class="list-item" data-act="openDeal" data-v="'+o.id+'" data-side="'+side+'">'+(side==="creator"?av(b.brand_name,b.brand_name,"sq"):av(c.handle,c.handle))+'<span class="grow"><b>'+esc(side==="creator"?b.brand_name:"@"+c.handle)+'</b><span class="muted" style="display:block">'+esc(b.product)+' · '+esc(t.deliverables)+'</span><span class="payline">'+feeTxt(t)+(due?' · paid by '+fmtD(due):'')+'</span></span><span class="pill '+st[1]+'">'+st[0]+'</span></button>';
}
function statusLabel(o){
  return({new:["New","info"],screened:["Screened","info"],declined:["Declined","misses"],contract_sent:["To confirm","wait"],creator_confirmed:["Creator confirmed","wait"],brand_confirmed:["Brand confirmed","wait"],locked:["Locked","locked"],change_requested:["Change asked","check"]})[o.status]||[o.status,"info"];
}
function replyText(me){return "Hi, thanks for reaching out. So I can reply properly, could you share the brief here? It takes about 3 minutes: "+ORIGIN+"/c/"+encodeURIComponent(me.handle);}
function msgBox(key,text){return '<div class="link" id="m-'+esc(key.replace(/[^a-z0-9-]/gi,"_"))+'">'+esc(text)+'</div><button type="button" class="btn sm" data-act="copy" data-v="'+esc(key)+'">Copy message</button>';}
function creatorLink(me){
  const sends=rows("link_sends").filter(s=>s.creator_id===me.handle).sort((a,b)=>b.sent_at.localeCompare(a.sent_at));
  const sd=D("send");if(!sd.type)sd.type="unclear";
  ui.msg["reply"]=replyText(me);
  return creatorHead(me)+'<div class="panel form">'+
  (ui.justSetup?'<p class="status ok">You\'re set up. Save your private link below; it opens your offers on any phone.</p>':"")+
  '<div class="card"><h3>Your reply to brands</h3><p class="muted">Paste this when a brand DMs you. Their brief comes to you complete and sorted.</p>'+msgBox("reply",ui.msg.reply)+'</div>'+
  '<div class="card"><h3>I sent my link</h3><p class="muted">Tell us which brand you sent it to, so we can follow up if they go quiet.</p>'+
   '<div class="field"><label for="send-brand">Brand handle</label><input id="send-brand" type="text" data-f="send.brand" placeholder="@brand" value="'+esc(sd.brand||"")+'" autocomplete="off"></div>'+
   '<div class="field"><span class="lbl">What did they offer in the DM?</span><div class="chips">'+OFFER_TYPES.map(([k,l])=>chipPick("sendType",k,l,sd.type===k)).join("")+'</div></div>'+
   '<button class="btn dark wide" data-act="logSendCreator">Log it</button>'+
   (sends.length?'<table class="trk"><thead><tr><th>Brand</th><th>Sent</th><th>Result</th></tr></thead><tbody>'+sends.slice(0,6).map(s=>'<tr><td>@'+esc(s.brand_handle)+'</td><td>'+fmtD(s.sent_at)+'</td><td>'+esc(outcomeLabel(s.outcome))+'</td></tr>').join("")+'</tbody></table>':"")+
  '</div>'+
  '<div class="card"><h3>Your private link</h3><div class="link">'+esc(ORIGIN+"/me/"+me.private_token)+'</div><p class="muted">Keep this link private. It opens your offers and agreed terms on any phone. Your code is <b>'+esc(me.private_token)+'</b>.</p></div>'+
  (me.verified?'<p class="status ok">Verified on '+fmtD(me.verified_at)+'. Brands see your audience numbers.</p>':'<p class="status warn">Verification pending: send your insights screenshot to our WhatsApp and we check it on a short call.</p>')+
  '</div>';
}
const outcomeLabel=o=>({filled:"Brief sent",replied_in_dm:"Replied in DM",went_quiet:"Went quiet"})[o]||"Waiting";
function creatorProfile(me){
  const deals=rows("offers").filter(o=>o.creator_id===me.handle);
  return '<div class="panel form"><div class="prof">'+av(me.handle,me.handle,"lg")+'<div class="stats"><div><b>'+Number(me.followers||0).toLocaleString("en-IN")+'</b><span>followers</span></div><div><b>'+deals.length+'</b><span>offers</span></div><div><b>'+(me.total_posts?me.on_time_posts+"/"+me.total_posts:"New")+'</b><span>on time</span></div></div></div>'+
  '<div><b>'+esc(me.name||me.handle)+'</b> <span class="muted">@'+esc(me.handle)+(me.verified?'<span class="tick" aria-label="verified">✓</span>':'')+'</span><p class="muted">'+esc(me.niche)+' · Top city '+esc(me.top_city||"not set")+' '+(me.top_city_share?esc(me.top_city_share)+"%":"")+' · '+esc(me.age_band||"")+'</p></div>'+
  '<div class="hl">'+[["Min "+inr(me.min_fee_inr),"Fee"],[me.barter_rule==="never"?"No barter":"≥ "+inr(me.barter_floor_inr),"Barter"],["≤ "+me.max_pay_days+" days","Paid"],[me.paid_ads_extra?"Extra":"Included","Paid ads"]].map(h=>'<div class="hlc"><div class="c">'+esc(h[0])+'</div><span>'+h[1]+'</span></div>').join("")+'</div>'+
  ((me.blocked_categories||[]).length?'<div class="field"><span class="lbl">I don\'t promote</span><div class="chips">'+me.blocked_categories.map(x=>'<span class="info">'+esc(x)+'</span>').join("")+'</div></div>':"")+
  '<button class="btn dark wide" data-act="editRules">Edit my rules</button><button class="btn wide" data-act="signOut">Sign out on this phone</button></div>';
}

/* ---------- brand ---------- */
function brandView(){
  if(ui.tab.brand==="contracts")return brandContracts();
  if(ui.sent)return sentView();
  if(ui.tab.brand==="campaign")return '<section class="hero"><h1>Post a <em>campaign</em> brief</h1><p class="muted">Tell us who you want to reach. Our team ranks verified creators by audience fit, never by follower count, and invites the best matches within 24 hours.</p></section><div class="panel form">'+briefForm("camp",true)+'</div>';
  const c=ui.found?byHandle(ui.found):null;
  let out='<section class="hero"><h1>Send a brief to a <em>creator</em></h1><p class="muted">'+(c?"@"+esc(c.handle)+" sent you here. One complete brief, so they can say yes fast.":"Got a creator's Mingle link? Enter their handle to brief them.")+'</p></section><div class="panel form">';
  if(!c)out+='<div class="card"><label for="find-handle">Creator\'s handle</label><div class="row"><input id="find-handle" type="text" data-f="find.handle" placeholder="@handle" value="'+esc(D("find").handle||"")+'" autocomplete="off"><button class="btn dark sm" data-act="find">Find</button></div>'+
   (ui.findTried?'<p class="status warn" role="alert">This link is not active. Ask the creator for their current link.</p>':'')+'</div>';
  else{
    out+='<div class="card"><div class="prof">'+av(c.handle,c.handle,"lg")+'<div style="display:grid;gap:4px;min-width:0"><b>@'+esc(c.handle)+(c.verified?'<span class="tick" aria-label="verified">✓</span>':'')+'</b><span class="muted">'+esc(c.niche)+' · '+esc(c.followers_band||"")+' followers</span>'+
     (c.verified?'<span class="info">Verified'+(c.verified_at?' on '+fmtD(c.verified_at):'')+': '+esc(c.top_city)+' '+esc(c.top_city_share)+'%, '+esc(c.age_band)+(c.total_posts?', posted on time '+c.on_time_posts+' of '+c.total_posts:'')+'</span>':'<span class="info">Audience check pending</span>')+'</div></div>'+
     '<button type="button" class="linkbtn" data-act="changeCreator">Not this creator?</button></div>'+
     briefForm("brief",false);
  }
  return out+'</div>';
}
// what a brief still needs, in the order the form asks for it
function briefNeeds(f,camp){
  const need=[];
  [["brand_name","brand name"],["contact_name","your name"],["contact_channel","WhatsApp or email"],["product","product"],["category","category"]].forEach(([k,l])=>{if(!String(f[k]||"").trim())need.push(l);});
  if(!delivText(f.cnt||{}))need.push("what each creator makes");
  if(f.pay==="barter"?!(Number(f.barter_value_inr)>0):!(Number(f.fee_inr)>0))need.push(f.pay==="barter"?"product value":"fee");
  if(f.usage_type==="paid"&&!(Number(f.usage_days)>0))need.push("paid ad days");
  if(!f.post_date)need.push("post date");
  if(!String(f.payment_days||"").trim())need.push("payment days");
  if(camp&&!String(f.target_city||"").trim())need.push("audience city");
  return need;
}
function briefPayload(f){
  const note=String(f.deliv_note||"").trim(),d=delivText(f.cnt||{});
  return {brand_name:f.brand_name,website:f.website,contact_name:f.contact_name,contact_role:f.contact_role,contact_channel:f.contact_channel,product:f.product,category:f.category,deliverables:d+(note?" ("+note+")":""),
    fee_inr:Number(f.fee_inr)||0,is_barter:f.pay==="barter",barter_value_inr:Number(f.barter_value_inr)||0,creators_wanted:Number(f.creators_wanted)||1,usage_type:f.usage_type,usage_days:Number(f.usage_days)||0,
    revision_rounds:Number(f.revision_rounds)||0,post_date:f.post_date,payment_days:Number(f.payment_days),claims:f.claims||"",target_niche:f.target_niche,target_city:f.target_city,target_age_band:f.target_age_band};
}
function progress(form){
  const el=document.getElementById("prog-"+form);if(!el)return;
  const f=D(form),camp=form==="camp",need=briefNeeds(f,camp),total=camp?11:10,done=total-need.length;
  el.innerHTML='<div class="bar" aria-hidden="true"><span style="width:'+Math.round(100*done/total)+'%"></span></div><p class="muted">'+(need.length?'<b>'+done+' of '+total+'</b> filled. Still needed: '+esc(need.join(", "))+'.':'<b>Ready to send.</b> The creator sees the fee, usage and payment date first.')+'</p>';
}
function briefForm(form,camp){
  const f=D(form);
  if(f.pay==null)Object.assign(f,{pay:"paid",usage_type:"organic",revision_rounds:"1",payment_days:"30",category:"",creators_wanted:"3",target_niche:"Skincare",target_age_band:"18 to 34",cnt:{reel:1}});
  const cnt=f.cnt||(f.cnt={});
  return '<div class="card"><h3><span class="stepn">1</span>Your brand</h3>'+
   '<div class="row2">'+F(form,"brand_name","Brand name","text",{auto:"organization"})+F(form,"website","Website","text",{ph:"optional",auto:"url"})+'</div>'+
   '<div class="row2">'+F(form,"contact_name","Your name","text",{auto:"name"})+F(form,"contact_role","Your role","text",{ph:"Brand manager"})+'</div>'+
   F(form,"contact_channel","WhatsApp or email","text",{auto:"email"})+'</div>'+
  '<div class="card"><h3><span class="stepn">2</span>The deal</h3>'+
   '<div class="row2">'+F(form,"product","Product","text")+F(form,"category","Category","select",{options:CATS,blank:true})+'</div>'+
   '<div class="field"><span class="lbl">What each creator makes</span><div class="counters">'+FORMATS.map(([k,l])=>'<div class="counter"><span>'+l+'</span><div class="cbtns"><button type="button" class="iconbtn cb" data-act="cnt" data-form="'+form+'" data-v="'+k+'" data-d="-1" aria-label="One less: '+l+'">−</button><b>'+(Number(cnt[k])||0)+'</b><button type="button" class="iconbtn cb" data-act="cnt" data-form="'+form+'" data-v="'+k+'" data-d="1" aria-label="One more: '+l+'">+</button></div></div>').join("")+'</div></div>'+
   F(form,"deliv_note","Details","text",{ph:"Optional. For example: 30 to 45 seconds, product in use"})+
   '<div class="field"><span class="lbl">Payment</span>'+RD(form,"pay","paid","Fee per creator",true)+RD(form,"pay","barter","Barter (product only)",true)+'</div>'+
   (f.pay==="barter"?F(form,"barter_value_inr","Product value","number",{hint:"₹"}):F(form,"fee_inr","Fee per creator","number",{hint:"₹"}))+
   '<div class="field"><div class="lblrow"><span class="lbl">Where it runs</span>'+tip(form+":use","Creator\'s page only: you can share or repost the post as it is, but not run it as an ad. Also as a paid ad: you can run the video as an ad from your own account for the days you set. Creators usually charge extra for paid use.")+'</div>'+RD(form,"usage_type","organic","Creator\'s page only",true)+RD(form,"usage_type","paid","Also as a paid ad",true)+'</div>'+
   (f.usage_type==="paid"?F(form,"usage_days","Paid ad for how many days","number",{ph:"90"}):"")+
   F(form,"revision_rounds","Revision rounds","select",{options:[0,1,2,3],tip:tip(form+":rev","How many times you can ask the creator to re-edit the video before it is posted. Changes after posting are a new request.")})+
   '<div class="row2">'+F(form,"post_date","Post date","date")+F(form,"payment_days","Pay within","select",{options:PAYDAYS,hint:"days after posting"})+'</div>'+
   F(form,"claims","Anything the creator must say","textarea",{ph:"Optional. For example a claim about results."})+'</div>'+
  (camp?'<div class="card"><h3><span class="stepn">3</span>Who you want</h3><div class="row2">'+F(form,"creators_wanted","Creators wanted","number")+F(form,"target_niche","Niche","select",{options:NICHES})+'</div><div class="row2">'+F(form,"target_city","Audience city","text",{list:"cities",ph:"Delhi"})+F(form,"target_age_band","Age band","select",{options:AGES})+'</div>'+cityList+'</div>':"")+
  '<div class="sendbar"><div id="prog-'+form+'" class="prog" aria-live="polite"></div>'+errBox(form)+'<button class="btn primary wide" data-act="sendBrief" data-v="'+form+'"'+(ui.busy?" disabled":"")+'>Send brief</button></div>';
}
function sentView(){
  const s=ui.sent;
  return '<section class="hero"><h1>Brief <em>sent</em></h1></section><div class="panel form"><p class="status ok">Brief sent. Nothing is final until both sides confirm.</p>'+
  '<div class="card"><h3>Your brief code</h3><div class="link">'+esc(s.code)+'</div><p class="muted">Keep this code. When the agreed terms are ready we send you a link. You can also open Mingle, tap Brand, then Terms, and enter the code.</p></div>'+
  '<div class="card"><h3>What happens next</h3><ol class="next">'+(s.camp?'<li>Our team ranks verified creators for your brief by audience fit.</li><li>We invite the best matches within 24 hours. Each sees your brief sorted against their rules.</li>':'<li>@'+esc(s.handle)+' sees your brief now, sorted against their rules.</li>')+'<li>If a creator says yes, we send you both the agreed terms within 12 hours.</li><li>Terms lock when you both confirm, before filming.</li></ol></div>'+
  '<button class="btn wide" data-act="newBrief">Send another brief</button><button class="btn dark wide" data-act="tab" data-v="contracts">Go to agreed terms</button></div>';
}
function brandContracts(){
  const code=String(ui.brandCode||"").trim();
  const list=code?rows("offers").filter(o=>o.brand_token===code):[];
  let note="";
  if(code&&!ui.loading&&!list.length)note='<p class="status '+(ui.codeFound?"info":"warn")+'" role="alert">'+(ui.codeFound?"Brief received. We are writing up the agreed terms and send them within 12 hours of the creator\'s yes.":"No brief with that code. Check the code we sent you.")+'</p>';
  return '<section class="hero"><h1>Your <em>agreed terms</em></h1><p class="muted">Enter the brief code we gave you when you sent the brief.</p></section><div class="panel form"><div class="card"><label for="bc-code">Brief code</label><div class="row"><input id="bc-code" type="text" data-f="bc.code" value="'+esc(D("bc").code||ui.brandCode||"")+'" placeholder="e.g. dewdrop-01" autocomplete="off"><button class="btn dark sm" data-act="brandCode">Open</button></div>'+note+'</div>'+
  list.map(o=>dealRow(o,"brand")).join("")+
  '<p class="muted">Trying it out? Demo brief codes are dewdrop-01, bloomwell-01, leaf-01 and kumkum-01.</p></div>';
}

/* ---------- agreed terms ---------- */
function dealView(){
  const o=all("offers")[ui.deal];
  const head='<div class="back"><button class="iconbtn" data-act="closeDeal" aria-label="Back">'+ic("back")+'</button><b>Agreed terms</b></div>';
  if(!o||!ui.dealSide)return head+'<div class="panel"><p class="status warn">'+(ui.loading||mode==="connecting"?"Loading…":"This link to the agreed terms is not valid. Use the link we sent you.")+'</p></div>';
  const b=briefOf(o),t=terms(o,b),c=byHandle(o.creator_id)||{handle:o.creator_id},side=ui.dealSide,other=side==="creator"?"brand":"creator",due=dueDate(t);
  let out=head+'<div class="panel form"><div class="row">'+av(b.brand_name,b.brand_name,"sq")+'<span style="font-weight:700">×</span>'+av(c.handle,c.handle)+'<div class="grow"><b>'+esc(b.brand_name)+' × @'+esc(c.handle)+'</b><p class="muted">You are viewing as the '+side+'</p></div></div>';
  if(!isContract(o))return out+'<p class="status info">We are writing up the agreed terms and send them within 12 hours of your yes.</p></div>';
  out+='<div class="paycard"><span>'+(t.is_barter?"Barter deal":"Fee")+'</span><b>'+feeTxt(t)+'</b>'+(due?'<span>Paid by <b>'+fmtD(due)+'</b>, '+esc(t.payment_days)+' days after the '+fmtD(t.post_date)+' post</span>':'')+'</div>';
  if(o.status==="change_requested"){
    const crs=rows("change_requests").filter(r=>r.offer_id===o.id).sort((a,b)=>b.created_at.localeCompare(a.created_at));
    out+='<p class="status warn">Changed after confirmation. Please review.</p>'+(crs[0]?'<p class="muted">The '+esc(crs[0].side)+' asked to change <b>'+esc(crs[0].field)+'</b>: “'+esc(crs[0].note)+'”. Our team updates the terms and sends them back to both of you.</p>':"");
  }
  if(o.status==="locked")out+='<p class="status ok">Terms locked on '+fmtD(o.locked_at)+'. You can film now.'+(due&&side==="creator"?' Got paid? Tell us on WhatsApp and we log it.':'')+'</p>';
  out+='<div class="card"><dl class="terms">'+
   '<dt>You make</dt><dd>'+esc(t.deliverables)+'</dd>'+
   '<dt>Product</dt><dd>'+esc(t.product)+'</dd>'+
   '<dt>Fee</dt><dd>'+feeTxt(t)+'</dd>'+
   '<dt>Where it runs</dt><dd'+(t.usage_type==="paid"?' class="flag"':'')+'>'+(t.usage_type==="paid"?"Creator's page, plus paid ads for "+esc(t.usage_days)+" days":"Creator's page only")+tip("duse:"+o.id,usageTip(t,true))+'</dd>'+
   '<dt>Revisions</dt><dd>'+esc(t.revision_rounds)+' round'+(Number(t.revision_rounds)===1?"":"s")+', before posting only'+tip("drev:"+o.id,revTip(t,true))+'</dd>'+
   '<dt>Post on</dt><dd>'+fmtD(t.post_date)+'</dd>'+
   '<dt>Paid by</dt><dd>'+(t.is_barter?"Not applicable, barter":fmtD(due))+'</dd>'+
   '<dt>Claims asked</dt><dd'+(String(t.claims||"").trim()?' class="flag"':'')+'>'+(String(t.claims||"").trim()?esc(t.claims):"None")+'</dd>'+
   '<dt>Creator</dt><dd>@'+esc(c.handle)+(c.verified_at?'<span class="muted" style="display:block;font-weight:400">Audience verified on '+fmtD(c.verified_at)+'</span>':'')+'</dd>'+
   '<dt>Brand contact</dt><dd>'+esc(b.contact_name)+(b.contact_role?", "+esc(b.contact_role):"")+'</dd></dl></div>'+
  '<ul class="steps"><li class="done"><span class="dot"></span>Terms sent'+(o.contract_sent_at?' on '+fmtD(o.contract_sent_at):'')+'</li><li class="'+(o.creator_confirmed_at?"done":"")+'"><span class="dot"></span>'+(o.creator_confirmed_at?"Creator confirmed on "+fmtD(o.creator_confirmed_at):"Waiting for the creator")+'</li><li class="'+(o.brand_confirmed_at?"done":"")+'"><span class="dot"></span>'+(o.brand_confirmed_at?"Brand confirmed on "+fmtD(o.brand_confirmed_at):"Waiting for the brand")+'</li><li class="'+(o.status==="locked"?"done":"")+'"><span class="dot"></span>'+(o.status==="locked"?"Locked. Film and post on "+fmtD(t.post_date):"Locks when both confirm")+'</li></ul>';
  const mine=o[side+"_confirmed_at"];
  if(o.status!=="locked"&&o.status!=="change_requested")out+=mine?'<p class="status info">You confirmed on '+fmtD(mine)+'. Waiting for the '+other+'.</p>':
    (side==="creator"?CK("cf","filming","I have already started filming"):"")+'<button class="btn primary wide" data-act="confirm"'+(ui.busy?" disabled":"")+'>Confirm these terms</button><p class="muted">These are agreed terms, not a legal contract. They lock only when both sides confirm.</p>';
  if(o.status!=="change_requested"){
    out+=ui.changeOpen?'<div class="card"><h3>Ask for a change</h3>'+F("chg","field","What should change","select",{options:["Fee","Deliverables","Where it runs","Revisions","Post date","Payment date","Claims","Other"]})+F("chg","note","What you need","textarea",{ph:"For example: post on 24 Oct instead"})+CK("chg","after","This comes after filming")+errBox("chg")+'<div class="btnrow"><button class="btn dark" data-act="sendChange">Send request</button><button class="btn" data-act="toggleChange">Cancel</button></div></div>'
      :'<button class="btn wide" data-act="toggleChange">Ask for a change</button>';
  }
  return out+'</div>';
}

/* ---------- team ---------- */
function teamView(){
  if(!teamKey)return '<section class="hero"><h1>Team <em>page</em></h1><p class="muted">For the Mingle team: pilot metrics, verify creators, rank creators for campaigns, write up agreed terms and log link sends.</p></section><div class="panel form"><div class="card">'+F("tk","key","Team key","password",{auto:"current-password"})+(ui.err.tk?'<p class="status bad" role="alert">Not allowed.</p>':"")+'<button class="btn dark wide" data-act="teamKey">Open team page</button><p class="muted">Team members only.</p></div></div>';
  const tab=ui.tab.team;
  const top='<div class="panel" style="padding-bottom:0"><label class="check"><input type="checkbox" data-act="demoToggle"'+(ui.showDemo?" checked":"")+'><span>Include demo data (names ending in “(dummy)”)</span></label></div>';
  if(tab==="campaigns")return top+teamCampaigns();
  if(tab==="offers")return top+teamOffers();
  if(tab==="log")return top+teamLog();
  if(tab==="today")return top+teamToday()+'<div class="panel"><button class="btn wide" data-act="signOutTeam">Leave team page on this device</button></div>';
  return top+teamPilot();
}
// deal stages after the lock come from team events: posted and paid are logged by hand in the pilot
function dealLog(){
  const m={};
  rows("events").filter(e=>(e.name==="deal_stage_updated"||e.name==="payment_marked_paid")&&e.props&&e.props.deal_id).sort((a,b)=>a.created_at.localeCompare(b.created_at)).forEach(e=>{
    const d=m[e.props.deal_id]||(m[e.props.deal_id]={});
    if(e.name==="payment_marked_paid")d.paid=e.props;else if(e.props.to_stage==="posted")d.posted=e.props;
  });
  return m;
}
const pct=(n,d)=>d?Math.round(100*n/d)+"%":"–";
function judge(m){
  if(!m.d)return["none","No data yet"];
  const r=m.n/m.d;
  if(m.lower)return r<=m.target?["ok","On track"]:r>m.floor?["bad","Act now"]:["warn","Watch"];
  return r>=m.target?["ok","On track"]:r<m.floor?["bad","Act now"]:["warn","Watch"];
}
function pilotMetrics(){
  const now=Date.now();
  const cr=rows("creators").filter(vis),br=rows("briefs").filter(vis),of=rows("offers").filter(vis),sends=rows("link_sends").filter(vis);
  const chg=rows("change_requests").filter(r=>{const o=all("offers")[r.offer_id];return o&&vis(o);});
  const evs=rows("events"),user=evs.filter(e=>!(e.props||{}).is_team),log=dealLog();
  const viewed=new Map();user.filter(e=>e.name==="offer_viewed").forEach(e=>{const id=(e.props||{}).offer_id,o=all("offers")[id];if(!o||!vis(o))return;const t=T(e.created_at);if(!viewed.has(id)||viewed.get(id)>t)viewed.set(id,t);});
  const firstView=h=>{let m=null;of.filter(o=>o.creator_id===h).forEach(o=>{const t=viewed.get(o.id);if(t!=null&&(m==null||t<m))m=t;});return m;};
  const M=[];
  // each link send is matched to at most one brief from that creator's link, sent within 72 hours, and each brief is used once
  const used=new Set(),done=sends.slice().sort((a,b)=>a.sent_at.localeCompare(b.sent_at)).filter(s=>{
    const b=br.filter(b=>b.source==="creator_link"&&b.creator_id===s.creator_id&&!used.has(b.id)&&T(b.created_at)>=T(s.sent_at)&&T(b.created_at)-T(s.sent_at)<=72*36e5).sort((x,y)=>x.created_at.localeCompare(y.created_at))[0];
    if(b){used.add(b.id);s.brief=b;}return !!b;});
  M.push({id:"omtm",goal:"Goal 3 · Acquire · One Metric That Matters",name:"Brands who send a complete brief within 72 hours of getting a creator's link",n:done.length,d:sends.length,target:.4,floor:.2,targetTxt:"≥ 40% by Wed 28 Oct",act:"Under 20%: the riskiest assumption fails; stop brand features and call five brands that opened and left.",owner:"Samuel, daily"});
  const ver=cr.filter(c=>c.verified),activated=ver.filter(c=>{const t=firstView(c.handle);return t!=null&&t-T(c.verified_at)<=7*DAY;});
  M.push({goal:"Goal 1 · Acquire",name:"Creators who view a sorted offer within 7 days of verification",n:activated.length,d:ver.length,target:.8,floor:.6,targetTxt:"≥ 8 of 10 by Mon 19 Oct",act:"Under 6 of 10: offers are not reaching creators; move team time to brand outreach.",owner:"Diksha, daily"});
  const ret=activated.filter(c=>{const t=firstView(c.handle);return sends.some(s=>s.creator_id===c.handle&&T(s.sent_at)>=t&&T(s.sent_at)-t<=14*DAY);});
  M.push({goal:"Goal 1 · Retain",name:"Activated creators who send their link to a new brand within 14 days",n:ret.length,d:activated.length,target:5/8,floor:3/8,targetTxt:"≥ 5 of 8 by Mon 9 Nov",act:"Under 3 of 8: call those creators before building more.",owner:"Diksha, weekly"});
  const taken=of.filter(o=>o.contract_sent_at||isContract(o));
  const atMin=taken.filter(o=>{const t=terms(o,briefOf(o)),c=byHandle(o.creator_id)||{};return !t.is_barter&&Number(t.fee_inr)>=Number(c.min_fee_inr||0);});
  M.push({goal:"Goal 1 · Monetise · North Star depth",name:"Offers taken to terms at or above the creator's minimum",n:atMin.length,d:taken.length,target:7/8,floor:.75,targetTxt:"≥ 7 of 8 by Wed 4 Nov",act:"Under 3 in 4: creators are trading down; check their floors and the brief's fee field with them.",owner:"Diksha, weekly"});
  const fitsViewed=of.filter(o=>viewed.has(o.id)&&fit(byHandle(o.creator_id)||{},terms(o,briefOf(o))).result==="fits"),fitsDeclined=fitsViewed.filter(o=>o.status==="declined");
  M.push({goal:"Goal 1 · Counter-metric",name:"Fits declined ÷ Fits viewed",n:fitsDeclined.length,d:fitsViewed.length,target:.25,floor:.5,lower:true,targetTxt:"≤ 1 in 4 by Wed 4 Nov",act:"Above 1 in 2: stop labelling offers Fits and show reasons only. Decline reasons are in the offer_declined events.",owner:"Archin, Mon and Thu"});
  const fast=taken.filter(o=>o.locked_at&&T(o.locked_at)-T(briefOf(o).created_at)<=7*DAY);
  M.push({goal:"Goal 2 · Acquire",name:"Deals locked within 7 days of the brief, before filming",n:fast.length,d:taken.length,target:.75,floor:.5,targetTxt:"≥ 6 of 8 by Wed 4 Nov",act:"Under 4 of 8: brands will not confirm on screen; rethink locking in the app.",owner:"Aarushi, after each deal"});
  const inApp=chg.length,afterFilm=chg.filter(r=>/\(after filming\)/.test(r.note||"")).length;
  M.push({goal:"Goal 2 · Retain",name:"Changes raised in Mingle ÷ all changes",n:inApp,d:null,count:true,targetTxt:"≥ 3 in 4 by Mon 9 Nov",act:inApp+" raised in Mingle"+(afterFilm?", "+afterFilm+" after filming":"")+". Add the changes creators report at the check-in by hand to get the ratio.",owner:"Aarushi, weekly"});
  const locked=of.filter(o=>o.status==="locked");
  const dueNow=locked.filter(o=>{const d=dueDate(terms(o,briefOf(o)));return d&&T(d)<now;});
  const onTime=dueNow.filter(o=>log[o.id]&&log[o.id].paid&&Number(log[o.id].paid.days_late)<=0);
  M.push({goal:"Goal 2 · Monetise",name:"Locked deals paid by the agreed date",n:onTime.length,d:dueNow.length,target:.8,floor:.6,targetTxt:"≥ 4 in 5 by Mon 30 Nov",act:"Under 3 in 5: reminders and brand payment records move to the front of Next.",owner:"Rishiraj, Mondays"});
  const byBrand={};br.forEach(b=>{const k=plain(b.brand_name).toLowerCase().trim();(byBrand[k]=byBrand[k]||[]).push(T(b.created_at));});
  const brands=Object.values(byBrand),again=brands.filter(ts=>{ts.sort((a,b)=>a-b);return ts.length>1&&ts[1]-ts[0]<=30*DAY;});
  M.push({goal:"Goal 3 · Retain",name:"Brands with a second brief within 30 days of their first",n:again.length,d:brands.length,target:1/3,floor:1/3,targetTxt:"≥ 1 in 3 by Fri 27 Nov",act:"Under it: the list or the terms did not pay off; call every brand that did not return.",owner:"Samuel, weekly"});
  const camps=br.filter(b=>b.source==="campaign"&&of.some(o=>o.brief_id===b.id));
  const campLocked=camps.filter(b=>of.some(o=>o.brief_id===b.id&&o.locked_at&&T(o.locked_at)-T(b.created_at)<=7*DAY));
  const ranks=evs.filter(e=>e.name==="creators_invited"&&Array.isArray((e.props||{}).rank_of_each)&&(ui.showDemo||!e.props.demo)).flatMap(e=>e.props.rank_of_each);
  M.push({goal:"Goal 3 · Monetise",name:"Campaign briefs with a locked deal within 7 days of the ranked list",n:campLocked.length,d:camps.length,target:.75,floor:.5,targetTxt:"≥ 3 of 4 by Wed 4 Nov",act:"Invites from our top 5: "+pct(ranks.filter(r=>r>0&&r<=5).length,ranks.length)+" of "+ranks.length+". If brands pass over our top 5, show verified-on dates and retest.",owner:"Samuel, Mon and Thu"});
  const active=ver.filter(c=>of.some(o=>o.creator_id===c.handle)),withLock=active.filter(c=>locked.some(o=>o.creator_id===c.handle));
  const lockedActive=locked.filter(o=>active.some(c=>c.handle===o.creator_id));
  const broken=locked.filter(o=>chg.some(r=>r.offer_id===o.id&&/\(after filming\)/.test(r.note||""))||(log[o.id]&&log[o.id].paid&&Number(log[o.id].paid.days_late)>0));
  const nsm={value:active.length?lockedActive.length/active.length:0,locked:lockedActive.length,active:active.length,breadth:[withLock.length,active.length],frequency:withLock.length?lockedActive.length/withLock.length:0,depth:[atMin.length,taken.length],broken:[broken.length,locked.length]};
  const fl=user.filter(e=>!(e.props||{}).demo||ui.showDemo);
  const opened=new Set(fl.filter(e=>e.name==="page_viewed"&&e.props.page==="brief_link").map(e=>e.props.anon_id+"|"+e.props.creator_handle)).size;
  const started=new Set(fl.filter(e=>e.name==="brief_form_opened"&&e.props.source==="creator_link").map(e=>e.props.anon_id+"|"+(e.props.creator_handle||""))).size;
  const linkLocked=done.filter(s=>of.some(o=>o.brief_id===s.brief.id&&o.status==="locked"&&T(o.locked_at)-T(s.brief.created_at)<=7*DAY));
  const rankedB=new Set(evs.filter(e=>e.name==="creators_ranked").map(e=>e.props.brief_id));
  const campB=br.filter(b=>b.source==="campaign"),campLock=of.filter(o=>o.status==="locked"&&briefOf(o).source==="campaign");
  const funnels=[["Creator links",[["Link shared",sends.length],["Link opened",opened],["Brief started",started],["Brief complete in 72 h",done.length],["Both confirmed in 7 days",linkLocked.length]]],
    ["Campaigns",[["Brief",campB.length],["Ranked",campB.filter(b=>rankedB.has(b.id)).length],["Invited",campB.filter(b=>of.some(o=>o.brief_id===b.id)).length],["Both confirmed",campLock.length]]]];
  return {M,nsm,funnels};
}
function metricCard(m){
  const j=m.count?["none","Count"]:judge(m);
  return '<article class="metric '+j[0]+(m.id==="omtm"?" omtm":"")+'"><p class="mgoal">'+esc(m.goal)+'</p><h3>'+esc(m.name)+'</h3>'+
   '<div class="mval"><b>'+(m.count?m.n:pct(m.n,m.d))+'</b>'+(m.count?'':'<span>'+m.n+' of '+m.d+'</span>')+'<span class="pill '+({ok:"locked",warn:"wait",bad:"misses",none:"info"})[j[0]]+'">'+j[1]+'</span></div>'+
   (m.d?'<div class="bar tgt"><span style="width:'+Math.min(100,Math.round(100*m.n/m.d))+'%"></span><i style="left:'+Math.round(100*m.target)+'%" title="Target"></i></div>':'')+
   '<p class="muted"><b>Target</b> '+esc(m.targetTxt)+'</p><p class="muted">'+esc(m.act)+'</p><p class="mown">Read by '+esc(m.owner)+'</p></article>';
}
function teamPilot(){
  const {M,nsm,funnels}=pilotMetrics();
  const v=Math.round(nsm.value*100)/100;
  return (ui.showDemo?'<div class="panel"><p class="status warn">These numbers include demo data. Untick “Include demo data” above to read the pilot.</p></div>':'')+'<div class="panel"><div class="nsm"><p class="mgoal">North Star</p><h2>Locked deals per active creator</h2><div class="nsmv"><b>'+v+'</b><span>'+nsm.locked+' locked ÷ '+nsm.active+' active creators</span></div>'+
   '<p class="muted"><b>Pilot target</b> ≥ 0.6 per active creator in the fortnight, read Wed 4 Nov. 6 or more locked deals: build Next. Under 3: stop and rethink.</p>'+
   '<div class="kpis"><div><b>'+pct(nsm.breadth[0],nsm.breadth[1])+'</b><span>Breadth: creators with a locked deal ('+nsm.breadth[0]+' of '+nsm.breadth[1]+'), target 5 of 10</span></div><div><b>'+(Math.round(nsm.frequency*10)/10)+'</b><span>Frequency: locked deals per creator who has one, target 1.2</span></div><div><b>'+pct(nsm.depth[0],nsm.depth[1])+'</b><span>Depth: taken to terms at or above minimum, target 7 of 8</span></div><div><b>'+nsm.broken[0]+' of '+nsm.broken[1]+'</b><span>Counter: locks that later broke (changed after filming or paid late), target no more than 1 of 6</span></div></div>'+
   '<p class="mown">Read by Ishu, Mon and Thu. Counts only deals where both sides confirmed all seven terms before filming.</p></div></div>'+
  '<div class="panel wide metrics">'+M.map(metricCard).join("")+'</div>'+
  '<div class="panel wide">'+funnels.map(([name,steps])=>{const top=Math.max(1,steps[0][1]);return '<div class="card"><h3>'+name+' funnel</h3>'+steps.map(([l,n])=>'<div class="fstep"><span>'+l+'</span><div class="bar"><span style="width:'+Math.min(100,Math.round(100*n/top))+'%"></span></div><b>'+n+'</b></div>').join("")+'</div>';}).join("")+
  '<div class="card"><h3>Reading calendar</h3><ul class="cal"><li><b>19 Oct</b> Creator activation</li><li><b>28 Oct</b> Brief completion (OMTM)</li><li><b>4 Nov</b> Deal outcomes and the North Star</li><li><b>9 Nov</b> Creator retention</li><li><b>27 Nov</b> Brands briefing again</li><li><b>30 Nov</b> Payment and the counter-metric</li></ul><p class="muted">Team actions carry is_team and are left out of every metric. Before reading a ratio, check its events are still arriving below.</p></div></div>'+
  eventsCard();
}
function eventsCard(){
  const evs=rows("events");const counts={};evs.forEach(e=>{counts[e.name]=(counts[e.name]||0)+1;});
  return '<div class="panel"><p class="group-h">Events recorded ('+evs.length+')</p><div class="card"><table class="trk"><tbody>'+(Object.keys(counts).length?Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>'<tr><td>'+esc(k)+'</td><td class="r">'+v+'</td></tr>').join(""):'<tr><td class="muted">No events yet. They appear as people use Mingle.</td></tr>')+'</tbody></table></div></div>';
}
function teamToday(){
  const pend=rows("creators").filter(c=>!c.verified&&vis(c));
  return '<div class="panel"><p class="group-h">Creators awaiting verification ('+pend.length+')</p></div><div class="panel wide">'+
  (pend.length?pend.map(c=>'<div class="card"><div class="row">'+av(c.handle,c.handle)+'<div class="grow"><b>@'+esc(c.handle)+'</b><p class="muted">'+esc(c.name)+' · '+esc(c.niche)+' · '+Number(c.followers||0).toLocaleString("en-IN")+' followers</p></div></div>'+
    '<dl class="terms"><dt>Says top city</dt><dd>'+esc(c.top_city||"–")+' '+esc(c.top_city_share||"")+'%</dd><dt>Says age band</dt><dd>'+esc(c.age_band||"–")+'</dd><dt>WhatsApp</dt><dd>'+esc(c.whatsapp)+'</dd><dt>Joined</dt><dd>'+ago(c.created_at)+'</dd></dl>'+
    '<p class="muted">Check these against the insights screenshot on the call, then verify.</p><button class="btn dark wide" data-act="verify" data-v="'+esc(c.handle)+'">Verify @'+esc(c.handle)+'</button></div>').join(""):'<p class="muted">Everyone is verified.</p>')+'</div>';
}
function ranked(b){
  return rows("creators").filter(c=>c.verified&&vis(c)).map(c=>Object.assign({c},match(c,b))).sort((x,y)=>y.score-x.score||String(x.c.handle).localeCompare(y.c.handle));
}
function teamCampaigns(){
  const camps=rows("briefs").filter(b=>b.source==="campaign"&&vis(b)).sort((a,b)=>b.created_at.localeCompare(a.created_at));
  if(!camps.length)return '<div class="panel"><p class="muted">No campaign briefs yet.</p></div>';
  return '<div class="panel wide">'+camps.map(b=>{
    const r=ranked(b).slice(0,8);
    const invited=new Set(rows("offers").filter(o=>o.brief_id===b.id).map(o=>o.creator_id));
    if(!ui.picks[b.id]){ui.picks[b.id]=new Set(r.filter(x=>!invited.has(x.c.handle)).slice(0,Math.max(0,Number(b.creators_wanted||1)-invited.size)).map(x=>x.c.handle));}
    const picks=ui.picks[b.id];
    return '<div class="card"><div class="row">'+av(b.brand_name,b.brand_name,"sq")+'<div class="grow"><b>'+esc(b.brand_name)+'</b><p class="muted">'+esc(b.product)+' · '+feeTxt(b)+' · '+esc(b.creators_wanted)+' creators</p></div></div>'+
     '<div class="chips"><span class="info">'+esc(b.target_niche)+'</span><span class="info">'+esc(b.target_city)+'</span><span class="info">'+esc(b.target_age_band)+'</span><span class="info">Code '+esc(b.brand_token)+'</span></div>'+
     '<p class="muted">Ranked by audience fit. Follower count is never used.</p>'+
     r.map((x,i)=>{const inv=invited.has(x.c.handle);return '<div class="rank"><input type="checkbox" aria-label="Pick @'+esc(x.c.handle)+'" data-act="pick" data-b="'+esc(b.id)+'" data-v="'+esc(x.c.handle)+'"'+(inv?" disabled checked":picks.has(x.c.handle)?" checked":"")+'>'+av(x.c.handle,x.c.handle)+'<div style="min-width:0"><b>#'+(i+1)+' @'+esc(x.c.handle)+'</b> '+(inv?'<span class="pill locked">Invited</span>':'')+(x.c.verified_at?'<span class="muted" style="display:block">Insights verified on '+fmtD(x.c.verified_at)+'</span>':'')+'<ul class="reasons y">'+x.yes.map(y=>'<li>'+esc(y)+'</li>').join("")+'</ul><ul class="reasons n">'+x.no.map(y=>'<li>'+esc(y)+'</li>').join("")+'</ul></div><span class="score">'+x.score+'</span></div>';}).join("")+
     '<button class="btn primary wide" data-act="invite" data-v="'+esc(b.id)+'"'+(picks.size?"":" disabled")+'>Invite selected ('+picks.size+')</button></div>';
  }).join("")+'</div>';
}
function fitMsg(o){
  const b=briefOf(o),t=terms(o,b),c=byHandle(o.creator_id)||{},f=fit(c,t);
  return "Hi @"+o.creator_id+", a new brief on Mingle from "+plain(b.brand_name)+": "+t.product+", "+t.deliverables+", "+feeTxt(t)+", post on "+fmtD(t.post_date)+". Against your rules it "+({fits:"fits",check:"needs a check",misses:"misses"})[f.result]+": "+f.reasons.join("; ")+". Reply yes or no, or see it here: "+ORIGIN+"/me/"+(c.private_token||"")+"?s=campaign_invite";
}
function contractMsg(o,side){
  const b=briefOf(o),link=ORIGIN+"/deal/"+o.id+"?t="+(side==="creator"?o.creator_token:o.brand_token)+"&s=terms_link";
  return side==="creator"?"Hi @"+o.creator_id+", your agreed terms with "+plain(b.brand_name)+" are ready on Mingle. Please read them and confirm here: "+link+". Terms lock only when you and the brand both confirm."
    :"Hi "+firstName(b.contact_name)+", your agreed terms with @"+o.creator_id+" are ready on Mingle. Please read them and confirm here: "+link+". Terms lock only when you and the creator both confirm.";
}
function teamOffers(){
  let list=rows("offers").filter(vis).sort((a,b)=>b.created_at.localeCompare(a.created_at));
  if(ui.offFilter==="action")list=list.filter(o=>o.status==="new"||o.status==="change_requested"||(o.interested&&!isContract(o)));
  if(ui.offFilter==="contracts")list=list.filter(isContract);
  const log=dealLog();
  const fb=(k,l)=>'<button class="chip" data-act="offFilter" data-v="'+k+'" aria-pressed="'+(ui.offFilter===k)+'">'+l+'</button>';
  return '<div class="panel"><div class="chips">'+fb("all","All")+fb("action","Needs action")+fb("contracts","Agreed terms")+'</div></div><div class="panel wide">'+
  (list.length?list.map(o=>{
    const b=briefOf(o),c=byHandle(o.creator_id)||{handle:o.creator_id},t=terms(o,b),f=fit(c,t),st=statusLabel(o),m=mins(o.created_at),lg=log[o.id]||{},due=dueDate(t);
    const crs=rows("change_requests").filter(r=>r.offer_id===o.id).sort((a,b)=>b.created_at.localeCompare(a.created_at));
    let actions='';
    if(!isContract(o)&&o.status!=="declined")actions='<div class="btnrow"><button class="btn sm" data-act="fitMsg" data-v="'+o.id+'">Copy fit message</button><button class="btn sm dark" data-act="makeContract" data-v="'+o.id+'">Write up terms</button></div>';
    if(o.status==="change_requested"){
      const e=D("edit-"+o.id);if(e.fee_inr==null)Object.assign(e,{fee_inr:t.fee_inr,post_date:t.post_date,payment_days:String(t.payment_days),revision_rounds:String(t.revision_rounds)});
      actions='<p class="status warn">'+esc(crs[0]?crs[0].side+" asked: "+crs[0].field+". “"+crs[0].note+"”":"Change asked")+'</p><div class="row2">'+F("edit-"+o.id,"fee_inr","Fee","number",{hint:"₹"})+F("edit-"+o.id,"post_date","Post date","date")+'</div><div class="row2">'+F("edit-"+o.id,"payment_days","Pay within","select",{options:PAYDAYS})+F("edit-"+o.id,"revision_rounds","Revisions","select",{options:[0,1,2,3]})+'</div><button class="btn sm dark" data-act="resend" data-v="'+o.id+'">Update terms and re-send</button>';
    }
    if(o.status==="locked"){
      const p=D("paid-"+o.id);if(p.date==null){p.date=new Date().toISOString().slice(0,10);p.match=true;}
      actions='<div class="stagebox"><p class="lbl">After the lock <span class="hint">logged by hand from WhatsApp</span></p>'+
       (lg.posted?'<p class="status ok">Posted on '+fmtD(lg.posted.posted_date)+'</p>':'<button class="btn sm" data-act="markPosted" data-v="'+o.id+'">Mark posted today</button>')+
       (lg.paid?'<p class="status '+(Number(lg.paid.days_late)>0?"warn":"ok")+'">Paid on '+fmtD(lg.paid.paid_date)+(Number(lg.paid.days_late)>0?", "+lg.paid.days_late+" days late":", on time")+(lg.paid.amount_matches===false?". Amount did not match":"")+'</p>':
        (t.is_barter?'':'<div class="row2">'+F("paid-"+o.id,"date","Paid on","date")+'<div class="field"><span class="lbl">Due</span><p>'+fmtD(due)+'</p></div></div>'+CK("paid-"+o.id,"match","Amount matches the agreed fee")+'<button class="btn sm dark" data-act="markPaid" data-v="'+o.id+'">Log payment</button>'))+'</div>';
    }
    return '<div class="card"><div class="row">'+av(c.handle,c.handle)+'<div class="grow"><b>@'+esc(c.handle)+' ← '+esc(b.brand_name)+'</b><p class="muted">'+esc(b.product)+' · '+(b.source==="campaign"?"Campaign invite"+(o.match_score!=null?", score "+o.match_score:""):"Creator link")+' · <span class="'+(o.status==="new"&&m>240?"amber":"")+'">'+ago(o.created_at)+'</span></p></div><span class="pill '+st[1]+'">'+st[0]+'</span></div>'+
      '<div class="row"><span class="pill '+f.result+'">'+({fits:"Fits",check:"Check",misses:"Misses"})[f.result]+'</span>'+(o.interested&&!isContract(o)?'<span class="pill info">Creator said yes</span>':'')+'</div><p class="payline">'+feeTxt(t)+(due?' · paid by '+fmtD(due):'')+'</p><ul class="reasons">'+f.reasons.map(r=>'<li>'+esc(r)+'</li>').join("")+'</ul>'+
      actions+(ui.msg["fit:"+o.id]?msgBox("fit:"+o.id,ui.msg["fit:"+o.id]):"")+(isContract(o)&&o.status!=="locked"?'<p class="group-h">Send to the creator</p>'+msgBox("con:"+o.id,ui.msg["con:"+o.id]=contractMsg(o,"creator"))+'<p class="group-h">Send to the brand</p>'+msgBox("conb:"+o.id,ui.msg["conb:"+o.id]=contractMsg(o,"brand")):"")+'</div>';
  }).join(""):'<p class="muted">Nothing here.</p>')+'</div>';
}
function teamLog(){
  const sends=rows("link_sends").filter(vis).sort((a,b)=>b.sent_at.localeCompare(a.sent_at));
  const cs=rows("creators").filter(vis).map(c=>c.handle).sort();
  const lg=D("lg");if(lg.creator==null)lg.creator=cs[0]||"";if(!lg.type)lg.type="unclear";
  return '<div class="panel wide"><div class="card"><h3>Log a link send</h3><p class="muted">When a creator posts a screenshot of sending their link in our group.</p>'+F("lg","creator","Creator","select",{options:cs})+F("lg","brand","Brand handle","text",{ph:"brand handle"})+
  '<div class="field"><span class="lbl">Offer in the DM</span><div class="chips">'+OFFER_TYPES.map(([k,l])=>chipPick("lgType",k,l,lg.type===k)).join("")+'</div></div>'+errBox("lg")+'<button class="btn dark wide" data-act="logSendTeam">Log send</button></div>'+
  '<div class="card"><h3>Link sends ('+sends.length+')</h3><table class="trk"><thead><tr><th>Creator → brand</th><th>Outcome</th></tr></thead><tbody>'+
  sends.map(s=>'<tr><td>@'+esc(s.creator_id)+' → @'+esc(s.brand_handle)+'<br><span class="muted">'+ago(s.sent_at)+'</span></td><td><select aria-label="Outcome" data-act="outcome" data-v="'+esc(s.id)+'">'+[["","Waiting"],["filled","Brief sent"],["replied_in_dm","Replied in DM"],["went_quiet","Went quiet"]].map(x=>'<option value="'+x[0]+'"'+((s.outcome||"")===x[0]?" selected":"")+'>'+x[1]+'</option>').join("")+'</select></td></tr>').join("")+'</tbody></table></div>'+
  '<div class="card"><h3>Export</h3><select aria-label="Table" data-f="x.table">'+opt(COLLS,D("x").table||"offers")+'</select><button class="btn wide" data-act="export">Download CSV</button></div></div>';
}
function csv(c){
  const rs=rows(c);const keys=[...new Set(rs.flatMap(r=>Object.keys(r)))];
  const cell=v=>{v=v==null?"":typeof v==="object"?JSON.stringify(v):String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
  return [keys.join(",")].concat(rs.map(r=>keys.map(k=>cell(r[k])).join(","))).join("\n");
}

/* ---------- brief start and abandon tracking ---------- */
const briefSource=form=>form==="camp"?"campaign":"creator_link";
function linkMinutes(){const t=ui.found&&srecall("mingle.lo."+ui.found);return t?Math.round((Date.now()-Number(t))/60000):null;}
function briefStarted(form,key){
  ui.lastField[form]=key;
  if(!ui.started[form]){ui.started[form]=Date.now();ui.abandoned.delete(form);ev("brief_form_opened",{source:briefSource(form),creator_handle:form==="brief"?ui.found:null,minutes_since_link_opened:form==="brief"?linkMinutes():null});}
  clearTimeout(briefStarted.idle);briefStarted.idle=setTimeout(()=>abandon("idle"),30*60000);
}
function abandon(why){
  ["brief","camp"].forEach(form=>{
    if(!ui.started[form]||ui.abandoned.has(form))return;ui.abandoned.add(form);
    const f=D(form);
    ev("brief_abandoned",{source:briefSource(form),fields_complete:termsComplete(briefPayload(f)),last_field:ui.lastField[form]||"",creators_in_brief:form==="camp"?Number(f.creators_wanted)||1:1,creator_handle:form==="brief"?ui.found:null,why},{keepalive:true});
  });
}
window.addEventListener("pagehide",()=>abandon("closed"));

/* ---------- actions ---------- */
function rulesPayload(f,handle){
  return {handle,name:String(f.name||"").trim(),whatsapp:String(f.whatsapp||"").trim(),niche:f.niche,followers:Number(f.followers)||0,offers_per_month:Number(f.offers_per_month)||0,
    top_city:String(f.top_city||"").trim(),top_city_share:Number(f.top_city_share)||0,age_band:f.age_band,min_fee_inr:Number(f.min_fee_inr)||0,barter_rule:f.barter_rule,
    barter_floor_inr:Number(f.barter_floor_inr)||0,blocked_categories:f.blocked||[],max_pay_days:Number(f.max_pay_days)||30,paid_ads_extra:!!f.paid_ads_extra,consent:!!f.consent};
}
function stageProps(o){const t=terms(o,briefOf(o));return{deal_id:o.id,post_date:t.post_date||null,payment_due_date:dueDate(t),demo:!!o.demo};}
const act={
  async role(d){ui.role=d.v;ui.deal=null;ui.dealSide=null;ui.dealTok=null;ui.err={};ui.setup=false;go(rolePath());load(null);render();window.scrollTo(0,0);await refresh();},
  home(){return act.role({v:"home"});},
  goCreator(){return act.role({v:"creator"});},
  async goBrand(d){ui.tab.brand=d.v||"send";ui.sent=null;await act.role({v:"brand"});},
  async tab(d){ui.tab[ui.role]=d.v;ui.deal=null;ui.dealSide=null;ui.dealTok=null;ui.editRules=false;ui.err={};ui.sent=null;go(rolePath());render();window.scrollTo(0,0);await refresh();},
  jump(d){const el=document.getElementById(d.v);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});},
  async openCode(){const code=String(D("gate").code||"").trim();if(!code)return;const p=await rpc("creator_me",{p_token:code});
    if(!p){ui.err.gate="This page is private. Use the link we sent you on WhatsApp.";render();return;}
    ui.token=code;ui.badToken=false;store("mingle.token",code);ui.err={};ui.tab.creator="offers";ui.role="creator";go("/creator");load(p);render();},
  demoCreator(){D("gate").code="riya-demo";return act.openCode();},
  async demoBrand(){ui.role="brand";ui.tab.brand="send";ui.sent=null;D("find").handle="dummy.skin.notes";go("/brand");await act.find();},
  startSetup(){ui.role="creator";ui.setup=true;ui.token=null;go("/creator");render();window.scrollTo(0,0);},
  cancelSetup(){ui.setup=false;ui.err={};render();},
  toggleBlock(d){const f=D("setup");f.blocked=f.blocked||[];f.blocked=f.blocked.includes(d.v)?f.blocked.filter(x=>x!==d.v):f.blocked.concat(d.v);render();},
  addBlock(){const f=D("setup");const v=String(f.custom||"").trim();if(v){f.blocked=(f.blocked||[]).filter(x=>x!==v).concat(v);f.custom="";}render();},
  async saveSetup(){
    if(ui.busy)return;
    const f=D("setup"),edit=ui.editRules,me=meC();
    const handle=edit?me.handle:String(f.handle||"").toLowerCase().replace(/^@/,"").replace(/[^a-z0-9._]/g,"");
    const miss=[];if(!handle)miss.push("Instagram handle");if(!String(f.whatsapp||"").trim())miss.push("WhatsApp");if(!(Number(f.min_fee_inr)>0))miss.push("lowest fee per reel");if(!f.consent)miss.push("consent");
    if(miss.length){ui.err.setup="Still needed: "+miss.join(", ")+".";render();return;}
    const p=rulesPayload(f,handle);
    ui.busy=true;render();
    try{
      if(edit){await rpc("update_rules",{p_token:ui.token,p});}
      else{const r=await rpc("create_creator",{p});ui.token=r.private_token;store("mingle.token",r.private_token);ui.setup=false;ui.justSetup=true;ui.tab.creator="link";ev("creator_onboarded",{creator_id:handle,niche:p.niche,followers:p.followers>=50000?"50K plus":p.followers>=25000?"25K to 50K":p.followers>=10000?"10K to 25K":"Under 10K"});}
      ev("rules_saved",{creator_id:handle,min_fee_by_format:{reel:p.min_fee_inr},min_fee_inr:p.min_fee_inr,barter_floor:p.barter_rule==="never"?null:p.barter_floor_inr,barter_rule:p.barter_rule,refused_categories:p.blocked_categories,payment_terms_days:p.max_pay_days,paid_ads_extra:p.paid_ads_extra});
      ui.editRules=false;ui.err={};delete ui.draft.setup;toast(edit?"Rules saved":"You're on Mingle");
    }catch(e){ui.err.setup=e.message;}
    ui.busy=false;render();window.scrollTo(0,0);await refresh();
  },
  editRules(){const me=meC();ui.draft.setup={name:me.name,handle:me.handle,whatsapp:me.whatsapp,niche:me.niche,followers:me.followers,offers_per_month:me.offers_per_month,top_city:me.top_city,top_city_share:me.top_city_share,age_band:me.age_band,min_fee_inr:me.min_fee_inr,barter_rule:me.barter_rule,barter_floor_inr:me.barter_floor_inr,blocked:(me.blocked_categories||[]).slice(),max_pay_days:String(me.max_pay_days),paid_ads_extra:me.paid_ads_extra,consent:me.consent};ui.editRules=true;render();window.scrollTo(0,0);},
  cancelEdit(){ui.editRules=false;delete ui.draft.setup;ui.err={};render();},
  signOut(){ui.token=null;store("mingle.token",null);ui.justSetup=false;load(null);ui.role="home";go("/");render();},
  async interested(d){const o=all("offers")[d.v]||{};if(await rpc("offer_interested",{p_token:ui.token,p_offer:d.v})){ev("offer_accepted",{offer_id:d.v,fit_status:fit(meC()||{},terms(o,briefOf(o))).result,demo:!!o.demo});toast("Sent. Agreed terms within 12 hours.");}await refresh();},
  startDecline(d){ui.declining=d.v;render();},
  cancelDecline(){ui.declining=null;render();},
  declineReason(d){if(ui.declining){D("dec")[ui.declining]=d.v;render();}},
  async decline(d){const o=all("offers")[d.v],b=briefOf(o),reason=D("dec")[d.v];if(!o||!reason)return;
    ui.msg["decline:"+d.v]="Hi "+firstName(b.contact_name)+", thank you for thinking of me for "+b.product+". It isn't the right fit for my audience right now, so I'll pass this time. Happy to hear about future campaigns.";
    if(await rpc("offer_decline",{p_token:ui.token,p_offer:d.v}))ev("offer_declined",{offer_id:d.v,fit_status:fit(meC()||{},terms(o,b)).result,reason,demo:!!o.demo});
    ui.declining=null;await refresh();},
  copy(d){const text=ui.msg[d.v]||"";if(d.v==="reply")ev("link_copied",{});
    const done=()=>toast("Copied");const fail=()=>toast("Copy is blocked here. Select the text and copy it.");
    try{navigator.clipboard.writeText(text).then(done,fail);}catch(e){fail();}},
  sendType(d){D("send").type=d.v;render();},
  lgType(d){D("lg").type=d.v;render();},
  async logSendCreator(){const sd=D("send"),h=String(sd.brand||"").replace(/^@/,"").trim();if(!h){toast("Add the brand's handle");return;}
    if(await rpc("log_send_creator",{p_token:ui.token,p_brand:h})){ev("link_shared",{brand_handle:h,offer_type:sd.type||"unclear",by:"creator"});sd.brand="";toast("Logged. We follow up if they go quiet.");}await refresh();},
  async find(){const h=String(D("find").handle||"").toLowerCase().replace(/^@/,"").trim();if(!h)return;
    const c=await rpc("public_creator",{p_handle:h});ui.findTried=true;ui.found=c?c.handle:null;S.creators=c?{[c.handle]:c}:{};
    if(c&&!srecall("mingle.lo."+c.handle))sstore("mingle.lo."+c.handle,String(Date.now()));render();},
  changeCreator(){ui.found=null;ui.findTried=false;D("find").handle="";render();},
  cnt(d){const form=d.form,f=D(form),c=f.cnt||(f.cnt={});c[d.v]=Math.max(0,Math.min(20,(Number(c[d.v])||0)+Number(d.d)));briefStarted(form,"deliverables");render();},
  async sendBrief(d){
    if(ui.busy)return;
    const form=d.v,camp=form==="camp",f=D(form);
    const miss=briefNeeds(f,camp);
    if(miss.length){ui.err[form]="Still needed: "+miss.join(", ")+". Add them so creators can decide.";render();return;}
    const src=briefSource(form),t0=ui.started[form]||Date.now();
    const p=Object.assign(briefPayload(f),{time_to_submit_sec:Math.round((Date.now()-t0)/1000)});
    ui.busy=true;render();
    try{
      const r=await rpc("submit_brief",{p,p_handle:camp?null:ui.found});
      ui.brandCode=r.code;
      ev("brief_submitted",{brief_id:r.brief_id,source:src,creator_handle:camp?null:ui.found,minutes_since_link_opened:camp?null:linkMinutes(),fields_complete:termsComplete(p),creators_in_brief:camp?p.creators_wanted:1,fee_per_creator:p.is_barter?0:p.fee_inr,barter_value:p.is_barter?p.barter_value_inr:0,payment_terms_days:p.payment_days,format:p.deliverables,usage_type:p.usage_type,target_niche:camp?p.target_niche:null,target_city:camp?p.target_city:null,time_to_submit_sec:p.time_to_submit_sec});
      ui.sent={code:r.code,camp,handle:ui.found};D("bc").code=r.code;delete ui.draft[form];delete ui.started[form];ui.abandoned.delete(form);ui.err={};
    }catch(e){ui.err[form]=e.message;}
    ui.busy=false;render();window.scrollTo(0,0);
  },
  newBrief(){ui.sent=null;ui.found=null;ui.findTried=false;D("find").handle="";render();},
  async brandCode(){ui.brandCode=String(D("bc").code||"").trim();render();await refresh();},
  async openDeal(d){ui.deal=d.v;ui.dealTok=d.side==="creator"?ui.token:ui.brandCode;ui.dealSide=null;ui.changeOpen=false;render();window.scrollTo(0,0);await refresh();},
  async closeDeal(){ui.deal=null;ui.dealSide=null;ui.dealTok=null;go(rolePath());render();await refresh();},
  async confirm(){
    const o=all("offers")[ui.deal],side=ui.dealSide,k=side+"_confirmed_at",once=ui.deal+":"+side+":"+(o&&o.contract_sent_at||"");
    if(!o||o[k]||ui.busy||ui.once.has(once))return;ui.once.add(once);
    const b=briefOf(o),t=terms(o,b),filming=side==="creator"?!!D("cf").filming:null;
    ui.busy=true;render();
    try{const r=await rpc("deal_confirm",{p_offer:ui.deal,p_token:ui.dealTok});if(r&&r.ok){
      ev("terms_confirmed",{deal_id:ui.deal,offer_id:ui.deal,side,terms_complete:termsComplete(t),filming_started:filming,hours_since_brief:b.created_at?Math.round((Date.now()-T(b.created_at))/36e4)/10:null,creator_id:o.creator_id,demo:!!o.demo});
      if(r.status==="locked"){ev("terms_locked",{offer_id:ui.deal,deal_id:ui.deal,demo:!!o.demo});ev("deal_stage_updated",Object.assign(stageProps(o),{from_stage:"terms_draft",to_stage:"terms_locked"}));}}}
    finally{ui.busy=false;}
    delete ui.draft.cf;await refresh();
  },
  toggleChange(){ui.changeOpen=!ui.changeOpen;ui.err={};render();},
  async sendChange(){
    const f=D("chg");if(!f.field)f.field="Fee";if(!String(f.note||"").trim()){ui.err.chg="Still needed: what you need.";render();return;}
    const o=all("offers")[ui.deal]||{},note=String(f.note).trim()+(f.after?" (after filming)":"");
    const r=await rpc("deal_change",{p_offer:ui.deal,p_token:ui.dealTok,p_field:f.field,p_note:note});
    if(r&&r.ok){ev("change_requested",{deal_id:ui.deal,offer_id:ui.deal,side:ui.dealSide,reason:f.field,field:f.field,after_filming:!!f.after,demo:!!o.demo});
      if(o.status==="locked")ev("deal_stage_updated",Object.assign(stageProps(Object.assign({id:ui.deal},o)),{from_stage:"terms_locked",to_stage:"terms_draft"}));}
    delete ui.draft.chg;ui.changeOpen=false;ui.err={};await refresh();
  },
  tip(d){if(ui.tips.has(d.v))ui.tips.delete(d.v);else{ui.tips.add(d.v);ev("term_explained",{term:/rev/.test(d.v)?"revisions":"usage",side:ui.deal?ui.dealSide:ui.role});}render();},
  async teamKey(){const k=String(D("tk").key||"").trim();if(!k)return;
    try{const p=await rpc("team_dump",{p_key:k});teamKey=k;store("mingle.team",k);ui.err={};load(p);}catch(e){ui.err.tk=true;}render();},
  demoToggle(d,el){ui.showDemo=el.checked;render();},
  async verify(d){const c=all("creators")[d.v]||{};if(await rpc("team_verify",{p_key:teamKey,p_handle:d.v})){ev("creator_verified",{creator_id:d.v,demo:!!c.demo});toast("Verified");}await refresh();},
  pick(d,el){const s=ui.picks[d.b];if(el.checked)s.add(d.v);else s.delete(d.v);render();},
  async invite(d){
    const b=Object.assign({id:d.v},all("briefs")[d.v]),picks=[...ui.picks[d.v]];if(!picks.length||ui.busy)return;
    const order=ranked(b).map(x=>x.c.handle);
    const items=picks.map(h=>({handle:h,score:match(byHandle(h),b).score}));
    ui.busy=true;
    try{const n=await rpc("team_invite",{p_key:teamKey,p_brief:b.id,p_items:items});
      ev("creators_invited",{brief_id:b.id,count:n,creator_ids:picks,rank_of_each:picks.map(h=>order.indexOf(h)+1),fit_scores:items.map(x=>x.score),avg_score:Math.round(items.reduce((a,x)=>a+x.score,0)/items.length),picked_by:"team",demo:!!b.demo});toast("Invited "+n);}
    finally{ui.busy=false;}
    delete ui.picks[d.v];await refresh();
  },
  offFilter(d){ui.offFilter=d.v;render();},
  async fitMsg(d){const o=all("offers")[d.v];ui.msg["fit:"+d.v]=fitMsg(Object.assign({id:d.v},o));render();if(o.status==="new"){await rpc("team_offer",{p_key:teamKey,p_offer:d.v,p_action:"screen",p_terms:null});await refresh();}},
  async makeContract(d){const o=all("offers")[d.v]||{};if(await rpc("team_offer",{p_key:teamKey,p_offer:d.v,p_action:"contract",p_terms:null})){ev("contract_sent",{offer_id:d.v,demo:!!o.demo});ev("deal_stage_updated",Object.assign(stageProps(Object.assign({id:d.v},o)),{from_stage:o.status||"new",to_stage:"terms_draft"}));toast("Agreed terms ready. Send each side its message.");}await refresh();},
  async resend(d){const e=D("edit-"+d.v),o=all("offers")[d.v]||{};
    if(await rpc("team_offer",{p_key:teamKey,p_offer:d.v,p_action:"resend",p_terms:{fee_inr:Number(e.fee_inr),post_date:e.post_date,payment_days:Number(e.payment_days),revision_rounds:Number(e.revision_rounds)}})){ev("contract_sent",{offer_id:d.v,resent:true,demo:!!o.demo});toast("Updated terms sent");}
    delete ui.draft["edit-"+d.v];await refresh();},
  markPosted(d){const o=Object.assign({id:d.v},all("offers")[d.v]),today=new Date().toISOString().slice(0,10);
    ev("deal_stage_updated",Object.assign(stageProps(o),{from_stage:"terms_locked",to_stage:"posted",posted_date:today}));toast("Logged as posted");setTimeout(refresh,900);},
  markPaid(d){const o=Object.assign({id:d.v},all("offers")[d.v]),p=D("paid-"+d.v),due=dueDate(terms(o,briefOf(o)));if(!p.date){toast("Add the date it was paid");return;}
    const late=due?Math.round((T(p.date)-T(due))/DAY):0;
    ev("payment_marked_paid",Object.assign(stageProps(o),{due_date:due,paid_date:p.date,days_late:late,amount_matches:!!p.match,by:"team"}));
    ev("deal_stage_updated",Object.assign(stageProps(o),{from_stage:"posted",to_stage:"paid"}));toast(late>0?"Logged: paid "+late+" days late":"Logged: paid on time");setTimeout(refresh,900);},
  async logSendTeam(){const f=D("lg"),h=String(f.brand||"").replace(/^@/,"").trim();if(!f.creator||!h){ui.err.lg="Still needed: creator and brand handle.";render();return;}
    if(await rpc("team_log_send",{p_key:teamKey,p_creator:f.creator,p_brand:h})){ev("link_shared",{creator_id:f.creator,brand_handle:h,offer_type:f.type||"unclear",by:"team"});f.brand="";ui.err={};toast("Logged");}await refresh();},
  async outcome(d,el){const prev=all("link_sends")[d.v]||{};if(await rpc("team_outcome",{p_key:teamKey,p_send:d.v,p_outcome:el.value})&&el.value==="went_quiet"&&prev.outcome!=="went_quiet")ev("brand_went_silent",{});await refresh();},
  export(){const c=D("x").table||"offers",text=csv(c);
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"text/csv"}));a.download="mingle_"+c+".csv";document.body.appendChild(a);a.click();a.remove();},
  async signOutTeam(){teamKey=null;store("mingle.team",null);load(null);ui.role="home";go("/");render();}
};
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-act]");if(!el||el.tagName==="SELECT")return;
  if(el.type==="checkbox"&&!["pick","demoToggle"].includes(el.dataset.act))return;
  const fn=act[el.dataset.act];if(fn){if(el.tagName!=="INPUT")e.preventDefault();run(fn,el);}
});
function run(fn,el){Promise.resolve().then(()=>fn(el.dataset,el)).catch(err=>{ui.busy=false;toast((err&&err.message)||"Something went wrong");render();});}
document.addEventListener("change",e=>{const el=e.target;if(el.tagName==="SELECT"&&el.dataset.act&&act[el.dataset.act])run(act[el.dataset.act],el);});
function bind(e){
  const el=e.target;const k=el.dataset&&el.dataset.f;if(!k)return;
  const [form,key]=k.split(".");D(form)[key]=el.type==="checkbox"?el.checked:el.value;
  if(form==="brief"||form==="camp"){briefStarted(form,key);progress(form);}
  if(e.type==="change"&&el.hasAttribute("data-rr"))render();
}
document.addEventListener("input",bind);document.addEventListener("change",bind);
document.addEventListener("keydown",e=>{if(e.key!=="Enter"||e.target.tagName!=="INPUT")return;const k=e.target.dataset.f||"";
  const map={"gate.code":"openCode","find.handle":"find","bc.code":"brandCode","tk.key":"teamKey","send.brand":"logSendCreator","setup.custom":"addBlock"};if(map[k]){e.preventDefault();run(act[map[k]],{dataset:{}});}});
init();
})();
