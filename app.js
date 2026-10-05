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
const ICON={
 inbox:'<path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
 doc:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
 send:'<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
 plus:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>',
 home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
 rank:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 back:'<path d="M15 5l-7 7 7 7"/>'
};
const PAL=[["#ffb648","#ff6a4d"],["#ff6a4d","#e0337f"],["#e0337f","#8e44ad"],["#2bb6a3","#1f6feb"],["#f7971e","#e8590c"],["#7bc67b","#2f9e6e"],["#ff8fb1","#c2185b"],["#36b3d9","#1c6e8c"],["#a06cd5","#5f3dc4"],["#ef6f6c","#b8325a"]];

/* ---------- state ---------- */
const S={}; COLLS.forEach(c=>{S[c]={};});
let mode="connecting",pending=false,teamKey=null;
const ui={role:"creator",tab:{creator:"offers",brand:"send",team:"today"},token:null,setup:false,editRules:false,justSetup:false,
  deal:null,dealSide:null,brandCode:"",teamOk:false,found:null,findTried:false,draft:{},err:{},sent:null,showDemo:true,
  picks:{},changeOpen:false,msg:{},offFilter:"all",busy:false,exportTable:"offers",
  viewed:new Set(),once:new Set(),ranked:new Set(),opened:new Set(),t0:{}};

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const inr=n=>"₹"+Math.round(Number(n)||0).toLocaleString("en-IN");
const fmtD=iso=>{if(!iso)return "Not set";const p=String(iso).slice(0,10).split("-").map(Number);return p[2]+" "+MON[p[1]-1]+" "+p[0];};
const addDays=(iso,n)=>{const p=String(iso).slice(0,10).split("-").map(Number);return new Date(Date.UTC(p[0],p[1]-1,p[2]+Number(n||0))).toISOString().slice(0,10);};
const nowIso=()=>new Date().toISOString();
const ago=iso=>{const m=Math.max(0,Math.round((Date.now()-Date.parse(iso))/60000));if(m<60)return m+" min ago";const h=Math.round(m/60);if(h<48)return h+" h ago";return Math.round(h/24)+" days ago";};
const mins=iso=>Math.round((Date.now()-Date.parse(iso))/60000);
const rid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const mkTok=()=>{const a="abcdefghjkmnpqrstuvwxyz23456789";let s="";for(let i=0;i<8;i++)s+=a[Math.floor(Math.random()*a.length)];return s;};
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
function store(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}}
function recall(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function toast(t){const el=$("#toast");el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{el.hidden=true;},2600);}
function D(form){return ui.draft[form]||(ui.draft[form]={});}

/* ---------- rules ---------- */
function terms(o,b){return Object.assign({},b||{},(o&&o.terms)||{});}
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

/* ---------- data layer: Supabase functions ---------- */
const ERR={missing_fields:"Some required fields are missing.",handle_taken:"That handle is already on Mingle. If it is yours, open it with your private link.",unknown_handle:"This link is not active. Ask the creator for their current link.",not_allowed:"Not allowed."};
async function rpc(fn,args){
  let r;
  try{r=await fetch(SB_URL+"/rest/v1/rpc/"+fn,{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify(args||{})});}
  catch(e){if(mode!=="offline"){mode="offline";setBanner();}throw{code:"offline",message:"Can't reach Mingle right now. Check your connection and try again."};}
  const t=await r.text();let j=null;try{j=t?JSON.parse(t):null;}catch(e){}
  if(mode!=="live"){mode="live";setBanner();}
  if(!r.ok){const code=(j&&j.message)||"error";throw{code,message:ERR[code]||"Something went wrong. Please try again."};}
  return j;
}
function ev(name,props){rpc("log_event",{p_name:name,p_props:props||{}}).catch(()=>{});}
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
  if(schedule.r)return;schedule.r=requestAnimationFrame(()=>{schedule.r=0;render();});
}
document.addEventListener("focusout",()=>setTimeout(()=>{const a=document.activeElement;if(pending&&!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)))render();},60));
function go(path){try{history.replaceState(null,"",path);}catch(e){}}

