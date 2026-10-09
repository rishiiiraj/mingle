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
const WDAY=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
// key, label, singular, plural
const FORMATS=[["reel","Reel","reel","reels"],["story","Story","story","stories"],["post","Post or carousel","post","posts"],["ugc","UGC video","UGC video","UGC videos"]];
const DECLINE=[["fee","Fee too low"],["category","Not my category"],["barter","Barter only"],["timing","Bad timing"],["brand","Not this brand"],["other","Something else"]];
const OFFER_TYPES=[["paid","Paid"],["barter","Barter"],["unclear","Not clear yet"]];
const SLOT_TIMES=["11 am to 12 pm","2 to 3 pm","6 to 7 pm","8 to 9 pm"];
const DEAL_STEPS=["Terms sent","Both confirm","Locked","Posted","Paid"];
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
 back:'<path d="M15 5l-7 7 7 7"/>',
 close:'<path d="M6 6l12 12M18 6L6 18"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 track:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h5a4 4 0 0 0 0-8h-2a4 4 0 0 1 0-8h5"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 wa:'<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1.2-1.2 2 .8-.5 1.6c-3.5.3-7.4-3.6-7.1-7.1l1.6-.5.8 2z"/>'
};
const PAL=[["#ffb648","#ff6a4d"],["#ff6a4d","#e0337f"],["#e0337f","#8e44ad"],["#2bb6a3","#1f6feb"],["#f7971e","#e8590c"],["#7bc67b","#2f9e6e"],["#ff8fb1","#c2185b"],["#36b3d9","#1c6e8c"],["#a06cd5","#5f3dc4"],["#ef6f6c","#b8325a"]];
// three sample briefs show a new creator how their rules will sort real offers
const SAMPLES=[
 {brand_name:"Dewdrop Skin",product:"Niacinamide serum",category:"Skincare",deliverables:"1 reel",deliverables_counts:{reel:1},fee_inr:9000,is_barter:false,usage_type:"organic",usage_days:0,revision_rounds:1,payment_days:15,claims:""},
 {brand_name:"Bloomwell Body",product:"Barrier lotion",category:"Body care",deliverables:"1 reel and 2 stories",deliverables_counts:{reel:1,story:2},fee_inr:12000,is_barter:false,usage_type:"paid",usage_days:90,revision_rounds:2,payment_days:45,claims:"Say it repairs the skin barrier in 7 days"},
 {brand_name:"FitSip",product:"Slimming tea",category:"Weight loss",deliverables:"1 reel",deliverables_counts:{reel:1},fee_inr:6000,is_barter:false,usage_type:"organic",usage_days:0,revision_rounds:1,payment_days:60,claims:""}];

/* ---------- state ---------- */
const S={}; COLLS.forEach(c=>{S[c]={};});
let mode="connecting",pending=false,teamKey=null;
const ui={role:"home",tab:{creator:"home",brand:"send",team:"pilot"},token:null,setup:false,editRules:false,justSetup:false,
  deal:null,dealSide:null,brandCode:"",found:null,findTried:false,draft:{},err:{},sent:null,showDemo:true,
  picks:{},msg:{},offFilter:"all",busy:false,tips:new Set(),src:"",page:"",offer:null,sheet:null,
  wiz:{setup:0,brief:-1,camp:-1},review:{},offerFilter:"open",
  viewed:new Set(),once:new Set(),ranked:new Set(),started:{},lastField:{},abandoned:new Set()};

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const inr=n=>"₹"+Math.round(Number(n)||0).toLocaleString("en-IN");
const fmtD=iso=>{if(!iso)return "Not set";const p=String(iso).slice(0,10).split("-").map(Number);return p[2]+" "+MON[p[1]-1]+" "+p[0];};
const fmtS=iso=>{if(!iso)return "";const p=String(iso).slice(0,10).split("-").map(Number);return p[2]+" "+MON[p[1]-1];};
const addDays=(iso,n)=>{const p=String(iso).slice(0,10).split("-").map(Number);return new Date(Date.UTC(p[0],p[1]-1,p[2]+Number(n||0))).toISOString().slice(0,10);};
const today=()=>new Date().toISOString().slice(0,10);
const daysTo=iso=>iso?Math.round((T(String(iso).slice(0,10))-T(today()))/DAY):null;
const inDays=iso=>{const n=daysTo(iso);if(n==null)return "";return n===0?"today":n===1?"tomorrow":n===-1?"yesterday":n>0?"in "+n+" days":-n+" days ago";};
const ago=iso=>{const m=Math.max(0,Math.round((Date.now()-Date.parse(iso))/60000));if(m<1)return "just now";if(m<60)return m+" min ago";const h=Math.round(m/60);if(h<48)return h+" h ago";return Math.round(h/24)+" days ago";};
const mins=iso=>Math.round((Date.now()-Date.parse(iso))/60000);
const T=iso=>Date.parse(iso);
const all=c=>S[c];
const rows=c=>Object.entries(all(c)).map(([id,d])=>Object.assign({id},d));
const hash=s=>{let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return h;};
const pal=k=>PAL[hash(k)%PAL.length];
const grad=k=>{const p=pal(k);return "background:linear-gradient(135deg,"+p[0]+","+p[1]+")";};
const ini=s=>(String(s||"?").replace(/[^A-Za-z0-9]/g,"")[0]||"?").toUpperCase();
const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+ICON[n]+'</svg>';
// people get an illustrated avatar (initial underneath while it loads); brands get a monogram tile
const av=(label,key,cls)=>'<span class="av '+(cls||"")+'"><span class="in" style="'+grad(key)+'">'+esc(ini(label))+'</span>'+(String(cls||"").includes("sq")?'':'<img src="https://api.dicebear.com/9.x/notionists/svg?seed='+encodeURIComponent(key)+'&backgroundColor=ffd5dc,c0aede,d1d4f9,b6e3f4,ffdfbf" alt="" loading="lazy" onerror="this.remove()">')+'</span>';
const logo=(name,cls)=>'<span class="av sq '+(cls||"")+'"><span class="in" style="'+grad(name)+'">'+esc(ini(name))+'</span></span>';
const opt=(arr,v)=>arr.map(x=>'<option'+(String(x)===String(v)?" selected":"")+'>'+esc(x)+'</option>').join("");
const plain=s=>String(s||"").replace(/ \(dummy\)$/,"");
const firstName=s=>plain(s).split(" ")[0]||"there";
const plural=(n,one,many)=>n+" "+(Number(n)===1?one:many);
const waLink=t=>"https://wa.me/?text="+encodeURIComponent(t);
function store(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}}
function recall(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function sstore(k,v){try{sessionStorage.setItem(k,v);}catch(e){}}
function srecall(k){try{return sessionStorage.getItem(k);}catch(e){return null;}}
function toast(t){const el=$("#toast");el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{el.hidden=true;},2800);}
function D(form){return ui.draft[form]||(ui.draft[form]={});}
const ANON=(()=>{let a=recall("mingle.anon");if(!a){a="a-"+Date.now().toString(36)+Math.random().toString(36).slice(2,8);store("mingle.anon",a);}return a;})();
const reduced=()=>window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
function celebrate(){
  if(reduced())return;const box=document.createElement("div");box.className="confetti";box.setAttribute("aria-hidden","true");
  const cols=["#ffb648","#ff6a4d","#e0337f","#2bb6a3","#1f6feb","#7bc67b"];
  for(let i=0;i<70;i++){const s=document.createElement("i");s.style.left=Math.random()*100+"%";s.style.background=cols[i%cols.length];s.style.animationDelay=(Math.random()*.5)+"s";s.style.animationDuration=(1.6+Math.random()*1.2)+"s";s.style.transform="rotate("+Math.random()*360+"deg)";box.appendChild(s);}
  document.body.appendChild(box);setTimeout(()=>box.remove(),3200);
}
const tickSvg='<svg class="okmark" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg>';
function ring(done,total){const r=22,c=2*Math.PI*r,p=total?done/total:0;return '<svg class="ring" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="'+r+'" class="trk"/><circle cx="26" cy="26" r="'+r+'" class="val" style="stroke-dasharray:'+c+';stroke-dashoffset:'+(c*(1-p))+'"/></svg>';}
// product artwork drawn per category, so every brief has a picture without uploads
function art(b,big){
  const p=pal((b.product||"")+(b.brand_name||"")),cat=String(b.category||"").toLowerCase(),w="rgba(255,255,255,.92)",s="rgba(255,255,255,.55)";
  let g;
  if(/body|hair/.test(cat))g='<rect x="138" y="30" width="44" height="86" rx="16" fill="'+w+'"/><rect x="146" y="18" width="28" height="16" rx="5" fill="'+s+'"/><rect x="148" y="60" width="24" height="22" rx="4" fill="'+p[1]+'" opacity=".45"/>';
  else if(/fitness|weight/.test(cat))g='<rect x="120" y="50" width="80" height="62" rx="12" fill="'+w+'"/><path d="M200 66c18 0 18 30 0 30" stroke="'+w+'" stroke-width="8" fill="none"/><path d="M140 40c0-10 10-10 10-20M162 40c0-10 10-10 10-20" stroke="'+s+'" stroke-width="5" fill="none" stroke-linecap="round"/>';
  else if(/fashion/.test(cat))g='<path d="M128 40l22-12h20l22 12 14 22-18 10-6-8v52h-44V64l-6 8-18-10z" fill="'+w+'"/>';
  else if(/food/.test(cat))g='<path d="M112 70h96a48 48 0 0 1-96 0z" fill="'+w+'"/><path d="M140 56c0-12 10-12 10-24M170 56c0-12 10-12 10-24" stroke="'+s+'" stroke-width="5" fill="none" stroke-linecap="round"/>';
  else if(/lightening|makeup/.test(cat))g='<rect x="124" y="56" width="72" height="56" rx="14" fill="'+w+'"/><rect x="118" y="40" width="84" height="20" rx="8" fill="'+s+'"/>';
  else g='<rect x="140" y="46" width="40" height="70" rx="10" fill="'+w+'"/><rect x="150" y="30" width="20" height="18" rx="4" fill="'+s+'"/><circle cx="160" cy="22" r="9" fill="'+s+'"/><rect x="146" y="70" width="28" height="26" rx="4" fill="'+p[1]+'" opacity=".45"/>';
  return '<svg class="art" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="g'+hash(b.product)+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+p[0]+'"/><stop offset="1" stop-color="'+p[1]+'"/></linearGradient></defs><rect width="320" height="140" fill="url(#g'+hash(b.product)+')"/><circle cx="40" cy="20" r="46" fill="rgba(255,255,255,.12)"/><circle cx="290" cy="130" r="60" fill="rgba(255,255,255,.1)"/>'+g+'</svg>';
}
const tiles=(h,n)=>'<div class="tiles">'+Array.from({length:n||6},(_,i)=>'<span class="tile" style="'+grad(h+i)+'"><img src="https://picsum.photos/seed/'+encodeURIComponent(h+"-"+i)+'/240/240" alt="" loading="lazy" onerror="this.remove()"></span>').join("")+'</div>';

/* ---------- rules ---------- */
function terms(o,b){return Object.assign({},b||{},(o&&o.terms)||{});}
const dueDate=t=>t.is_barter||!t.post_date?null:addDays(t.post_date,t.payment_days);
const feeTxt=t=>t.is_barter?"Barter, product worth "+inr(t.barter_value_inr):inr(t.fee_inr);
// The fee a creator asks for a brief: each format's rate times how many the brand wants (mirrors fee_floor in the database).
// A reel or UGC video without its own rate uses the minimum fee; briefs without a format breakdown use the minimum fee.
function feeFloor(c,b){
  const cnt=b.deliverables_counts||{},r=c.rates||{};
  if(!FORMATS.some(f=>Number(cnt[f[0]])>0))return Number(c.min_fee_inr)||0;
  return FORMATS.reduce((a,[k])=>a+(Number(cnt[k])||0)*(Number(r[k])||(k==="reel"||k==="ugc"?Number(c.min_fee_inr)||0:0)),0);
}
const multiFormat=b=>{const cnt=b.deliverables_counts||{};return FORMATS.filter(f=>Number(cnt[f[0]])>0).length>1||FORMATS.some(f=>Number(cnt[f[0]])>1);};
// each of the creator's rules, checked one by one: ok, check or miss
function ruleChecks(c,b){
  const out=[],floor=feeFloor(c,b),blocked=(c.blocked_categories||[]).map(x=>String(x).toLowerCase());
  if(b.is_barter){
    if(c.barter_rule==="never")out.push(["miss","Barter","Barter only, and you don't take barter"]);
    else out.push([Number(b.barter_value_inr)>=Number(c.barter_floor_inr||0)?"ok":"miss","Barter","Product worth "+inr(b.barter_value_inr)+" against your "+inr(c.barter_floor_inr)+" barter minimum"]);
  }else out.push([Number(b.fee_inr)>=floor?"ok":"miss","Fee",inr(b.fee_inr)+" against your "+inr(floor)+(multiFormat(b)?" for "+delivText(b.deliverables_counts):" minimum")]);
  out.push([blocked.includes(String(b.category||"").toLowerCase())?"miss":"ok","Category",b.category+(blocked.includes(String(b.category||"").toLowerCase())?" is on your list of things you don't promote":" is fine by your rules")]);
  out.push([b.usage_type==="paid"&&c.paid_ads_extra?"check":"ok","Usage",b.usage_type==="paid"?"Paid ads for "+b.usage_days+" days"+(c.paid_ads_extra?". You charge extra for that":""):"Your page only"]);
  if(!b.is_barter)out.push([Number(b.payment_days)>Number(c.max_pay_days)?"check":"ok","Payment","Paid "+b.payment_days+" days after posting. You accept up to "+c.max_pay_days]);
  out.push([String(b.claims||"").trim()?"check":"ok","Claims",String(b.claims||"").trim()?"Asks you to say: ‘"+String(b.claims).trim()+"’":"Nothing scripted to say"]);
  return out;
}
function fit(c,b){
  const rc=ruleChecks(c,b),miss=rc.filter(r=>r[0]==="miss"),chk=rc.filter(r=>r[0]==="check");
  const why=r=>r[1]==="Fee"?r[2].replace(" against your "," is below your "):r[1]==="Payment"?r[2]:r[1]==="Claims"?r[2]+". Check you are comfortable saying it":r[1]==="Usage"?"Wants to run it as a paid ad for "+b.usage_days+" days. You charge extra for that":r[2];
  if(miss.length)return{result:"misses",reasons:miss.concat(chk).map(why)};
  if(chk.length)return{result:"check",reasons:chk.map(why)};
  return{result:"fits",reasons:["Meets your fee, category, usage and payment rules"]};
}
function match(c,b){
  let s=0;const yes=[],no=[];const eq=(x,y)=>String(x||"").trim().toLowerCase()===String(y||"").trim().toLowerCase();
  if(eq(c.niche,b.target_niche)){s+=40;yes.push("Niche "+c.niche);}else no.push("Niche "+(c.niche||"not set"));
  if(eq(c.top_city,b.target_city)){s+=25;yes.push("Top city "+c.top_city+" ("+(c.top_city_share||0)+"%)");}else no.push("Top city "+(c.top_city||"not set"));
  if(eq(c.age_band,b.target_age_band)){s+=15;yes.push("Age "+c.age_band);}else no.push("Age "+(c.age_band||"not set"));
  const budget=b.is_barter?Number(b.barter_value_inr):Number(b.fee_inr),floor=feeFloor(c,b);
  if(floor<=budget){s+=10;yes.push("Rate "+inr(floor)+" within budget");}else no.push("Rate "+inr(floor)+", over the "+inr(budget)+" budget");
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
  cnt=cnt||{};const parts=FORMATS.filter(f=>Number(cnt[f[0]])>0).map(f=>plural(Number(cnt[f[0]]),f[2],f[3]));
  return parts.length>1?parts.slice(0,-1).join(", ")+" and "+parts[parts.length-1]:(parts[0]||"");
}
// where a deal is: 0 terms sent, 1 one side confirmed, 2 locked, 3 posted, 4 paid
function dealStage(o){if(o.paid_at)return 4;if(o.posted_at)return 3;if(o.status==="locked")return 2;if(o.status==="creator_confirmed"||o.status==="brand_confirmed")return 1;return 0;}
const isContract=o=>CONTRACT.includes(o.status);
function myTurn(o,side){
  if(o.status==="change_requested")return false;
  if(isContract(o)&&o.status!=="locked")return !o[side+"_confirmed_at"];
  if(o.status!=="locked"||o.paid_at)return false;
  // the creator acts to post, then to confirm a payment the brand marked as sent; the brand acts to pay once the post is live
  return side==="creator"?!o.posted_at||!!o.payment_sent_at:!!o.posted_at&&!o.payment_sent_at;
}
function sevenTerms(t,both){
  const due=dueDate(t),you=both?"The creator":"You";
  return [
   ["deliverables","What gets made",t.deliverables,"Exactly what goes live. Anything extra is a new request, not a favour."],
   ["fee","Fee",feeTxt(t),t.is_barter?"No cash changes hands; the product is the payment.":"The full fee for these deliverables, agreed now so nobody renegotiates after filming."],
   ["usage","Where it runs",t.usage_type==="paid"?"Creator's page, plus paid ads for "+t.usage_days+" days":"Creator's page only",usageTip(t,true)],
   ["revisions","Revisions",plural(Number(t.revision_rounds)||0,"round","rounds")+", before posting only",revTip(t,true)],
   ["post_date","Post date",fmtD(t.post_date)+" ("+inDays(t.post_date)+")",you+" posts on this date. If it has to move, ask for a change here, not in DMs."],
   ["payment","Payment date",t.is_barter?"Not applicable, barter":fmtD(due)+", "+t.payment_days+" days after posting","The brand pays by this date. Mingle keeps the date in front of both sides."],
   ["claims","Claims",String(t.claims||"").trim()?"‘"+String(t.claims).trim()+"’":"None",String(t.claims||"").trim()?you+" will say exactly this, nothing more.":"Nothing scripted. "+you+" talk"+(both?"s":"")+" about the product in "+(both?"their":"your")+" own words."]];
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
  if(a&&a.closest&&a.closest("#view,#sheet")&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)){pending=true;return;}
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
  setInterval(()=>{if(document.visibilityState==="visible"&&!ui.sheet)refresh();},15000);
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
  else if(parts[0]==="track"&&parts[1]){ui.role="brand";ui.tab.brand="contracts";ui.brandCode=parts[1];D("bc").code=parts[1];}
  else if(parts[0]==="team"){ui.role="team";}
}

