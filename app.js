const $=id=>document.getElementById(id);
const LOGO_L="images/logo-left.png", SIG="images/signature.png", LOGO_R="images/logo-right.jpg";
const DEF={tag:"Sri Agora, Nirmala thunai",co:"A.M. EARTH MOVERS",addr:"No.2/128, Chetpet Mani Road, Sabari Nagar, Chepet, Kancheepuram Dist - 601301.",
ph:"GPay 9585279002 | WhatsApp 6374295795 / 6379051846",date:new Date().toLocaleDateString("en-CA"),title:"JCB RENTAL & INVOICE",
cn:"",ca:"",cp:"",cs:"",inv:"",minOn:true,minAmt:5000,bkb:30,bkl:60,bkd:30,
rate:900,beta:500,days:5,ded:15000,betaLbl:"Driver Beta (Allowance)",dedLbl:"Less: Total Deduction (Diesel Charge Advance)",
bn:"CITY UNION BANK",bh:"MOHANRAM G",ba:"500101014417263",bi:"CIUB000894",bg:"9585279002",forco:"A.M. EARTH MOVERS"};
const CO=["tag","co","addr","ph"], BK=["bn","bh","ba","bi","bg","forco"];
let S={...DEF,log:[["2026-09-22",6,"08:00","14:00",{}],["2026-09-23",7,"08:00","15:00",{}],["2026-09-24",7,"08:00","15:00",{}],["2026-09-25",8,"08:00","16:00",{}],["2026-09-26",8,"08:00","16:00",{}]]};
try{const d=JSON.parse(localStorage.getItem("invDraft"));if(d&&Array.isArray(d.log))S={...S,...d}}catch(e){}
S.log.forEach(r=>{r[4]=r[4]||{}});
const push=(k,v)=>{fetch("/api/kv/"+k,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(v)}).catch(()=>{})};
let dt;
function saveDraft(){try{localStorage.setItem("invDraft",JSON.stringify(S))}catch(e){}clearTimeout(dt);dt=setTimeout(()=>push("invDraft",S),600)}
function resetAll(){if(confirm("Start a new invoice? Current details will be cleared.")){try{localStorage.removeItem("invDraft")}catch(e){}push("invDraft",{});location.reload()}}
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2400)}
let P={co:[],bk:[]};
try{P=JSON.parse(localStorage.getItem("invPresets"))||P}catch(e){}
const tm=t=>{if(!t)return"";let[h,m]=t.split(":").map(Number);const ap=h>=12?"PM":"AM";h=h%12||12;return h+":"+String(m).padStart(2,"0")+" "+ap};
const fh=x=>String(Math.round(x*100)/100);
const fmt=n=>"₹"+Math.round(n).toLocaleString("en-IN");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function go(n){
  document.querySelectorAll(".pane").forEach(p=>p.classList.toggle("on",p.id=="p"+n));
  document.querySelectorAll("#tabs button").forEach(b=>b.classList.toggle("on",b.dataset.t==n));
  $("bar").style.display=n==5?"none":"flex";if(n==5){render();if(!S.cn.trim())toast("Tip: add the customer name in tab 1")}window.scrollTo(0,0);
}
$("tabs").onclick=e=>{if(e.target.dataset.t)go(+e.target.dataset.t)};