async function init(){
  readRoute();
  const t=recall("mingle.token");if(t&&!ui.token)ui.token=t;
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
  if(parts[0]==="c"&&parts[1]){ui.role="brand";ui.tab.brand="send";D("find").handle=parts[1];ui.autoFind=true;}
  else if(parts[0]==="brief"){ui.role="brand";ui.tab.brand="campaign";}
  else if(parts[0]==="brand"){ui.role="brand";}
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
  if(ui.deal)return null;
  if(ui.role==="creator")return meC()?[["offers","Offers","inbox"],["contracts","Contracts","doc"],["link","My link","send"],["profile","Profile","user"]]:null;
  if(ui.role==="brand")return[["send","Send brief","send"],["campaign","Campaign","plus"],["contracts","Contracts","doc"]];
  return teamKey?[["today","Today","home"],["campaigns","Campaigns","rank"],["offers","Offers","inbox"],["log","Log","list"]]:null;
}
function render(){
  pending=false;setBanner();
  document.querySelectorAll(".role button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===ui.role)));
  let html;
  if(ui.deal)html=dealView();
  else if(ui.role==="creator")html=creatorView();
  else if(ui.role==="brand")html=brandView();
  else html=teamView();
  $("#view").innerHTML=html;
  const tabs=tabsFor(),nav=$("#tabbar");
  if(!tabs){nav.hidden=true;nav.innerHTML="";}
  else{
    nav.hidden=false;nav.style.gridTemplateColumns="repeat("+tabs.length+",1fr)";
    const cur=ui.tab[ui.role];
    nav.innerHTML=tabs.map(t=>{const b=badge(t[0]);return '<button class="tab" data-act="tab" data-v="'+t[0]+'"'+(cur===t[0]?' aria-current="page"':'')+'>'+ic(t[2])+'<span>'+t[1]+'</span>'+(b?'<span class="badge">'+b+'</span>':'')+'</button>';}).join("");
  }
  after();
}
function badge(t){
  if(ui.role==="creator"&&t==="offers"){const me=meC();return me?rows("offers").filter(o=>o.creator_id===me.handle&&o.status==="new"&&!o.interested).length:0;}
  if(ui.role==="creator"&&t==="contracts"){const me=meC();return me?rows("offers").filter(o=>o.creator_id===me.handle&&(o.status==="contract_sent"||o.status==="change_requested"||o.status==="brand_confirmed")).length:0;}
  if(ui.role==="team"&&t==="today")return rows("creators").filter(c=>!c.verified&&vis(c)).length;
  if(ui.role==="team"&&t==="offers")return rows("offers").filter(o=>vis(o)&&(o.status==="new"||o.status==="change_requested"||(o.interested&&!isContract(o)))).length;
  return 0;
}
function after(){
  if(mode==="connecting")return;
  // one-time analytics events, after the screen is drawn
  if(ui.role==="creator"&&ui.tab.creator==="offers"&&!ui.deal){const me=meC();if(me)rows("offers").filter(o=>o.creator_id===me.handle).forEach(o=>{if(!ui.viewed.has(o.id)){ui.viewed.add(o.id);const b=briefOf(o);ev("offer_viewed",{offer_id:o.id,fit_result:fit(me,terms(o,b)).result,source:b.source||""});}});}
  if(ui.role==="brand"&&!ui.deal&&!ui.sent){const k=ui.tab.brand==="campaign"?"campaign":(ui.found?"creator_link:"+ui.found:"");if(k&&!ui.opened.has(k)){ui.opened.add(k);ui.t0[k.split(":")[0]]=Date.now();ev("brief_form_opened",{source:k.split(":")[0]});}}
}

/* ---------- form fields ---------- */
function F(form,k,label,type,o){
  o=o||{};const v=D(form)[k];const id=form+"-"+k;const hint=o.hint?' <span class="hint">'+esc(o.hint)+'</span>':"";
  if(type==="select")return '<div class="field"><label for="'+id+'">'+esc(label)+hint+'</label><select id="'+id+'" data-f="'+form+'.'+k+'"'+(o.rr?' data-rr':'')+'>'+(o.blank?'<option value="">Choose</option>':'')+opt(o.options,v==null?o.def:v)+'</select></div>';
  if(type==="textarea")return '<div class="field"><label for="'+id+'">'+esc(label)+hint+'</label><textarea id="'+id+'" data-f="'+form+'.'+k+'" placeholder="'+esc(o.ph||"")+'">'+esc(v||"")+'</textarea></div>';
  return '<div class="field"><label for="'+id+'">'+esc(label)+hint+'</label><input id="'+id+'" type="'+(type||"text")+'" data-f="'+form+'.'+k+'" value="'+esc(v==null?(o.def==null?"":o.def):v)+'" placeholder="'+esc(o.ph||"")+'"'+(o.list?' list="'+o.list+'"':'')+(type==="number"?' inputmode="numeric" min="0"':'')+(o.ro?' readonly':'')+'></div>';
}
function CK(form,k,label){return '<label class="check"><input type="checkbox" data-f="'+form+'.'+k+'"'+(D(form)[k]?" checked":"")+'><span>'+label+'</span></label>';}
function RD(form,k,val,label,rr){return '<label class="radio"><input type="radio" name="'+form+'-'+k+'" value="'+esc(val)+'" data-f="'+form+'.'+k+'"'+(rr?' data-rr':'')+(String(D(form)[k])===String(val)?" checked":"")+'><span>'+label+'</span></label>';}
const errBox=k=>ui.err[k]?'<p class="status warn" role="alert">'+esc(ui.err[k])+'</p>':"";
const cityList='<datalist id="cities">'+CITIES.map(c=>'<option value="'+c+'">').join("")+'</datalist>';

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
  const g=D("gate");
  return '<section class="hero"><h1>Brand deals that <em>fit your audience</em>, with terms locked before you film.</h1><p class="muted">Set your rules once. Every brief arrives complete and sorted: fits, check, or misses.</p></section>'+
  '<div class="panel">'+
  '<div class="card"><h2>Open my offers</h2>'+F("gate","code","Private code","text",{ph:"From your private link"})+(err?'<p class="status warn" role="alert">'+esc(err)+'</p>':"")+'<button class="btn dark wide" data-act="openCode">Open</button></div>'+
  '<div class="card"><h2>New to Mingle?</h2><p class="muted">Set up your profile and rules in about 2 minutes. You get a link to send brands and a private code for your offers.</p><button class="btn primary wide" data-act="startSetup">Set up my profile</button></div>'+
  '<div class="card"><p class="muted">Trying Mingle out? Open the demo creator, Riya (dummy), whose private code is <b>riya-demo</b>.</p><button class="btn wide" data-act="demoCreator">Open demo creator</button></div>'+
  '</div>';
}
function setupForm(edit,me){
  const f=D("setup");
  if(f.barter_rule==null)Object.assign(f,{barter_rule:"value",max_pay_days:"30",paid_ads_extra:true,blocked:[],niche:"Skincare",age_band:"18 to 34"});
  const chips=BLOCK.concat((f.blocked||[]).filter(x=>!BLOCK.includes(x)));
  return (edit?'<div class="back"><button class="iconbtn" data-act="cancelEdit" aria-label="Back">'+ic("back")+'</button><b>Edit my rules</b></div>':'<section class="hero"><h1>Set up your <em>Mingle</em></h1><p class="muted">Brands see your verified audience, not just followers. Your rules sort every offer for you.</p></section>')+
  '<div class="panel">'+
  '<div class="card"><h3>About you</h3>'+
    F("setup","name","Your name","text",{ph:"First name is fine"})+
    '<div class="row2">'+F("setup","handle","Instagram handle","text",{ph:"without @",ro:edit})+F("setup","whatsapp","WhatsApp","text",{ph:"+91"})+'</div>'+
    '<div class="row2">'+F("setup","niche","Niche","select",{options:NICHES})+F("setup","followers","Followers","number",{ph:"9200"})+'</div>'+
    F("setup","offers_per_month","Brand offers you get in a month","number",{ph:"4"})+
  '</div>'+
  '<div class="card"><h3>Your audience</h3><p class="muted">From your Instagram insights. Send us the screenshot on WhatsApp; we check it on a short call and mark you verified.</p>'+
    '<div class="row2">'+F("setup","top_city","Top city","text",{list:"cities",ph:"Delhi"})+F("setup","top_city_share","Share in top city","number",{hint:"%",ph:"31"})+'</div>'+
    F("setup","age_band","Main age band","select",{options:AGES})+cityList+
  '</div>'+
  '<div class="card"><h3>Your rules</h3>'+
    F("setup","min_fee_inr","Lowest fee per reel","number",{hint:"₹",ph:"8000"})+
    '<div class="field"><span class="lbl">Barter</span>'+RD("setup","barter_rule","value","I take barter if the product is worth at least",true)+(f.barter_rule==="value"?F("setup","barter_floor_inr","Barter minimum","number",{hint:"₹",ph:"2000"}):"")+RD("setup","barter_rule","never","I never take barter",true)+'</div>'+
    '<div class="field"><span class="lbl">Categories I don\'t promote</span><div class="chips">'+chips.map(x=>'<button class="chip block" data-act="toggleBlock" data-v="'+esc(x)+'" aria-pressed="'+(f.blocked||[]).includes(x)+'">'+esc(x)+'</button>').join("")+'</div>'+
    '<div class="row"><input type="text" data-f="setup.custom" aria-label="Add your own category" placeholder="Add your own" value="'+esc(f.custom||"")+'"><button class="btn sm" data-act="addBlock">Add</button></div></div>'+
    F("setup","max_pay_days","I want to be paid within (days after posting)","select",{options:[15,30,45,60]})+
    CK("setup","paid_ads_extra","I charge extra if the brand runs my video as a paid ad")+
    CK("setup","consent","I agree Mingle may show my verified audience numbers to brands I send my link to")+
  '</div>'+errBox("setup")+
  '<button class="btn primary wide" data-act="saveSetup"'+(ui.busy?" disabled":"")+'>'+(edit?"Save my rules":"Create my Mingle")+'</button>'+
  (edit?"":'<button class="btn wide" data-act="cancelSetup">Back</button>')+
  '</div>';
}
function creatorHead(me){
  return '<div class="phead">'+av(me.handle,me.handle)+'<div class="who"><b>@'+esc(me.handle)+(me.verified?'<span class="tick" aria-label="verified">✓</span>':'')+'</b><span class="sub">'+(me.verified?"Verified audience":"Verification pending")+' · '+esc(me.niche||"")+'</span></div></div>';
}
function offerCard(o,me,forCreator){
  const b=briefOf(o),t=terms(o,b),f=fit(me,t);
  const src=b.source==="campaign"?"Campaign invite":"Your Mingle link";
  const fee=t.is_barter?"Barter "+inr(t.barter_value_inr):inr(t.fee_inr);
  let foot="";
  if(o.status==="declined")foot='<p class="status bad">You declined this offer.</p>'+(ui.msg["decline:"+o.id]?msgBox("decline:"+o.id,ui.msg["decline:"+o.id]):"");
  else if(isContract(o))foot='<p class="status '+(o.status==="locked"?"ok":"info")+'">'+(o.status==="locked"?"Terms locked on "+fmtD(o.locked_at):"Contract ready to review")+'</p><button class="btn dark wide" data-act="openDeal" data-v="'+o.id+'" data-side="creator">Review contract</button>';
  else if(o.interested)foot='<p class="status info">You said yes. Your contract is being prepared. We send it within 12 hours of your yes.</p>';
  else foot='<div class="btnrow"><button class="btn primary" data-act="interested" data-v="'+o.id+'">I\'m interested</button><button class="btn" data-act="decline" data-v="'+o.id+'">Decline politely</button></div>';
  return '<article class="post '+f.result+'">'+
   '<div class="phead">'+av(b.brand_name,b.brand_name,"sq")+'<div class="who"><b>'+esc(b.brand_name)+'</b><span class="sub">'+src+' · '+ago(o.created_at)+'</span></div><span class="pill '+f.result+'">'+({fits:"Fits",check:"Check",misses:"Misses"})[f.result]+'</span></div>'+
   '<div class="media" style="'+grad(b.product+b.brand_name)+'"><h3>'+esc(b.product)+'</h3><span class="tag">'+esc(t.deliverables)+'</span><span class="tag r">'+fee+'</span></div>'+
   '<div class="pbody"><ul class="reasons">'+f.reasons.map(r=>'<li>'+esc(r)+'</li>').join("")+'</ul>'+
   '<dl class="terms"><dt>Category</dt><dd>'+esc(t.category)+'</dd><dt>Post on</dt><dd>'+fmtD(t.post_date)+'</dd><dt>Runs</dt><dd>'+(t.usage_type==="paid"?"Your page plus paid ads, "+esc(t.usage_days)+" days":"Your page only")+'</dd><dt>Paid within</dt><dd>'+(t.is_barter?"Barter":esc(t.payment_days)+" days of posting")+'</dd></dl>'+
   foot+'</div></article>';
}
function creatorOffers(me){
  const mine=rows("offers").filter(o=>o.creator_id===me.handle).sort((a,b)=>b.created_at.localeCompare(a.created_at));
  const handled=o=>o.status==="declined"||o.interested||isContract(o);
  const groups=[["fits","Fits your rules"],["check","Check before you reply"],["misses","Misses your rules"]];
  let out='<div class="panel" style="padding-bottom:0">'+(ui.justSetup?'<p class="status ok">You\'re on Mingle. Send your link to the next brand that DMs you.</p>':"")+'</div>'+creatorHead(me)+'<div class="panel">';
  if(!mine.length)return out+'<div class="card"><h3>No offers yet</h3><p class="muted">Paste your link in your next reply to a brand. Their brief lands here, sorted by your rules.</p><button class="btn dark wide" data-act="tab" data-v="link">Get my link</button></div></div>';
  for(const [k,label] of groups){
    const list=mine.filter(o=>!handled(o)&&fit(me,terms(o,briefOf(o))).result===k);
    if(list.length)out+='<p class="group-h">'+label+' ('+list.length+')</p>'+list.map(o=>offerCard(o,me)).join("");
  }
  const h=mine.filter(handled);
  if(h.length)out+='<p class="group-h">Handled ('+h.length+')</p>'+h.map(o=>offerCard(o,me)).join("");
  return out+'</div>';
}
function creatorContracts(me){
  const list=rows("offers").filter(o=>o.creator_id===me.handle&&isContract(o));
  return creatorHead(me)+'<div class="panel">'+(list.length?list.map(o=>dealRow(o,"creator")).join(""):'<div class="card"><h3>No contracts yet</h3><p class="muted">When you say yes to an offer, our team prepares the contract within 12 hours and it appears here.</p></div>')+'</div>';
}
function dealRow(o,side){
  const b=briefOf(o),c=byHandle(o.creator_id)||{handle:o.creator_id};
  const st=statusLabel(o);
  return '<button class="list-item" data-act="openDeal" data-v="'+o.id+'" data-side="'+side+'">'+(side==="creator"?av(b.brand_name,b.brand_name,"sq"):av(c.handle,c.handle))+'<span class="grow"><b>'+esc(side==="creator"?b.brand_name:"@"+c.handle)+'</b><span class="muted" style="display:block">'+esc(b.product)+' · '+esc(terms(o,b).deliverables)+'</span></span><span class="pill '+st[1]+'">'+st[0]+'</span></button>';
}
function statusLabel(o){
  return({new:["New","info"],screened:["Screened","info"],declined:["Declined","misses"],contract_sent:["To confirm","wait"],creator_confirmed:["Creator confirmed","wait"],brand_confirmed:["Brand confirmed","wait"],locked:["Locked","locked"],change_requested:["Change asked","check"]})[o.status]||[o.status,"info"];
}
function replyText(me){return "Hi, thanks for reaching out. So I can reply properly, could you share the brief here? It takes about 3 minutes: "+ORIGIN+"/c/"+encodeURIComponent(me.handle);}
function msgBox(key,text){return '<div class="link" id="m-'+esc(key.replace(/[^a-z0-9-]/gi,"_"))+'">'+esc(text)+'</div><button class="btn sm" data-act="copy" data-v="'+esc(key)+'">Copy message</button>';}
function creatorLink(me){
  const sends=rows("link_sends").filter(s=>s.creator_id===me.handle).sort((a,b)=>b.sent_at.localeCompare(a.sent_at));
  ui.msg["reply"]=replyText(me);
  return creatorHead(me)+'<div class="panel">'+
  (ui.justSetup?'<p class="status ok">You\'re set up. Save your private link below; it opens your offers on any phone.</p>':"")+
  '<div class="card"><h3>Your reply to brands</h3><p class="muted">Paste this when a brand DMs you. Their brief comes to you complete and sorted.</p>'+msgBox("reply",ui.msg.reply)+'</div>'+
  '<div class="card"><h3>Your private link</h3><div class="link">'+esc(ORIGIN+"/me/"+me.private_token)+'</div><p class="muted">Keep this link private. It opens your offers and contracts on any phone. Your code is <b>'+esc(me.private_token)+'</b>.</p></div>'+
  '<div class="card"><h3>I sent my link</h3><p class="muted">Tell us which brand you sent it to, so we can follow up if they go quiet.</p>'+
   '<div class="row"><input type="text" data-f="send.brand" aria-label="Brand handle" placeholder="Brand handle" value="'+esc(D("send").brand||"")+'"><button class="btn sm dark" data-act="logSendCreator">Log</button></div>'+
   (sends.length?'<table class="trk"><thead><tr><th>Brand</th><th>Sent</th><th>Result</th></tr></thead><tbody>'+sends.slice(0,6).map(s=>'<tr><td>@'+esc(s.brand_handle)+'</td><td>'+fmtD(s.sent_at)+'</td><td>'+esc(outcomeLabel(s.outcome))+'</td></tr>').join("")+'</tbody></table>':"")+
  '</div>'+
  (me.verified?'<p class="status ok">Verified on '+fmtD(me.verified_at)+'. Brands see your audience numbers.</p>':'<p class="status warn">Verification pending: send your insights screenshot to our WhatsApp and we check it on a short call.</p>')+
  '</div>';
}
const outcomeLabel=o=>({filled:"Brief sent",replied_in_dm:"Replied in DM",went_quiet:"Went quiet"})[o]||"Waiting";
function creatorProfile(me){
  const deals=rows("offers").filter(o=>o.creator_id===me.handle);
  return '<div class="panel"><div class="prof">'+av(me.handle,me.handle,"lg")+'<div class="stats"><div><b>'+Number(me.followers||0).toLocaleString("en-IN")+'</b><span>followers</span></div><div><b>'+deals.length+'</b><span>offers</span></div><div><b>'+(me.total_posts?me.on_time_posts+"/"+me.total_posts:"New")+'</b><span>on time</span></div></div></div>'+
  '<div><b>'+esc(me.name||me.handle)+'</b> <span class="muted">@'+esc(me.handle)+(me.verified?'<span class="tick" aria-label="verified">✓</span>':'')+'</span><p class="muted">'+esc(me.niche)+' · Top city '+esc(me.top_city||"not set")+' '+(me.top_city_share?esc(me.top_city_share)+"%":"")+' · '+esc(me.age_band||"")+'</p></div>'+
  '<div class="hl">'+[["Min "+inr(me.min_fee_inr),"Fee"],[me.barter_rule==="never"?"No barter":"≥ "+inr(me.barter_floor_inr),"Barter"],["≤ "+me.max_pay_days+" days","Paid"],[me.paid_ads_extra?"Extra":"Included","Paid ads"]].map(h=>'<div class="hlc"><div class="c">'+esc(h[0])+'</div><span>'+h[1]+'</span></div>').join("")+'</div>'+
  ((me.blocked_categories||[]).length?'<div class="field"><span class="lbl">I don\'t promote</span><div class="chips">'+me.blocked_categories.map(x=>'<span class="info">'+esc(x)+'</span>').join("")+'</div></div>':"")+
  '<button class="btn dark wide" data-act="editRules">Edit my rules</button><button class="btn wide" data-act="signOut">Sign out on this phone</button></div>';
}

