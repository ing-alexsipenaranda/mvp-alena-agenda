(function(){
  const KEY='alenaAgendaDataV3';
  const LEGACY_KEY='alenaAppointmentsV2';
  const seed={version:3,updatedAt:new Date().toISOString(),appointments:[
    {id:'seed1',name:'Camila Rojas',phone:'3004102231',email:'camila@example.com',date:'2026-10-15',time:'09:00',service:'Hidratación capilar',professional:'Juliana Castro',status:'confirmed',source:'admin',createdAt:'2026-10-12T14:20:00.000Z'},
    {id:'seed2',name:'Andrés Moreno',phone:'3157724088',email:'andres@example.com',date:'2026-10-15',time:'10:30',service:'Corte y barba',professional:'Santiago Ruiz',status:'confirmed',source:'admin',createdAt:'2026-10-13T18:10:00.000Z'},
    {id:'seed3',name:'Valentina Torres',phone:'3018846152',email:'valentina@example.com',date:'2026-10-15',time:'14:00',service:'Diseño de color',professional:'Laura Mejía',status:'pending',source:'web',createdAt:'2026-10-14T16:35:00.000Z'},
    {id:'seed4',name:'Mariana López',phone:'3206918443',email:'mariana@example.com',date:'2026-10-15',time:'15:30',service:'Hidratación capilar',professional:'Juliana Castro',status:'confirmed',source:'web',createdAt:'2026-10-14T19:05:00.000Z'}
  ],settings:{businessName:'Casa Luma',location:'Laureles, Medellín'}};
  const clone=value=>JSON.parse(JSON.stringify(value));
  function validAppointment(item){return item&&typeof item.id==='string'&&typeof item.name==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(item.date||'')&&/^\d{2}:\d{2}$/.test(item.time||'')}
  function normalize(data){const safe=data&&typeof data==='object'?data:{};return{version:3,updatedAt:safe.updatedAt||new Date().toISOString(),appointments:Array.isArray(safe.appointments)?safe.appointments.filter(validAppointment):[],settings:{...seed.settings,...(safe.settings||{})}}}
  function persist(data){const next=normalize(data);next.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent('alena:data',{detail:clone(next)}));return clone(next)}
  function load(){try{const raw=localStorage.getItem(KEY);if(raw)return normalize(JSON.parse(raw));const legacy=localStorage.getItem(LEGACY_KEY);if(legacy){const migrated=clone(seed);const rows=JSON.parse(legacy);if(Array.isArray(rows)&&rows.length)migrated.appointments=rows.filter(validAppointment);return persist(migrated)}}catch(error){console.warn('No fue posible leer los datos locales. Se restauró la demostración.',error)}return persist(clone(seed))}
  function appointments(){return load().appointments}
  function addAppointment(item){const data=load();const appointment={...item,id:item.id||`apt_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,createdAt:item.createdAt||new Date().toISOString()};data.appointments.push(appointment);persist(data);return clone(appointment)}
  function updateAppointment(id,changes){const data=load();const index=data.appointments.findIndex(item=>item.id===id);if(index<0)return null;data.appointments[index]={...data.appointments[index],...changes,updatedAt:new Date().toISOString()};persist(data);return clone(data.appointments[index])}
  function isSlotTaken({date,time,professional,excludeId}){return appointments().some(item=>item.id!==excludeId&&item.status!=='cancelled'&&item.date===date&&item.time===time&&item.professional===professional)}
  function reset(){return persist(clone(seed))}
  function exportData(){return JSON.stringify(load(),null,2)}
  window.addEventListener('storage',event=>{if(event.key===KEY)window.dispatchEvent(new CustomEvent('alena:data',{detail:load()}))});
  window.AlenaStore={key:KEY,load,appointments,addAppointment,updateAppointment,isSlotTaken,reset,exportData};
})();