function fill(){document.querySelectorAll("[data-k]").forEach(i=>{i.type=="checkbox"?i.checked=S[i.dataset.k]:i.value=S[i.dataset.k]})}
document.addEventListener("input",e=>{
  const k=e.target.dataset.k; if(k){S[k]=e.target.type=="checkbox"?e.target.checked:e.target.type=="number"?(+e.target.value||0):e.target.value}
  if(k&&k.startsWith("bk"))recalcAll();else calc();
});
document.addEventListener("change",e=>{if(e.target.type=="checkbox"&&e.target.dataset.k){S[e.target.dataset.k]=e.target.checked;calc()}});
const BRK=[["b","Breakfast","bkb"],["l","Lunch","bkl"],["d","Dinner","bkd"]];
const fm=m=>m>=60&&m%60==0?(m/60)+" hr":m+" min";
const dmy=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||"");return m?m[3]+"/"+m[2]+"/"+m[1]:(s||"")};
function brkMin(r){return BRK.reduce((a,b)=>a+(r[4][b[0]]?(+S[b[2]]||0):0),0)}
function brkTxt(r){return BRK.filter(b=>r[4][b[0]]).map(b=>b[1]+" "+fm(+S[b[2]]||0)).join(", ")}
function recalc(i){
  const r=S.log[i];
  if(r[2]&&r[3]){const m=t=>{const[a,b]=t.split(":");return +a*60+ +b};let d=m(r[3])-m(r[2]);if(d<=0)d+=1440;d=Math.max(d-brkMin(r),0);r[1]=Math.round(d/60*100)/100;const el=$("h"+i);if(el)el.value=r[1]}
}
function recalcAll(){S.log.forEach((r,i)=>recalc(i));calc()}
function setT(i,k,v){S.log[i][k]=v;recalc(i);calc()}
function setB(i,k,on){S.log[i][4][k]=on;recalc(i);calc()}
function rows(){
  $("wl").innerHTML=S.log.map((r,i)=>`<div class="wl"><b class="badge">Day ${i+1}</b>
  <input class="f" style="width:150px" type="date" value="${esc(r[0])}" title="Date" oninput="S.log[${i}][0]=this.value">
  <input class="f" style="width:112px" type="time" value="${r[2]||""}" title="Start time" oninput="setT(${i},2,this.value)">
  <input class="f" style="width:112px" type="time" value="${r[3]||""}" title="End time" oninput="setT(${i},3,this.value)">
  <input class="f" id="h${i}" style="width:80px" type="number" step="0.25" value="${r[1]}" title="Hours" oninput="S.log[${i}][1]=+this.value||0;calc()">
  <button class="btn rd" onclick="S.log.splice(${i},1);rows();calc()">×</button>
  <div style="width:100%;display:flex;gap:14px;flex-wrap:wrap;padding-top:2px"><span style="font-size:13px;color:var(--mute);font-weight:600">Breaks taken:</span>${BRK.map(b=>`<label style="display:flex;gap:5px;align-items:center;margin:0;font-size:13px"><input type="checkbox" ${r[4][b[0]]?"checked":""} onchange="setB(${i},'${b[0]}',this.checked)"> ${b[1]}</label>`).join("")}</div></div>`).join("");
}
function addRow(){S.log.push([new Date().toLocaleDateString("en-CA"),8,"08:00","16:00",{l:1}]);recalc(S.log.length-1);rows();calc()}
function tot(){return S.log.reduce((a,r)=>a+(+r[1]||0),0)}
function nums(){const t=tot(),raw=t*S.rate,w=S.minOn?Math.max(raw,S.minAmt):raw,b=S.days*S.beta,i=w+b;return{t,raw,w,b,i,due:i-S.ded}}
function calc(){const n=nums();$("th").textContent=fh(n.t);$("s1").textContent=fmt(n.w)+(n.w>n.raw?" (minimum applied)":"");$("s2").textContent=fmt(n.b);$("s3").textContent=fmt(n.i);$("s4").textContent=fmt(n.due);$("bh2").textContent=fh(n.t);$("bd").textContent=fmt(n.due);saveDraft()}

