const observer = new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},{
threshold:.2
});

document.querySelectorAll("section,.feature,.stat-card,.step").forEach(el=>{

el.classList.add("hidden");

observer.observe(el);

});
const canvas=document.getElementById("particles");

const ctx=canvas.getContext("2d");

canvas.width=window.innerWidth;

canvas.height=window.innerHeight;

const particles=[];

for(let i=0;i<80;i++){

particles.push({

x:Math.random()*canvas.width,

y:Math.random()*canvas.height,

r:Math.random()*3+1,

dx:(Math.random()-.5)*0.4,

dy:(Math.random()-.5)*0.4

});

}

function animate(){

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="rgba(0,212,255,.6)";

particles.forEach(p=>{

ctx.beginPath();

ctx.arc(p.x,p.y,p.r,0,Math.PI*2);

ctx.fill();

p.x+=p.dx;

p.y+=p.dy;

if(p.x<0||p.x>canvas.width)p.dx*=-1;

if(p.y<0||p.y>canvas.height)p.dy*=-1;

});

requestAnimationFrame(animate);

}

animate();

window.addEventListener("resize",()=>{

canvas.width=window.innerWidth;

canvas.height=window.innerHeight;

});
document.querySelectorAll(".feature,.stat-card,.step").forEach(card=>{

card.addEventListener("mousemove",(e)=>{

const rect=card.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

const rotateY=((x/rect.width)-0.5)*18;

const rotateX=((y/rect.height)-0.5)*-18;

card.style.transform=
`perspective(1000px)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
translateY(-10px)
scale(1.03)`;

});

card.addEventListener("mouseleave",()=>{

card.style.transform="";

});

});