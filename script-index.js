document.addEventListener('DOMContentLoaded',function(){
var prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
var isMobile=window.matchMedia('(hover: none) and (pointer: coarse)');
var connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
var slowConnection=connection&&(connection.effectiveType==='2g'||connection.effectiveType==='slow-2g'||connection.saveData);
var isReduced=prefersReducedMotion.matches||slowConnection;

ScrollTrigger.config({limitCallbacks:true,syncInterval:50,autoRefreshEvents:'visibilitychange,DOMContentLoaded,load'});

var lenis=new Lenis({
duration:1.45,
easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},
smoothWheel:!isReduced,
touchMultiplier:1.5,
infinite:false,
orientation:'vertical',
gestureOrientation:'vertical',
smoothTouch:false
});

gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll',ScrollTrigger.update);
gsap.ticker.add(function(time){lenis.raf(time*1000)});
gsap.ticker.lagSmoothing(0);

var nav=document.getElementById('nav');
var navTicking=false;
lenis.on('scroll',function(e){
if(!navTicking){navTicking=true;requestAnimationFrame(function(){nav.classList.toggle('scrolled',e.scroll>48);navTicking=false})}
});

function createGrain(){
var grainEl=document.querySelector('.grain');
if(!grainEl||isReduced)return;
var c=document.createElement('canvas');
c.width=256;c.height=256;
var ctx=c.getContext('2d');
var img=ctx.createImageData(256,256);
var d=img.data;
for(var i=0;i<d.length;i+=4){var v=Math.random()*255;d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=18}
ctx.putImageData(img,0,0);
grainEl.style.backgroundImage='url('+c.toDataURL('image/png')+')';
grainEl.style.backgroundSize='256px 256px';
grainEl.style.opacity='1';
}
createGrain();

var dot=document.querySelector('.cursor-dot');
var ring=document.querySelector('.cursor-ring');
var mouseX=0,mouseY=0,dotX=0,dotY=0,ringX=0,ringY=0;

if(!isMobile.matches&&!isReduced){
document.addEventListener('mousemove',function(e){
mouseX=e.clientX;mouseY=e.clientY;
dot.style.opacity='1';ring.style.opacity='1';
});

document.addEventListener('mousedown',function(){ring.classList.add('clicking')});
document.addEventListener('mouseup',function(){ring.classList.remove('clicking')});

var hovers=document.querySelectorAll('a,button,.magnetic,.dev-card,.h-card,.partner-badge,.faq-q,.atag');
for(var h=0;h<hovers.length;h++){
(function(el){
el.addEventListener('mouseenter',function(){ring.classList.add('hovering')});
el.addEventListener('mouseleave',function(){ring.classList.remove('hovering')});
})(hovers[h]);
}

function animateCursor(){
dotX+=(mouseX-dotX)*.25;dotY+=(mouseY-dotY)*.25;
ringX+=(mouseX-ringX)*.12;ringY+=(mouseY-ringY)*.12;
dot.style.transform='translate('+(dotX-3)+'px,'+(dotY-3)+'px)';
ring.style.transform='translate('+(ringX-20)+'px,'+(ringY-20)+'px)';
requestAnimationFrame(animateCursor);
}
animateCursor();
}

function initMagnetic(){
if(isMobile.matches||isReduced)return;
var magnetics=document.querySelectorAll('.magnetic');
for(var m=0;m<magnetics.length;m++){
(function(el){
el.addEventListener('mousemove',function(e){
var rect=el.getBoundingClientRect();
var x=e.clientX-rect.left-rect.width/2;
var y=e.clientY-rect.top-rect.height/2;
el.style.transform='translate('+(x*.2)+'px,'+(y*.2)+'px)';
});
el.addEventListener('mouseleave',function(){el.style.transform='translate(0,0)'});
})(magnetics[m]);
}
}
initMagnetic();

var threeOk=typeof THREE!=='undefined'&&!isReduced&&!isMobile.matches;

function initThree(){
if(!threeOk)return;
try{
var canvas=document.getElementById('bg-canvas');
if(!canvas)return;
var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,100);
camera.position.z=5;
var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:false,powerPreference:'high-performance'});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));

var pCount=600;
var pPos=new Float32Array(pCount*3);
for(var i=0;i<pCount*3;i++){pPos[i]=(Math.random()-.5)*20}
var pGeo=new THREE.BufferGeometry();
pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
var pMat=new THREE.PointsMaterial({size:0.015,color:0xEAB308,transparent:true,opacity:0.35,blending:THREE.AdditiveBlending,depthWrite:false});
var particles=new THREE.Points(pGeo,pMat);
scene.add(particles);