function render(){
  const n=nums();
  $("inv").innerHTML=`
  <div style="border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:10px">
   <div style="width:150px;flex:none;text-align:left"><img src="${LOGO_L}" style="width:150px;height:auto;display:block" alt=""></div>
   <div style="flex:1;text-align:center">
    <div style="font-size:13px">${esc(S.tag)}</div>
    <div style="font-size:34px;font-weight:bold;color:#8b1a1a;letter-spacing:1px">${esc(S.co)}</div>
    <div style="font-size:12px">${esc(S.addr)}</div><div style="font-size:12px">${esc(S.ph)}</div></div>
   <div style="width:150px;flex:none;text-align:right"><img src="${LOGO_R}" style="height:100px;width:auto;display:inline-block" alt=""></div></div>
  <div style="display:flex;justify-content:space-between;font-size:13px;line-height:1.6">
   <div><b>BILL TO:</b><br>${esc(S.cn)}<br>${esc(S.ca)}${S.cp?"<br>Ph: "+esc(S.cp):""}${S.cs?"<br>Site: "+esc(S.cs):""}</div>
   <div class="r">${S.inv?"Invoice No: "+esc(S.inv)+"<br>":""}Date: ${esc(dmy(S.date))}</div></div>
  <h2 class="c" style="margin:6px 0 10px;font-size:24px">${esc(S.title)}</h2>
  <table><tr class="hd"><td colspan="4" class="c b" style="font-size:17px">WORK LOG</td></tr>
  <tr><th>Day</th><th>Date</th><th>Working Time (From – To)</th><th>Hours Worked</th></tr>
  ${S.log.map((r,i)=>`<tr><td class="c">Day ${i+1}</td><td class="c">${esc(dmy(r[0]))}</td><td class="c">${r[2]&&r[3]?tm(r[2])+" – "+tm(r[3]):"—"}${brkTxt(r)?'<div style="font-size:11px;color:#444">Less: '+brkTxt(r)+'</div>':""}</td><td class="c">${fh(+r[1])} hrs</td></tr>`).join("")}
  <tr><td></td><td></td><td class="c b">Total</td><td class="c b">${fh(n.t)} Hours</td></tr></table>
  <table><tr class="hd"><td colspan="3" class="c b" style="font-size:19px">COST SUMMARY</td></tr>
  <tr><th>Description</th><th style="width:170px">Details/Rate</th><th style="width:120px">Amount</th></tr>
  <tr><td>Hourly Work Charges (${fh(n.t)} Hours)${n.w>n.raw?" – Minimum Charge Applied":""}</td><td>@ ₹${S.rate}/hr</td><td class="r">${fmt(n.w)}</td></tr>
  <tr><td>${esc(S.betaLbl)} - ${S.days} days</td><td>@ ₹${S.beta}/day</td><td class="r">${fmt(n.b)}</td></tr>
  <tr><td colspan="2" class="r b">Consolidated Total (Initial)</td><td class="r b">${fmt(n.i)}</td></tr></table>
  <table><tr class="hd"><td colspan="2" class="b" style="font-size:17px">BILL SUMMARY &amp; PAYMENT DETAILS</td></tr>
  <tr><td>Total Initial Amount</td><td class="r" style="width:120px">${fmt(n.i)}</td></tr>
  <tr><td>${esc(S.dedLbl)}</td><td class="r">${fmt(S.ded)}</td></tr>
  <tr><td class="r b">Total Amount Due Payable</td><td class="r b">${fmt(n.due)}</td></tr></table>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:16px">
   <div style="font-weight:bold;line-height:1.6"><div>BANK DETAILS FOR PAYMENT:</div>
    <div>BANK NAME : ${esc(S.bn)}</div><div>A/C HOLDER NAME : ${esc(S.bh)}</div>
    <div>A/C NO: ${esc(S.ba)}</div><div>IFSC: ${esc(S.bi)}</div><div>GPay No: ${esc(S.bg)}</div>
    <div style="margin-top:34px;border-top:1px solid #333;width:200px;font-size:12px;font-weight:normal">Customer Signature</div></div>
   <div class="c" style="font-size:13px;width:34%"><div style="height:70px;display:flex;align-items:flex-end;justify-content:center"><img src="${SIG}" style="max-height:66px;width:auto" alt=""></div>For <b>${esc(S.forco)}</b></div></div>`;fit();
}
function fit(){const box=$("scaleBox"),sc=$("scaler"),inv=$("inv");const s=Math.min(1,(box.parentElement.clientWidth-20)/794)||1;sc.style.width="794px";sc.style.transform=s<1?`scale(${s})`:"none";box.style.width=(794*s)+"px";box.style.height=(inv.offsetHeight*s)+"px";box.style.margin="0 auto"}

