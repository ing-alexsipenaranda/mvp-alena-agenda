const calendar = document.querySelector('#week-grid');
const days = ['Lun 12','Mar 13','Mié 14','Jue 15','Vie 16'];
const times = ['9:00','10:00','11:00','2:00','3:00'];
const bookings = { '0-0':['Mateo','alt'], '2-0':['Sara',''], '4-0':['Nicolás','pending'], '1-1':['Camila',''], '3-1':['Valeria','alt'], '0-2':['Manuela','pending'], '2-2':['Andrés','alt'], '4-2':['Juliana',''], '1-3':['Laura',''], '3-3':['Simón','alt'], '0-4':['Daniela','alt'], '4-4':['Mariana',''] };
if (calendar) {
  calendar.append(document.createElement('div'));
  days.forEach(day => { const el=document.createElement('div'); el.className='day'; el.textContent=day; calendar.append(el); });
  times.forEach((time,row) => { const t=document.createElement('div'); t.className='time'; t.textContent=time; calendar.append(t); days.forEach((_,col)=>{ const cell=document.createElement('div'); const item=bookings[`${col}-${row}`]; if(item){cell.className=`appointment ${item[1]}`;cell.textContent=item[0]} calendar.append(cell); }); });
}

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}), {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const tagline = document.querySelector('.tagline');
if(tagline){ tagline.innerHTML=tagline.textContent.trim().split(' ').map(word=>`<span class="word">${word}</span>`).join(' '); const words=[...tagline.querySelectorAll('.word')]; const wordObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const index=words.indexOf(entry.target);setTimeout(()=>entry.target.classList.add('active'),index*55);wordObserver.unobserve(entry.target)}}),{threshold:.8}); words.forEach(word=>wordObserver.observe(word)); }

const menuButton=document.querySelector('.menu-button'); const navLinks=document.querySelector('#nav-links');
menuButton?.addEventListener('click',()=>{const open=menuButton.classList.toggle('open');navLinks.classList.toggle('open',open);menuButton.setAttribute('aria-expanded',String(open))});
navLinks?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menuButton?.classList.remove('open');navLinks.classList.remove('open');menuButton?.setAttribute('aria-expanded','false')}));

const modal=document.querySelector('#booking-modal'); const form=document.querySelector('#booking-form'); let currentStep=1;
function setStep(next){currentStep=next;document.querySelectorAll('.form-step').forEach(step=>step.classList.toggle('active',Number(step.dataset.step)===next));document.querySelectorAll('.booking-progress span').forEach((dot,index)=>dot.classList.toggle('active',index<next));}
document.querySelectorAll('[data-open-booking]').forEach(button=>button.addEventListener('click',()=>{setStep(1);form?.classList.remove('complete');form?.querySelector('.success-step')?.classList.remove('active');modal?.showModal()}));
document.querySelector('.modal-close')?.addEventListener('click',()=>modal.close());
document.querySelector('.close-success')?.addEventListener('click',()=>modal.close());
modal?.addEventListener('click',event=>{if(event.target===modal)modal.close()});
document.querySelectorAll('.form-next').forEach(button=>button.addEventListener('click',()=>setStep(Math.min(3,currentStep+1))));
document.querySelectorAll('.back-button').forEach(button=>button.addEventListener('click',()=>setStep(Math.max(1,currentStep-1))));
document.querySelectorAll('.date-options button,.time-options button').forEach(button=>button.addEventListener('click',()=>{button.parentElement.querySelectorAll('button').forEach(item=>item.classList.remove('selected'));button.classList.add('selected')}));
form?.addEventListener('submit',event=>{event.preventDefault();let valid=true;form.querySelectorAll('input[required]').forEach(input=>{const okay=input.checkValidity() && (input.name!=='phone'||input.value.replace(/\D/g,'').length>=7);input.closest('label').classList.toggle('invalid',!okay);if(!okay)valid=false});if(!valid)return;document.querySelector('#summary-service').textContent=new FormData(form).get('service');document.querySelectorAll('.form-step').forEach(step=>step.classList.remove('active'));form.querySelector('.success-step').classList.add('active');showToast('Reserva de demostración confirmada')});
form?.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>input.closest('label')?.classList.remove('invalid')));
function showToast(message){const toast=document.querySelector('.toast');toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2800)}