/* ---------- brand ---------- */
function brandView(){
  if(ui.tab.brand==="contracts")return brandContracts();
  if(ui.sent)return sentView();
  if(ui.tab.brand==="campaign")return '<section class="hero"><h1>Post a <em>campaign</em> brief</h1><p class="muted">Tell us who you want to reach. Our team ranks verified creators by audience fit, never by follower count, and invites the best matches within 24 hours.</p></section><div class="panel">'+briefForm("camp",true)+'</div>';
  const c=ui.found?byHandle(ui.found):null;
  let out='<section class="hero"><h1>Send a brief to a <em>creator</em></h1><p class="muted">The creator sent you here. One complete brief, so they can say yes fast.</p></section><div class="panel">'+
   '<div class="card"><label for="find-handle">Creator\'s handle</label><div class="row"><input id="find-handle" type="text" data-f="find.handle" placeholder="@handle" value="'+esc(D("find").handle||"")+'"><button class="btn dark sm" data-act="find">Find</button></div>'+
   (ui.findTried&&!c?'<p class="status warn" role="alert">This link is not active. Ask the creator for their current link.</p>':'')+'</div>';
  if(c){
    out+='<div class="card"><div class="prof">'+av(c.handle,c.handle,"lg")+'<div style="display:grid;gap:4px"><b>@'+esc(c.handle)+(c.verified?'<span class="tick" aria-label="verified">✓</span>':'')+'</b><span class="muted">'+esc(c.niche)+' · '+esc(c.followers_band||"")+' followers</span>'+
     (c.verified?'<span class="info">Verified: '+esc(c.top_city)+' '+esc(c.top_city_share)+'%, '+esc(c.age_band)+(c.total_posts?', posted on time '+c.on_time_posts+' of '+c.total_posts:'')+'</span>':'<span class="info">Audience check pending</span>')+'</div></div></div>'+
     briefForm("brief",false);
  }
  return out+'</div>';
}
function briefForm(form,camp){
  const f=D(form);
  if(f.pay==null)Object.assign(f,{pay:"paid",usage_type:"organic",revision_rounds:"1",payment_days:"30",category:"",creators_wanted:"3",target_niche:"Skincare",target_age_band:"18 to 34"});
  return '<div class="card"><h3>Your brand</h3>'+
   '<div class="row2">'+F(form,"brand_name","Brand name","text")+F(form,"website","Website","text",{ph:"optional"})+'</div>'+
   '<div class="row2">'+F(form,"contact_name","Your name","text")+F(form,"contact_role","Your role","text",{ph:"Brand manager"})+'</div>'+
   F(form,"contact_channel","WhatsApp or email","text")+'</div>'+
  '<div class="card"><h3>The deal</h3>'+
   '<div class="row2">'+F(form,"product","Product","text")+F(form,"category","Category","select",{options:CATS,blank:true})+'</div>'+
   F(form,"deliverables","What each creator makes","text",{ph:"1 reel and 2 stories"})+
   '<div class="field"><span class="lbl">Payment</span>'+RD(form,"pay","paid","Fee per creator",true)+RD(form,"pay","barter","Barter (product only)",true)+'</div>'+
   (f.pay==="barter"?F(form,"barter_value_inr","Product value","number",{hint:"₹"}):F(form,"fee_inr","Fee per creator","number",{hint:"₹"}))+
   '<div class="field"><span class="lbl">Where it runs</span>'+RD(form,"usage_type","organic","Creator\'s page only",true)+RD(form,"usage_type","paid","Also as a paid ad",true)+'</div>'+
   (f.usage_type==="paid"?F(form,"usage_days","Paid ad for how many days","number",{ph:"90"}):"")+
   '<div class="row2">'+F(form,"revision_rounds","Revision rounds","select",{options:[0,1,2,3]})+F(form,"post_date","Post date","date")+'</div>'+
   F(form,"payment_days","Pay within (days after posting)","select",{options:PAYDAYS})+
   F(form,"claims","Anything the creator must say","textarea",{ph:"Optional. For example a claim about results."})+'</div>'+
  (camp?'<div class="card"><h3>Who you want</h3><div class="row2">'+F(form,"creators_wanted","Creators wanted","number")+F(form,"target_niche","Niche","select",{options:NICHES})+'</div><div class="row2">'+F(form,"target_city","Audience city","text",{list:"cities",ph:"Delhi"})+F(form,"target_age_band","Age band","select",{options:AGES})+'</div>'+cityList+'</div>':"")+
  errBox(form)+'<button class="btn primary wide" data-act="sendBrief" data-v="'+form+'"'+(ui.busy?" disabled":"")+'>Send brief</button>';
}
function sentView(){
  const s=ui.sent;
  return '<section class="hero"><h1>Brief <em>sent</em></h1></section><div class="panel"><p class="status ok">Brief sent. Nothing is final until both sides confirm.</p>'+
  '<div class="card"><h3>Your brief code</h3><div class="link">'+esc(s.code)+'</div><p class="muted">Keep this code. When the contract is ready we send you a link. You can also open Mingle, tap Brand, then Contracts, and enter the code.</p></div>'+
  (s.camp?'<p class="muted">Our team ranks verified creators for your brief and invites the best matches within 24 hours.</p>':'<p class="muted">@'+esc(s.handle)+' sees your brief now, sorted against their rules. If they say yes, we send both of you the contract within 12 hours.</p>')+
  '<button class="btn wide" data-act="newBrief">Send another brief</button><button class="btn dark wide" data-act="tab" data-v="contracts">Go to contracts</button></div>';
}
function brandContracts(){
  const code=String(ui.brandCode||"").trim();
  const list=code?rows("offers").filter(o=>o.brand_token===code):[];
  let note="";
  if(code&&!ui.loading&&!list.length)note='<p class="status '+(ui.codeFound?"info":"warn")+'" role="alert">'+(ui.codeFound?"Brief received. Your contract is being prepared. We send it within 12 hours of the creator\'s yes.":"No brief with that code. Check the code we sent you.")+'</p>';
  return '<section class="hero"><h1>Your <em>contracts</em></h1><p class="muted">Enter the brief code we gave you when you sent the brief.</p></section><div class="panel"><div class="card"><label for="bc-code">Brief code</label><div class="row"><input id="bc-code" type="text" data-f="bc.code" value="'+esc(D("bc").code||ui.brandCode||"")+'" placeholder="e.g. dewdrop-01"><button class="btn dark sm" data-act="brandCode">Open</button></div>'+note+'</div>'+
  list.map(o=>dealRow(o,"brand")).join("")+
  '<p class="muted">Trying it out? Demo brief codes are dewdrop-01, bloomwell-01, leaf-01 and kumkum-01.</p></div>';
}