var shapes=[];
var sMats=[
new THREE.MeshBasicMaterial({color:0x5865F2,wireframe:true,transparent:true,opacity:0.06}),
new THREE.MeshBasicMaterial({color:0xEAB308,wireframe:true,transparent:true,opacity:0.04})
];
var geos=[
function(){return new THREE.IcosahedronGeometry(.5+Math.random()*.4,1)},
function(){return new THREE.OctahedronGeometry(.4+Math.random()*.3,0)},
function(){return new THREE.TetrahedronGeometry(.35+Math.random()*.3,0)}
];
for(var s=0;s<5;s++){
var geo=geos[s%3]();
var mat=sMats[s%2].clone();
var mesh=new THREE.Mesh(geo,mat);
mesh.position.set((Math.random()-.5)*14,(Math.random()-.5)*10,(Math.random()-.5)*8-2);
mesh.rotation.set(Math.random()*Math.PI*2,Math.random()*Math.PI*2,0);
mesh.userData={rx:(Math.random()-.5)*.003,ry:(Math.random()-.5)*.003,fs:.3+Math.random()*.4,fa:.15+Math.random()*.25,by:mesh.position.y};
scene.add(mesh);
shapes.push(mesh);
}

var lineGeo=new THREE.BufferGeometry();
var lineCount=80;
var linePos=new Float32Array(lineCount*6);
for(var l=0;l<lineCount;l++){
var idx=l*6;
linePos[idx]=(Math.random()-.5)*16;linePos[idx+1]=(Math.random()-.5)*12;linePos[idx+2]=(Math.random()-.5)*8;
linePos[idx+3]=linePos[idx]+(Math.random()-.5)*2;linePos[idx+4]=linePos[idx+1]+(Math.random()-.5)*2;linePos[idx+5]=linePos[idx+2]+(Math.random()-.5)*2;
}
lineGeo.setAttribute('position',new THREE.BufferAttribute(linePos,3));
var lineMat=new THREE.LineBasicMaterial({color:0x5865F2,transparent:true,opacity:0.04});
var lines=new THREE.LineSegments(lineGeo,lineMat);
scene.add(lines);

var targetMX=0,targetMY=0,mouseCamX=0,mouseCamY=0;
document.addEventListener('mousemove',function(e){
targetMX=(e.clientX/window.innerWidth)*2-1;
targetMY=-(e.clientY/window.innerHeight)*2+1;
});

var scrollProgress=0;
lenis.on('scroll',function(e){scrollProgress=e.scroll/(document.body.scrollHeight-window.innerHeight)});

var clock=new THREE.Clock();
function animate(){
requestAnimationFrame(animate);
var t=clock.getElapsedTime();
mouseCamX+=(targetMX-mouseCamX)*.03;
mouseCamY+=(targetMY-mouseCamY)*.03;
camera.position.x=mouseCamX*.4;
camera.position.y=mouseCamY*.3;
camera.lookAt(0,0,0);
particles.rotation.y=t*.01;
particles.rotation.x=Math.sin(t*.006)*.12;
for(var i=0;i<shapes.length;i++){
var sh=shapes[i];
sh.rotation.x+=sh.userData.rx;
sh.rotation.y+=sh.userData.ry;
sh.position.y=sh.userData.by+Math.sin(t*sh.userData.fs)*sh.userData.fa;
}
lines.rotation.y=t*.005;
lines.rotation.x=Math.sin(t*.003)*.08;
renderer.render(scene,camera);
}
animate();

window.addEventListener('resize',function(){
camera.aspect=window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth,window.innerHeight);
});

}catch(e){}
}
initThree();

function initVideo(){
var video=document.getElementById('heroBg');
var muteBtn=document.getElementById('muteBtn');
var muteIcon=document.getElementById('muteIcon');
if(!video)return;

function updateMuteUI(){
muteIcon.className=video.muted?'fa-solid fa-volume-xmark':'fa-solid fa-volume-high';
}

function ensurePlaying(){if(video.paused&&!document.hidden)video.play().catch(function(){})}

video.addEventListener('pause',ensurePlaying);
video.addEventListener('ended',ensurePlaying);
document.addEventListener('visibilitychange',function(){if(!document.hidden)ensurePlaying()});

if(muteBtn){
muteBtn.addEventListener('click',function(){
video.muted=!video.muted;
if(!video.muted)video.volume=1;
updateMuteUI();
if(video.paused)video.play().catch(function(){});
});

['click','touchstart','keydown'].forEach(function(evt){
document.addEventListener(evt,function(){
if(video.muted){video.muted=false;video.volume=1;video.play().then(function(){updateMuteUI()}).catch(function(){video.muted=true;updateMuteUI()})}
},{once:true,passive:true});
});
}

video.play().then(function(){
if(!isReduced){video.muted=false;video.volume=1}
updateMuteUI();
}).catch(function(){video.muted=true;updateMuteUI()});
}
initVideo();

