
// ─── ICONS ───
const I={
  pill:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>`,
  capsule:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/></svg>`,
  syrup:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="2" x2="16" y2="2"/><path d="M7 4v16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4z"/><path d="M7 9h10"/></svg>`,
  drops:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`,
  injection:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>`,
  other:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>`,
  cam:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  edit:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>`,
  trash:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  cart:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  warn:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  chk:`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  clk:`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  person:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--border2)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  repeat:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
};
function mIco(t){return I[t]||I.pill;}

// ─── REPEAT SCHEDULE HELPERS ───
// repeat object shape:
// { type: 'daily' | 'weekdays' | 'weekly' | 'every_n_days' | 'as_needed',
//   days: [0,1,2,3,4,5,6],   // for 'weekdays' / 'weekly' (0=Sun)
//   every: 2,                  // for 'every_n_days'
//   startDate: 'YYYY-MM-DD'   // for 'every_n_days' anchor
// }

function isDueToday(m) {
  const repeat = m.repeat || { type: 'daily' };
  const now = new Date();
  const dow = now.getDay(); // 0=Sun
  const dk = todayStr();

  switch (repeat.type) {
    case 'daily':
      return true;
    case 'weekdays':
      // specific days chosen by user (stored in repeat.days array)
      return (repeat.days || []).includes(dow);
    case 'weekly':
      // one specific day
      return (repeat.days || [])[0] === dow;
    case 'every_n_days': {
      const n = repeat.every || 1;
      const anchor = repeat.startDate || dk;
      const anchorDate = new Date(anchor + 'T00:00:00');
      const todayDate = new Date(dk + 'T00:00:00');
      const diff = Math.round((todayDate - anchorDate) / 86400000);
      return diff >= 0 && diff % n === 0;
    }
    case 'as_needed':
      return false; // never auto-deduct; show doses but no auto
    default:
      return true;
  }
}

function repeatLabel(m) {
  const r = m.repeat || { type: 'daily' };
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  switch (r.type) {
    case 'daily': return 'Every day';
    case 'weekdays':
      if (!r.days || !r.days.length) return 'No days selected';
      if (JSON.stringify(r.days.slice().sort()) === JSON.stringify([1,2,3,4,5])) return 'Weekdays';
      if (JSON.stringify(r.days.slice().sort()) === JSON.stringify([0,6])) return 'Weekends';
      return r.days.map(d=>DAY_NAMES[d]).join(', ');
    case 'weekly':
      return `Every ${DAY_NAMES[(r.days||[])[0]??0]}`;
    case 'every_n_days':
      return `Every ${r.every||2} days`;
    case 'as_needed': return 'As needed';
    default: return 'Every day';
  }
}

// ─── STATE ───
let S={
  profiles:[],sosMeds:[],
  editPId:null,editMId:null,target:null,
  color:1,pImg:null,mImg:null,
  times:[],       // selected schedule times
  repeat:{ type:'daily', days:[], every:2, startDate:'' },
  bsCtx:null,confirmCb:null,
};
let deferredInstall=null;

function load(){
  try{const d=localStorage.getItem('mv5');if(d){const p=JSON.parse(d);S.profiles=p.profiles||[];S.sosMeds=p.sosMeds||[];}}catch(e){}
  // Migrate old mv4 data if mv5 doesn't exist yet
  try{
    if(!localStorage.getItem('mv5') && localStorage.getItem('mv4')){
      const old=JSON.parse(localStorage.getItem('mv4'));
      S.profiles=old.profiles||[];S.sosMeds=old.sosMeds||[];
      save(); // save under new key
    }
  }catch(e){}
}
function save(){
  try{localStorage.setItem('mv5',JSON.stringify({profiles:S.profiles,sosMeds:S.sosMeds}));}catch(e){}
}

// ─── DATE HELPERS ───
function todayStr(){return new Date().toISOString().slice(0,10);}
function doseKey(mid,time){return `done_${mid}_${todayStr()}_${time}`;}
function isDone(mid,time){return !!localStorage.getItem(doseKey(mid,time));}
function markDone(mid,time){localStorage.setItem(doseKey(mid,time),'1');}
function markUndone(mid,time){localStorage.removeItem(doseKey(mid,time));}

// ─── INIT ───
function init(){
  load();
  document.getElementById('home-date').textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  renderAll();autoDecrement();calcAlerts();
  setInterval(autoDecrement,60000);setInterval(calcAlerts,60000);
  setupPWA();
  // Init repeat UI defaults
  syncRepeatUI();
}

// ─── RENDER ───
function renderAll(){renderHome();renderSB();renderBN();renderSOS();calcAlerts();}

function renderHome(){
  let ha='',html='';
  S.profiles.forEach(p=>{
    const low=(p.medicines||[]).filter(m=>m.count<=4&&m.count>0);
    const zero=(p.medicines||[]).filter(m=>m.count===0);
    if(low.length)ha+=`<div class="alert-strip">${I.warn}<strong>${p.name}</strong> — ${low.map(m=>`${m.name}: ${m.count} left`).join(', ')}</div>`;
    if(zero.length)ha+=`<div class="alert-strip">${I.warn}<strong>${p.name}</strong> — ${zero.map(m=>m.name).join(', ')} out of stock</div>`;
    const av=p.img?`<img src="${p.img}" alt="">`:`<div style="opacity:0.6">${I.person}</div>`;
    html+=`<div class="pcard c${p.color}" onclick="showProfile('${p.id}')">
      <div class="pav-lg">${av}<div class="pav-ov">${I.cam}</div></div>
      <div class="p-name">${p.name}</div>
      <div class="p-role">${p.role||''}${p.age?` · ${p.age}y`:''}</div>
      <div class="p-stats">
        <div class="schip">${(p.medicines||[]).length} meds</div>
        ${(low.length+zero.length)?`<div class="schip w">${low.length+zero.length} alert</div>`:''}
      </div>
    </div>`;
  });
  html+=`<div class="add-pcard" onclick="openAddProfile()">
    <div class="add-ring"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
    <div style="font-size:13px;font-weight:600;">Add Family Member</div>
  </div>`;
  document.getElementById('pgrid').innerHTML=html;
  document.getElementById('home-alerts').innerHTML=ha;
}

function renderSB(){
  document.getElementById('sb-profiles').innerHTML=S.profiles.map(p=>{
    const av=p.img?`<img src="${p.img}">`:`<div style="opacity:0.6">${I.person}</div>`;
    return `<div class="pnav" onclick="showProfile('${p.id}')" data-profile="${p.id}"><div class="pav-xs">${av}</div>${p.name}</div>`;
  }).join('');
}

function renderBN(){
  document.getElementById('bn-profiles').innerHTML=S.profiles.map(p=>{
    const av=p.img?`<img src="${p.img}">`:`<div style="font-size:11px;opacity:0.6">${I.person}</div>`;
    return `<div class="bn-profile-btn" onclick="showProfile('${p.id}')" data-bnp="${p.id}">
      <div class="bn-pav">${av}</div>
      <div class="bn-pname">${p.name}</div>
    </div>`;
  }).join('');
}

function renderSOS(){
  const list=document.getElementById('sos-list');
  let ha='';
  if(!S.sosMeds.length){
    list.innerHTML=`<div class="empty"><div class="empty-ico">${I.pill}</div><h3>No SOS Medicines</h3><p>Add critical medicines to monitor here</p></div>`;
    document.getElementById('sos-alerts').innerHTML='';return;
  }
  S.sosMeds.forEach(m=>{
    if(!m.count)ha+=`<div class="alert-strip">${I.warn} SOS: <strong>${m.name}</strong> out of stock</div>`;
    else if(m.count<=4)ha+=`<div class="alert-strip">${I.warn} SOS: <strong>${m.name}</strong> — only ${m.count} left</div>`;
  });
  list.innerHTML=S.sosMeds.map(m=>mcard(m,'sos',null)).join('');
  document.getElementById('sos-alerts').innerHTML=ha;
}

function renderProfile(id){
  const p=S.profiles.find(x=>x.id===id);if(!p)return;
  const av=p.img?`<img src="${p.img}" alt="">`:`<div style="opacity:0.6">${I.person}</div>`;
  let ha='';
  (p.medicines||[]).forEach(m=>{
    if(!m.count)ha+=`<div class="alert-strip">${I.warn} <strong>${m.name}</strong> out of stock</div>`;
    else if(m.count<=4)ha+=`<div class="alert-strip">${I.warn} <strong>${m.name}</strong> — only ${m.count} left</div>`;
  });
  const meds=(p.medicines||[]).length
    ?`<div class="med-list">${p.medicines.map(m=>mcard(m,'profile',id)).join('')}</div>`
    :`<div class="empty"><div class="empty-ico">${I.pill}</div><h3>No medicines yet</h3><p>Add medicines for ${p.name}</p></div>`;
  document.getElementById('pcontent').innerHTML=`
  <div class="sec-head">
    <div style="display:flex;align-items:center;gap:14px;">
      <div class="pav-lg" style="width:58px;height:58px;cursor:pointer;" onclick="document.getElementById('ev-up').click()">
        ${av}<div class="pav-ov">${I.cam}</div>
      </div>
      <input type="file" id="ev-up" accept="image/*" class="hidden" onchange="updPImg(event,'${p.id}')">
      <div><div class="sec-title">${p.name}</div><div class="sec-sub">${p.role||''}${p.age?` · ${p.age} yrs`:''}</div></div>
    </div>
    <div style="display:flex;gap:7px;flex-wrap:wrap;">
      <button class="btn btn-ghost btn-sm" onclick="openEditProfile('${p.id}')">${I.edit} Edit</button>
      <button class="btn btn-danger btn-sm" onclick="confirmDeleteProfile('${p.id}')">${I.trash} Remove</button>
      <button class="btn btn-primary" onclick="openAddMed('profile','${p.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Med
      </button>
    </div>
  </div>
  ${ha}${meds}`;
}

function mcard(m,type,pid){
  const low=m.count<=4;
  const tid=type==='sos'?'sos':pid;
  const img=m.img
    ?`<img src="${m.img}" alt="">`
    :`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;opacity:0.75;">${mIco(m.type)}</div>`;
  const strip=m.stripSize?`<div style="font-size:9.5px;color:var(--text3);margin-top:2px;font-weight:700;letter-spacing:0.3px;">STRIP ${m.stripSize}</div>`:'';

  // Repeat badge
  const rl = repeatLabel(m);
  const dueToday = isDueToday(m);
  const repeatBadge = type!=='sos'
    ? `<span class="repeat-badge ${!dueToday?'repeat-badge-off':''}">${I.repeat} ${rl}</span>`
    : '';

  // Dose pills — only show if due today (or as_needed for manual)
  let doseSec='';
  const rep = m.repeat || {type:'daily'};
  const showDoses = type!=='sos' && (m.schedule||[]).length && (dueToday || rep.type==='as_needed');
  if(showDoses){
    const pills=(m.schedule||[]).map(t=>{
      const done=isDone(m.id,t);
      const[h,mi]=t.split(':').map(Number),td=new Date();td.setHours(h,mi,0,0);
      const past=td<=new Date();
      let cls='up';
      if(done)cls='taken';
      else if(past&&rep.type!=='as_needed')cls='missed';
      const ico=done?I.chk:(past&&rep.type!=='as_needed'?`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`:I.clk);
      const label = rep.type==='as_needed' ? fmt(t) : fmt(t);
      return `<div class="dpill ${cls}" onclick="toggleDose('${m.id}','${t}','${tid}')" title="${done?'Mark as not taken':'Mark as taken'}">
        <div class="dpill-ico">${ico}</div>${label}
      </div>`;
    }).join('');
    const doseTitle = rep.type==='as_needed' ? 'Tap to record a dose' : "Today's Doses — tap to mark taken";
    doseSec=`<div class="dose-section"><div class="dose-label">${doseTitle}</div><div class="dose-pills">${pills}</div></div>`;
  } else if(type!=='sos'&&(m.schedule||[]).length&&!dueToday){
    doseSec=`<div class="dose-section"><div class="dose-label not-due">Not scheduled for today — ${rl}</div></div>`;
  }

  return `<div class="mcard ${low?'low':''}" id="mc-${m.id}">
    <div class="mcard-top">
      <div class="mthumb" onclick="document.getElementById('mi-${m.id}').click()">
        ${img}
        <div class="thumb-ov">${I.cam}</div>
        <input type="file" id="mi-${m.id}" accept="image/*" class="hidden" onchange="updMImg(event,'${m.id}','${tid}')">
      </div>
      <div class="minfo">
        <div class="mname">${m.name}</div>
        ${m.desc?`<div class="mdesc">${m.desc}</div>`:''}
        ${repeatBadge}
      </div>
      <div class="mcnt-col">
        <div class="cnt-big ${low?'w':''}">${m.count}</div>
        <div class="cnt-unit">${unit(m.type)}${strip}</div>
        <div class="cnt-row">
          <div class="cb" onclick="adjCnt('${m.id}','${tid}',-1)">−</div>
          <input class="ci" type="number" value="${m.count}" min="0" onchange="setCnt('${m.id}','${tid}',this.value)" onblur="setCnt('${m.id}','${tid}',this.value)">
          <div class="cb" onclick="adjCnt('${m.id}','${tid}',1)">+</div>
        </div>
      </div>
    </div>
    ${doseSec}
    <div class="mcard-actions">
      <button class="btn btn-green btn-sm" onclick="openStrip('${m.id}','${tid}')">${I.cart} Strip</button>
      <button class="btn btn-ghost btn-sm" onclick="openEditMed('${m.id}','${tid}')">${I.edit} Edit</button>
      <button class="btn btn-danger btn-sm" onclick="delMed('${m.id}','${tid}')">${I.trash}</button>
    </div>
  </div>`;
}