function saveP(){try{localStorage.setItem("invPresets",JSON.stringify(P))}catch(e){}push("invPresets",P)}
function opts(t){
  const el=$(t+"Sel");
  el.innerHTML='<option value="-1">— Current / new —</option>'+P[t].map((p,i)=>`<option value="${i}">${esc(p.name)}</option>`).join("");
}
function savePreset(t){
  const keys=t=="co"?CO:BK, d={}; keys.forEach(k=>d[k]=S[k]);
  const name=prompt("Preset name?",t=="co"?S.co:S.bn+" - "+S.bh); if(!name)return;
  d.name=name; P[t].push(d); saveP(); opts(t); $(t+"Sel").value=P[t].length-1;
}
function delPreset(t){
  const i=+$(t+"Sel").value; if(i<0)return; P[t].splice(i,1); saveP(); opts(t);
}
["co","bk"].forEach(t=>{opts(t);$(t+"Sel").onchange=e=>{
  const i=+e.target.value; if(i<0)return;
  (t=="co"?CO:BK).forEach(k=>S[k]=P[t][i][k]); fill();
}});

const fname=ext=>"Invoice_"+(S.cn.trim()?S.cn.trim().replace(/[^\w]+/g,"_")+"_":"")+dmy(S.date).replace(/\//g,"-")+"."+ext;
const busy=(ids,on)=>ids.forEach(i=>$(i).disabled=on);
async function snap(){
  render();$("scaler").style.transform="none";
  try{return await html2canvas($("inv"),{scale:2,backgroundColor:"#fff",useCORS:true})}
  finally{fit()}
}
async function pdf(){
  busy(["bPdf","bImg"],true);
  try{
    const cv=await snap();
    const {jsPDF}=window.jspdf, doc=new jsPDF({unit:"mm",format:"a4"});
    let w=210,h=cv.height*w/cv.width; if(h>297){w=w*297/h;h=297}
    doc.addImage(cv.toDataURL("image/jpeg",.95),"JPEG",(210-w)/2,0,w,h);
    doc.save(fname("pdf"));toast("PDF saved");
  }catch(e){alert("PDF library needs internet. Use Print > Save as PDF instead.")}
  finally{busy(["bPdf","bImg"],false)}
}
async function img(){
  busy(["bPdf","bImg"],true);
  try{
    const cv=await snap();
    cv.toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=fname("png");document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast("Image saved")},"image/png");
  }catch(e){alert("Image export needs internet (html2canvas). Take a screenshot or use Print instead.")}
  finally{busy(["bPdf","bImg"],false)}
}
async function share(){
  try{
    const cv=await snap(), blob=await new Promise(r=>cv.toBlob(r,"image/png"));
    const f=new File([blob],fname("png"),{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],title:"Invoice"});else img();
  }catch(e){if(e.name!="AbortError")toast("Sharing not available, use Image instead")}
}
if(navigator.share)$("bShare").style.display="";
window.addEventListener("resize",()=>{if($("p5").classList.contains("on"))fit()});
fill();rows();calc();
// Load saved presets from PostgreSQL (if the server is running)
fetch("/api/kv/invPresets").then(r=>r.ok?r.json():null).then(d=>{
  if(d&&d.co&&d.bk&&(d.co.length||d.bk.length)){P=d;try{localStorage.setItem("invPresets",JSON.stringify(P))}catch(e){}opts("co");opts("bk")}
}).catch(()=>{});