function initPreloader(){
var preloader=document.getElementById('preloader');
if(!preloader){initPage();return}
var letters=preloader.querySelectorAll('.preloader-name span');
var fill=preloader.querySelector('.preloader-line-fill');

var tl=gsap.timeline({
onComplete:function(){
preloader.classList.add('done');
setTimeout(function(){preloader.style.display='none'},1500);
initPage();
}
});

tl.to(letters,{opacity:1,y:0,duration:.6,stagger:.04,ease:'power3.out'})
.to({},{duration:1.2,onUpdate:function(){fill.style.width=(this.progress()*100)+'%'}})
.to(letters,{opacity:0,y:-30,duration:.4,stagger:.02,ease:'power2.in'},'+=.15');
}
initPreloader();

function initPage(){
document.documentElement.classList.remove('loading');
document.documentElement.classList.add('js-loaded');

initAnimations();
initHorizontalScroll();
initTiltCards();
initFAQ();
initPrefetch();
}

function initAnimations(){
var heroTl=gsap.timeline({delay:isReduced?0:0.2,defaults:{ease:'power4.out'}});

heroTl.to('.h-line-inner',{y:0,duration:isReduced?0:1.3,stagger:isReduced?0:.12})
.to('.hero-sub',{opacity:1,y:0,duration:isReduced?0:1},isReduced?0:'-=0.7')
.to('.hero-card',{opacity:1,y:0,duration:isReduced?0:1},isReduced?0:'-=0.6')
.to('.scroll-cue',{opacity:isReduced?1:1,duration:isReduced?0:.8},isReduced?0:'-=0.4')
.to('.video-mute-btn',{opacity:1,duration:isReduced?0:.5},isReduced?0:'-=0.6');

if(!isReduced){
lenis.on('scroll',function(e){
if(e.scroll>120){
gsap.to('.scroll-cue',{opacity:0,duration:.4,onComplete:function(){
var sc=document.querySelector('.scroll-cue');if(sc)sc.style.pointerEvents='none';
}});
}
},{once:true});

gsap.to('.hero-title',{yPercent:25,opacity:.3,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});
gsap.to('.hero-sub',{yPercent:40,opacity:0,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'60% top',scrub:true}});
gsap.to('.hero-card',{yPercent:60,opacity:0,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'50% top',scrub:true}});
}