// ─── DOSE TOGGLE ───
function toggleDose(mid,time,tid){
  const m=findM(mid,tid);if(!m)return;
  if(isDone(mid,time)){
    m.count+=1;
    markUndone(mid,time);
    toast('Dose unmarked — tablet returned');
  }else{
    if(m.count>0)m.count=Math.max(0,m.count-1);
    markDone(mid,time);
    toast('Dose marked as taken ✓');
  }
  save();refrsh(tid);calcAlerts();
}

// ─── NAV ───
function showPage(pg){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('[data-page]').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('[data-profile]').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('[data-bn]').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('[data-bnp]').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+pg).classList.add('active');
  document.querySelector('[data-page="'+pg+'"]')?.classList.add('active');
  document.querySelector('[data-bn="'+pg+'"]')?.classList.add('active');
}
function showProfile(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('[data-page],[data-bn]').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('[data-profile],[data-bnp]').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-profile').classList.add('active');
  document.querySelector('[data-profile="'+id+'"]')?.classList.add('active');
  document.querySelector('[data-bnp="'+id+'"]')?.classList.add('active');
  renderProfile(id);
}

// ─── PROFILE CRUD ───
function openAddProfile(){
  S.editPId=null;S.pImg=null;S.color=1;
  document.getElementById('p-name').value='';
  document.getElementById('p-role').value='';
  document.getElementById('p-age').value='';
  document.getElementById('pav-prev').innerHTML=I.person;
  document.getElementById('pm-title').textContent='Add Family Member';
  updSw(1);openModal('modal-profile');
}
function openEditProfile(id){
  const p=S.profiles.find(x=>x.id===id);if(!p)return;
  S.editPId=id;S.pImg=p.img||null;S.color=p.color||1;
  document.getElementById('p-name').value=p.name;
  document.getElementById('p-role').value=p.role||'';
  document.getElementById('p-age').value=p.age||'';
  document.getElementById('pav-prev').innerHTML=p.img?`<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`:`<div style="opacity:0.6">${I.person}</div>`;
  document.getElementById('pm-title').textContent='Edit Profile';
  updSw(p.color||1);openModal('modal-profile');
}
function saveProfile(){
  const name=document.getElementById('p-name').value.trim();
  if(!name){toast('Please enter a name');return;}
  if(S.editPId){
    const p=S.profiles.find(x=>x.id===S.editPId);
    if(p){p.name=name;p.role=document.getElementById('p-role').value.trim();p.age=document.getElementById('p-age').value;p.color=S.color;if(S.pImg)p.img=S.pImg;}
  }else{
    S.profiles.push({id:'p'+Date.now(),name,role:document.getElementById('p-role').value.trim(),age:document.getElementById('p-age').value,color:S.color,img:S.pImg||null,medicines:[]});
  }
  closeModal('modal-profile');save();renderAll();toast('Profile saved');
}
function confirmDeleteProfile(id){
  const p=S.profiles.find(x=>x.id===id);if(!p)return;
  document.getElementById('confirm-title').textContent=`Remove ${p.name}?`;
  document.getElementById('confirm-msg').textContent=`This will permanently remove ${p.name}'s profile and all their medicines. This cannot be undone.`;
  document.getElementById('confirm-ok').textContent='Remove Profile';
  S.confirmCb=()=>{S.profiles=S.profiles.filter(x=>x.id!==id);save();renderAll();showPage('home');toast(`${p.name} removed`);};
  document.getElementById('confirm-overlay').classList.add('open');
}
function closeConfirm(){document.getElementById('confirm-overlay').classList.remove('open');S.confirmCb=null;}
function doConfirm(){if(S.confirmCb)S.confirmCb();closeConfirm();}
function previewPImg(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=ev=>{S.pImg=ev.target.result;document.getElementById('pav-prev').innerHTML=`<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`};r.readAsDataURL(f);
}
function updPImg(e,id){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=ev=>{const p=S.profiles.find(x=>x.id===id);if(p){p.img=ev.target.result;save();renderProfile(id);renderSB();renderBN();renderHome();}};r.readAsDataURL(f);
}
function pickColor(n){S.color=n;updSw(n);}
function updSw(n){document.querySelectorAll('.sw').forEach(s=>s.classList.toggle('on',s.dataset.c==n));}