/* ---------- contract ---------- */
function dealView(){
  const o=all("offers")[ui.deal];
  const head='<div class="back"><button class="iconbtn" data-act="closeDeal" aria-label="Back">'+ic("back")+'</button><b>Contract</b></div>';
  if(!o||!ui.dealSide)return head+'<div class="panel"><p class="status warn">'+(ui.loading||mode==="connecting"?"Loading…":"This contract link is not valid. Use the link we sent you.")+'</p></div>';
  const b=briefOf(o),t=terms(o,b),c=byHandle(o.creator_id)||{handle:o.creator_id},side=ui.dealSide,other=side==="creator"?"brand":"creator";
  let out=head+'<div class="panel"><div class="row">'+av(b.brand_name,b.brand_name,"sq")+'<span style="font-weight:700">×</span>'+av(c.handle,c.handle)+'<div class="grow"><b>'+esc(b.brand_name)+' × @'+esc(c.handle)+'</b><p class="muted">You are viewing as the '+side+'</p></div></div>';
  if(!isContract(o))return out+'<p class="status info">Your contract is being prepared. We send it within 12 hours of your yes.</p></div>';
  if(o.status==="change_requested"){
    const crs=rows("change_requests").filter(r=>r.offer_id===o.id).sort((a,b)=>b.created_at.localeCompare(a.created_at));
    out+='<p class="status warn">Changed after confirmation. Please review.</p>'+(crs[0]?'<p class="muted">The '+esc(crs[0].side)+' asked to change <b>'+esc(crs[0].field)+'</b>: “'+esc(crs[0].note)+'”. Our team updates the terms and sends them back to both of you.</p>':"");
  }
  if(o.status==="locked")out+='<p class="status ok">Terms locked on '+fmtD(o.locked_at)+'. You can film now.</p>';
  out+='<div class="card"><dl class="terms">'+
   '<dt>You make</dt><dd>'+esc(t.deliverables)+'</dd>'+
   '<dt>Product</dt><dd>'+esc(t.product)+'</dd>'+
   '<dt>Fee</dt><dd>'+(t.is_barter?"Barter: product worth "+inr(t.barter_value_inr):inr(t.fee_inr))+'</dd>'+
   '<dt>Where it runs</dt><dd'+(t.usage_type==="paid"?' class="flag"':'')+'>'+(t.usage_type==="paid"?"Creator's page, plus paid ads for "+esc(t.usage_days)+" days":"Creator's page only")+'</dd>'+
   '<dt>Revisions</dt><dd>'+esc(t.revision_rounds)+' round'+(Number(t.revision_rounds)===1?"":"s")+', before posting only</dd>'+
   '<dt>Post on</dt><dd>'+fmtD(t.post_date)+'</dd>'+
   '<dt>Paid by</dt><dd>'+(t.is_barter?"Not applicable, barter":fmtD(addDays(t.post_date,t.payment_days)))+'</dd>'+
   '<dt>Claims asked</dt><dd'+(String(t.claims||"").trim()?' class="flag"':'')+'>'+(String(t.claims||"").trim()?esc(t.claims):"None")+'</dd>'+
   '<dt>Creator</dt><dd>@'+esc(c.handle)+'</dd>'+
   '<dt>Brand contact</dt><dd>'+esc(b.contact_name)+(b.contact_role?", "+esc(b.contact_role):"")+'</dd></dl></div>'+
  '<ul class="steps"><li class="'+(o.creator_confirmed_at?"done":"")+'"><span class="dot"></span>'+(o.creator_confirmed_at?"Creator confirmed on "+fmtD(o.creator_confirmed_at):"Waiting for the creator")+'</li><li class="'+(o.brand_confirmed_at?"done":"")+'"><span class="dot"></span>'+(o.brand_confirmed_at?"Brand confirmed on "+fmtD(o.brand_confirmed_at):"Waiting for the brand")+'</li></ul>';
  const mine=o[side+"_confirmed_at"];
  if(o.status!=="locked"&&o.status!=="change_requested")out+=mine?'<p class="status info">You confirmed on '+fmtD(mine)+'. Waiting for the '+other+'.</p>':'<button class="btn primary wide" data-act="confirm"'+(ui.busy?" disabled":"")+'>Confirm these terms</button>';
  if(o.status!=="change_requested"){
    out+=ui.changeOpen?'<div class="card"><h3>Ask for a change</h3>'+F("chg","field","What should change","select",{options:["Fee","Deliverables","Where it runs","Revisions","Post date","Payment date","Claims","Other"]})+F("chg","note","What you need","textarea",{ph:"For example: post on 24 Oct instead"})+errBox("chg")+'<div class="btnrow"><button class="btn dark" data-act="sendChange">Send request</button><button class="btn" data-act="toggleChange">Cancel</button></div></div>'
      :'<button class="btn wide" data-act="toggleChange">Ask for a change</button>';
  }
  return out+'</div>';
}