gsap.utils.toArray('.reveal').forEach(function(el){
gsap.to(el,{opacity:1,y:0,duration:isReduced?0:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 93%',toggleActions:'play none none none',once:true}});
});

if(!isReduced){
gsap.utils.toArray('.section-label-text').forEach(function(label){
gsap.to(label,{x:0,ease:'none',scrollTrigger:{trigger:label.parentElement,start:'top bottom',end:'top center',scrub:2}});
});
}

gsap.utils.toArray('.collab-item img').forEach(function(img){
if(isReduced)return;
var container=img.closest('.collab-item');
if(!container)return;
gsap.fromTo(img,{yPercent:-4},{yPercent:4,ease:'none',scrollTrigger:{trigger:container,start:'top bottom',end:'bottom top',scrub:1.5,invalidateOnRefresh:true}});
});

gsap.utils.toArray('.h-card-img img').forEach(function(img){
if(isReduced)return;
var container=img.closest('.h-card');
if(!container)return;
gsap.fromTo(img,{scale:1.15},{scale:1,ease:'none',scrollTrigger:{trigger:container,start:'top bottom',end:'bottom top',scrub:2,containerAnimation:hTween,invalidateOnRefresh:true}});
});

var ctaLine=gsap.utils.toArray('.cta-line-inner, .cta-sub-inner');
ctaLine.forEach(function(el,i){
gsap.to(el,{y:0,duration:isReduced?0:1.15,ease:'power4.out',delay:isReduced?0:i*.13,scrollTrigger:{trigger:el.parentElement,start:'top 92%',toggleActions:'play none none none',once:true}});
});

var marqueeStrips=document.querySelectorAll('.marquee-strip');
marqueeStrips.forEach(function(strip){
if(isReduced)return;
gsap.fromTo(strip,{xPercent:-5},{xPercent:0,ease:'none',scrollTrigger:{trigger:strip,start:'top bottom',end:'bottom top',scrub:2}});
});
}

var hTween=null;

function initHorizontalScroll(){
if(window.innerWidth<=768||isReduced)return;

var hTrack=document.querySelector('.horizontal-track');
if(!hTrack)return;

var totalWidth=hTrack.scrollWidth-window.innerWidth+100;

hTween=gsap.to(hTrack,{
x:function(){return -totalWidth},
ease:'none',
scrollTrigger:{
trigger:'#work',
pin:'.horizontal-viewport',
scrub:1.2,
end:function(){return '+='+(totalWidth*1.3)},
invalidateOnRefresh:true
}
});

gsap.utils.toArray('.h-card').forEach(function(card){
gsap.from(card.querySelector('.h-card-content'),{
y:50,opacity:0,
scrollTrigger:{
trigger:card,
containerAnimation:hTween,
start:'left 80%',
toggleActions:'play none none none'
}
});
});
}

function initTiltCards(){
if(isMobile.matches||isReduced)return;
var cards=document.querySelectorAll('[data-tilt]');
cards.forEach(function(card){
card.addEventListener('mousemove',function(e){
var rect=card.getBoundingClientRect();
var x=e.clientX-rect.left;
var y=e.clientY-rect.top;
var midX=rect.width/2;
var midY=rect.height/2;
var rotY=((x-midX)/midX)*8;
var rotX=((y-midY)/midY)*-8;
card.style.transform='perspective(800px) rotateX('+rotX+'deg) rotateY('+rotY+'deg) scale3d(1.02,1.02,1.02)';
var shine=card.querySelector('.card-shine');
if(shine){shine.style.background='radial-gradient(circle at '+x+'px '+y+'px, rgba(255,255,255,0.06) 0%, transparent 65%)'}
});
card.addEventListener('mouseleave',function(){
card.style.transition='transform .5s cubic-bezier(.25,.46,.45,.94)';
card.style.transform='perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
var shine=card.querySelector('.card-shine');
if(shine){shine.style.background='transparent'}
setTimeout(function(){card.style.transition=''},500);
});
card.addEventListener('mouseenter',function(){card.style.transition=''});
});
}

function initFAQ(){
var faqBtns=document.querySelectorAll('.faq-q');
faqBtns.forEach(function(btn){
btn.addEventListener('click',function(){
var answer=btn.nextElementSibling;
var isOpen=btn.classList.contains('active');

faqBtns.forEach(function(b){
if(b!==btn){
b.classList.remove('active');
b.setAttribute('aria-expanded','false');
gsap.to(b.nextElementSibling,{maxHeight:0,duration:.35,ease:'power2.inOut'});
}
});

if(isOpen){
btn.classList.remove('active');
btn.setAttribute('aria-expanded','false');
gsap.to(answer,{maxHeight:0,duration:.35,ease:'power2.inOut'});
}else{
btn.classList.add('active');
btn.setAttribute('aria-expanded','true');
gsap.set(answer,{maxHeight:'none'});
var h=answer.offsetHeight;
gsap.fromTo(answer,{maxHeight:0},{maxHeight:h,duration:.45,ease:'power2.out'});
}
});
});
}

function initPrefetch(){
var links=document.querySelectorAll('a[target="_blank"], .nav-links a[href^="#"]');
links.forEach(function(link){
link.addEventListener('mouseenter',function(){
var href=link.getAttribute('href');
if(!href||href.startsWith('#'))return;
var l=document.createElement('link');l.rel='prefetch';l.href=href;l.as='document';
document.head.appendChild(l);
},{once:true,passive:true});
});
}

var resizeTimer;
window.addEventListener('resize',function(){
clearTimeout(resizeTimer);
resizeTimer=setTimeout(function(){ScrollTrigger.refresh()},300);
},{passive:true});

window.addEventListener('load',function(){
requestAnimationFrame(function(){ScrollTrigger.refresh()});
});

if('PerformanceObserver' in window){
try{
new PerformanceObserver(function(){}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(function(){}).observe({type:'layout-shift',buffered:true});
}catch(e){}
}

if('serviceWorker' in navigator&&!isReduced){
window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});
}
});