// ─── MEDICINE CRUD ───
function openAddMed(type,pid){
  S.editMId=null;S.mImg=null;S.times=[];
  S.repeat={type:'daily',days:[],every:2,startDate:todayStr()};
  S.target={type,pid:pid||null};
  ['m-name','m-desc','m-count','m-strip'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('m-type').value='tablet';
  document.getElementById('m-img-prev').innerHTML=`<div style="opacity:0.5">${I.pill}</div>`;
  document.querySelectorAll('#time-chips .chip,#strip-presets .chip').forEach(c=>c.classList.remove('on'));
  document.querySelectorAll('#time-chips .chip[data-custom]').forEach(c=>c.remove());
  document.getElementById('mm-title').textContent=type==='sos'?'Add SOS Medicine':'Add Medicine';
  document.getElementById('sched-grp').style.display=type==='sos'?'none':'block';
  syncRepeatUI();
  openModal('modal-medicine');
}
function openEditMed(mid,tid){
  let m;
  if(tid==='sos'){m=S.sosMeds.find(x=>x.id===mid);S.target={type:'sos',pid:null};}
  else{const p=S.profiles.find(x=>x.id===tid);m=p?.medicines.find(x=>x.id===mid);S.target={type:'profile',pid:tid};}
  if(!m)return;
  S.editMId=mid;S.mImg=m.img||null;S.times=[...(m.schedule||[])];
  S.repeat=m.repeat ? JSON.parse(JSON.stringify(m.repeat)) : {type:'daily',days:[],every:2,startDate:todayStr()};
  document.getElementById('m-name').value=m.name;
  document.getElementById('m-desc').value=m.desc||'';
  document.getElementById('m-count').value=m.count;
  document.getElementById('m-type').value=m.type||'tablet';
  document.getElementById('m-strip').value=m.stripSize||'';
  document.getElementById('m-img-prev').innerHTML=m.img?`<img src="${m.img}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`:`<div style="opacity:0.7">${mIco(m.type)}</div>`;
  document.querySelectorAll('#time-chips .chip[data-custom]').forEach(c=>c.remove());
  const presetTimes=['06:00','08:00','12:00','15:00','18:00','21:00','22:00'];
  document.querySelectorAll('#time-chips .chip').forEach(c=>c.classList.toggle('on',S.times.includes(c.dataset.t)));
  S.times.filter(t=>!presetTimes.includes(t)).forEach(t=>{
    const el=document.createElement('div');
    el.className='chip on';el.dataset.t=t;el.dataset.custom='1';el.textContent=fmt(t);
    el.onclick=()=>toggleTime(el);
    document.getElementById('time-chips').appendChild(el);
  });
  document.querySelectorAll('#strip-presets .chip').forEach(c=>c.classList.toggle('on',parseInt(c.dataset.s)===m.stripSize));
  document.getElementById('mm-title').textContent=tid==='sos'?'Edit SOS Medicine':'Edit Medicine';
  document.getElementById('sched-grp').style.display=tid==='sos'?'none':'block';
  syncRepeatUI();
  openModal('modal-medicine');
}
function saveMed(){
  const name=document.getElementById('m-name').value.trim();
  if(!name){toast('Please enter medicine name');return;}
  // Validate repeat
  const rep=S.repeat;
  if((rep.type==='weekdays'||rep.type==='weekly')&&(!rep.days||!rep.days.length)){
    toast('Please select at least one day');return;
  }
  const d={
    id:S.editMId||'m'+Date.now(),name,
    desc:document.getElementById('m-desc').value.trim(),
    count:parseInt(document.getElementById('m-count').value)||0,
    type:document.getElementById('m-type').value,
    stripSize:parseInt(document.getElementById('m-strip').value)||null,
    schedule:[...S.times],
    repeat:JSON.parse(JSON.stringify(rep)),
    img:S.mImg||null,
  };
  const{type,pid}=S.target;
  if(type==='sos'){
    if(S.editMId){const i=S.sosMeds.findIndex(x=>x.id===S.editMId);if(i!==-1)S.sosMeds[i]={...S.sosMeds[i],...d};}
    else S.sosMeds.push(d);
    closeModal('modal-medicine');save();renderSOS();
  }else{
    const p=S.profiles.find(x=>x.id===pid);if(!p)return;
    if(S.editMId){const i=p.medicines.findIndex(x=>x.id===S.editMId);if(i!==-1)p.medicines[i]={...p.medicines[i],...d};}
    else p.medicines.push(d);
    closeModal('modal-medicine');save();renderProfile(pid);renderHome();
  }
  calcAlerts();toast('Medicine saved');
}
function delMed(mid,tid){
  S.confirmCb=()=>{
    if(tid==='sos'){S.sosMeds=S.sosMeds.filter(m=>m.id!==mid);save();renderSOS();}
    else{const p=S.profiles.find(x=>x.id===tid);if(p){p.medicines=p.medicines.filter(m=>m.id!==mid);save();renderProfile(tid);renderHome();}}
    calcAlerts();toast('Medicine removed');
  };
  document.getElementById('confirm-title').textContent='Remove Medicine?';
  document.getElementById('confirm-msg').textContent='This will permanently remove this medicine and its history.';
  document.getElementById('confirm-ok').textContent='Remove';
  document.getElementById('confirm-overlay').classList.add('open');
}
function previewMImg(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=ev=>{S.mImg=ev.target.result;document.getElementById('m-img-prev').innerHTML=`<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`};r.readAsDataURL(f);
}
function updMImg(e,mid,tid){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=ev=>{
    let m=tid==='sos'?S.sosMeds.find(x=>x.id===mid):S.profiles.find(x=>x.id===tid)?.medicines.find(x=>x.id===mid);
    if(m){m.img=ev.target.result;save();if(tid==='sos')renderSOS();else{renderProfile(tid);renderHome();}}
  };r.readAsDataURL(f);
}

// ─── COUNT ───
function findM(mid,tid){return tid==='sos'?S.sosMeds.find(m=>m.id===mid):S.profiles.find(x=>x.id===tid)?.medicines.find(m=>m.id===mid);}
function adjCnt(mid,tid,d){const m=findM(mid,tid);if(!m)return;m.count=Math.max(0,m.count+d);save();refrsh(tid);calcAlerts();}
function setCnt(mid,tid,v){const m=findM(mid,tid);if(!m)return;m.count=Math.max(0,parseInt(v)||0);save();refrsh(tid);calcAlerts();}
function refrsh(tid){if(tid==='sos')renderSOS();else{renderProfile(tid);renderHome();}}

// ─── AUTO DECREMENT ───
// Only fires when app is open. Respects repeat schedule — won't deduct on off-days.
function autoDecrement(){
  const now=new Date(),dk=todayStr();
  S.profiles.forEach(p=>(p.medicines||[]).forEach(m=>{
    // Skip if not due today or as_needed
    if(!isDueToday(m)||(m.repeat&&m.repeat.type==='as_needed'))return;
    (m.schedule||[]).forEach(t=>{
      const[h,mi]=t.split(':').map(Number),sd=new Date();sd.setHours(h,mi,0,0);
      const autoKey=`auto_${m.id}_${dk}_${t}`;
      const doneKey=doseKey(m.id,t);
      if(!localStorage.getItem(autoKey)&&!localStorage.getItem(doneKey)&&sd<=now&&m.count>0){
        m.count=Math.max(0,m.count-1);
        localStorage.setItem(autoKey,'1');
        localStorage.setItem(doneKey,'1');
      }
    });
  }));
  save();renderAll();
}

// ─── ALERTS ───
function calcAlerts(){
  const al=[];
  S.profiles.forEach(p=>(p.medicines||[]).forEach(m=>{
    if(!m.count)al.push(`${p.name} — ${m.name} out of stock`);
    else if(m.count<=4)al.push(`${p.name} — ${m.name}: ${m.count} left`);
  }));
  S.sosMeds.forEach(m=>{
    if(!m.count)al.push(`SOS: ${m.name} out of stock`);
    else if(m.count<=4)al.push(`SOS: ${m.name}: ${m.count} left`);
  });
  const b=document.getElementById('nbadge');
  b.textContent=al.length;b.style.display=al.length?'flex':'none';
  document.getElementById('nlist').innerHTML=al.length
    ?al.map(a=>`<div class="nitem"><div class="ndot"></div><div><div class="nmsg">${a}</div><div class="ntime">Low stock alert</div></div></div>`).join('')
    :`<div style="padding:20px;text-align:center;font-size:13px;color:var(--text3);">All medicines well stocked ✓</div>`;
}
function toggleNotif(){document.getElementById('npanel').classList.toggle('open');}
document.addEventListener('click',e=>{if(!e.target.closest('#notif-btn')&&!e.target.closest('#npanel'))document.getElementById('npanel').classList.remove('open');});

// ─── TIME CHIPS ───
function toggleTime(el){
  const t=el.dataset.t;
  if(S.times.includes(t)){S.times=S.times.filter(x=>x!==t);el.classList.remove('on');}
  else{S.times.push(t);el.classList.add('on');}
}
function addCustomTime(){
  const v=document.getElementById('custom-t').value;if(!v)return;
  if(!S.times.includes(v)){
    S.times.push(v);
    const el=document.createElement('div');
    el.className='chip on';el.dataset.t=v;el.dataset.custom='1';el.textContent=fmt(v);
    el.onclick=()=>toggleTime(el);
    document.getElementById('time-chips').appendChild(el);
  }
  document.getElementById('custom-t').value='';
}

// ─── REPEAT UI ───
function setRepeatType(type){
  S.repeat.type=type;
  if(type==='every_n_days'&&!S.repeat.startDate)S.repeat.startDate=todayStr();
  syncRepeatUI();
}

function syncRepeatUI(){
  const type=S.repeat.type||'daily';
  // Update type selector chips
  document.querySelectorAll('.rtype-chip').forEach(c=>c.classList.toggle('on',c.dataset.rt===type));
  // Show/hide sub-panels
  document.getElementById('rp-days').style.display=(type==='weekdays'||type==='weekly')?'block':'none';
  document.getElementById('rp-every').style.display=type==='every_n_days'?'block':'none';
  // Weekly: single-select day chips; weekdays: multi-select
  const dayChips=document.querySelectorAll('.rday-chip');
  dayChips.forEach(c=>{
    c.classList.toggle('on',(S.repeat.days||[]).includes(parseInt(c.dataset.d)));
  });
  // every_n input
  const evEl=document.getElementById('r-every-n');
  if(evEl) evEl.value=S.repeat.every||2;
  const sdEl=document.getElementById('r-start-date');
  if(sdEl) sdEl.value=S.repeat.startDate||todayStr();
  // Update preview text
  updateRepeatPreview();
}

function toggleRepeatDay(el){
  const d=parseInt(el.dataset.d);
  const type=S.repeat.type;
  if(type==='weekly'){
    // single select
    S.repeat.days=[d];
    document.querySelectorAll('.rday-chip').forEach(c=>c.classList.toggle('on',parseInt(c.dataset.d)===d));
  } else {
    // multi select
    if((S.repeat.days||[]).includes(d)){
      S.repeat.days=S.repeat.days.filter(x=>x!==d);
      el.classList.remove('on');
    } else {
      S.repeat.days=[...(S.repeat.days||[]),d];
      el.classList.add('on');
    }
  }
  updateRepeatPreview();
}

function updateRepeatEvery(){
  S.repeat.every=parseInt(document.getElementById('r-every-n').value)||2;
  S.repeat.startDate=document.getElementById('r-start-date').value||todayStr();
  updateRepeatPreview();
}

function updateRepeatPreview(){
  const el=document.getElementById('repeat-preview');
  if(!el)return;
  const label=repeatLabel({repeat:S.repeat});
  el.textContent=label;
}

// ─── STRIP ───
function pickStrip(el,s){
  document.querySelectorAll('#strip-presets .chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');document.getElementById('m-strip').value=s;
}
function syncStripChip(v){
  const n=parseInt(v);
  document.querySelectorAll('#strip-presets .chip').forEach(c=>c.classList.toggle('on',parseInt(c.dataset.s)===n));
}

// ─── BUY STRIP ───
function openStrip(mid,tid){
  const m=findM(mid,tid);if(!m)return;
  S.bsCtx={mid,tid};
  const img=document.getElementById('bs-img');
  img.innerHTML=m.img?`<img src="${m.img}" style="width:100%;height:100%;object-fit:cover;border-radius:7px;">`:`<div style="opacity:0.8">${mIco(m.type)}</div>`;
  document.getElementById('bs-name').textContent=m.name;
  document.getElementById('bs-stock').textContent=`In stock: ${m.count} ${unit(m.type)}`;
  document.getElementById('bs-qty').value=1;
  document.getElementById('bs-size').value=m.stripSize||'';
  bsPrev();openModal('modal-strip');
}
function chgQty(d){
  const el=document.getElementById('bs-qty');
  el.value=Math.max(1,(parseInt(el.value)||1)+d);bsPrev();
}
document.addEventListener('input',e=>{if(e.target.id==='bs-qty'||e.target.id==='bs-size')bsPrev();});
function bsPrev(){
  const qty=parseInt(document.getElementById('bs-qty').value)||0;
  const sz=parseInt(document.getElementById('bs-size').value)||0;
  const pv=document.getElementById('bs-prev');
  if(!sz){pv.textContent='Enter strip size to preview';pv.className='sp';return;}
  const m=S.bsCtx?findM(S.bsCtx.mid,S.bsCtx.tid):null;
  pv.textContent=`${m?m.count:0} + ${qty*sz}  (${qty} × ${sz}) = ${(m?m.count:0)+qty*sz}`;
  pv.className='sp ready';
}
function confirmStrip(){
  const qty=parseInt(document.getElementById('bs-qty').value)||0;
  const sz=parseInt(document.getElementById('bs-size').value)||0;
  if(!sz){toast('Enter tablets per strip');return;}
  if(!qty){toast('Enter number of strips');return;}
  const{mid,tid}=S.bsCtx;const m=findM(mid,tid);if(!m)return;
  m.count+=qty*sz;m.stripSize=sz;
  save();closeModal('modal-strip');refrsh(tid);calcAlerts();
  toast(`Added ${qty*sz} tablets to ${m.name}`);
}

// ─── MODAL ───
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.moverlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');}));
document.getElementById('confirm-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeConfirm();});

// ─── TOAST ───
function toast(msg){
  const t=document.getElementById('toast');
  document.getElementById('t-msg').textContent=msg;
  t.className='toast';void t.offsetWidth;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2900);
}

// ─── PWA ───
function setupPWA(){
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();deferredInstall=e;
    document.getElementById('install-banner').classList.add('show');
  });
  window.addEventListener('appinstalled',()=>{
    document.getElementById('install-banner').classList.remove('show');
    deferredInstall=null;
  });
  const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone=window.navigator.standalone;
  if(isIOS&&!isStandalone&&!localStorage.getItem('ios-hint-dismissed')){
    const b=document.getElementById('install-banner');
    b.querySelector('span').textContent='On iOS: tap Share then "Add to Home Screen"';
    b.querySelector('.dismiss').onclick=()=>{b.classList.remove('show');localStorage.setItem('ios-hint-dismissed','1');};
    b.querySelector('button:not(.dismiss)').style.display='none';
    b.classList.add('show');
  }
}
function installPWA(){
  if(deferredInstall){deferredInstall.prompt();deferredInstall.userChoice.then(()=>{deferredInstall=null;document.getElementById('install-banner').classList.remove('show');});}
}

// ─── HELPERS ───
function fmt(t){const[h,m]=t.split(':').map(Number);return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;}
function unit(t){return t==='syrup'?'ml':t==='drops'?'doses':'tablets';}

init();

// ─── SERVICE WORKER ───
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js')
      .then(r=>console.log('MedVault SW:',r.scope))
      .catch(e=>console.log('SW fail:',e));
  });
}
