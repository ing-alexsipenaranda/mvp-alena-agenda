(function(){
  const KEY='alenaAgendaDataV3';
  const LEGACY_KEY='alenaAppointmentsV2';
  const seed={version:3,updatedAt:new Date().toISOString(),
    appointments:[
      {id:'seed1',name:'Camila Rojas',phone:'3004102231',email:'camila@example.com',date:'2026-10-15',time:'09:00',service:'Hidratación capilar',professional:'Juliana Castro',status:'confirmed',source:'admin',createdAt:'2026-10-12T14:20:00.000Z'},
      {id:'seed2',name:'Andrés Moreno',phone:'3157724088',email:'andres@example.com',date:'2026-10-15',time:'10:30',service:'Corte y barba',professional:'Santiago Ruiz',status:'confirmed',source:'admin',createdAt:'2026-10-13T18:10:00.000Z'},
      {id:'seed3',name:'Valentina Torres',phone:'3018846152',email:'valentina@example.com',date:'2026-10-15',time:'14:00',service:'Diseño de color',professional:'Laura Mejía',status:'pending',source:'web',createdAt:'2026-10-14T16:35:00.000Z'},
      {id:'seed4',name:'Mariana López',phone:'3206918443',email:'mariana@example.com',date:'2026-10-15',time:'15:30',service:'Hidratación capilar',professional:'Juliana Castro',status:'confirmed',source:'web',createdAt:'2026-10-14T19:05:00.000Z'}
    ],
    services:[
      {id:'svc1',name:'Corte y barba',price:52000,duration:60},
      {id:'svc2',name:'Diseño de color',price:145000,duration:150},
      {id:'svc3',name:'Hidratación capilar',price:68000,duration:45}
    ],
    team:[
      {id:'team1',name:'Santiago Ruiz',role:'Barbero',commissionRate:0.35},
      {id:'team2',name:'Laura Mejía',role:'Colorista',commissionRate:0.35},
      {id:'team3',name:'Juliana Castro',role:'Esteticista',commissionRate:0.35}
    ],
    inventory:[
      {id:'inv1',name:'Shampoo reparación',category:'Cuidado capilar',cost:28400,price:54000,stock:18},
      {id:'inv2',name:'Cera mate 100 ml',category:'Barbería',cost:16800,price:36000,stock:3},
      {id:'inv3',name:'Mascarilla hidratante',category:'Tratamientos',cost:34200,price:72000,stock:11},
      {id:'inv4',name:'Protector térmico',category:'Cuidado capilar',cost:22600,price:48000,stock:4}
    ],
    sales:[],
    settings:{businessName:'Casa Luma',location:'Laureles, Medellín'}};
  const clone=value=>JSON.parse(JSON.stringify(value));
  function validAppointment(item){return item&&typeof item.id==='string'&&typeof item.name==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(item.date||'')&&/^\d{2}:\d{2}$/.test(item.time||'')}
  function validNamed(item){return item&&typeof item.id==='string'&&typeof item.name==='string'}
  function validService(item){return validNamed(item)&&Number.isFinite(item.price)&&Number.isFinite(item.duration)}
  function validTeamMember(item){return validNamed(item)&&typeof item.role==='string'&&Number.isFinite(item.commissionRate)}
  function validProduct(item){return validNamed(item)&&Number.isFinite(item.cost)&&Number.isFinite(item.price)&&Number.isFinite(item.stock)}
  function validSale(item){return item&&typeof item.id==='string'&&typeof item.productId==='string'&&Number.isFinite(item.qty)&&Number.isFinite(item.total)&&typeof item.date==='string'}
  function normalize(data){
    const safe=data&&typeof data==='object'?data:{};
    return{
      version:3,
      updatedAt:safe.updatedAt||new Date().toISOString(),
      appointments:Array.isArray(safe.appointments)?safe.appointments.filter(validAppointment):[],
      services:Array.isArray(safe.services)?safe.services.filter(validService):[],
      team:Array.isArray(safe.team)?safe.team.filter(validTeamMember):[],
      inventory:Array.isArray(safe.inventory)?safe.inventory.filter(validProduct):[],
      sales:Array.isArray(safe.sales)?safe.sales.filter(validSale):[],
      settings:{...seed.settings,...(safe.settings||{})}
    }
  }
  function persist(data){const next=normalize(data);next.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent('alena:data',{detail:clone(next)}));return clone(next)}
  function load(){try{const raw=localStorage.getItem(KEY);if(raw)return normalize(JSON.parse(raw));const legacy=localStorage.getItem(LEGACY_KEY);if(legacy){const migrated=clone(seed);const rows=JSON.parse(legacy);if(Array.isArray(rows)&&rows.length)migrated.appointments=rows.filter(validAppointment);return persist(migrated)}}catch(error){console.warn('No fue posible leer los datos locales. Se restauró la demostración.',error)}return persist(clone(seed))}
  function appointments(){return load().appointments}
  function addAppointment(item){const data=load();const appointment={...item,id:item.id||`apt_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,createdAt:item.createdAt||new Date().toISOString()};data.appointments.push(appointment);persist(data);return clone(appointment)}
  function updateAppointment(id,changes){const data=load();const index=data.appointments.findIndex(item=>item.id===id);if(index<0)return null;data.appointments[index]={...data.appointments[index],...changes,updatedAt:new Date().toISOString()};persist(data);return clone(data.appointments[index])}
  function isSlotTaken({date,time,professional,excludeId}){return appointments().some(item=>item.id!==excludeId&&item.status!=='cancelled'&&item.date===date&&item.time===time&&item.professional===professional)}

  function addRecord(collection,item){const data=load();const record={...item,id:item.id||`${collection}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,createdAt:item.createdAt||new Date().toISOString()};data[collection].push(record);persist(data);return clone(record)}
  function updateRecord(collection,id,changes){const data=load();const index=data[collection].findIndex(item=>item.id===id);if(index<0)return null;data[collection][index]={...data[collection][index],...changes,updatedAt:new Date().toISOString()};persist(data);return clone(data[collection][index])}
  function deleteRecord(collection,id){const data=load();const index=data[collection].findIndex(item=>item.id===id);if(index<0)return false;data[collection].splice(index,1);persist(data);return true}

  function services(){return load().services}
  function addService(item){return addRecord('services',item)}
  function updateService(id,changes){return updateRecord('services',id,changes)}
  function deleteService(id){return deleteRecord('services',id)}

  function team(){return load().team}
  function addTeamMember(item){return addRecord('team',item)}
  function updateTeamMember(id,changes){return updateRecord('team',id,changes)}
  function deleteTeamMember(id){return deleteRecord('team',id)}

  function inventory(){return load().inventory}
  function addProduct(item){return addRecord('inventory',item)}
  function updateProduct(id,changes){return updateRecord('inventory',id,changes)}
  function deleteProduct(id){return deleteRecord('inventory',id)}

  function sales(){return load().sales}
  function addSale({productId,qty}){
    const data=load();
    const product=data.inventory.find(item=>item.id===productId);
    const quantity=Math.max(1,Math.floor(Number(qty)||0));
    if(!product||product.stock<quantity)return null;
    product.stock-=quantity;
    const sale={id:`sale_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,productId,productName:product.name,qty:quantity,unitPrice:product.price,total:product.price*quantity,date:new Date().toISOString().slice(0,10),createdAt:new Date().toISOString()};
    data.sales.push(sale);
    persist(data);
    return clone(sale);
  }

  function reset(){return persist(clone(seed))}
  function exportData(){return JSON.stringify(load(),null,2)}
  window.addEventListener('storage',event=>{if(event.key===KEY)window.dispatchEvent(new CustomEvent('alena:data',{detail:load()}))});
  window.AlenaStore={
    key:KEY,load,appointments,addAppointment,updateAppointment,isSlotTaken,reset,exportData,
    services,addService,updateService,deleteService,
    team,addTeamMember,updateTeamMember,deleteTeamMember,
    inventory,addProduct,updateProduct,deleteProduct,
    sales,addSale
  };
})();
