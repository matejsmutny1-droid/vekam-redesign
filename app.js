'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
let galleries = [], photos = [], selectedPhotos = [], galleryLimit = 12, photoIndex = 0;
const names = ['Bytová architektúra','Krby','Kuchynské pracovné dosky','Kúpeľne','Obklady fasád','Pomníkové zostavy','Portálové obstavby','Sakrálne prvky','Schody','Podlahy'];
const dialogs = $$('dialog');
function syncScroll() { document.body.classList.toggle('modal-open', dialogs.some(d => d.open)); }
function openDialog(id) { const d = document.getElementById(id); if (!d.open) d.showModal(); syncScroll(); }
function closeDialog(id) { document.getElementById(id).close(); syncScroll(); }
$$('[data-close]').forEach(b => b.addEventListener('click', () => closeDialog(b.dataset.close)));
dialogs.forEach(d => { d.addEventListener('close', syncScroll); d.addEventListener('click', e => {if(e.target === d) { const r = d.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) d.close(); }}); });
$('.menu-toggle').addEventListener('click', e => { const b = e.currentTarget; const open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', open); b.setAttribute('aria-label', open ? 'Zavrieť menu' : 'Otvoriť menu'); $('.nav').classList.toggle('open', open); });
$$('.nav a').forEach(a => a.addEventListener('click', () => { $('.nav').classList.remove('open'); $('.menu-toggle').setAttribute('aria-expanded','false'); $('.menu-toggle').setAttribute('aria-label','Otvoriť menu'); }));
const galleryReady = fetch('gallery.json').then(r => {if(!r.ok) throw Error(); return r.json();}).then(data => {
 galleries = data.map((g,i) => ({...g,name:names[i]}));
 photos = galleries.flatMap((g,i) => g.images.map((im,n) => ({...im,category:i,name:g.name,number:n+1})));
 const select = $('#gallery-category');
 galleries.forEach((g,i) => {const o=document.createElement('option');o.value=i;o.textContent=`${g.name} (${g.images.length})`;select.append(o);});
 return true;
}).catch(() => { $('#gallery-grid').innerHTML='<p>Galériu sa nepodarilo načítať. <a href="https://vekam.sk/fotogaleria/">Otvoriť pôvodnú galériu ↗</a></p>'; return false; });
function renderGallery() {
 const category=$('#gallery-category').value;
 selectedPhotos = category === 'all' ? photos : photos.filter(p => p.category === Number(category));
 const grid=$('#gallery-grid');grid.replaceChildren();
 selectedPhotos.slice(0,galleryLimit).forEach((p,i) => {
  const b=document.createElement('button');b.className='gallery-item';b.setAttribute('aria-label',`${p.name}, fotografia ${p.number}, zväčšiť`);
  const img=document.createElement('img');img.src=p.src.replace('.jpg','-thumb.jpg');img.alt=`${p.name} – realizácia VEKAM ${p.number}`;img.loading='lazy';img.width=600;img.height=460;
  const label=document.createElement('span');label.textContent=p.name;b.append(img,label);b.addEventListener('click',()=>showPhoto(i));grid.append(b);
 });
 $('#gallery-count').textContent=`${selectedPhotos.length} fotografií`;
 $('#load-more').hidden=galleryLimit>=selectedPhotos.length;
}
async function openGallery(category='all') {openDialog('gallery-dialog');if(await galleryReady) {$('#gallery-category').value=String(category);galleryLimit=12;renderGallery();$('#gallery-dialog').scrollTop=0;}}
$$('[data-gallery]').forEach(b=>b.addEventListener('click',()=>openGallery(b.dataset.gallery)));
$('#gallery-category').addEventListener('change',()=>{galleryLimit=12;renderGallery();});
$('#load-more').addEventListener('click',()=>{const previous=galleryLimit;galleryLimit+=12;renderGallery();const next=$$('.gallery-item')[previous];if(next)next.focus({preventScroll:true});});
function updatePhoto() {const p=selectedPhotos[photoIndex];if(!p)return;$('#lightbox-image').src=p.src;$('#lightbox-image').alt=`${p.name} – realizácia VEKAM ${p.number}`;$('#lightbox-caption').textContent=`${p.name} · ${photoIndex+1} / ${selectedPhotos.length}`;}
function showPhoto(index) {photoIndex=index;updatePhoto();openDialog('lightbox');}
$$('[data-photo]').forEach(b=>b.addEventListener('click',async()=>{if(await galleryReady){selectedPhotos=photos;const i=photos.findIndex(p=>p.src===`assets/photo-${b.dataset.photo}.jpg`);showPhoto(i);}}));
function movePhoto(step){photoIndex=(photoIndex+step+selectedPhotos.length)%selectedPhotos.length;updatePhoto();}
$('.lightbox-prev').addEventListener('click',()=>movePhoto(-1));$('.lightbox-next').addEventListener('click',()=>movePhoto(1));
$('#lightbox').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();movePhoto(1);}if(e.key==='ArrowLeft'){e.preventDefault();movePhoto(-1);}});
const materials=[{text:'Výrazná štruktúra a prirodzená pevnosť. V našej ponuke nájdete žulu pre kuchynské dosky, schody aj ďalšie kamenárske riešenia.',photo:43,name:'ŽULA',position:'70% 80%',scale:2.4},{text:'Neopakovateľná kresba a osobitý charakter. Mramor prináša do interiérov, krbových obstavieb a architektúry prirodzenú eleganciu.',photo:159,name:'MRAMOR',position:'45% 55%',scale:2.5},{text:'Teplé prírodné odtiene a jemná štruktúra. Pieskovec patrí do našej ponuky materiálov pre individuálne kamenárske riešenia.',photo:15,name:'PIESKOVEC',position:'60% 30%',scale:3},{text:'Kameň s jedinečnou kresbou. V ponuke VEKAM nájdete aj dekoratívne ónyxové lampy v rôznych veľkostiach.',photo:0,name:'ÓNYX',position:'45% 30%',scale:3}];
function selectMaterial(index,focus=false){const m=materials[index];$$('[data-material]').forEach((b,i)=>{b.setAttribute('aria-selected',i===index);b.tabIndex=i===index?0:-1;if(i===index&&focus)b.focus();});$('#material-panel').setAttribute('aria-labelledby',`mat-${index}`);$('#material-text').textContent=m.text;}
$$('[data-material]').forEach((b,i)=>{b.addEventListener('click',()=>selectMaterial(i));b.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%4;else if(e.key==='ArrowLeft')n=(i+3)%4;else if(e.key==='Home')n=0;else if(e.key==='End')n=3;else return;e.preventDefault();selectMaterial(n,true);});});
fetch('projects.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{const list=$('#projects-list');data.forEach(p=>{const d=document.createElement('details');d.className='project-row';const s=document.createElement('summary');const year=document.createElement('span');year.textContent=p.year;const h=document.createElement('h3');h.textContent=p.title;const plus=document.createElement('span');plus.className='plus';s.append(year,h,plus);const body=document.createElement('div');body.className='project-content';body.innerHTML=p.html;$$('a',body).forEach(a=>{a.target='_blank';a.rel='noopener';});$$('img',body).forEach(im=>{im.loading='lazy';if(!im.alt)im.alt='Pôvodná projektová dokumentácia VEKAM';});d.append(s,body);list.append(d);});}).catch(()=>{$('#projects-list').innerHTML='<p><a class="text-link" href="https://vekam.sk/">Projektové informácie na pôvodnom webe ↗</a></p>';});
$('#write-us').addEventListener('click',()=>openDialog('contact-dialog'));
$('#contact-form').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const subject=f.get('subject').trim()||'Dopyt z webu VEKAM';const body=`Meno: ${f.get('name')}\nE-mail: ${f.get('email')}\n\n${f.get('message')}`;window.location.href=`mailto:vekam@vekam.sk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;$('#form-result').textContent='Správa je pripravená vo vašej e-mailovej aplikácii. Ak sa neotvorila, napíšte nám priamo na vekam@vekam.sk.';});
$('#year').textContent=new Date().getFullYear();