/* ---------- lookups ---------- */
const meC=()=>ui.token?rows("creators").find(c=>c.private_token===ui.token)||null:null;
const byHandle=h=>all("creators")[String(h||"").toLowerCase().replace(/^@/,"").trim()]||null;
const briefOf=o=>all("briefs")[o.brief_id]||{};
const vis=r=>ui.showDemo||!r.demo;
const myOffers=me=>rows("offers").filter(o=>o.creator_id===me.handle);

/* ---------- shell ---------- */
function setBanner(){
  const b=$("#banner");
  if(mode==="offline"){b.hidden=false;b.className="banner local";b.textContent="Can't reach Mingle right now. Check your connection and try again.";}
  else b.hidden=true;
}
function tabsFor(){
  if(ui.deal||ui.offer||ui.role==="home")return null;
  if(ui.role==="creator")return meC()&&!ui.editRules?[["home","Home","home"],["offers","Offers","inbox"],["contracts","Deals","doc"],["link","My link","send"],["profile","Profile","user"]]:null;
  if(ui.role==="brand")return ui.wiz.brief>=0&&ui.tab.brand==="send"||ui.wiz.camp>=0&&ui.tab.brand==="campaign"?null:[["send","Brief a creator","send"],["campaign","Campaign","plus"],["contracts","Track","track"]];
  return teamKey?[["pilot","Pilot","rank"],["today","Verify","check"],["campaigns","Campaigns","list"],["offers","Deals","doc"],["log","Links","send"]]:null;
}
function pageKey(){
  if(ui.deal)return "terms";
  if(ui.role==="home")return "home";
  if(ui.role==="creator"){const me=meC();if(ui.offer)return "offer_detail";return me?"creator_"+ui.tab.creator+(ui.editRules?"_edit":""):ui.setup?"creator_setup_"+ui.wiz.setup:ui.token?"":"creator_gate";}
  if(ui.role==="brand"){if(ui.sent)return "brief_sent";if(ui.tab.brand==="send")return !ui.found?"brand_find":ui.wiz.brief<0?"brief_link":"brief_link_step_"+ui.wiz.brief;return ui.tab.brand==="campaign"?(ui.wiz.camp<0?"campaign_intro":"campaign_brief_step_"+ui.wiz.camp):"brand_track";}
  return teamKey?"team_"+ui.tab.team:"team_gate";
}
function render(){
  pending=false;setBanner();const prev=ui.page;ui.page=pageKey();
  document.querySelectorAll(".role button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===ui.role)));
  document.body.dataset.role=ui.role;
  let html;
  if(ui.deal)html=dealView();
  else if(ui.role==="home")html=homeView();
  else if(ui.role==="creator")html=creatorView();
  else if(ui.role==="brand")html=brandView();
  else html=teamView();
  const view=$("#view");view.innerHTML=html;
  if(prev!==ui.page&&ui.page){view.classList.remove("enter");void view.offsetWidth;view.classList.add("enter");}
  const tabs=tabsFor(),nav=$("#tabbar");
  if(!tabs){nav.hidden=true;nav.innerHTML="";document.body.classList.remove("has-tabs");}
  else{
    nav.hidden=false;document.body.classList.add("has-tabs");nav.style.gridTemplateColumns="repeat("+tabs.length+",1fr)";
    const cur=ui.tab[ui.role];
    nav.innerHTML=tabs.map(t=>{const b=badge(t[0]);return '<button class="tab" data-act="tab" data-v="'+t[0]+'"'+(cur===t[0]?' aria-current="page"':'')+'>'+ic(t[2])+'<span>'+t[1]+'</span>'+(b?'<span class="badge">'+b+'</span>':'')+'</button>';}).join("");
  }
  renderSheet();
  ["brief","camp"].forEach(progress);
  after();
}
function badge(t){
  if(ui.role==="creator"){const me=meC();if(!me)return 0;
    if(t==="offers")return myOffers(me).filter(o=>o.status==="new"&&!o.interested).length;
    if(t==="contracts")return myOffers(me).filter(o=>myTurn(o,"creator")).length;}
  if(ui.role==="team"&&t==="today")return rows("creators").filter(c=>!c.verified&&vis(c)).length;
  if(ui.role==="team"&&t==="offers")return rows("offers").filter(o=>vis(o)&&(o.status==="new"||o.status==="change_requested"||(o.interested&&!isContract(o)))).length;
  return 0;
}
// analytics that depend on what is on screen, sent after the screen is drawn
function after(){
  if(mode==="connecting"||ui.loading&&ui.role!=="home")return;
  const key=ui.page+"|"+(ui.found||"")+"|"+(ui.deal||"")+"|"+(ui.offer||"");
  if(ui.page&&ui.lastPage!==key){
    ui.lastPage=key;
    const p={page:ui.page};
    if(/^brief_link/.test(ui.page)&&ui.found){p.creator_handle=ui.found;p.source="creator_link";}
    else if(/^campaign/.test(ui.page))p.source="campaign";
    else if(ui.src)p.source=ui.src;
    if(ui.offer)p.offer_id=ui.offer;
    const me=ui.role==="creator"?meC():null;if(me)p.creator_handle=me.handle;
    ev("page_viewed",p);
  }
  if(ui.role==="creator"&&(ui.tab.creator==="offers"||ui.offer)&&!ui.deal){const me=meC();if(me)myOffers(me).filter(o=>!ui.offer||o.id===ui.offer).forEach(o=>{if(!ui.viewed.has(o.id)){ui.viewed.add(o.id);const b=briefOf(o),t=terms(o,b),f=fit(me,t);
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
  return '<div class="field">'+L+'<input id="'+id+'" type="'+(type||"text")+'" data-f="'+form+'.'+k+'" value="'+esc(v==null?(o.def==null?"":o.def):v)+'" placeholder="'+esc(o.ph||"")+'"'+(o.list?' list="'+o.list+'"':'')+(type==="number"?' inputmode="numeric" min="0"':'')+(o.ro?' readonly':'')+(o.auto?' autocomplete="'+o.auto+'"':'')+(o.min?' min="'+o.min+'"':'')+'></div>';
}
function CK(form,k,label){return '<label class="check"><input type="checkbox" data-f="'+form+'.'+k+'"'+(D(form)[k]?" checked":"")+(arguments[3]?' data-rr':'')+'><span>'+label+'</span></label>';}
function RD(form,k,val,label,rr){return '<label class="radio"><input type="radio" name="'+form+'-'+k+'" value="'+esc(val)+'" data-f="'+form+'.'+k+'"'+(rr?' data-rr':'')+(String(D(form)[k])===String(val)?" checked":"")+'><span>'+label+'</span></label>';}
const errBox=k=>ui.err[k]?'<p class="status warn" role="alert">'+esc(ui.err[k])+'</p>':"";
const cityList='<datalist id="cities">'+CITIES.map(c=>'<option value="'+c+'">').join("")+'</datalist>';
const chipPick=(a,v,label,on,extra)=>'<button type="button" class="chip" data-act="'+a+'" data-v="'+esc(v)+'"'+(extra||"")+' aria-pressed="'+!!on+'">'+esc(label)+'</button>';
// tap-to-explain: a "?" button that opens a plain-language line under a term
function tip(key,text){const open=ui.tips.has(key);return '<button type="button" class="tipbtn" data-act="tip" data-v="'+esc(key)+'" aria-expanded="'+open+'" aria-label="What does this mean?">?</button>'+(open?'<span class="tiptext">'+esc(text)+'</span>':'');}
// "you" wording on the creator's own offers; neutral wording on agreed terms, which both sides read
const usageTip=(t,both)=>t.usage_type==="paid"?(both?"Besides the creator's page, the brand can run the video as an ad from its own account for ":"Besides your page, the brand can run your video as an ad from their own account for ")+t.usage_days+" days. After that it must stop. Creators usually charge extra for this.":(both?"The brand can share or repost the post as it is, but cannot run it as an ad from its account.":"The brand can share or repost your post as it is, but cannot run it as an ad from their account.");
const revTip=(t,both)=>{const n=Number(t.revision_rounds),times=n===1?"once":"up to "+n+" times";return n>0?(both?"Before posting, the brand can ask the creator to re-edit the video "+times+".":"Before you post, the brand can ask you to re-edit the video "+times+".")+" Anything more, or any change after posting, is a new request.":(both?"The brand sees the video before it is posted but cannot ask for re-edits.":"The brand sees your video before you post but cannot ask for re-edits.");};
const backBar=(act,title,v)=>'<div class="back"><button class="iconbtn" data-act="'+act+'"'+(v?' data-v="'+esc(v)+'"':'')+' aria-label="Back">'+ic("back")+'</button><b>'+esc(title)+'</b></div>';
function stepper(labels,cur){
  return '<div class="stepper" aria-label="Step '+(cur+1)+' of '+labels.length+'"><div class="sbar"><span style="width:'+Math.round(100*(cur+1)/labels.length)+'%"></span></div><p><b>Step '+(cur+1)+' of '+labels.length+'</b> · '+esc(labels[cur])+'</p></div>';
}
function timeline(items){return '<ol class="tl">'+items.map(([state,title,sub])=>'<li class="'+state+'"><span class="tdot"></span><div><b>'+title+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</div></li>').join("")+'</ol>';}

/* ---------- home: pick your side ---------- */
function homeView(){
  return '<section class="hero home"><p class="eyebrow">For part-time creators and the small brands that hire them</p><h1>Brand deals that <em>fit your audience</em>, agreed before anyone films.</h1>'+
  '<p class="lead">Brands send one complete brief: fee, what to make, where it runs, post date and payment date. Creators see every offer sorted against their own rules. Both sides confirm the terms before filming, then Mingle tracks the post and the payment.</p></section>'+
  '<div class="panel"><div class="choose">'+
   '<article class="persona"><div class="pfaces">'+["riya.skinnotes","glow.with.anu","fitwithkabir"].map(h=>av(h,h)).join("")+'</div><span class="ptag">I\'m a creator</span><h2>Fewer offers, better ones</h2><ul class="ticks"><li>Set your rates and rules once</li><li>Every offer sorted: Fits, Check or Misses, with the reason</li><li>Terms locked before you film, payment date included</li></ul>'+
    '<div class="btncol"><button class="btn primary wide" data-act="startSetup">Set up my profile</button><button class="btn wide" data-act="goCreator">I have a private code</button></div></article>'+
   '<article class="persona"><div class="pfaces">'+["Aurelia Skin","Mitti Naturals","Kumkum Botanicals"].map(n=>logo(n)).join("")+'</div><span class="ptag b">I\'m a brand</span><h2>A short list you can trust</h2><ul class="ticks"><li>Brief a creator who sent you their Mingle link</li><li>Or post a campaign: we rank verified creators by audience fit, never followers</li><li>One standard brief, terms both sides confirm, payment tracked</li></ul>'+
    '<div class="btncol"><button class="btn dark wide" data-act="goBrand" data-v="send">Brief a creator</button><button class="btn wide" data-act="goBrand" data-v="campaign">Post a campaign brief</button></div></article>'+
  '</div>'+
  '<section class="how" aria-label="How Mingle works"><h2>How a deal moves</h2><ol><li><b>The creator shares a link.</b><span>Instead of haggling in DMs, the creator replies with their Mingle link.</span></li><li><b>The brand sends one complete brief.</b><span>It cannot go out without fee, deliverables, usage, post date and payment terms.</span></li><li><b>Mingle sorts it.</b><span>The creator sees Fits, Check or Misses against their own rules, with every reason.</span></li><li><b>Both sides confirm seven terms.</b><span>They lock before filming. Changes are dated requests, not DMs.</span></li><li><b>Post, then get paid.</b><span>The creator marks the post live; the payment date stays in front of both sides.</span></li></ol></section>'+
  '<section class="demo"><h2>Walk through it</h2><p class="muted">Sample creators and brands are loaded so you can try every step. Nothing you do here reaches a real brand.</p><div class="demos">'+
   '<button class="demo-c" data-act="demoCreator">'+av("riya.skinnotes","riya.skinnotes")+'<span><b>Be Riya, a skincare creator</b><span>New offers, terms to confirm, a post due and a payment to collect</span></span>'+ic("arrow")+'</button>'+
   '<button class="demo-c" data-act="demoBrandTerms">'+logo("Aurelia Skin")+'<span><b>Be Aurelia Skin, a brand</b><span>Riya said yes. Review the agreed terms and lock the deal</span></span>'+ic("arrow")+'</button>'+
   '<button class="demo-c" data-act="demoBrand">'+logo("Your brand")+'<span><b>Brief Riya as a new brand</b><span>Open her Mingle link and send a complete brief</span></span>'+ic("arrow")+'</button>'+
   '<button class="demo-c" data-act="demoCampaign">'+logo("Kumkum Botanicals")+'<span><b>Track a campaign</b><span>Kumkum Botanicals invited creators ranked by fit</span></span>'+ic("arrow")+'</button>'+
  '</div><button class="linkbtn" data-act="resetDemo">Reset the sample data</button></section>'+
  '</div>';
}

/* ---------- creator ---------- */
function creatorView(){
  const me=meC();
  if(ui.token&&!me&&!ui.setup)return ui.badToken&&!ui.loading?gate("This page is private. Use the link we sent you on WhatsApp."):'<div class="panel"><div class="skel"></div><div class="skel"></div></div>';
  if(!me)return ui.setup?setupWizard():gate(ui.err.gate);
  if(ui.offer)return offerDetail(me);
  if(ui.tab.creator==="offers")return creatorOffers(me);
  if(ui.tab.creator==="contracts")return creatorDeals(me);
  if(ui.tab.creator==="link")return creatorLink(me);
  if(ui.tab.creator==="profile")return ui.editRules?rulesForm(me):creatorProfile(me);
  return creatorHome(me);
}
function gate(err){
  return '<section class="hero"><h1>Brand deals that <em>fit your audience</em>, with terms locked before you film.</h1><p class="muted">Set your rules once. Every brief arrives complete and sorted: fits, check, or misses.</p></section>'+
  '<div class="panel form">'+
  '<div class="card"><h2>New to Mingle?</h2><p class="muted">Six short steps, about 3 minutes. You get a link to send brands and a private code for your offers.</p><button class="btn primary wide" data-act="startSetup">Set up my profile</button></div>'+
  '<div class="card"><h2>Open my offers</h2>'+F("gate","code","Private code","text",{ph:"From your private link",auto:"off"})+(err?'<p class="status warn" role="alert">'+esc(err)+'</p>':"")+'<button class="btn dark wide" data-act="openCode">Open</button></div>'+
  '<button class="demo-c" data-act="demoCreator">'+av("riya.skinnotes","riya.skinnotes")+'<span><b>Try it as Riya</b><span>A sample creator with offers at every stage</span></span>'+ic("arrow")+'</button>'+
  '</div>';
}
const SETUP=["Welcome","About you","Your audience","Your rates","Your rules","Preview"];
function setupDefaults(f){if(f.barter_rule==null)Object.assign(f,{barter_rule:"value",max_pay_days:"30",paid_ads_extra:true,blocked:[],niche:"Skincare",age_band:"18 to 34"});}
function draftCreator(f){return {handle:String(f.handle||"you").replace(/^@/,""),min_fee_inr:Number(f.min_fee_inr)||0,rates:{reel:Number(f.min_fee_inr)||0,story:Number(f.rate_story)||0,post:Number(f.rate_post)||0,ugc:Number(f.rate_ugc)||0},barter_rule:f.barter_rule,barter_floor_inr:Number(f.barter_floor_inr)||0,blocked_categories:f.blocked||[],max_pay_days:Number(f.max_pay_days)||30,paid_ads_extra:!!f.paid_ads_extra};}
function slots(){const out=[];for(let i=1;i<=3;i++){const d=new Date(Date.now()+i*DAY);out.push(WDAY[d.getDay()]+" "+d.getDate()+" "+MON[d.getMonth()]);}return out;}
function slotPicker(form){
  const f=D(form);return '<div class="field"><span class="lbl">Pick a 10-minute call <span class="hint">we check your insights screenshot with you</span></span><div class="chips">'+slots().map(d=>chipPick("pickDay",d,d,f.day===d,' data-form="'+form+'"')).join("")+'</div>'+
  (f.day?'<div class="chips">'+SLOT_TIMES.map(t=>chipPick("pickTime",t,t,f.time===t,' data-form="'+form+'"')).join("")+'</div>':'')+'</div>';
}
function rulesFields(f){
  const chips=BLOCK.concat((f.blocked||[]).filter(x=>!BLOCK.includes(x)));
  return '<div class="field"><span class="lbl">Barter</span>'+RD("setup","barter_rule","value","I take barter if the product is worth at least",true)+(f.barter_rule==="value"?F("setup","barter_floor_inr","Barter minimum","number",{hint:"₹",ph:"2000"}):"")+RD("setup","barter_rule","never","I never take barter",true)+'</div>'+
    '<div class="field"><span class="lbl">Categories I don\'t promote</span><div class="chips">'+chips.map(x=>'<button type="button" class="chip block" data-act="toggleBlock" data-v="'+esc(x)+'" aria-pressed="'+(f.blocked||[]).includes(x)+'">'+esc(x)+'</button>').join("")+'</div>'+
    '<div class="row"><input type="text" data-f="setup.custom" aria-label="Add your own category" placeholder="Add your own" value="'+esc(f.custom||"")+'"><button type="button" class="btn sm" data-act="addBlock">Add</button></div></div>'+
    F("setup","max_pay_days","I want to be paid within (days after posting)","select",{options:[15,30,45,60]})+
    CK("setup","paid_ads_extra","I charge extra if the brand runs my video as a paid ad");
}
function ratesFields(){
  return '<div class="rates">'+F("setup","min_fee_inr","Reel","number",{hint:"required",ph:"8000"})+F("setup","rate_story","Story","number",{ph:"optional"})+F("setup","rate_post","Post or carousel","number",{ph:"optional"})+F("setup","rate_ugc","UGC video","number",{ph:"optional"})+'</div>';
}
function setupWizard(){
  const f=D("setup");setupDefaults(f);const s=ui.wiz.setup;
  let body="";
  if(s===0)body='<div class="card intro"><div class="pfaces">'+["Dewdrop Skin","Leaf & Lather","Aurelia Skin"].map(n=>logo(n)).join("")+'</div><h2>Here is how Mingle works for you</h2>'+
    timeline([["done","You set your rates and rules","Once. Takes 3 minutes."],["done","Brands brief you through your link","Fee, usage, post date and payment terms, every time."],["done","Mingle sorts every offer","Fits, Check or Misses, with the reason. You always decide."],["done","You both lock the terms","Before you film. Then you post and get paid on the date."]])+'</div>';
  if(s===1)body='<div class="card">'+F("setup","name","Your name","text",{ph:"First name is fine",auto:"given-name"})+
    '<div class="row2">'+F("setup","handle","Instagram handle","text",{ph:"without @",auto:"off"})+F("setup","whatsapp","WhatsApp","text",{ph:"+91",auto:"tel"})+'</div>'+
    '<div class="row2">'+F("setup","niche","Niche","select",{options:NICHES})+F("setup","followers","Followers","number",{ph:"9200"})+'</div>'+
    F("setup","offers_per_month","Brand offers you get in a month","number",{ph:"4"})+'</div>';
  if(s===2)body='<div class="card"><p class="muted">From your Instagram insights. Brands see these numbers once we verify them; they never see your follower count used to rank you.</p>'+
    '<div class="row2">'+F("setup","top_city","Top city","text",{list:"cities",ph:"Delhi"})+F("setup","top_city_share","Share in top city","number",{hint:"%",ph:"31"})+'</div>'+
    F("setup","age_band","Main age band","select",{options:AGES})+cityList+slotPicker("setup")+'</div>';
  if(s===3)body='<div class="card"><p class="muted">Your lowest fee for each format. Mingle adds them up for every brief, so a reel plus two stories is checked against the right total.</p>'+ratesFields()+
    (Number(f.min_fee_inr)>0?'<p class="status info">A brief for 1 reel and 2 stories needs at least <b>'+inr(feeFloor(draftCreator(f),{deliverables_counts:{reel:1,story:2}}))+'</b> to fit.</p>':'')+'</div>';
  if(s===4)body='<div class="card">'+rulesFields(f)+'</div>';
  if(s===5){const c=draftCreator(f);
    body='<div class="card"><h3>How offers would land for you</h3><p class="muted">Three sample briefs, checked against the rules you just set. Change a rule and come back to see the sort change.</p>'+
      SAMPLES.map(b=>{const r=fit(c,b);return '<div class="mini '+r.result+'">'+logo(b.brand_name)+'<div class="grow"><b>'+esc(b.brand_name)+'</b><span class="muted">'+esc(b.deliverables)+' · '+inr(b.fee_inr)+'</span><span class="why">'+esc(r.reasons[0])+'</span></div><span class="pill '+r.result+'">'+({fits:"Fits",check:"Check",misses:"Misses"})[r.result]+'</span></div>';}).join("")+'</div>'+
      '<div class="card">'+CK("setup","consent","I agree Mingle may show my verified audience numbers to brands I send my link to")+'</div>';}
  return '<section class="hero slim"><h1>Set up your <em>Mingle</em></h1></section><div class="panel form">'+stepper(SETUP,s)+'<h2 class="steph">'+esc(SETUP[s])+'</h2>'+body+errBox("setup")+
   '<div class="wiznav">'+(s>0?'<button class="btn" data-act="setupBack">Back</button>':'<button class="btn" data-act="cancelSetup">Cancel</button>')+
   (s<5?'<button class="btn primary" data-act="setupNext">'+(s===0?"Let's start":"Continue")+'</button>':'<button class="btn primary" data-act="saveSetup"'+(ui.busy?" disabled":"")+'>Create my Mingle</button>')+'</div></div>';
}
function rulesForm(me){
  const f=D("setup");setupDefaults(f);
  return backBar("cancelEdit","Edit my rates and rules")+'<div class="panel form">'+
  '<div class="card"><h3>About you</h3>'+F("setup","name","Your name","text")+'<div class="row2">'+F("setup","handle","Instagram handle","text",{ro:true})+F("setup","whatsapp","WhatsApp","text")+'</div><div class="row2">'+F("setup","niche","Niche","select",{options:NICHES})+F("setup","followers","Followers","number")+'</div></div>'+
  '<div class="card"><h3>Your audience</h3><div class="row2">'+F("setup","top_city","Top city","text",{list:"cities"})+F("setup","top_city_share","Share in top city","number",{hint:"%"})+'</div>'+F("setup","age_band","Main age band","select",{options:AGES})+cityList+'</div>'+
  '<div class="card"><h3>Your rates</h3>'+ratesFields()+'</div><div class="card"><h3>Your rules</h3>'+rulesFields(f)+'</div>'+errBox("setup")+
  '<button class="btn primary wide" data-act="saveSetup"'+(ui.busy?" disabled":"")+'>Save my rates and rules</button></div>';
}
function creatorHead(me){
  return '<div class="phead mehead">'+av(me.handle,me.handle)+'<div class="who"><b>@'+esc(me.handle)+(me.verified?'<span class="tick" aria-label="verified">✓</span>':'')+'</b><span class="sub">'+(me.verified?"Verified audience":"Verification pending")+' · '+esc(me.niche||"")+'</span></div></div>';
}
function nextStep(me){
  const of=myOffers(me),bn=o=>briefOf(o).brand_name;
  const conf=of.find(o=>isContract(o)&&o.status!=="locked"&&o.status!=="change_requested"&&!o.creator_confirmed_at);
  if(conf)return{icon:"doc",title:"Confirm your terms with "+bn(conf),text:"Seven terms, one at a time. They lock when you both confirm, before you film.",cta:"Review the terms",act:"openDeal",v:conf.id};
  const sent=of.find(o=>o.status==="locked"&&!o.paid_at&&o.payment_sent_at);
  if(sent)return{icon:"check",title:bn(sent)+" says your fee is on its way",text:"Marked as sent on "+fmtD(sent.payment_sent_at)+". Tell us once it reaches your account.",cta:"Confirm the payment",act:"openDeal",v:sent.id};
  const post=of.filter(o=>o.status==="locked"&&!o.posted_at).sort((a,b)=>String(briefOf(a).post_date).localeCompare(String(briefOf(b).post_date)))[0];
  if(post){const t=terms(post,briefOf(post));return{icon:"cal",title:"Post for "+bn(post)+" "+inDays(t.post_date),text:t.deliverables+", due "+fmtD(t.post_date)+". Mark it live once it is up, with the link.",cta:"Open the deal",act:"openDeal",v:post.id};}
  const nw=of.filter(o=>o.status==="new"&&!o.interested);
  if(nw.length)return{icon:"inbox",title:plural(nw.length,"new offer is","new offers are")+" waiting",text:"Already sorted against your rules. Open one to see exactly how it matches.",cta:"See my offers",act:"tab",v:"offers"};
  const due=of.find(o=>o.status==="locked"&&o.posted_at&&!o.paid_at);
  if(due){const d=dueDate(terms(due,briefOf(due)));return{icon:"cal",title:"Payment from "+bn(due)+" due "+inDays(d),text:"Due "+fmtD(d)+". We remind the brand before the date.",cta:"Open the deal",act:"openDeal",v:due.id};}
  if(!me.verified&&!me.verify_slot)return{icon:"cal",title:"Book your verification call",text:"Ten minutes on WhatsApp to check your insights. Brands trust verified audiences.",cta:"Pick a time",act:"openSheet",v:"bookCall"};
  if(!rows("link_sends").some(s=>s.creator_id===me.handle))return{icon:"send",title:"Send your link to the next brand",text:"Reply to a brand DM with your Mingle link. Their brief comes back complete.",cta:"Get my link",act:"tab",v:"link"};
  return{icon:"check",title:"You are all caught up",text:"New briefs from your link land in Offers, already sorted.",cta:"Share my link",act:"tab",v:"link"};
}
function creatorHome(me){
  const of=myOffers(me),n=nextStep(me),h=new Date().getHours(),hi=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
  const steps=[["Set your rates and rules",true],["Get verified",!!me.verified,me.verified?"":me.verify_slot?"Call booked: "+me.verify_slot:""],["Share your link",rows("link_sends").some(s=>s.creator_id===me.handle)],["Answer an offer",of.some(o=>o.interested||o.status==="declined")],["Lock terms before filming",of.some(o=>o.locked_at)],["Post and get paid",of.some(o=>o.paid_at)]];
  const done=steps.filter(s=>s[1]).length;
  const earned=of.filter(o=>o.paid_at).reduce((a,o)=>a+Number(terms(o,briefOf(o)).fee_inr||0),0);
  const act=[];
  of.forEach(o=>{const b=briefOf(o);act.push([o.created_at,"inbox",(b.source==="campaign"?"Campaign invite from ":"New brief from ")+b.brand_name]);if(o.locked_at)act.push([o.locked_at,"doc","Terms locked with "+b.brand_name]);if(o.posted_at)act.push([o.posted_at,"send","Post live for "+b.brand_name]);if(o.paid_at)act.push([o.paid_at,"check","Paid "+inr(b.fee_inr)+" by "+b.brand_name]);});
  rows("link_sends").filter(s=>s.creator_id===me.handle).forEach(s=>act.push([s.sent_at,"send","Sent your link to @"+s.brand_handle]));
  act.sort((a,b)=>String(b[0]).localeCompare(String(a[0])));
  return '<div class="panel form">'+(ui.justSetup?'<div class="status ok welcome">'+tickSvg+'<span><b>You are on Mingle.</b> Next: send your link to the next brand that DMs you.</span></div>':'')+
   '<div class="greet">'+av(me.handle,me.handle,"lg")+'<div><p class="muted">'+hi+'</p><h1>'+esc(me.name?firstName(me.name):"@"+me.handle)+'</h1><p class="muted">@'+esc(me.handle)+(me.verified?'<span class="tick" aria-label="verified">✓</span>':'')+'</p></div></div>'+
   '<div class="next"><span class="nicon">'+ic(n.icon)+'</span><div class="grow"><p class="mgoal">Your next step</p><h2>'+esc(n.title)+'</h2><p>'+esc(n.text)+'</p></div><button class="btn primary" data-act="'+n.act+'" data-v="'+esc(n.v)+'">'+esc(n.cta)+'</button></div>'+
   '<div class="kpis"><div><b>'+of.filter(o=>o.status==="new"&&!o.interested).length+'</b><span>Offers to answer</span></div><div><b>'+of.filter(o=>o.status==="locked"&&!o.paid_at).length+'</b><span>Deals in progress</span></div><div><b>'+inr(earned)+'</b><span>Paid through Mingle</span></div><div><b>'+(me.total_posts?me.on_time_posts+"/"+me.total_posts:"New")+'</b><span>Posted on time</span></div></div>'+
   '<div class="card journey"><div class="row">'+ring(done,steps.length)+'<div><h3>Your Mingle journey</h3><p class="muted">'+done+' of '+steps.length+' done</p></div></div><ol class="jsteps">'+steps.map(s=>'<li class="'+(s[1]?"done":"")+'"><span class="jdot">'+(s[1]?ic("check"):"")+'</span><span>'+esc(s[0])+(s[2]?'<em>'+esc(s[2])+'</em>':'')+'</span></li>').join("")+'</ol></div>'+
   (act.length?'<div class="card"><h3>Recent activity</h3><ul class="act">'+act.slice(0,7).map(a=>'<li><span class="aicon">'+ic(a[1])+'</span><span class="grow">'+esc(a[2])+'</span><span class="muted">'+ago(a[0])+'</span></li>').join("")+'</ul></div>':'')+
  '</div>';
}
function offerRow(o,me){
  const b=briefOf(o),t=terms(o,b),f=fit(me,t);
  const st=o.status==="declined"?"Declined":isContract(o)?(o.paid_at?"Paid":o.posted_at?"Posted":o.status==="locked"?"Locked":"Terms ready"):o.interested?"You said yes":"";
  return '<button class="orow '+f.result+'" data-act="openOffer" data-v="'+o.id+'"><span class="othumb">'+art(b)+'</span><span class="grow"><span class="otop"><b>'+esc(b.brand_name)+'</b><span class="pill '+f.result+'">'+({fits:"Fits",check:"Check",misses:"Misses"})[f.result]+'</span></span><span class="oprod">'+esc(b.product)+' · '+esc(t.deliverables)+'</span><span class="ofee">'+feeTxt(t)+(st?' · <em>'+st+'</em>':'')+'</span><span class="why">'+esc(f.reasons[0])+'</span><span class="sub">'+(b.source==="campaign"?"Campaign invite":"Via your link")+' · '+ago(o.created_at)+'</span></span></button>';
}
function creatorOffers(me){
  const mine=myOffers(me).sort((a,b)=>b.created_at.localeCompare(a.created_at));
  const handled=o=>o.status==="declined"||o.interested||isContract(o);
  if(!mine.length)return creatorHead(me)+'<div class="panel form"><div class="card empty"><h3>No offers yet</h3><p class="muted">Paste your link in your next reply to a brand. Their brief lands here, sorted by your rules.</p><button class="btn dark wide" data-act="tab" data-v="link">Get my link</button></div></div>';
  const open=mine.filter(o=>!handled(o)),cnt={fits:0,check:0,misses:0};open.forEach(o=>{cnt[fit(me,terms(o,briefOf(o))).result]++;});
  const fl=ui.offerFilter,list=fl==="handled"?mine.filter(handled):open.filter(o=>fl==="open"||fit(me,terms(o,briefOf(o))).result===fl);
  const chip=(k,l,n)=>'<button class="chip" data-act="offerFilter" data-v="'+k+'" aria-pressed="'+(fl===k)+'">'+l+(n!=null?' <b>'+n+'</b>':'')+'</button>';
  return creatorHead(me)+'<div class="panel form"><div class="summary">'+[["fits","Fit"],["check","To check"],["misses","Miss"]].map(([k,l])=>'<button class="sumc s-'+k+'" data-act="offerFilter" data-v="'+k+'"><b>'+cnt[k]+'</b><span>'+l+'</span></button>').join("")+'</div>'+
   '<div class="chips filt">'+chip("open","All open",open.length)+chip("fits","Fits",cnt.fits)+chip("check","Check",cnt.check)+chip("misses","Misses",cnt.misses)+chip("handled","Answered",mine.filter(handled).length)+'</div>'+
   (fl==="misses"?'<p class="muted">Misses are advice only. Open one and you can still say yes.</p>':'')+
   (list.length?'<div class="olist">'+list.map(o=>offerRow(o,me)).join("")+'</div>':'<div class="card empty"><p class="muted">Nothing here right now.</p></div>')+'</div>';
}
function offerDetail(me){
  const o=all("offers")[ui.offer];
  if(!o)return backBar("closeOffer","Offer")+'<div class="panel"><p class="muted">This offer is no longer here.</p></div>';
  const b=briefOf(o),t=terms(o,b),f=fit(me,t),rc=ruleChecks(me,t),due=dueDate(t),handled=o.status==="declined"||o.interested||isContract(o);
  const verdict={fits:["Fits your rules","Every rule you set is met."],check:["Check before you reply","Nothing breaks your rules, but something needs a look."],misses:["Misses your rules","This is advice only. You can still say yes."]}[f.result];
  let action;
  if(o.status==="declined")action='<p class="status bad">You declined this offer'+(o.decline_reason?' ('+esc((DECLINE.find(x=>x[0]===o.decline_reason)||[0,""])[1].toLowerCase())+')':'')+'.</p>';
  else if(isContract(o))action='<button class="btn primary wide" data-act="openDeal" data-v="'+o.id+'">'+(o.status==="locked"?"Open the deal":"Review the agreed terms")+'</button>';
  else if(o.interested)action='<p class="status info">You said yes. We write up the agreed terms within 12 hours and send them to you both.</p>';
  else action='<div class="btnrow"><button class="btn" data-act="openSheet" data-v="decline">Decline politely</button><button class="btn primary" data-act="openSheet" data-v="yes">I\'m interested</button></div>';
  return backBar("closeOffer","Offer")+'<div class="panel form"><div class="hero-art">'+art(b,true)+'<div class="ha-txt"><span class="tag">'+(b.source==="campaign"?"Campaign invite":"Via your link")+'</span><h2>'+esc(b.product)+'</h2></div></div>'+
   '<div class="row brandrow">'+logo(b.brand_name)+'<div class="grow"><b>'+esc(b.brand_name)+'</b><p class="muted">'+esc(b.contact_name)+(b.contact_role?', '+esc(b.contact_role):'')+(b.website?' · '+esc(b.website):'')+'</p></div><span class="muted">'+ago(o.created_at)+'</span></div>'+
   '<div class="feehero"><b>'+feeTxt(t)+'</b><span>'+esc(t.deliverables)+(t.is_barter?'':' · paid by '+fmtD(due))+'</span></div>'+
   '<div class="verdict '+f.result+'"><span class="pill '+f.result+'">'+({fits:"Fits",check:"Check",misses:"Misses"})[f.result]+'</span><div><b>'+verdict[0]+'</b><span>'+verdict[1]+'</span></div></div>'+
   '<div class="card"><h3>How it matches your rules</h3><ul class="rules">'+rc.map(r=>'<li class="'+r[0]+'"><span class="rmark">'+(r[0]==="ok"?"✓":r[0]==="check"?"!":"✕")+'</span><div><b>'+r[1]+'</b><span>'+esc(r[2])+'</span></div></li>').join("")+'</ul></div>'+
   '<div class="card"><h3>The brief</h3><dl class="terms"><dt>You make</dt><dd>'+esc(t.deliverables)+'</dd><dt>Category</dt><dd>'+esc(t.category)+'</dd><dt>Post on</dt><dd>'+fmtD(t.post_date)+' <span class="muted">('+inDays(t.post_date)+')</span></dd><dt>Runs</dt><dd>'+(t.usage_type==="paid"?"Your page plus paid ads, "+esc(t.usage_days)+" days":"Your page only")+tip("use:"+o.id,usageTip(t))+'</dd><dt>Revisions</dt><dd>'+esc(t.revision_rounds)+' round'+(Number(t.revision_rounds)===1?"":"s")+tip("rev:"+o.id,revTip(t))+'</dd><dt>Paid</dt><dd>'+(t.is_barter?"Barter":esc(t.payment_days)+" days after posting")+'</dd><dt>Claims</dt><dd>'+(String(t.claims||"").trim()?esc(t.claims):"None")+'</dd></dl></div>'+
   (handled?'':'<div class="card"><h3>If you say yes</h3>'+timeline([["","We write up the agreed terms","Within 12 hours, sent to you and "+esc(firstName(b.contact_name))],["","You both confirm seven terms","Terms lock before you film"],["","Film and post by "+fmtS(t.post_date),"Mark it live with the link"],["",t.is_barter?"Keep the product":"Get paid by "+fmtS(due),t.is_barter?"No payment date on barter":"The date stays in front of the brand"]])+'</div>')+
   '<div class="actbar">'+action+'</div></div>';
}
function creatorDeals(me){
  const of=myOffers(me).filter(isContract);
  const needs=of.filter(o=>myTurn(o,"creator")),waiting=of.filter(o=>!o.paid_at&&!needs.includes(o)),done=of.filter(o=>o.paid_at);
  const grp=(t,l)=>l.length?'<p class="group-h">'+t+' ('+l.length+')</p>'+l.map(o=>dealRow(o,"creator")).join(""):"";
  return creatorHead(me)+'<div class="panel form">'+(of.length?grp("Needs you",needs)+grp("In progress",waiting)+grp("Done",done):'<div class="card empty"><h3>No deals yet</h3><p class="muted">When you say yes to an offer, our team writes up the agreed terms within 12 hours and they appear here.</p><button class="btn dark wide" data-act="tab" data-v="offers">See my offers</button></div>')+'</div>';
}
function dealNote(o,side){
  const t=terms(o,briefOf(o)),due=dueDate(t),other=side==="creator"?"brand":"creator";
  if(o.paid_at)return "Paid on "+fmtD(o.paid_at);
  if(o.status==="change_requested")return "Change asked. Our team is updating the terms";
  if(o.status!=="locked")return o[side+"_confirmed_at"]?"Waiting for the "+other+" to confirm":"Your turn: review and confirm";
  if(!o.posted_at)return (side==="creator"?"Post ":"Creator posts ")+inDays(t.post_date)+", "+fmtS(t.post_date);
  if(o.payment_sent_at)return side==="creator"?"Brand sent the fee. Did it arrive?":"Payment sent. Waiting for the creator to confirm";
  return "Payment due "+inDays(due)+", "+fmtS(due);
}
function dealRow(o,side){
  const b=briefOf(o),c=byHandle(o.creator_id)||{handle:o.creator_id},t=terms(o,b),st=dealStage(o);
  return '<button class="list-item deal" data-act="openDeal" data-v="'+o.id+'" data-side="'+side+'">'+(side==="creator"?logo(b.brand_name):av(c.handle,c.handle))+'<span class="grow"><b>'+esc(side==="creator"?b.brand_name:"@"+c.handle)+'</b><span class="muted" style="display:block">'+esc(b.product)+' · '+feeTxt(t)+'</span><span class="ministeps">'+DEAL_STEPS.map((s,i)=>'<i class="'+(i<st||o.paid_at?"done":i===st?"cur":"")+'"></i>').join("")+'</span><span class="payline">'+esc(dealNote(o,side))+'</span></span>'+ic("arrow")+'</button>';
}
function replyText(me){return "Hi, thanks for reaching out! So I can reply properly, could you share the brief here? It takes about 3 minutes: "+ORIGIN+"/c/"+encodeURIComponent(me.handle);}
function msgBox(key,text){return '<div class="link" id="m-'+esc(key.replace(/[^a-z0-9-]/gi,"_"))+'">'+esc(text)+'</div><button type="button" class="btn sm" data-act="copy" data-v="'+esc(key)+'">Copy message</button>';}
function creatorLink(me){
  const sends=rows("link_sends").filter(s=>s.creator_id===me.handle).sort((a,b)=>b.sent_at.localeCompare(a.sent_at));
  const sd=D("send");if(!sd.type)sd.type="unclear";
  ui.msg["reply"]=replyText(me);ui.msg["link"]=ORIGIN+"/c/"+me.handle;
  return creatorHead(me)+'<div class="panel form">'+
  '<div class="card share"><h3>Your Mingle link</h3><div class="biglink">'+esc(ORIGIN.replace(/^https?:\/\//,"")+"/c/"+me.handle)+'</div><div class="btnrow"><button class="btn sm" data-act="copy" data-v="link">Copy link</button><a class="btn sm" href="/c/'+esc(me.handle)+'" target="_blank" rel="noopener">See what brands see</a></div></div>'+
  '<div class="card"><h3>Your reply to brand DMs</h3><p class="muted">Paste this when a brand messages you. Their brief comes back complete and sorted.</p>'+msgBox("reply",ui.msg.reply)+'<a class="btn sm wa" href="'+waLink(ui.msg.reply)+'" target="_blank" rel="noopener" data-act="waShare">'+ic("wa")+' Share on WhatsApp</a></div>'+
  '<div class="card"><h3>I sent my link</h3><p class="muted">Tell us which brand, so we can follow up if they go quiet.</p>'+
   '<div class="field"><label for="send-brand">Brand handle</label><input id="send-brand" type="text" data-f="send.brand" placeholder="@brand" value="'+esc(sd.brand||"")+'" autocomplete="off"></div>'+
   '<div class="field"><span class="lbl">What did they offer in the DM?</span><div class="chips">'+OFFER_TYPES.map(([k,l])=>chipPick("sendType",k,l,sd.type===k)).join("")+'</div></div>'+
   '<button class="btn dark wide" data-act="logSendCreator">Log it</button>'+
   (sends.length?'<ul class="sends">'+sends.slice(0,8).map(s=>'<li><span class="grow"><b>@'+esc(s.brand_handle)+'</b><span class="muted">'+fmtD(s.sent_at)+(s.offer_type&&s.offer_type!=="unclear"?' · '+esc(s.offer_type)+' offer':'')+'</span></span><span class="pill '+(s.outcome==="filled"?"locked":s.outcome==="went_quiet"?"misses":"info")+'">'+esc(outcomeLabel(s.outcome))+'</span></li>').join("")+'</ul>':"")+
  '</div>'+
  '<div class="card"><h3>Your private link</h3><div class="link">'+esc(ORIGIN+"/me/"+me.private_token)+'</div><p class="muted">Keep this private. It opens your offers and deals on any phone. Your code is <b>'+esc(me.private_token)+'</b>.</p></div></div>';
}
const outcomeLabel=o=>({filled:"Brief sent",replied_in_dm:"Replied in DM",went_quiet:"Went quiet"})[o]||"Waiting";
function creatorProfile(me){
  const of=myOffers(me),r=me.rates||{};
  return '<div class="panel form"><div class="prof">'+av(me.handle,me.handle,"lg")+'<div class="stats"><div><b>'+Number(me.followers||0).toLocaleString("en-IN")+'</b><span>followers</span></div><div><b>'+of.length+'</b><span>offers</span></div><div><b>'+(me.total_posts?me.on_time_posts+"/"+me.total_posts:"New")+'</b><span>on time</span></div></div></div>'+
  '<div><b>'+esc(me.name||me.handle)+'</b> <span class="muted">@'+esc(me.handle)+(me.verified?'<span class="tick" aria-label="verified">✓</span>':'')+'</span><p class="muted">'+esc(me.niche)+' · Top city '+esc(me.top_city||"not set")+' '+(me.top_city_share?esc(me.top_city_share)+"%":"")+' · '+esc(me.age_band||"")+'</p></div>'+
  (me.verified?'<p class="status ok">Audience verified on '+fmtD(me.verified_at)+'. Brands see these numbers.</p>':me.verify_slot?'<p class="status info">Verification call booked: '+esc(me.verify_slot)+'. Keep your insights screenshot ready.</p>':'<div class="status warn row"><span class="grow">Not verified yet. Brands trust verified audiences.</span><button class="btn sm" data-act="openSheet" data-v="bookCall">Book a call</button></div>')+
  '<div class="card"><h3>Your rates</h3><div class="hl">'+FORMATS.filter(([k])=>k==="reel"||Number(r[k])>0).map(([k,l])=>'<div class="hlc"><div class="c">'+inr(k==="reel"?me.min_fee_inr:r[k])+'</div><span>'+l+'</span></div>').join("")+'</div></div>'+
  '<div class="card"><h3>Your rules</h3><dl class="terms"><dt>Barter</dt><dd>'+(me.barter_rule==="never"?"Never":"If worth ≥ "+inr(me.barter_floor_inr))+'</dd><dt>Paid within</dt><dd>'+me.max_pay_days+' days of posting</dd><dt>Paid ads</dt><dd>'+(me.paid_ads_extra?"Extra fee":"Included")+'</dd><dt>Won\'t promote</dt><dd>'+((me.blocked_categories||[]).join(", ")||"Nothing listed")+'</dd></dl></div>'+
  '<div class="card"><h3>What brands see</h3><p class="muted">Your verified audience and recent posts, never your follower count used to rank you.</p>'+tiles(me.handle,6)+'</div>'+
  '<button class="btn dark wide" data-act="editRules">Edit my rates and rules</button><button class="btn wide" data-act="signOut">Sign out on this phone</button></div>';
}

/* ---------- brand ---------- */
const BRIEF_STEPS=["About you","The product","Fee and dates","Usage and rules","Review"];
const CAMP_STEPS=["About you","The product","Fee and dates","Usage and rules","Who you want","Review"];
function brandView(){
  if(ui.tab.brand==="contracts")return brandTrack();
  if(ui.sent)return sentView();
  if(ui.tab.brand==="campaign"){
    if(ui.wiz.camp<0)return '<section class="hero"><h1>Post a <em>campaign</em> brief</h1><p class="muted">For briefs to several creators. Our team ranks verified creators by audience fit, never by follower count, and invites the best matches within 24 hours.</p></section><div class="panel form">'+
      '<div class="card">'+timeline([["done","You write one complete brief","About 4 minutes. Fee, deliverables, usage, dates, who you want."],["done","We rank verified creators by fit","Niche, top city, age band, rate and delivery record."],["done","We invite the best matches","Each sees your brief sorted against their own rules."],["done","Terms lock with each creator","Before filming. Track every creator from one code."]])+'</div>'+
      '<button class="btn primary wide" data-act="startBrief" data-v="camp">Start the campaign brief</button></div>';
    return briefWizard("camp");
  }
  const c=ui.found?byHandle(ui.found):null;
  if(!c)return '<section class="hero"><h1>Brief a <em>creator</em></h1><p class="muted">Got a creator\'s Mingle link? Enter their handle. One complete brief, so they can say yes fast.</p></section><div class="panel form"><div class="card"><label for="find-handle">Creator\'s handle</label><div class="row"><input id="find-handle" type="text" data-f="find.handle" placeholder="@handle" value="'+esc(D("find").handle||"")+'" autocomplete="off"><button class="btn dark sm" data-act="find">Find</button></div>'+
   (ui.findTried?'<p class="status warn" role="alert">This link is not active. Ask the creator for their current link.</p>':'')+'</div>'+
   '<button class="demo-c" data-act="demoBrand">'+av("riya.skinnotes","riya.skinnotes")+'<span><b>Try it with Riya</b><span>A sample skincare creator in Delhi</span></span>'+ic("arrow")+'</button></div>';
  if(ui.wiz.brief>=0)return briefWizard("brief");
  return creatorLanding(c);
}
function creatorLanding(c){
  return '<div class="panel form"><div class="cl-head">'+av(c.handle,c.handle,"xl")+'<h1>@'+esc(c.handle)+(c.verified?'<span class="tick" aria-label="verified">✓</span>':'')+'</h1><p class="muted">'+esc(c.niche)+' creator · '+esc(c.followers_band||"")+' followers</p></div>'+
   (c.verified?'<div class="kpis"><div><b>'+esc(c.top_city)+'</b><span>Top city, '+esc(c.top_city_share)+'% of audience</span></div><div><b>'+esc(c.age_band)+'</b><span>Main age band</span></div><div><b>'+(c.total_posts?c.on_time_posts+" of "+c.total_posts:"New")+'</b><span>Posted on time</span></div><div><b>'+fmtS(c.verified_at)+'</b><span>Insights verified</span></div></div>':'<p class="status info">Audience check pending. We verify every creator\'s insights on a call.</p>')+
   '<div class="card"><h3>Recent posts</h3>'+tiles(c.handle,6)+'</div>'+
   '<div class="card"><h3>How briefing @'+esc(c.handle)+' works</h3>'+timeline([["done","Fill one complete brief","About 3 minutes, five short steps."],["done","They see it sorted against their rules","Fee, category, usage and payment, checked in seconds."],["done","If they say yes, you both confirm the terms","Within 12 hours. Terms lock before filming."]])+'</div>'+
   '<button class="btn primary wide" data-act="startBrief" data-v="brief">Start the brief</button><button type="button" class="linkbtn" data-act="changeCreator">Not this creator?</button></div>';
}
// what a brief still needs, for one wizard step (or every step when step is null)
function briefNeeds(f,camp,step){
  const need=[],at=s=>step==null||step===s;
  if(at(0))[["brand_name","brand name"],["contact_name","your name"],["contact_channel","WhatsApp or email"]].forEach(([k,l])=>{if(!String(f[k]||"").trim())need.push(l);});
  if(at(1)){if(!String(f.product||"").trim())need.push("product");if(!String(f.category||"").trim())need.push("category");if(!delivText(f.cnt||{}))need.push("what each creator makes");}
  if(at(2)){if(f.pay==="barter"?!(Number(f.barter_value_inr)>0):!(Number(f.fee_inr)>0))need.push(f.pay==="barter"?"product value":"fee");if(!f.post_date)need.push("post date");else if(f.post_date<today())need.push("a post date in the future");if(!String(f.payment_days||"").trim())need.push("payment days");}
  if(at(3)){if(f.usage_type==="paid"&&!(Number(f.usage_days)>0))need.push("paid ad days");}
  if(camp&&at(4)){if(!String(f.target_city||"").trim())need.push("audience city");}
  return need;
}
function briefPayload(f){
  const note=String(f.deliv_note||"").trim(),d=delivText(f.cnt||{});
  return {brand_name:f.brand_name,website:f.website,contact_name:f.contact_name,contact_role:f.contact_role,contact_channel:f.contact_channel,product:f.product,category:f.category,deliverables:d+(note?" ("+note+")":""),deliverables_counts:Object.assign({},f.cnt||{}),
    fee_inr:Number(f.fee_inr)||0,is_barter:f.pay==="barter",barter_value_inr:Number(f.barter_value_inr)||0,creators_wanted:Number(f.creators_wanted)||1,usage_type:f.usage_type,usage_days:Number(f.usage_days)||0,
    revision_rounds:Number(f.revision_rounds)||0,post_date:f.post_date,payment_days:Number(f.payment_days),claims:f.claims||"",target_niche:f.target_niche,target_city:f.target_city,target_age_band:f.target_age_band};
}
function progress(form){
  const el=document.getElementById("prog-"+form);if(!el)return;
  const f=D(form),camp=form==="camp",step=ui.wiz[form],need=briefNeeds(f,camp,step);
  el.innerHTML=need.length?'<p class="muted">Still needed: '+esc(need.join(", "))+'.</p>':'<p class="muted ok">'+ic("check")+' This step is complete.</p>';
}
function briefDefaults(f){if(f.pay==null)Object.assign(f,{pay:"paid",usage_type:"organic",revision_rounds:"1",payment_days:"30",category:"",creators_wanted:"3",target_niche:"Skincare",target_age_band:"18 to 34",cnt:{reel:1}});}
function briefWizard(form){
  const camp=form==="camp",f=D(form);briefDefaults(f);const labels=camp?CAMP_STEPS:BRIEF_STEPS,s=ui.wiz[form],last=labels.length-1,cnt=f.cnt||(f.cnt={});
  const c=camp?null:byHandle(ui.found);
  let body="";
  if(s===0)body='<div class="card"><div class="row2">'+F(form,"brand_name","Brand name","text",{auto:"organization"})+F(form,"website","Website","text",{ph:"optional",auto:"url"})+'</div>'+
    '<div class="row2">'+F(form,"contact_name","Your name","text",{auto:"name"})+F(form,"contact_role","Your role","text",{ph:"Brand manager"})+'</div>'+F(form,"contact_channel","WhatsApp or email","text",{auto:"email",hint:"only our team sees this"})+'</div>';
  if(s===1)body='<div class="card"><div class="row2">'+F(form,"product","Product","text",{ph:"Vitamin C serum"})+F(form,"category","Category","select",{options:CATS,blank:true})+'</div>'+
    '<div class="field"><span class="lbl">What each creator makes</span><div class="counters">'+FORMATS.map(([k,l])=>'<div class="counter"><span>'+l+'</span><div class="cbtns"><button type="button" class="iconbtn cb" data-act="cnt" data-form="'+form+'" data-v="'+k+'" data-d="-1" aria-label="One less: '+l+'">−</button><b>'+(Number(cnt[k])||0)+'</b><button type="button" class="iconbtn cb" data-act="cnt" data-form="'+form+'" data-v="'+k+'" data-d="1" aria-label="One more: '+l+'">+</button></div></div>').join("")+'</div>'+
    (delivText(cnt)?'<p class="muted">Each creator makes <b>'+esc(delivText(cnt))+'</b>.</p>':'')+'</div>'+F(form,"deliv_note","Details","text",{ph:"Optional. For example: 30 to 45 seconds, product in use"})+'</div>';
  if(s===2)body='<div class="card"><div class="field"><span class="lbl">Payment</span>'+RD(form,"pay","paid","Fee per creator",true)+RD(form,"pay","barter","Barter (product only)",true)+'</div>'+
    (f.pay==="barter"?F(form,"barter_value_inr","Product value","number",{hint:"₹"}):F(form,"fee_inr","Fee per creator","number",{hint:"₹",ph:"9000"}))+
    '<div class="row2">'+F(form,"post_date","Post date","date",{min:today()})+F(form,"payment_days","Pay within","select",{options:PAYDAYS,hint:"days after posting"})+'</div>'+
    (f.post_date&&f.pay!=="barter"?'<p class="status info">You pay by <b>'+fmtD(addDays(f.post_date,f.payment_days))+'</b>. Mingle keeps this date in front of both of you.</p>':'')+'</div>';
  if(s===3)body='<div class="card"><div class="field"><div class="lblrow"><span class="lbl">Where it runs</span>'+tip(form+":use","Creator\'s page only: you can share or repost the post as it is, but not run it as an ad. Also as a paid ad: you can run the video as an ad from your own account for the days you set. Creators usually charge extra for paid use.")+'</div>'+RD(form,"usage_type","organic","Creator\'s page only",true)+RD(form,"usage_type","paid","Also as a paid ad",true)+'</div>'+
    (f.usage_type==="paid"?F(form,"usage_days","Paid ad for how many days","number",{ph:"90"}):"")+
    F(form,"revision_rounds","Revision rounds","select",{options:[0,1,2,3],tip:tip(form+":rev","How many times you can ask the creator to re-edit the video before it is posted. Changes after posting are a new request.")})+
    F(form,"claims","Anything the creator must say","textarea",{ph:"Optional. For example a claim about results."})+'</div>';
  if(camp&&s===4)body='<div class="card"><div class="row2">'+F(form,"creators_wanted","Creators wanted","number")+F(form,"target_niche","Niche","select",{options:NICHES})+'</div><div class="row2">'+F(form,"target_city","Audience city","text",{list:"cities",ph:"Delhi"})+F(form,"target_age_band","Age band","select",{options:AGES})+'</div>'+cityList+
    '<p class="muted">We rank verified creators on niche, top city, age band, rate and delivery record. Follower count is never used.</p></div>';
  if(s===last){const p=briefPayload(f),due=p.is_barter?null:addDays(p.post_date,p.payment_days);
    const sec=(i,title,lines)=>'<div class="rv"><div class="rvh"><b>'+title+'</b><button class="linkbtn" data-act="wizGo" data-form="'+form+'" data-v="'+i+'">Edit</button></div>'+lines.map(l=>'<p>'+l+'</p>').join("")+'</div>';
    body='<div class="card review">'+(c?'<div class="row">'+av(c.handle,c.handle)+'<p class="grow">Going to <b>@'+esc(c.handle)+'</b>, who sees it sorted against their own rules.</p></div>':'')+
      sec(0,"About you",[esc(p.brand_name)+' · '+esc(p.contact_name)+(p.contact_role?', '+esc(p.contact_role):'')])+
      sec(1,"The product",[esc(p.product)+' · '+esc(p.category),'Each creator makes '+esc(p.deliverables)])+
      sec(2,"Fee and dates",[feeTxt(p)+' per creator','Post on '+fmtD(p.post_date)+(due?', paid by '+fmtD(due):'')])+
      sec(3,"Usage and rules",[p.usage_type==="paid"?"Creator's page plus paid ads for "+p.usage_days+" days":"Creator's page only",plural(p.revision_rounds,"revision round","revision rounds"),'Claims: '+(p.claims?'‘'+esc(p.claims)+'’':'none')])+
      (camp?sec(4,"Who you want",[plural(p.creators_wanted,"creator","creators")+' · '+esc(p.target_niche)+' · '+esc(p.target_city)+' · '+esc(p.target_age_band)]):'')+
      '<p class="muted">Nothing is final until you and the creator both confirm the agreed terms.</p></div>';}
  const head=camp?'<section class="hero slim"><h1>Campaign <em>brief</em></h1></section>':'<div class="briefto">'+av(c.handle,c.handle)+'<span>Brief for <b>@'+esc(c.handle)+'</b></span></div>';
  return head+'<div class="panel form">'+stepper(labels,s)+'<h2 class="steph">'+esc(labels[s])+'</h2>'+body+
   '<div id="prog-'+form+'" class="prog" aria-live="polite"></div>'+errBox(form)+
   '<div class="wiznav"><button class="btn" data-act="wizBack" data-form="'+form+'">'+(s===0?"Cancel":"Back")+'</button>'+(s<last?'<button class="btn primary" data-act="wizNext" data-form="'+form+'">Continue</button>':'<button class="btn primary" data-act="sendBrief" data-v="'+form+'"'+(ui.busy?" disabled":"")+'>Send brief</button>')+'</div></div>';
}
function sentView(){
  const s=ui.sent;
  return '<div class="panel form sent"><div class="bigok">'+tickSvg+'<h1>Brief sent</h1><p class="muted">'+(s.camp?"Our team is ranking verified creators for it now.":"@"+esc(s.handle)+" can see it now, sorted against their rules.")+'</p></div>'+
  '<div class="card"><h3>Your brief code</h3><div class="biglink">'+esc(s.code)+'</div><p class="muted">Keep it. It opens your brief\'s tracker and the agreed terms on any device.</p><button class="btn sm" data-act="copy" data-v="code">Copy code</button></div>'+
  '<div class="card"><h3>What happens next</h3>'+timeline([["done","Brief sent","Just now"],["cur",s.camp?"We rank and invite creators":"@"+esc(s.handle)+" reviews it",s.camp?"Within 24 hours":"Most creators answer within a day"],["","Agreed terms","Within 12 hours of a yes, sent to you both"],["","Both confirm, terms lock","Before filming"],["","Post goes live, you pay on the date","Tracked here"]])+'</div>'+
  '<button class="btn primary wide" data-act="trackSent">Track this brief</button><button class="btn wide" data-act="newBrief">Send another brief</button></div>';
}
function brandTrack(){
  const code=String(ui.brandCode||"").trim(),br=code?rows("briefs").filter(b=>b.brand_token===code):[],b=br[0];
  if(!code||!b){
    let note="";if(code&&!ui.loading)note='<p class="status warn" role="alert">No brief with that code. Check the code we sent you.</p>';
    return '<section class="hero"><h1>Track your <em>brief</em></h1><p class="muted">Enter the code you got when you sent the brief.</p></section><div class="panel form"><div class="card"><label for="bc-code">Brief code</label><div class="row"><input id="bc-code" type="text" data-f="bc.code" value="'+esc(D("bc").code||code)+'" placeholder="e.g. aurelia-01" autocomplete="off"><button class="btn dark sm" data-act="brandCode">Open</button></div>'+note+'</div>'+
     '<button class="demo-c" data-act="demoBrandTerms">'+logo("Aurelia Skin")+'<span><b>Try it as Aurelia Skin</b><span>Code aurelia-01: terms ready to confirm</span></span>'+ic("arrow")+'</button>'+
     '<button class="demo-c" data-act="demoCampaign">'+logo("Kumkum Botanicals")+'<span><b>Try a campaign</b><span>Code kumkum-01: creators invited by fit</span></span>'+ic("arrow")+'</button></div>';
  }
  // everything loaded here belongs to this code; campaign invites the creator has not answered come back hidden
  const of=rows("offers").filter(o=>o.brief_id===b.id),shown=of.filter(o=>!o.hidden),hidden=of.filter(o=>o.hidden),t=terms(null,b);
  const camp=b.source==="campaign",yes=shown.filter(o=>o.interested||isContract(o)).length,locked=shown.filter(o=>o.status==="locked").length;
  const tl=camp?[["done","Brief received",fmtD(b.created_at)],[of.length?"done":"cur","Creators ranked and invited",of.length?plural(of.length,"creator","creators")+" invited":"Within 24 hours"],[yes?"done":of.length?"cur":"","Creators say yes",yes?yes+" said yes":"Waiting"],[locked?"done":"","Terms locked",locked?locked+" locked":""]]:
    [["done","Brief sent",fmtD(b.created_at)],[shown.some(o=>o.interested||o.status==="declined"||isContract(o))?"done":"cur","Creator reviews it",""],[shown.some(isContract)?"done":"","Agreed terms written up",""],[locked?"done":"","Terms locked",""],[shown.some(o=>o.paid_at)?"done":"","Posted and paid",""]];
  return '<div class="panel form"><div class="tr-head">'+logo(b.brand_name,"lg")+'<div><p class="mgoal">'+(camp?"Campaign":"Creator brief")+' · '+esc(code)+'</p><h1>'+esc(b.product)+'</h1><p class="muted">'+esc(b.brand_name)+' · '+feeTxt(t)+' · '+esc(t.deliverables)+'</p></div></div>'+
  '<div class="card">'+timeline(tl)+'</div>'+
  (shown.length?'<p class="group-h">Creators</p>'+shown.map(o=>brandOfferRow(o)).join(""):'')+
  (hidden.length?'<div class="card"><p class="muted">'+plural(hidden.length,"more creator is","more creators are")+' reviewing your brief. You will see them here once they say yes.</p></div>':'')+
  '<button class="linkbtn" data-act="clearCode">Track another brief</button></div>';
}
function brandOfferRow(o){
  const c=byHandle(o.creator_id)||{handle:o.creator_id};
  if(isContract(o))return dealRow(o,"brand");
  const st=o.status==="declined"?["Declined politely","misses"]:o.interested?["Said yes. Terms within 12 hours","locked"]:["Reviewing your brief","info"];
  return '<div class="list-item">'+av(c.handle,c.handle)+'<span class="grow"><b>@'+esc(c.handle)+'</b><span class="muted" style="display:block">'+esc(c.niche||"")+(c.top_city?' · '+esc(c.top_city):'')+'</span></span><span class="pill '+st[1]+'">'+st[0]+'</span></div>';
}

/* ---------- agreed terms and the deal ---------- */
function dealView(){
  const o=all("offers")[ui.deal];
  if(!o||!ui.dealSide)return backBar("closeDeal","Deal")+'<div class="panel"><p class="status warn">'+(ui.loading||mode==="connecting"?"Loading…":"This link is not valid. Use the link we sent you.")+'</p></div>';
  const b=briefOf(o),t=terms(o,b),c=byHandle(o.creator_id)||{handle:o.creator_id},side=ui.dealSide,other=side==="creator"?"brand":"creator",due=dueDate(t),st=dealStage(o);
  let out=backBar("closeDeal",b.brand_name+" × @"+c.handle)+'<div class="panel form"><div class="pair">'+logo(b.brand_name,"lg")+'<span class="x">×</span>'+av(c.handle,c.handle,"lg")+'</div><p class="muted center">'+esc(b.product)+' · you are the '+side+'</p>';
  if(!isContract(o))return out+'<p class="status info">We are writing up the agreed terms and send them within 12 hours of the yes.</p></div>';
  out+='<ol class="track">'+DEAL_STEPS.map((s,i)=>'<li class="'+(i<st||o.paid_at?"done":i===st?"cur":"")+'"><span></span><b>'+s+'</b></li>').join("")+'</ol>';
  out+='<div class="paycard"><span>'+(t.is_barter?"Barter deal":"Fee")+'</span><b>'+feeTxt(t)+'</b>'+(due?'<span>Paid by <b>'+fmtD(due)+'</b>, '+esc(t.payment_days)+' days after the '+fmtD(t.post_date)+' post</span>':'')+'</div>';
  out+=dealStagePanel(o,b,t,c,side,other,due);
  out+='<details class="card"'+(o.status==="locked"?'':' open')+'><summary><h3>All seven terms</h3></summary><dl class="terms">'+sevenTerms(t,true).map(x=>'<dt>'+x[1]+'</dt><dd>'+esc(x[2])+'</dd>').join("")+'<dt>Creator</dt><dd>@'+esc(c.handle)+(c.verified_at?'<span class="muted" style="display:block;font-weight:400">Audience verified on '+fmtD(c.verified_at)+'</span>':'')+'</dd><dt>Brand contact</dt><dd>'+esc(b.contact_name)+(b.contact_role?", "+esc(b.contact_role):"")+'</dd></dl></details>';
  if(o.status!=="change_requested"&&!o.paid_at)out+='<button class="btn wide" data-act="openSheet" data-v="change">Ask for a change</button>';
  out+='<p class="muted center">These are agreed terms, not a legal contract.</p>';
  return out+'</div>';
}
function dealStagePanel(o,b,t,c,side,other,due){
  if(o.status==="change_requested"){
    const crs=rows("change_requests").filter(r=>r.offer_id===o.id).sort((a,b)=>b.created_at.localeCompare(a.created_at));
    return '<div class="stage warn"><h2>Change requested</h2><p>The '+esc(crs[0]?crs[0].side:"other side")+' asked to change <b>'+esc(crs[0]?crs[0].field:"a term")+'</b>'+(crs[0]?': “'+esc(crs[0].note)+'”':'')+'.</p><p class="muted">Our team updates the terms and sends them back to both of you to confirm again. Nothing is locked until then.</p></div>';
  }
  if(o.status!=="locked"){
    if(o[side+"_confirmed_at"]){const nudge=side==="creator"?"Hi "+firstName(b.contact_name)+", I've confirmed our agreed terms on Mingle. Could you confirm too, so we can lock them before I film?":"Hi @"+c.handle+", we've confirmed the agreed terms on Mingle. Could you confirm too, so they lock before you film?";ui.msg["nudge"]=nudge;
      return '<div class="stage"><h2>You confirmed. Waiting for the '+other+'</h2><p class="muted">You confirmed on '+fmtD(o[side+"_confirmed_at"])+'. The terms lock the moment the '+other+' confirms.</p><p class="lbl">Nudge them</p>'+msgBox("nudge",nudge)+'</div>';}
    const i=ui.review[o.id];const list=sevenTerms(t,true);
    if(i==null)return '<div class="stage hl"><h2>Review the terms, then confirm</h2><p>Seven terms, one at a time. It takes about a minute. If anything is off, ask for a change before you confirm.</p>'+(o[other+"_confirmed_at"]?'<p class="status ok">The '+other+' already confirmed on '+fmtD(o[other+"_confirmed_at"])+'. Your confirmation locks the deal.</p>':'')+'<button class="btn primary wide" data-act="reviewStart" data-v="'+o.id+'">Start the review</button></div>';
    if(i<list.length){const x=list[i];
      return '<div class="stage hl walk"><div class="wtop"><span class="mgoal">Term '+(i+1)+' of '+list.length+'</span><div class="dots">'+list.map((_,k)=>'<i class="'+(k<i?"done":k===i?"cur":"")+'"></i>').join("")+'</div></div><p class="wlabel">'+esc(x[1])+'</p><p class="wval">'+esc(x[2])+'</p><p class="muted">'+esc(x[3])+'</p>'+
        '<div class="btnrow"><button class="btn" data-act="openSheet" data-v="change" data-field="'+esc(x[1])+'">Ask for a change</button><button class="btn primary" data-act="reviewNext" data-v="'+o.id+'">Looks right</button></div>'+(i>0?'<button class="linkbtn" data-act="reviewBack" data-v="'+o.id+'">Previous term</button>':'')+'</div>';}
    return '<div class="stage hl"><h2>All seven terms checked</h2><ul class="ticked">'+list.map(x=>'<li>'+ic("check")+'<span><b>'+esc(x[1])+'</b> '+esc(x[2])+'</span></li>').join("")+'</ul>'+(side==="creator"?CK("cf","filming","I have already started filming"):"")+
      '<button class="btn primary wide" data-act="confirm"'+(ui.busy?" disabled":"")+'>'+(o[other+"_confirmed_at"]?"Confirm and lock the deal":"Confirm these terms")+'</button><button class="linkbtn" data-act="reviewStart" data-v="'+o.id+'">Go through them again</button></div>';
  }
  if(!o.posted_at){
    if(side==="creator"){const f=D("post-"+o.id);
      return '<div class="stage hl"><h2>Film and post '+inDays(t.post_date)+'</h2><p class="muted">Due '+fmtD(t.post_date)+'. Your checklist:</p><ul class="ticked plain"><li>'+ic("check")+'<span>'+esc(t.deliverables)+'</span></li><li>'+ic("check")+'<span>'+(t.usage_type==="paid"?"Brand may run it as a paid ad for "+t.usage_days+" days":"On your page only")+'</span></li><li>'+ic("check")+'<span>'+(String(t.claims||"").trim()?"Say: ‘"+esc(t.claims)+"’":"Nothing scripted to say")+'</span></li><li>'+ic("check")+'<span>Up to '+plural(Number(t.revision_rounds)||0,"revision","revisions")+' before posting</span></li></ul>'+
        F("post-"+o.id,"link","Link to the live post","text",{ph:"https://instagram.com/reel/…"})+'<button class="btn primary wide" data-act="markLive" data-v="'+o.id+'">My post is live</button></div>';}
    return '<div class="stage"><h2>@'+esc(c.handle)+' posts '+inDays(t.post_date)+'</h2><p class="muted">Due '+fmtD(t.post_date)+'. You will see the post link here as soon as it is live. Payment is due '+fmtD(due)+'.</p></div>';
  }
  if(!o.paid_at){
    const link=o.post_link?'<a class="btn sm" href="'+esc(o.post_link)+'" target="_blank" rel="noopener">View the post</a>':'';
    if(side==="creator")return '<div class="stage hl"><h2>'+(o.payment_sent_at?esc(b.brand_name)+" says your fee is on its way":"Payment due "+inDays(due))+'</h2><p class="muted">'+(o.payment_sent_at?"Marked as sent on "+fmtD(o.payment_sent_at)+". Check your account and confirm.":"Posted on "+fmtD(o.posted_at)+". "+esc(firstName(b.contact_name))+" pays by "+fmtD(due)+". We remind them before the date.")+'</p>'+link+
      '<button class="btn primary wide" data-act="openSheet" data-v="paid">The fee has arrived</button></div>';
    return '<div class="stage hl"><h2>The post is live</h2><p class="muted">Posted on '+fmtD(o.posted_at)+'. '+(o.payment_sent_at?"You marked the payment as sent on "+fmtD(o.payment_sent_at)+". Waiting for @"+esc(c.handle)+" to confirm it arrived.":"Please pay "+feeTxt(t)+" by "+fmtD(due)+" ("+inDays(due)+").")+'</p>'+link+
      (o.payment_sent_at?'':'<button class="btn primary wide" data-act="paymentSent" data-v="'+o.id+'">I have sent the payment</button>')+'</div>';
  }
  const late=due?daysTo(o.paid_at)-daysTo(due):0;
  return '<div class="stage ok"><div class="bigok">'+tickSvg+'<h2>Deal complete</h2></div><p class="center">Posted on '+fmtD(o.posted_at)+' and paid on '+fmtD(o.paid_at)+(late>0?', '+plural(late,"day","days")+' after the date.':', on time.')+'</p><p class="muted center">'+(side==="creator"?"It now counts towards your on-time record that brands see.":"It now counts towards your payment record that creators see.")+'</p></div>';
}

/* ---------- sheets ---------- */
function renderSheet(){
  const el=$("#sheet");const s=ui.sheet;
  if(!s){if(!el.hidden){el.hidden=true;el.innerHTML="";document.body.classList.remove("sheet-open");}return;}
  const html=sheetBody(s);
  const firstOpen=el.hidden;
  el.innerHTML='<div class="scrim" data-act="closeSheet"></div><div class="sheet'+(firstOpen?" up":"")+'" role="dialog" aria-modal="true" aria-label="'+esc(s.title||"")+'"><div class="grab"></div><button class="iconbtn sclose" data-act="closeSheet" aria-label="Close">'+ic("close")+'</button>'+html+'</div>';
  el.hidden=false;document.body.classList.add("sheet-open");
}
function sheetBody(s){
  const me=meC();
  if(s.type==="yes"){const o=all("offers")[s.id],b=briefOf(o),t=terms(o,b),f=D("yes-"+s.id);s.title="Before you say yes";
    if(s.done)return '<div class="bigok">'+tickSvg+'<h2>Yes sent to '+esc(b.brand_name)+'</h2></div>'+timeline([["done","You said yes","Just now"],["cur","We write up the agreed terms","Within 12 hours. We message you on WhatsApp."],["","You both confirm seven terms","Then you film"]])+'<button class="btn primary wide" data-act="closeSheet">Done</button>';
    const ok=f.a&&f.b&&f.c;
    return '<h2>Before you say yes</h2><p class="muted">Three quick checks, so the terms we write up hold.</p>'+CK("yes-"+s.id,"a","I can post "+esc(t.deliverables)+" by <b>"+fmtD(t.post_date)+"</b>",1)+CK("yes-"+s.id,"b",(t.usage_type==="paid"?"I'm fine with the brand running it as a paid ad for "+t.usage_days+" days":"I'm fine with it running on my page only"),1)+CK("yes-"+s.id,"c","I'll mark the post live with its link, so payment starts on time",1)+
      '<button class="btn primary wide" data-act="interested" data-v="'+s.id+'"'+(ok&&!ui.busy?"":" disabled")+'>Send my yes</button>';}
  if(s.type==="decline"){const o=all("offers")[s.id],b=briefOf(o),f=D("dec-"+s.id);s.title="Decline politely";
    if(s.done)return '<div class="bigok">'+tickSvg+'<h2>Declined</h2><p class="muted">Your reply is copied. Paste it in the DM so '+esc(b.brand_name)+' hears back.</p></div><button class="btn primary wide" data-act="closeSheet">Done</button>';
    if(f.msg==null||f.lastReason!==f.reason){f.msg=declineMsg(b,f.reason);f.lastReason=f.reason;}
    return '<h2>Why are you passing?</h2><p class="muted">Only our team sees the reason. It helps us send you better offers.</p><div class="chips">'+DECLINE.map(([k,l])=>chipPick("declineReason",k,l,f.reason===k)).join("")+'</div>'+
      (f.reason?F("dec-"+s.id,"msg","Your reply to the brand","textarea")+'<button class="btn dark wide" data-act="decline" data-v="'+s.id+'">Copy reply and decline</button>':'');}
  if(s.type==="bookCall"){const f=D("call");s.title="Book your verification call";
    if(s.done)return '<div class="bigok">'+tickSvg+'<h2>Call booked</h2><p class="muted">'+esc(f.day+", "+f.time)+'. Keep a screenshot of your Instagram audience insights ready: top cities and age range.</p></div><button class="btn primary wide" data-act="closeSheet">Done</button>';
    return '<h2>Book your verification call</h2><p class="muted">Ten minutes on WhatsApp. We look at your insights screenshot together and mark you verified.</p>'+slotPicker("call")+'<button class="btn primary wide" data-act="bookCall"'+(f.day&&f.time?"":" disabled")+'>Book this slot</button>';}
  if(s.type==="change"){const f=D("chg");s.title="Ask for a change";if(s.field&&!f.field)f.field={"What gets made":"Deliverables","Fee":"Fee","Where it runs":"Where it runs","Revisions":"Revisions","Post date":"Post date","Payment date":"Payment date","Claims":"Claims"}[s.field]||"Other";
    return '<h2>Ask for a change</h2><p class="muted">It goes to our team with today\'s date, not into DMs. Both of you confirm the updated terms again.</p>'+F("chg","field","What should change","select",{options:["Fee","Deliverables","Where it runs","Revisions","Post date","Payment date","Claims","Other"]})+F("chg","note","What you need","textarea",{ph:"For example: post on 24 Oct instead"})+CK("chg","after","This comes after filming")+errBox("chg")+'<button class="btn dark wide" data-act="sendChange">Send the request</button>';}
  if(s.type==="paid"){const f=D("paid-c-"+s.id);if(f.match==null)f.match=true;s.title="Payment received";
    if(s.done)return '<div class="bigok">'+tickSvg+'<h2>Deal complete</h2><p class="muted">Paid and logged. It counts towards your on-time record.</p></div><button class="btn primary wide" data-act="closeSheet">Done</button>';
    const o=all("offers")[s.id],t=terms(o,briefOf(o));
    return '<h2>The fee has arrived</h2><p class="muted">Confirm what reached your account.</p>'+CK("paid-c-"+s.id,"match","I received the full "+feeTxt(t))+'<button class="btn primary wide" data-act="confirmPaid" data-v="'+s.id+'">Confirm payment</button>';}
  if(s.type==="locked"){s.title="Terms locked";const o=all("offers")[s.id]||{},t=terms(o,briefOf(o));
    return '<div class="bigok">'+tickSvg+'<h2>Terms locked</h2><p class="muted">Both of you confirmed all seven terms on '+fmtD(today())+'.</p></div>'+timeline([["done","Terms locked","Today"],["cur","Film and post",fmtD(t.post_date)],["",t.is_barter?"Keep the product":"Payment",t.is_barter?"":fmtD(dueDate(t))]])+'<button class="btn primary wide" data-act="closeSheet">Got it</button>';}
  return "";
}
function declineMsg(b,reason){
  const hi="Hi "+firstName(b.contact_name)+", thank you for thinking of me for "+b.product+". ";
  return hi+({fee:"The fee doesn't work for me for this scope, so I'll pass this time.",category:"It isn't a category I promote, so I'll pass.",barter:"I'm only taking paid collaborations right now, so I'll pass.",timing:"The timing doesn't work for me right now, so I'll pass this time.",brand:"It isn't the right fit for my audience, so I'll pass this time."}[reason]||"It isn't the right fit for me right now, so I'll pass this time.")+" Happy to hear about future campaigns!";
}

/* ---------- team ---------- */
function teamView(){
  if(!teamKey)return '<section class="hero"><h1>Team <em>page</em></h1><p class="muted">For the Mingle team: pilot metrics, verify creators, rank creators for campaigns, write up agreed terms and log link sends.</p></section><div class="panel form"><div class="card">'+F("tk","key","Team key","password",{auto:"current-password"})+(ui.err.tk?'<p class="status bad" role="alert">Not allowed.</p>':"")+'<button class="btn dark wide" data-act="teamKey">Open team page</button><p class="muted">Team members only.</p></div></div>';
  const tab=ui.tab.team;
  const top='<div class="panel" style="padding-bottom:0"><label class="check"><input type="checkbox" data-act="demoToggle"'+(ui.showDemo?" checked":"")+'><span>Include sample data</span></label></div>';
  if(tab==="campaigns")return top+teamCampaigns();
  if(tab==="offers")return top+teamOffers();
  if(tab==="log")return top+teamLog();
  if(tab==="today")return top+teamToday()+'<div class="panel"><button class="btn wide" data-act="resetDemo">Reset the sample data</button><button class="btn wide" data-act="signOutTeam">Leave team page on this device</button></div>';
  return top+teamPilot();
}
// deal stages after the lock: the deal row is the record; team events fill in details such as days late
function dealLog(){
  const m={};
  rows("events").filter(e=>(e.name==="deal_stage_updated"||e.name==="payment_marked_paid")&&e.props&&e.props.deal_id).sort((a,b)=>a.created_at.localeCompare(b.created_at)).forEach(e=>{
    const d=m[e.props.deal_id]||(m[e.props.deal_id]={});
    if(e.name==="payment_marked_paid")d.paid=e.props;else if(e.props.to_stage==="posted")d.posted=e.props;
  });
  rows("offers").forEach(o=>{
    if(!o.posted_at&&!o.paid_at)return;const d=m[o.id]||(m[o.id]={}),due=dueDate(terms(o,briefOf(o)));
    if(o.posted_at&&!d.posted)d.posted={posted_date:String(o.posted_at).slice(0,10)};
    if(o.paid_at&&!d.paid){const pd=String(o.paid_at).slice(0,10);d.paid={paid_date:pd,days_late:due?Math.round((T(pd)-T(due))/DAY):0,amount_matches:o.paid_amount_matches!==false};}
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
  const atMin=taken.filter(o=>{const t=terms(o,briefOf(o)),c=byHandle(o.creator_id)||{};return !t.is_barter&&Number(t.fee_inr)>=feeFloor(c,t);});
  M.push({goal:"Goal 1 · Monetise · North Star depth",name:"Offers taken to terms at or above the creator's minimum",n:atMin.length,d:taken.length,target:7/8,floor:.75,targetTxt:"≥ 7 of 8 by Wed 4 Nov",act:"Under 3 in 4: creators are trading down; check their floors and the brief's fee field with them.",owner:"Diksha, weekly"});
  const fitsViewed=of.filter(o=>viewed.has(o.id)&&fit(byHandle(o.creator_id)||{},terms(o,briefOf(o))).result==="fits"),fitsDeclined=fitsViewed.filter(o=>o.status==="declined");
  M.push({goal:"Goal 1 · Counter-metric",name:"Fits declined ÷ Fits viewed",n:fitsDeclined.length,d:fitsViewed.length,target:.25,floor:.5,lower:true,targetTxt:"≤ 1 in 4 by Wed 4 Nov",act:"Above 1 in 2: stop labelling offers Fits and show reasons only. Decline reasons are on each declined deal.",owner:"Archin, Mon and Thu"});
  const fast=taken.filter(o=>o.locked_at&&T(o.locked_at)-T(briefOf(o).created_at)<=7*DAY);
  M.push({goal:"Goal 2 · Acquire",name:"Deals locked within 7 days of the brief, before filming",n:fast.length,d:taken.length,target:.75,floor:.5,targetTxt:"≥ 6 of 8 by Wed 4 Nov",act:"Under 4 of 8: brands will not confirm on screen; rethink locking in the app.",owner:"Aarushi, after each deal"});
  const afterF=r=>r.after_filming||/\(after filming\)/.test(r.note||""),inApp=chg.length,afterFilm=chg.filter(afterF).length;
  M.push({goal:"Goal 2 · Retain",name:"Changes raised in Mingle ÷ all changes",n:inApp,d:null,count:true,targetTxt:"≥ 3 in 4 by Mon 9 Nov",act:inApp+" raised in Mingle"+(afterFilm?", "+afterFilm+" after filming":"")+". Add the changes creators report at the check-in by hand to get the ratio.",owner:"Aarushi, weekly"});
  const locked=of.filter(o=>o.status==="locked");
  const dueNow=locked.filter(o=>{const d=dueDate(terms(o,briefOf(o)));return d&&T(d)<now||o.paid_at;});
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
  const broken=locked.filter(o=>chg.some(r=>r.offer_id===o.id&&afterF(r))||(log[o.id]&&log[o.id].paid&&Number(log[o.id].paid.days_late)>0));
  const nsm={value:active.length?lockedActive.length/active.length:0,locked:lockedActive.length,active:active.length,breadth:[withLock.length,active.length],frequency:withLock.length?lockedActive.length/withLock.length:0,depth:[atMin.length,taken.length],broken:[broken.length,locked.length]};
  const fl=user.filter(e=>!(e.props||{}).demo||ui.showDemo);
  const opened=new Set(fl.filter(e=>e.name==="page_viewed"&&/^brief_link/.test(e.props.page||"")).map(e=>e.props.anon_id+"|"+e.props.creator_handle)).size;
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
  return (ui.showDemo?'<div class="panel"><p class="status warn">These numbers include sample data. Untick “Include sample data” above to read the pilot.</p></div>':'')+'<div class="panel"><div class="nsm"><p class="mgoal">North Star</p><h2>Locked deals per active creator</h2><div class="nsmv"><b>'+v+'</b><span>'+nsm.locked+' locked ÷ '+nsm.active+' active creators</span></div>'+
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
    (c.verify_slot?'<p class="status info">Call booked: '+esc(c.verify_slot)+'</p>':'<p class="status warn">No call booked yet</p>')+
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
    return '<div class="card"><div class="row">'+logo(b.brand_name)+'<div class="grow"><b>'+esc(b.brand_name)+'</b><p class="muted">'+esc(b.product)+' · '+feeTxt(b)+' · '+esc(b.creators_wanted)+' creators</p></div></div>'+
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
    const b=briefOf(o),c=byHandle(o.creator_id)||{handle:o.creator_id},t=terms(o,b),f=fit(c,t),m=mins(o.created_at),lg=log[o.id]||{},due=dueDate(t);
    const crs=rows("change_requests").filter(r=>r.offer_id===o.id).sort((a,b)=>b.created_at.localeCompare(a.created_at));
    const st=o.paid_at?["Paid","locked"]:o.posted_at?["Posted","locked"]:({new:["New","info"],screened:["Screened","info"],declined:["Declined","misses"],contract_sent:["To confirm","wait"],creator_confirmed:["Creator confirmed","wait"],brand_confirmed:["Brand confirmed","wait"],locked:["Locked","locked"],change_requested:["Change asked","check"]})[o.status]||[o.status,"info"];
    let actions='';
    if(!isContract(o)&&o.status!=="declined")actions='<div class="btnrow"><button class="btn sm" data-act="fitMsg" data-v="'+o.id+'">Copy fit message</button><button class="btn sm dark" data-act="makeContract" data-v="'+o.id+'">Write up terms</button></div>';
    if(o.status==="change_requested"){
      const e=D("edit-"+o.id);if(e.fee_inr==null)Object.assign(e,{fee_inr:t.fee_inr,post_date:t.post_date,payment_days:String(t.payment_days),revision_rounds:String(t.revision_rounds)});
      actions='<p class="status warn">'+esc(crs[0]?crs[0].side+" asked: "+crs[0].field+". “"+crs[0].note+"”"+(crs[0].after_filming?" (after filming)":""):"Change asked")+'</p><div class="row2">'+F("edit-"+o.id,"fee_inr","Fee","number",{hint:"₹"})+F("edit-"+o.id,"post_date","Post date","date")+'</div><div class="row2">'+F("edit-"+o.id,"payment_days","Pay within","select",{options:PAYDAYS})+F("edit-"+o.id,"revision_rounds","Revisions","select",{options:[0,1,2,3]})+'</div><button class="btn sm dark" data-act="resend" data-v="'+o.id+'">Update terms and re-send</button>';
    }
    if(o.status==="locked"){
      const p=D("paid-"+o.id);if(p.date==null){p.date=today();p.match=true;}
      actions='<div class="stagebox"><p class="lbl">After the lock <span class="hint">creators and brands mark these; log by hand if they tell you on WhatsApp</span></p>'+
       (lg.posted?'<p class="status ok">Posted on '+fmtD(lg.posted.posted_date)+(o.post_link?' · <a href="'+esc(o.post_link)+'" target="_blank" rel="noopener">view</a>':'')+'</p>':'<button class="btn sm" data-act="markPosted" data-v="'+o.id+'">Mark posted today</button>')+
       (o.payment_sent_at&&!o.paid_at?'<p class="status info">Brand marked payment sent on '+fmtD(o.payment_sent_at)+'</p>':'')+
       (lg.paid?'<p class="status '+(Number(lg.paid.days_late)>0?"warn":"ok")+'">Paid on '+fmtD(lg.paid.paid_date)+(Number(lg.paid.days_late)>0?", "+lg.paid.days_late+" days late":", on time")+(lg.paid.amount_matches===false?". Amount did not match":"")+'</p>':
        (t.is_barter?'':'<div class="row2">'+F("paid-"+o.id,"date","Paid on","date")+'<div class="field"><span class="lbl">Due</span><p>'+fmtD(due)+'</p></div></div>'+CK("paid-"+o.id,"match","Amount matches the agreed fee")+'<button class="btn sm dark" data-act="markPaid" data-v="'+o.id+'">Log payment</button>'))+'</div>';
    }
    return '<div class="card"><div class="row">'+av(c.handle,c.handle)+'<div class="grow"><b>@'+esc(c.handle)+' ← '+esc(b.brand_name)+'</b><p class="muted">'+esc(b.product)+' · '+(b.source==="campaign"?"Campaign invite"+(o.match_score!=null?", score "+o.match_score:""):"Creator link")+' · <span class="'+(o.status==="new"&&m>240?"amber":"")+'">'+ago(o.created_at)+'</span></p></div><span class="pill '+st[1]+'">'+st[0]+'</span></div>'+
      '<div class="row"><span class="pill '+f.result+'">'+({fits:"Fits",check:"Check",misses:"Misses"})[f.result]+'</span>'+(o.interested&&!isContract(o)?'<span class="pill info">Creator said yes</span>':'')+(o.decline_reason?'<span class="info">Declined: '+esc((DECLINE.find(x=>x[0]===o.decline_reason)||[0,o.decline_reason])[1])+'</span>':'')+'</div><p class="payline">'+feeTxt(t)+(due?' · paid by '+fmtD(due):'')+'</p><ul class="reasons">'+f.reasons.map(r=>'<li>'+esc(r)+'</li>').join("")+'</ul>'+
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
  sends.map(s=>'<tr><td>@'+esc(s.creator_id)+' → @'+esc(s.brand_handle)+'<br><span class="muted">'+ago(s.sent_at)+(s.offer_type&&s.offer_type!=="unclear"?' · '+esc(s.offer_type)+' offer':'')+'</span></td><td><select aria-label="Outcome" data-act="outcome" data-v="'+esc(s.id)+'">'+[["","Waiting"],["filled","Brief sent"],["replied_in_dm","Replied in DM"],["went_quiet","Went quiet"]].map(x=>'<option value="'+x[0]+'"'+((s.outcome||"")===x[0]?" selected":"")+'>'+x[1]+'</option>').join("")+'</select></td></tr>').join("")+'</tbody></table></div>'+
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
    ev("brief_abandoned",{source:briefSource(form),fields_complete:termsComplete(briefPayload(f)),last_field:ui.lastField[form]||"",last_step:ui.wiz[form],creators_in_brief:form==="camp"?Number(f.creators_wanted)||1:1,creator_handle:form==="brief"?ui.found:null,why},{keepalive:true});
  });
}
window.addEventListener("pagehide",()=>abandon("closed"));

/* ---------- actions ---------- */
function rulesPayload(f,handle){
  return {handle,name:String(f.name||"").trim(),whatsapp:String(f.whatsapp||"").trim(),niche:f.niche,followers:Number(f.followers)||0,offers_per_month:Number(f.offers_per_month)||0,
    top_city:String(f.top_city||"").trim(),top_city_share:Number(f.top_city_share)||0,age_band:f.age_band,min_fee_inr:Number(f.min_fee_inr)||0,barter_rule:f.barter_rule,
    barter_floor_inr:Number(f.barter_floor_inr)||0,blocked_categories:f.blocked||[],max_pay_days:Number(f.max_pay_days)||30,paid_ads_extra:!!f.paid_ads_extra,consent:!!f.consent,
    rates:{reel:Number(f.min_fee_inr)||0,story:Number(f.rate_story)||0,post:Number(f.rate_post)||0,ugc:Number(f.rate_ugc)||0}};
}
function stageProps(o){const t=terms(o,briefOf(o));return{deal_id:o.id,post_date:t.post_date||null,payment_due_date:dueDate(t),demo:!!o.demo};}
function setupNeeds(f,s){
  const n=[];
  if(s===1){if(!String(f.handle||"").replace(/[^a-z0-9._]/gi,""))n.push("Instagram handle");if(!String(f.whatsapp||"").trim())n.push("WhatsApp");}
  if(s===2){if(!String(f.top_city||"").trim())n.push("top city");}
  if(s===3){if(!(Number(f.min_fee_inr)>0))n.push("your reel rate");}
  if(s===5){if(!f.consent)n.push("your consent");}
  return n;
}
const act={
  async role(d){ui.role=d.v;ui.deal=null;ui.offer=null;ui.dealSide=null;ui.dealTok=null;ui.err={};ui.setup=false;ui.sheet=null;go(rolePath());load(null);render();window.scrollTo(0,0);await refresh();},
  home(){return act.role({v:"home"});},
  goCreator(){return act.role({v:"creator"});},
  async goBrand(d){ui.tab.brand=d.v||"send";ui.sent=null;ui.wiz.brief=-1;ui.wiz.camp=-1;await act.role({v:"brand"});},
  async tab(d){ui.tab[ui.role]=d.v;ui.deal=null;ui.offer=null;ui.dealSide=null;ui.dealTok=null;ui.editRules=false;ui.err={};ui.sent=null;ui.sheet=null;go(rolePath());render();window.scrollTo(0,0);await refresh();},
  async openCode(){const code=String(D("gate").code||"").trim();if(!code)return;const p=await rpc("creator_me",{p_token:code});
    if(!p){ui.err.gate="This page is private. Use the link we sent you on WhatsApp.";render();return;}
    ui.token=code;ui.badToken=false;store("mingle.token",code);ui.err={};ui.tab.creator="home";ui.role="creator";go("/creator");load(p);render();window.scrollTo(0,0);},
  demoCreator(){D("gate").code="riya-demo";return act.openCode();},
  async demoBrand(){ui.role="brand";ui.tab.brand="send";ui.sent=null;ui.wiz.brief=-1;D("find").handle="riya.skinnotes";go("/brand");await act.find();},
  async demoBrandTerms(){ui.role="brand";ui.tab.brand="contracts";ui.brandCode="aurelia-01";D("bc").code="aurelia-01";go("/track/aurelia-01");render();await refresh();},
  async demoCampaign(){ui.role="brand";ui.tab.brand="contracts";ui.brandCode="kumkum-01";D("bc").code="kumkum-01";go("/track/kumkum-01");render();await refresh();},
  async resetDemo(){if(!confirm("Put the sample creators, brands and deals back to where they started?"))return;await rpc("reset_demo",{});ev("demo_reset",{});ui.review={};ui.draft={};toast("Sample data reset");await refresh();},
  startSetup(){ui.role="creator";ui.setup=true;ui.token=null;ui.wiz.setup=0;go("/creator");render();window.scrollTo(0,0);},
  cancelSetup(){ui.setup=false;ui.err={};ui.role="home";go("/");render();},
  setupNext(){const f=D("setup"),n=setupNeeds(f,ui.wiz.setup);if(n.length){ui.err.setup="Still needed: "+n.join(", ")+".";render();return;}ui.err={};ev("setup_step_completed",{step:SETUP[ui.wiz.setup]});ui.wiz.setup++;render();window.scrollTo(0,0);},
  setupBack(){ui.err={};ui.wiz.setup=Math.max(0,ui.wiz.setup-1);render();window.scrollTo(0,0);},
  pickDay(d){D(d.form).day=d.v;render();},
  pickTime(d){D(d.form).time=d.v;render();},
  toggleBlock(d){const f=D("setup");f.blocked=f.blocked||[];f.blocked=f.blocked.includes(d.v)?f.blocked.filter(x=>x!==d.v):f.blocked.concat(d.v);render();},
  addBlock(){const f=D("setup");const v=String(f.custom||"").trim();if(v){f.blocked=(f.blocked||[]).filter(x=>x!==v).concat(v);f.custom="";}render();},
  async saveSetup(){
    if(ui.busy)return;
    const f=D("setup"),edit=ui.editRules,me=meC();
    const handle=edit?me.handle:String(f.handle||"").toLowerCase().replace(/^@/,"").replace(/[^a-z0-9._]/g,"");
    const miss=[];if(!handle)miss.push("Instagram handle");if(!String(f.whatsapp||"").trim())miss.push("WhatsApp");if(!(Number(f.min_fee_inr)>0))miss.push("your reel rate");if(!edit&&!f.consent)miss.push("your consent");
    if(miss.length){ui.err.setup="Still needed: "+miss.join(", ")+".";render();return;}
    const p=rulesPayload(f,handle);if(edit)p.consent=true;
    ui.busy=true;render();
    try{
      if(edit){await rpc("update_rules",{p_token:ui.token,p});}
      else{const r=await rpc("create_creator",{p});ui.token=r.private_token;store("mingle.token",r.private_token);ui.setup=false;ui.justSetup=true;ui.tab.creator="home";
        ev("creator_onboarded",{creator_id:handle,niche:p.niche,followers:p.followers>=50000?"50K plus":p.followers>=25000?"25K to 50K":p.followers>=10000?"10K to 25K":"Under 10K"});
        if(f.day&&f.time&&await rpc("creator_book_call",{p_token:r.private_token,p_slot:f.day+", "+f.time}).catch(()=>false))ev("verification_call_booked",{creator_id:handle,slot:f.day+", "+f.time});
        setTimeout(celebrate,200);}
      ev("rules_saved",{creator_id:handle,min_fee_by_format:p.rates,min_fee_inr:p.min_fee_inr,barter_floor:p.barter_rule==="never"?null:p.barter_floor_inr,barter_rule:p.barter_rule,refused_categories:p.blocked_categories,payment_terms_days:p.max_pay_days,paid_ads_extra:p.paid_ads_extra});
      ui.editRules=false;ui.err={};delete ui.draft.setup;toast(edit?"Rates and rules saved":"You're on Mingle");
    }catch(e){ui.err.setup=e.message;}
    ui.busy=false;render();window.scrollTo(0,0);await refresh();
  },
  editRules(){const me=meC(),r=me.rates||{};ui.draft.setup={name:me.name,handle:me.handle,whatsapp:me.whatsapp,niche:me.niche,followers:me.followers,offers_per_month:me.offers_per_month,top_city:me.top_city,top_city_share:me.top_city_share,age_band:me.age_band,min_fee_inr:me.min_fee_inr,barter_rule:me.barter_rule,barter_floor_inr:me.barter_floor_inr,blocked:(me.blocked_categories||[]).slice(),max_pay_days:String(me.max_pay_days),paid_ads_extra:me.paid_ads_extra,consent:me.consent,rate_story:r.story||"",rate_post:r.post||"",rate_ugc:r.ugc||""};ui.editRules=true;render();window.scrollTo(0,0);},
  cancelEdit(){ui.editRules=false;delete ui.draft.setup;ui.err={};render();},
  signOut(){ui.token=null;store("mingle.token",null);ui.justSetup=false;load(null);ui.role="home";go("/");render();},
  offerFilter(d){ui.offerFilter=d.v;render();},
  openOffer(d){ui.offer=d.v;ui.tips.clear();render();window.scrollTo(0,0);ev("offer_opened",{offer_id:d.v,demo:!!(all("offers")[d.v]||{}).demo});},
  closeOffer(){ui.offer=null;render();window.scrollTo(0,0);},
  openSheet(d,el){ui.sheet={type:d.v,id:ui.offer||ui.deal,field:el&&el.dataset.field};ui.err={};if(d.v==="change"&&el&&el.dataset.field){delete D("chg").field;}render();},
  closeSheet(){const s=ui.sheet;ui.sheet=null;if(s&&s.type==="decline"&&s.done)ui.offer=null;render();},
  async interested(d){const o=all("offers")[d.v]||{};if(ui.busy)return;ui.busy=true;
    try{if(await rpc("offer_interested",{p_token:ui.token,p_offer:d.v})){ev("offer_accepted",{offer_id:d.v,fit_status:fit(meC()||{},terms(o,briefOf(o))).result,demo:!!o.demo});ui.sheet.done=true;}}finally{ui.busy=false;}
    render();await refresh();},
  declineReason(d){if(ui.sheet)D("dec-"+ui.sheet.id).reason=d.v;render();},
  async decline(d){const o=all("offers")[d.v],b=briefOf(o),f=D("dec-"+d.v);if(!o||!f.reason)return;
    ui.msg["decline"]=f.msg||declineMsg(b,f.reason);try{navigator.clipboard.writeText(ui.msg.decline).catch(()=>{});}catch(e){}
    if(await rpc("offer_decline",{p_token:ui.token,p_offer:d.v,p_reason:f.reason}))ev("offer_declined",{offer_id:d.v,fit_status:fit(meC()||{},terms(o,b)).result,reason:f.reason,demo:!!o.demo});
    ui.sheet.done=true;render();await refresh();},
  async bookCall(){const f=D("call");if(!f.day||!f.time)return;if(await rpc("creator_book_call",{p_token:ui.token,p_slot:f.day+", "+f.time})){ev("verification_call_booked",{slot:f.day+", "+f.time});ui.sheet.done=true;}else toast("Already verified");render();await refresh();},
  copy(d){const text=d.v==="code"?(ui.sent&&ui.sent.code)||"":ui.msg[d.v]||"";if(d.v==="reply"||d.v==="link")ev("link_copied",{what:d.v});
    const done=()=>toast("Copied");const fail=()=>toast("Copy is blocked here. Select the text and copy it.");
    try{navigator.clipboard.writeText(text).then(done,fail);}catch(e){fail();}},
  waShare(){ev("link_copied",{what:"whatsapp"});return "follow";},
  sendType(d){D("send").type=d.v;render();},
  lgType(d){D("lg").type=d.v;render();},
  async logSendCreator(){const sd=D("send"),h=String(sd.brand||"").replace(/^@/,"").trim();if(!h){toast("Add the brand's handle");return;}
    if(await rpc("log_send_creator",{p_token:ui.token,p_brand:h,p_offer_type:sd.type||"unclear"})){ev("link_shared",{brand_handle:h,offer_type:sd.type||"unclear",by:"creator"});sd.brand="";toast("Logged. We follow up if they go quiet.");}await refresh();},
  async find(){const h=String(D("find").handle||"").toLowerCase().replace(/^@/,"").trim();if(!h)return;
    const c=await rpc("public_creator",{p_handle:h});ui.findTried=true;ui.found=c?c.handle:null;S.creators=c?{[c.handle]:c}:{};
    if(c&&!srecall("mingle.lo."+c.handle))sstore("mingle.lo."+c.handle,String(Date.now()));render();window.scrollTo(0,0);},
  changeCreator(){ui.found=null;ui.findTried=false;ui.wiz.brief=-1;D("find").handle="";render();},
  startBrief(d){ui.wiz[d.v]=0;briefStarted(d.v,"start");render();window.scrollTo(0,0);},
  wizNext(d){const form=d.form,f=D(form),n=briefNeeds(f,form==="camp",ui.wiz[form]);if(n.length){ui.err[form]="Still needed: "+n.join(", ")+".";render();return;}
    ui.err={};ev("brief_step_completed",{source:briefSource(form),step:(form==="camp"?CAMP_STEPS:BRIEF_STEPS)[ui.wiz[form]],creator_handle:form==="brief"?ui.found:null});ui.wiz[form]++;render();window.scrollTo(0,0);},
  wizBack(d){ui.err={};ui.wiz[d.form]--;render();window.scrollTo(0,0);},
  wizGo(d){ui.err={};ui.wiz[d.form]=Number(d.v);render();window.scrollTo(0,0);},
  cnt(d){const form=d.form,f=D(form),c=f.cnt||(f.cnt={});c[d.v]=Math.max(0,Math.min(20,(Number(c[d.v])||0)+Number(d.d)));briefStarted(form,"deliverables");render();},
  async sendBrief(d){
    if(ui.busy)return;
    const form=d.v,camp=form==="camp",f=D(form);
    const miss=briefNeeds(f,camp);
    if(miss.length){ui.err[form]="Still needed: "+miss.join(", ")+".";render();return;}
    const src=briefSource(form),t0=ui.started[form]||Date.now();
    const p=Object.assign(briefPayload(f),{time_to_submit_sec:Math.round((Date.now()-t0)/1000)});
    ui.busy=true;render();
    try{
      const r=await rpc("submit_brief",{p,p_handle:camp?null:ui.found});
      ui.brandCode=r.code;
      ev("brief_submitted",{brief_id:r.brief_id,source:src,creator_handle:camp?null:ui.found,minutes_since_link_opened:camp?null:linkMinutes(),fields_complete:termsComplete(p),creators_in_brief:camp?p.creators_wanted:1,fee_per_creator:p.is_barter?0:p.fee_inr,barter_value:p.is_barter?p.barter_value_inr:0,payment_terms_days:p.payment_days,format:p.deliverables,usage_type:p.usage_type,target_niche:camp?p.target_niche:null,target_city:camp?p.target_city:null,time_to_submit_sec:p.time_to_submit_sec});
      ui.sent={code:r.code,camp,handle:ui.found};D("bc").code=r.code;delete ui.draft[form];delete ui.started[form];ui.abandoned.delete(form);ui.wiz[form]=-1;ui.err={};setTimeout(celebrate,150);
    }catch(e){ui.err[form]=e.message;}
    ui.busy=false;render();window.scrollTo(0,0);
  },
  newBrief(){ui.sent=null;ui.found=null;ui.findTried=false;ui.wiz.brief=-1;ui.wiz.camp=-1;D("find").handle="";render();},
  async trackSent(){ui.tab.brand="contracts";ui.sent=null;go("/track/"+ui.brandCode);render();await refresh();},
  async brandCode(){ui.brandCode=String(D("bc").code||"").trim();go(ui.brandCode?"/track/"+ui.brandCode:"/brand");render();await refresh();},
  clearCode(){ui.brandCode="";D("bc").code="";go("/brand");load(null);render();},
  async openDeal(d){ui.deal=d.v;ui.offer=null;ui.dealTok=(d.side||ui.role)==="creator"?ui.token:ui.brandCode;ui.dealSide=null;ui.sheet=null;render();window.scrollTo(0,0);await refresh();},
  async closeDeal(){ui.deal=null;ui.dealSide=null;ui.dealTok=null;ui.sheet=null;go(ui.role==="brand"&&ui.brandCode?"/track/"+ui.brandCode:rolePath());render();await refresh();},
  reviewStart(d){ui.review[d.v]=0;ev("terms_review_started",{deal_id:d.v,side:ui.dealSide});render();},
  reviewNext(d){ui.review[d.v]=(ui.review[d.v]||0)+1;render();},
  reviewBack(d){ui.review[d.v]=Math.max(0,(ui.review[d.v]||0)-1);render();},
  async confirm(){
    const o=all("offers")[ui.deal],side=ui.dealSide,k=side+"_confirmed_at",once=ui.deal+":"+side+":"+(o&&o.contract_sent_at||"");
    if(!o||o[k]||ui.busy||ui.once.has(once))return;ui.once.add(once);
    const b=briefOf(o),t=terms(o,b),filming=side==="creator"?!!D("cf").filming:null;
    ui.busy=true;render();
    try{const r=await rpc("deal_confirm",{p_offer:ui.deal,p_token:ui.dealTok});if(r&&r.ok){
      ev("terms_confirmed",{deal_id:ui.deal,offer_id:ui.deal,side,terms_complete:termsComplete(t),filming_started:filming,hours_since_brief:b.created_at?Math.round((Date.now()-T(b.created_at))/36e4)/10:null,creator_id:o.creator_id,demo:!!o.demo});
      if(r.status==="locked"){ev("terms_locked",{offer_id:ui.deal,deal_id:ui.deal,demo:!!o.demo});ev("deal_stage_updated",Object.assign(stageProps(o),{from_stage:"terms_draft",to_stage:"terms_locked"}));ui.sheet={type:"locked",id:ui.deal};celebrate();}
      else toast("Confirmed. Waiting for the other side.");}}
    finally{ui.busy=false;}
    delete ui.draft.cf;delete ui.review[ui.deal];await refresh();
  },
  async sendChange(){
    const f=D("chg");if(!f.field)f.field="Fee";if(!String(f.note||"").trim()){ui.err.chg="Still needed: what you need.";render();return;}
    const o=all("offers")[ui.deal]||{},note=String(f.note).trim();
    const r=await rpc("deal_change",{p_offer:ui.deal,p_token:ui.dealTok,p_field:f.field,p_note:note,p_after_filming:!!f.after});
    if(r&&r.ok){ev("change_requested",{deal_id:ui.deal,offer_id:ui.deal,side:ui.dealSide,reason:f.field,field:f.field,after_filming:!!f.after,demo:!!o.demo});
      if(o.status==="locked")ev("deal_stage_updated",Object.assign(stageProps(Object.assign({id:ui.deal},o)),{from_stage:"terms_locked",to_stage:"terms_draft"}));toast("Change request sent");}
    delete ui.draft.chg;delete ui.review[ui.deal];ui.sheet=null;ui.err={};await refresh();
  },
  async markLive(d){const o=Object.assign({id:d.v},all("offers")[d.v]),link=String(D("post-"+d.v).link||"").trim();
    const r=await rpc("deal_posted",{p_offer:d.v,p_token:ui.dealTok,p_link:link||null});
    if(r&&r.ok){ev("deal_stage_updated",Object.assign(stageProps(o),{from_stage:"terms_locked",to_stage:"posted",posted_date:today(),by:"creator",has_link:!!link}));celebrate();toast("Marked live. The payment clock is running.");}
    await refresh();},
  async paymentSent(d){const o=Object.assign({id:d.v},all("offers")[d.v]);const r=await rpc("deal_payment_sent",{p_offer:d.v,p_token:ui.dealTok});
    if(r&&r.ok){ev("payment_sent",Object.assign(stageProps(o),{by:"brand"}));toast("Marked as sent. The creator confirms when it arrives.");}await refresh();},
  async confirmPaid(d){const o=Object.assign({id:d.v},all("offers")[d.v]),f=D("paid-c-"+d.v),due=dueDate(terms(o,briefOf(o)));
    const r=await rpc("deal_paid",{p_offer:d.v,p_token:ui.dealTok,p_amount_matches:f.match!==false});
    if(r&&r.ok){const late=due?Math.round((T(today())-T(due))/DAY):0;
      ev("payment_marked_paid",Object.assign(stageProps(o),{due_date:due,paid_date:today(),days_late:late,amount_matches:f.match!==false,by:"creator"}));
      ev("deal_stage_updated",Object.assign(stageProps(o),{from_stage:"posted",to_stage:"paid"}));ui.sheet.done=true;celebrate();}
    render();await refresh();},
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
  async markPosted(d){const o=Object.assign({id:d.v},all("offers")[d.v]);
    if(!await rpc("team_offer",{p_key:teamKey,p_offer:d.v,p_action:"posted",p_terms:{posted_date:today()}})){toast("Already logged");return refresh();}
    ev("deal_stage_updated",Object.assign(stageProps(o),{from_stage:"terms_locked",to_stage:"posted",posted_date:today(),by:"team"}));toast("Logged as posted");await refresh();},
  async markPaid(d){const o=Object.assign({id:d.v},all("offers")[d.v]),p=D("paid-"+d.v),due=dueDate(terms(o,briefOf(o)));if(!p.date){toast("Add the date it was paid");return;}
    if(!await rpc("team_offer",{p_key:teamKey,p_offer:d.v,p_action:"paid",p_terms:{paid_date:p.date,amount_matches:!!p.match}})){toast("Already logged");return refresh();}
    const late=due?Math.round((T(p.date)-T(due))/DAY):0;
    ev("payment_marked_paid",Object.assign(stageProps(o),{due_date:due,paid_date:p.date,days_late:late,amount_matches:!!p.match,by:"team"}));
    ev("deal_stage_updated",Object.assign(stageProps(o),{from_stage:"posted",to_stage:"paid"}));toast(late>0?"Logged: paid "+late+" days late":"Logged: paid on time");await refresh();},
  async logSendTeam(){const f=D("lg"),h=String(f.brand||"").replace(/^@/,"").trim();if(!f.creator||!h){ui.err.lg="Still needed: creator and brand handle.";render();return;}
    if(await rpc("team_log_send",{p_key:teamKey,p_creator:f.creator,p_brand:h,p_offer_type:f.type||"unclear"})){ev("link_shared",{creator_id:f.creator,brand_handle:h,offer_type:f.type||"unclear",by:"team"});f.brand="";ui.err={};toast("Logged");}await refresh();},
  async outcome(d,el){const prev=all("link_sends")[d.v]||{};if(await rpc("team_outcome",{p_key:teamKey,p_send:d.v,p_outcome:el.value})&&el.value==="went_quiet"&&prev.outcome!=="went_quiet")ev("brand_went_silent",{});await refresh();},
  export(){const c=D("x").table||"offers",text=csv(c);
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"text/csv"}));a.download="mingle_"+c+".csv";document.body.appendChild(a);a.click();a.remove();},
  async signOutTeam(){teamKey=null;store("mingle.team",null);load(null);ui.role="home";go("/");render();}
};
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-act]");if(!el||el.tagName==="SELECT")return;
  if(el.type==="checkbox"&&!["pick","demoToggle"].includes(el.dataset.act))return;
  const fn=act[el.dataset.act];if(!fn)return;
  // links that also log an event keep their normal navigation
  if(el.tagName==="A"&&el.target==="_blank"){fn(el.dataset,el);return;}
  if(el.tagName!=="INPUT")e.preventDefault();run(fn,el);
});
function run(fn,el){Promise.resolve().then(()=>fn(el.dataset,el)).catch(err=>{ui.busy=false;toast((err&&err.message)||"Something went wrong");render();});}
document.addEventListener("change",e=>{const el=e.target;if(el.tagName==="SELECT"&&el.dataset.act&&act[el.dataset.act])run(act[el.dataset.act],el);});
function bind(e){
  const el=e.target;const k=el.dataset&&el.dataset.f;if(!k)return;
  const [form,key]=k.split(".");D(form)[key]=el.type==="checkbox"?el.checked:el.value;
  if(form==="brief"||form==="camp"){briefStarted(form,key);progress(form);}
  // fields whose value changes a live hint on screen redraw once the field is done
  if(e.type==="change"&&(el.hasAttribute("data-rr")||/^(post_date|payment_days|min_fee_inr|rate_story)$/.test(key)))render();
}
document.addEventListener("input",bind);document.addEventListener("change",bind);
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&ui.sheet){ui.sheet=null;render();return;}
  if(e.key!=="Enter"||e.target.tagName!=="INPUT")return;const k=e.target.dataset.f||"";
  const map={"gate.code":"openCode","find.handle":"find","bc.code":"brandCode","tk.key":"teamKey","send.brand":"logSendCreator","setup.custom":"addBlock"};if(map[k]){e.preventDefault();run(act[map[k]],{dataset:{}});}});
init();
})();