/* ---------- team ---------- */
function teamView(){
  if(!teamKey)return '<section class="hero"><h1>Team <em>page</em></h1><p class="muted">For the Mingle team: verify creators, rank creators for campaigns, prepare contracts and log link sends.</p></section><div class="panel"><div class="card">'+F("tk","key","Team key","password")+(ui.err.tk?'<p class="status bad" role="alert">Not allowed.</p>':"")+'<button class="btn dark wide" data-act="teamKey">Open team page</button><p class="muted">Team members only.</p></div></div>';
  const tab=ui.tab.team;
  const top='<div class="panel" style="padding-bottom:0"><label class="check"><input type="checkbox" data-act="demoToggle"'+(ui.showDemo?" checked":"")+'><span>Include demo data (names ending in “(dummy)”)</span></label></div>';
  if(tab==="campaigns")return top+teamCampaigns();
  if(tab==="offers")return top+teamOffers();
  if(tab==="log")return top+teamLog();
  return top+teamToday()+'<div class="panel"><button class="btn wide" data-act="signOutTeam">Leave team page on this device</button></div>';
}
function metrics(){
  const sends=rows("link_sends").filter(vis),briefs=rows("briefs").filter(vis),offers=rows("offers").filter(vis);
  const decided=sends.filter(s=>s.outcome);
  const within=briefs.filter(b=>b.source==="creator_link"&&sends.some(s=>s.creator_id===b.creator_id&&Date.parse(b.created_at)>=Date.parse(s.sent_at)&&Date.parse(b.created_at)-Date.parse(s.sent_at)<=72*3600e3)).length;
  const reached=offers.filter(o=>isContract(o)),locked=offers.filter(o=>o.status==="locked");
  const pct=(a,b)=>b?Math.round(100*a/b)+"%":"–";
  return [[sends.length,"Links sent"],[within,"Briefs within 72 h of a send"],[pct(decided.filter(s=>s.outcome==="filled").length,decided.length),"Brief completion rate"],[pct(decided.filter(s=>s.outcome==="went_quiet").length,decided.length),"Went-quiet rate"],[pct(locked.length,reached.length),"Both confirmed"],[offers.filter(o=>o.status==="new"&&mins(o.created_at)>240).length,"Offers waiting over 4 h"]];
}
function teamToday(){
  const pend=rows("creators").filter(c=>!c.verified&&vis(c));
  const evs=rows("events");const counts={};evs.forEach(e=>{counts[e.name]=(counts[e.name]||0)+1;});
  return '<div class="panel"><div class="kpis">'+metrics().map(m=>'<div><b>'+esc(m[0])+'</b><span>'+esc(m[1])+'</span></div>').join("")+'</div>'+
  '<p class="group-h">Creators awaiting verification ('+pend.length+')</p>'+
  (pend.length?pend.map(c=>'<div class="card"><div class="row">'+av(c.handle,c.handle)+'<div class="grow"><b>@'+esc(c.handle)+'</b><p class="muted">'+esc(c.name)+' · '+esc(c.niche)+' · '+Number(c.followers||0).toLocaleString("en-IN")+' followers</p></div></div>'+
    '<dl class="terms"><dt>Says top city</dt><dd>'+esc(c.top_city||"–")+' '+esc(c.top_city_share||"")+'%</dd><dt>Says age band</dt><dd>'+esc(c.age_band||"–")+'</dd><dt>WhatsApp</dt><dd>'+esc(c.whatsapp)+'</dd><dt>Joined</dt><dd>'+ago(c.created_at)+'</dd></dl>'+
    '<p class="muted">Check these against the insights screenshot on the call, then verify.</p><button class="btn dark wide" data-act="verify" data-v="'+esc(c.handle)+'">Verify @'+esc(c.handle)+'</button></div>').join(""):'<p class="muted">Everyone is verified.</p>')+
  '<p class="group-h">Events recorded ('+evs.length+')</p><div class="card"><table class="trk"><tbody>'+(Object.keys(counts).length?Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>'<tr><td>'+esc(k)+'</td><td class="r">'+v+'</td></tr>').join(""):'<tr><td class="muted">No events yet. They appear as people use Mingle.</td></tr>')+'</tbody></table></div></div>';
}
function ranked(b){
  return rows("creators").filter(c=>c.verified&&vis(c)).map(c=>Object.assign({c},match(c,b))).sort((x,y)=>y.score-x.score||String(x.c.handle).localeCompare(y.c.handle));
}
function teamCampaigns(){
  const camps=rows("briefs").filter(b=>b.source==="campaign"&&vis(b)).sort((a,b)=>b.created_at.localeCompare(a.created_at));
  if(!camps.length)return '<div class="panel"><p class="muted">No campaign briefs yet.</p></div>';
  return '<div class="panel">'+camps.map(b=>{
    const r=ranked(b).slice(0,8);
    const invited=new Set(rows("offers").filter(o=>o.brief_id===b.id).map(o=>o.creator_id));
    if(!ui.picks[b.id]){ui.picks[b.id]=new Set(r.filter(x=>!invited.has(x.c.handle)).slice(0,Math.max(0,Number(b.creators_wanted||1)-invited.size)).map(x=>x.c.handle));}
    const picks=ui.picks[b.id];
    return '<div class="card"><div class="row">'+av(b.brand_name,b.brand_name,"sq")+'<div class="grow"><b>'+esc(b.brand_name)+'</b><p class="muted">'+esc(b.product)+' · '+(b.is_barter?"Barter "+inr(b.barter_value_inr):inr(b.fee_inr))+' · '+esc(b.creators_wanted)+' creators</p></div></div>'+
     '<div class="chips"><span class="info">'+esc(b.target_niche)+'</span><span class="info">'+esc(b.target_city)+'</span><span class="info">'+esc(b.target_age_band)+'</span><span class="info">Code '+esc(b.brand_token)+'</span></div>'+
     '<p class="muted">Ranked by audience fit. Follower count is never used.</p>'+
     r.map(x=>{const inv=invited.has(x.c.handle);return '<div class="rank"><input type="checkbox" aria-label="Pick @'+esc(x.c.handle)+'" data-act="pick" data-b="'+esc(b.id)+'" data-v="'+esc(x.c.handle)+'"'+(inv?" disabled checked":picks.has(x.c.handle)?" checked":"")+'>'+av(x.c.handle,x.c.handle)+'<div style="min-width:0"><b>@'+esc(x.c.handle)+'</b> '+(inv?'<span class="pill locked">Invited</span>':'')+'<ul class="reasons y">'+x.yes.map(y=>'<li>'+esc(y)+'</li>').join("")+'</ul><ul class="reasons n">'+x.no.map(y=>'<li>'+esc(y)+'</li>').join("")+'</ul></div><span class="score">'+x.score+'</span></div>';}).join("")+
     '<button class="btn primary wide" data-act="invite" data-v="'+esc(b.id)+'"'+(picks.size?"":" disabled")+'>Invite selected ('+picks.size+')</button></div>';
  }).join("")+'</div>';
}
function fitMsg(o){
  const b=briefOf(o),t=terms(o,b),c=byHandle(o.creator_id)||{},f=fit(c,t);
  return "Hi @"+o.creator_id+", a new brief on Mingle from "+plain(b.brand_name)+": "+t.product+", "+t.deliverables+", "+(t.is_barter?"barter worth "+inr(t.barter_value_inr):inr(t.fee_inr))+", post on "+fmtD(t.post_date)+". Against your rules it "+({fits:"fits",check:"needs a check",misses:"misses"})[f.result]+": "+f.reasons.join("; ")+". Reply yes or no, or see it here: "+ORIGIN+"/me/"+(c.private_token||"");
}
function contractMsg(o,side){
  const b=briefOf(o),link=ORIGIN+"/deal/"+o.id+"?t="+(side==="creator"?o.creator_token:o.brand_token);
  return side==="creator"?"Hi @"+o.creator_id+", your contract with "+plain(b.brand_name)+" is ready on Mingle. Please read it and confirm here: "+link+". Terms lock only when you and the brand both confirm."
    :"Hi "+firstName(b.contact_name)+", your contract with @"+o.creator_id+" is ready on Mingle. Please read it and confirm here: "+link+". Terms lock only when you and the creator both confirm.";
}
function teamOffers(){
  let list=rows("offers").filter(vis).sort((a,b)=>b.created_at.localeCompare(a.created_at));
  if(ui.offFilter==="action")list=list.filter(o=>o.status==="new"||o.status==="change_requested"||(o.interested&&!isContract(o)));
  if(ui.offFilter==="contracts")list=list.filter(isContract);
  const fb=(k,l)=>'<button class="chip" data-act="offFilter" data-v="'+k+'" aria-pressed="'+(ui.offFilter===k)+'">'+l+'</button>';
  return '<div class="panel"><div class="chips">'+fb("all","All")+fb("action","Needs action")+fb("contracts","Contracts")+'</div>'+
  (list.length?list.map(o=>{
    const b=briefOf(o),c=byHandle(o.creator_id)||{handle:o.creator_id},t=terms(o,b),f=fit(c,t),st=statusLabel(o),m=mins(o.created_at);
    const crs=rows("change_requests").filter(r=>r.offer_id===o.id).sort((a,b)=>b.created_at.localeCompare(a.created_at));
    let actions='';
    if(!isContract(o)&&o.status!=="declined")actions='<div class="btnrow"><button class="btn sm" data-act="fitMsg" data-v="'+o.id+'">Copy fit message</button><button class="btn sm dark" data-act="makeContract" data-v="'+o.id+'">Create contract</button></div>';
    if(o.status==="change_requested"){
      const e=D("edit-"+o.id);if(e.fee_inr==null)Object.assign(e,{fee_inr:t.fee_inr,post_date:t.post_date,payment_days:String(t.payment_days),revision_rounds:String(t.revision_rounds)});
      actions='<p class="status warn">'+esc(crs[0]?crs[0].side+" asked: "+crs[0].field+". “"+crs[0].note+"”":"Change asked")+'</p><div class="row2">'+F("edit-"+o.id,"fee_inr","Fee","number",{hint:"₹"})+F("edit-"+o.id,"post_date","Post date","date")+'</div><div class="row2">'+F("edit-"+o.id,"payment_days","Pay within","select",{options:PAYDAYS})+F("edit-"+o.id,"revision_rounds","Revisions","select",{options:[0,1,2,3]})+'</div><button class="btn sm dark" data-act="resend" data-v="'+o.id+'">Update terms and re-send</button>';
    }
    return '<div class="card"><div class="row">'+av(c.handle,c.handle)+'<div class="grow"><b>@'+esc(c.handle)+' ← '+esc(b.brand_name)+'</b><p class="muted">'+esc(b.product)+' · '+(b.source==="campaign"?"Campaign invite"+(o.match_score!=null?", score "+o.match_score:""):"Creator link")+' · <span class="'+(o.status==="new"&&m>240?"amber":"")+'">'+ago(o.created_at)+'</span></p></div><span class="pill '+st[1]+'">'+st[0]+'</span></div>'+
      '<div class="row"><span class="pill '+f.result+'">'+({fits:"Fits",check:"Check",misses:"Misses"})[f.result]+'</span>'+(o.interested&&!isContract(o)?'<span class="pill info">Creator said yes</span>':'')+'</div><ul class="reasons">'+f.reasons.map(r=>'<li>'+esc(r)+'</li>').join("")+'</ul>'+
      actions+(ui.msg["fit:"+o.id]?msgBox("fit:"+o.id,ui.msg["fit:"+o.id]):"")+(isContract(o)?'<p class="group-h">Send to the creator</p>'+msgBox("con:"+o.id,ui.msg["con:"+o.id]=contractMsg(o,"creator"))+'<p class="group-h">Send to the brand</p>'+msgBox("conb:"+o.id,ui.msg["conb:"+o.id]=contractMsg(o,"brand")):"")+'</div>';
  }).join(""):'<p class="muted">Nothing here.</p>')+'</div>';
}
function teamLog(){
  const sends=rows("link_sends").filter(vis).sort((a,b)=>b.sent_at.localeCompare(a.sent_at));
  const cs=rows("creators").filter(vis).map(c=>c.handle).sort();
  const lg=D("lg");if(lg.creator==null)lg.creator=cs[0]||"";
  return '<div class="panel"><div class="card"><h3>Log a link send</h3>'+F("lg","creator","Creator","select",{options:cs})+F("lg","brand","Brand handle","text",{ph:"brand handle"})+errBox("lg")+'<button class="btn dark wide" data-act="logSendTeam">Log send</button></div>'+
  '<div class="card"><h3>Link sends ('+sends.length+')</h3><table class="trk"><thead><tr><th>Creator → brand</th><th>Outcome</th></tr></thead><tbody>'+
  sends.map(s=>'<tr><td>@'+esc(s.creator_id)+' → @'+esc(s.brand_handle)+'<br><span class="muted">'+ago(s.sent_at)+'</span></td><td><select aria-label="Outcome" data-act="outcome" data-v="'+esc(s.id)+'">'+[["","Waiting"],["filled","Brief sent"],["replied_in_dm","Replied in DM"],["went_quiet","Went quiet"]].map(x=>'<option value="'+x[0]+'"'+((s.outcome||"")===x[0]?" selected":"")+'>'+x[1]+'</option>').join("")+'</select></td></tr>').join("")+'</tbody></table></div>'+
  '<div class="card"><h3>Export</h3><select aria-label="Table" data-f="x.table">'+opt(COLLS,D("x").table||"offers")+'</select><button class="btn wide" data-act="export">Download CSV</button></div></div>';
}
function csv(c){
  const rs=rows(c);const keys=[...new Set(rs.flatMap(r=>Object.keys(r)))];
  const cell=v=>{v=v==null?"":typeof v==="object"?JSON.stringify(v):String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
  return [keys.join(",")].concat(rs.map(r=>keys.map(k=>cell(r[k])).join(","))).join("\n");
}

/* ---------- actions ---------- */
function rulesPayload(f,handle){
  return {handle,name:String(f.name||"").trim(),whatsapp:String(f.whatsapp||"").trim(),niche:f.niche,followers:Number(f.followers)||0,offers_per_month:Number(f.offers_per_month)||0,
    top_city:String(f.top_city||"").trim(),top_city_share:Number(f.top_city_share)||0,age_band:f.age_band,min_fee_inr:Number(f.min_fee_inr)||0,barter_rule:f.barter_rule,
    barter_floor_inr:Number(f.barter_floor_inr)||0,blocked_categories:f.blocked||[],max_pay_days:Number(f.max_pay_days)||30,paid_ads_extra:!!f.paid_ads_extra,consent:!!f.consent};
}
const act={
  async role(d){ui.role=d.v;ui.deal=null;ui.dealSide=null;ui.dealTok=null;ui.err={};go("/");load(null);render();window.scrollTo(0,0);await refresh();},
  async tab(d){ui.tab[ui.role]=d.v;ui.deal=null;ui.dealSide=null;ui.dealTok=null;ui.editRules=false;ui.err={};ui.sent=null;go("/");render();window.scrollTo(0,0);await refresh();},
  async openCode(){const code=String(D("gate").code||"").trim();if(!code)return;const p=await rpc("creator_me",{p_token:code});
    if(!p){ui.err.gate="This page is private. Use the link we sent you on WhatsApp.";render();return;}
    ui.token=code;ui.badToken=false;store("mingle.token",code);ui.err={};ui.tab.creator="offers";load(p);render();},
  demoCreator(){D("gate").code="riya-demo";return act.openCode();},
  startSetup(){ui.setup=true;ui.token=null;render();window.scrollTo(0,0);},
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
      else{const r=await rpc("create_creator",{p});ui.token=r.private_token;store("mingle.token",r.private_token);ui.setup=false;ui.justSetup=true;ui.tab.creator="link";ev("creator_onboarded",{niche:p.niche,followers:p.followers>=50000?"50K plus":p.followers>=25000?"25K to 50K":p.followers>=10000?"10K to 25K":"Under 10K"});}
      ev("rules_saved",{min_fee_inr:p.min_fee_inr,blocked_count:p.blocked_categories.length,max_pay_days:p.max_pay_days,barter_rule:p.barter_rule});
      ui.editRules=false;ui.err={};delete ui.draft.setup;toast(edit?"Rules saved":"You're on Mingle");
    }catch(e){ui.err.setup=e.message;}
    ui.busy=false;render();window.scrollTo(0,0);await refresh();
  },
  editRules(){const me=meC();ui.draft.setup={name:me.name,handle:me.handle,whatsapp:me.whatsapp,niche:me.niche,followers:me.followers,offers_per_month:me.offers_per_month,top_city:me.top_city,top_city_share:me.top_city_share,age_band:me.age_band,min_fee_inr:me.min_fee_inr,barter_rule:me.barter_rule,barter_floor_inr:me.barter_floor_inr,blocked:(me.blocked_categories||[]).slice(),max_pay_days:String(me.max_pay_days),paid_ads_extra:me.paid_ads_extra,consent:me.consent};ui.editRules=true;render();window.scrollTo(0,0);},
  cancelEdit(){ui.editRules=false;delete ui.draft.setup;ui.err={};render();},
  signOut(){ui.token=null;store("mingle.token",null);ui.justSetup=false;load(null);go("/");render();},
  async interested(d){if(await rpc("offer_interested",{p_token:ui.token,p_offer:d.v})){ev("offer_accepted",{offer_id:d.v});toast("Sent. Contract within 12 hours.");}await refresh();},
  async decline(d){const o=all("offers")[d.v],b=briefOf(o);ui.msg["decline:"+d.v]="Hi "+firstName(b.contact_name)+", thank you for thinking of me for "+b.product+". It isn't the right fit for my audience right now, so I'll pass this time. Happy to hear about future campaigns.";
    if(await rpc("offer_decline",{p_token:ui.token,p_offer:d.v}))ev("offer_declined",{offer_id:d.v});await refresh();},
  copy(d){const text=ui.msg[d.v]||"";if(d.v==="reply")ev("link_copied",{});
    const done=()=>toast("Copied");const fail=()=>toast("Copy is blocked here. Select the text and copy it.");
    try{navigator.clipboard.writeText(text).then(done,fail);}catch(e){fail();}},
  async logSendCreator(){const h=String(D("send").brand||"").replace(/^@/,"").trim();if(!h){toast("Add the brand's handle");return;}
    if(await rpc("log_send_creator",{p_token:ui.token,p_brand:h})){ev("link_sent",{source:"creator"});D("send").brand="";toast("Logged");}await refresh();},
  async find(){const h=String(D("find").handle||"").toLowerCase().replace(/^@/,"").trim();if(!h)return;
    const c=await rpc("public_creator",{p_handle:h});ui.findTried=true;ui.found=c?c.handle:null;S.creators=c?{[c.handle]:c}:{};render();},
  async sendBrief(d){
    if(ui.busy)return;
    const form=d.v,camp=form==="camp",f=D(form);
    const need=[["brand_name","brand name"],["contact_name","your name"],["contact_channel","WhatsApp or email"],["product","product"],["category","category"],["deliverables","what each creator makes"],["post_date","post date"],["payment_days","payment days"]];
    const miss=need.filter(([k])=>!String(f[k]||"").trim()).map(x=>x[1]);
    if(f.pay==="barter"?!(Number(f.barter_value_inr)>0):!(Number(f.fee_inr)>0))miss.splice(4,0,f.pay==="barter"?"product value":"fee");
    if(f.usage_type==="paid"&&!(Number(f.usage_days)>0))miss.push("paid ad days");
    if(camp&&!String(f.target_city||"").trim())miss.push("audience city");
    if(miss.length){ui.err[form]="Still needed: "+miss.join(", ")+". Add them so creators can decide.";render();return;}
    const src=camp?"campaign":"creator_link",t0=ui.t0[src]||Date.now();
    const p={brand_name:f.brand_name,website:f.website,contact_name:f.contact_name,contact_role:f.contact_role,contact_channel:f.contact_channel,product:f.product,category:f.category,deliverables:f.deliverables,
      fee_inr:Number(f.fee_inr)||0,is_barter:f.pay==="barter",barter_value_inr:Number(f.barter_value_inr)||0,creators_wanted:Number(f.creators_wanted)||1,usage_type:f.usage_type,usage_days:Number(f.usage_days)||0,
      revision_rounds:Number(f.revision_rounds)||0,post_date:f.post_date,payment_days:Number(f.payment_days),claims:f.claims||"",target_niche:f.target_niche,target_city:f.target_city,target_age_band:f.target_age_band,
      time_to_submit_sec:Math.round((Date.now()-t0)/1000)};
    ui.busy=true;render();
    try{
      const r=await rpc("submit_brief",{p,p_handle:camp?null:ui.found});
      ev("brief_submitted",{brief_id:r.brief_id,source:src,budget_inr:p.is_barter?p.barter_value_inr:p.fee_inr,creators_wanted:camp?p.creators_wanted:1,usage_type:p.usage_type,payment_days:p.payment_days,target_niche:camp?p.target_niche:null,target_city:camp?p.target_city:null,time_to_submit_sec:p.time_to_submit_sec});
      ui.sent={code:r.code,camp,handle:ui.found};ui.brandCode=r.code;D("bc").code=r.code;delete ui.draft[form];ui.err={};
    }catch(e){ui.err[form]=e.message;}
    ui.busy=false;render();window.scrollTo(0,0);
  },
  newBrief(){ui.sent=null;ui.found=null;ui.findTried=false;D("find").handle="";ui.opened.clear();render();},
  async brandCode(){ui.brandCode=String(D("bc").code||"").trim();render();await refresh();},
  async openDeal(d){ui.deal=d.v;ui.dealTok=d.side==="creator"?ui.token:ui.brandCode;ui.dealSide=null;ui.changeOpen=false;render();window.scrollTo(0,0);await refresh();},
  async closeDeal(){ui.deal=null;ui.dealSide=null;ui.dealTok=null;go("/");render();await refresh();},
  async confirm(){
    const o=all("offers")[ui.deal],side=ui.dealSide,k=side+"_confirmed_at",once=ui.deal+":"+side+":"+(o&&o.contract_sent_at||"");
    if(!o||o[k]||ui.busy||ui.once.has(once))return;ui.once.add(once);
    ui.busy=true;render();
    try{const r=await rpc("deal_confirm",{p_offer:ui.deal,p_token:ui.dealTok});if(r&&r.ok){ev("terms_confirmed",{offer_id:ui.deal,side});if(r.status==="locked")ev("terms_locked",{offer_id:ui.deal});}}
    finally{ui.busy=false;}
    await refresh();
  },
  toggleChange(){ui.changeOpen=!ui.changeOpen;ui.err={};render();},
  async sendChange(){
    const f=D("chg");if(!f.field)f.field="Fee";if(!String(f.note||"").trim()){ui.err.chg="Still needed: what you need.";render();return;}
    const r=await rpc("deal_change",{p_offer:ui.deal,p_token:ui.dealTok,p_field:f.field,p_note:String(f.note).trim()});
    if(r&&r.ok)ev("change_requested",{offer_id:ui.deal,side:ui.dealSide,field:f.field});
    delete ui.draft.chg;ui.changeOpen=false;ui.err={};await refresh();
  },
  async teamKey(){const k=String(D("tk").key||"").trim();if(!k)return;
    try{const p=await rpc("team_dump",{p_key:k});teamKey=k;store("mingle.team",k);ui.err={};load(p);}catch(e){ui.err.tk=true;}render();},
  demoToggle(d,el){ui.showDemo=el.checked;render();},
  async verify(d){if(await rpc("team_verify",{p_key:teamKey,p_handle:d.v})){ev("creator_verified",{});toast("Verified");}await refresh();},
  pick(d,el){const s=ui.picks[d.b];if(el.checked)s.add(d.v);else s.delete(d.v);render();},
  async invite(d){
    const b=Object.assign({id:d.v},all("briefs")[d.v]),picks=[...ui.picks[d.v]];if(!picks.length||ui.busy)return;
    const items=picks.map(h=>({handle:h,score:match(byHandle(h),b).score}));
    ui.busy=true;
    try{const n=await rpc("team_invite",{p_key:teamKey,p_brief:b.id,p_items:items});
      ev("creators_invited",{brief_id:b.id,count:n,avg_score:Math.round(items.reduce((a,x)=>a+x.score,0)/items.length)});toast("Invited "+n);}
    finally{ui.busy=false;}
    delete ui.picks[d.v];await refresh();
  },
  offFilter(d){ui.offFilter=d.v;render();},
  async fitMsg(d){const o=all("offers")[d.v];ui.msg["fit:"+d.v]=fitMsg(Object.assign({id:d.v},o));render();if(o.status==="new"){await rpc("team_offer",{p_key:teamKey,p_offer:d.v,p_action:"screen",p_terms:null});await refresh();}},
  async makeContract(d){if(await rpc("team_offer",{p_key:teamKey,p_offer:d.v,p_action:"contract",p_terms:null})){ev("contract_sent",{offer_id:d.v});toast("Contract ready. Send each side its message.");}await refresh();},
  async resend(d){const e=D("edit-"+d.v);
    if(await rpc("team_offer",{p_key:teamKey,p_offer:d.v,p_action:"resend",p_terms:{fee_inr:Number(e.fee_inr),post_date:e.post_date,payment_days:Number(e.payment_days),revision_rounds:Number(e.revision_rounds)}})){ev("contract_sent",{offer_id:d.v,resent:true});toast("Updated terms sent");}
    delete ui.draft["edit-"+d.v];await refresh();},
  async logSendTeam(){const f=D("lg"),h=String(f.brand||"").replace(/^@/,"").trim();if(!f.creator||!h){ui.err.lg="Still needed: creator and brand handle.";render();return;}
    if(await rpc("team_log_send",{p_key:teamKey,p_creator:f.creator,p_brand:h})){ev("link_sent",{source:"team"});f.brand="";ui.err={};toast("Logged");}await refresh();},
  async outcome(d,el){const prev=all("link_sends")[d.v]||{};if(await rpc("team_outcome",{p_key:teamKey,p_send:d.v,p_outcome:el.value})&&el.value==="went_quiet"&&prev.outcome!=="went_quiet")ev("brand_went_silent",{});await refresh();},
  export(){const c=D("x").table||"offers",text=csv(c);
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"text/csv"}));a.download="mingle_"+c+".csv";document.body.appendChild(a);a.click();a.remove();},
  async signOutTeam(){teamKey=null;store("mingle.team",null);load(null);render();}
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
  if(e.type==="change"&&el.hasAttribute("data-rr"))render();
}
document.addEventListener("input",bind);document.addEventListener("change",bind);
document.addEventListener("keydown",e=>{if(e.key!=="Enter"||e.target.tagName!=="INPUT")return;const k=e.target.dataset.f||"";
  const map={"gate.code":"openCode","find.handle":"find","bc.code":"brandCode","tk.key":"teamKey","send.brand":"logSendCreator","setup.custom":"addBlock"};if(map[k]){e.preventDefault();run(act[map[k]],{dataset:{}});}});
init();
})();
