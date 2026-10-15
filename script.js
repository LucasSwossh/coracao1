/* A separate, dependency-free reproduction of the text-heart reference.
   Timing: blue outline, scattered interior words, a quiet hold, fade and repeat. */
(() => {
  'use strict';
  const scene=document.getElementById('scene'),canvas=document.getElementById('heart'),ctx=canvas.getContext('2d');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let w=1,h=1,unit=1,cx=0,cy=0,ratio=1,particles=[],elapsed=0,previous=null,frame=0,lastPaint=-100;
  const sprites=new Map();
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
  function heart(t){return [16*Math.sin(t)**3,-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))];}
  const contour=Array.from({length:240},(_,i)=>heart(i/240*Math.PI*2));
  function inside(x,y){let yes=false;for(let i=0,j=contour.length-1;i<contour.length;j=i++){const a=contour[i],b=contour[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
  function createParticles(){
    let seed=14329;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const result=[];
    for(let i=0;i<86;i++){
      const t=i/86*Math.PI*2,p=heart(t),offset=(random()-.5)*1.1;
      result.push({x:p[0]+offset,y:p[1]+(random()-.5)*.9,size:random(),phase:random()*6.28,speed:.8+random()*1.3,delay:i/86*3.3,word:i%5===0?'I LOVE YOU':'I Love you',outline:true});
    }
    for(let i=0;i<125;i++){
      let x,y;do{x=(random()-.5)*30;y=-11+random()*27;}while(!inside(x,y));
      result.push({x,y,size:random(),phase:random()*6.28,speed:.8+random()*1.3,delay:4.0+random()*4.8,word:i%7===0?'I LOVE YOU':'I Love you',outline:false});
    }
    return result;
  }
  function sprite(text,size){
    const key=text+':'+size;if(sprites.has(key))return sprites.get(key);
    const c=document.createElement('canvas'),g=c.getContext('2d'),pad=12;
    g.font=`${size}px Arial,Helvetica,sans-serif`;const tw=Math.ceil(g.measureText(text).width),th=Math.ceil(size*1.4);
    c.width=Math.ceil((tw+pad*2)*ratio);c.height=Math.ceil((th+pad*2)*ratio);g.scale(ratio,ratio);
    g.font=`${size}px Arial,Helvetica,sans-serif`;g.textAlign='center';g.textBaseline='middle';
    g.shadowColor='#138eff';g.shadowBlur=7;g.fillStyle='#1697ed';g.fillText(text,tw/2+pad,th/2+pad);
    g.shadowBlur=2;g.fillStyle='#45b8ff';g.fillText(text,tw/2+pad,th/2+pad);
    const value={canvas:c,width:tw+pad*2,height:th+pad*2};sprites.set(key,value);return value;
  }
  function resize(){
    w=scene.clientWidth||innerWidth;h=scene.clientHeight||innerHeight;ratio=Math.min(devicePixelRatio||1,1.7);
    canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
    unit=Math.min((w-56)/34,(h-84)/33,21);cx=w/2;cy=h/2-unit*2;
    sprites.clear();draw();
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    const t=motion.matches?12:elapsed%16;
    const cycleOpacity=motion.matches?1:1-smooth((t-14.5)/1.5);
    const base=Math.max(8,Math.min(13,unit*.69));
    const pulse=motion.matches?1:1+Math.sin(t*1.45)*.009;
    for(const p of particles){
      const reveal=smooth((t-p.delay)/.75);if(reveal<=0)continue;
      const flicker=motion.matches?1:.72+.28*(.5+.5*Math.sin(t*p.speed*1.7+p.phase));
      const breathe=motion.matches?0:Math.sin(t*.65+p.phase)*.13;
      const size=Math.round((base*(.73+p.size*.43))*2)/2,art=sprite(p.word,size);
      const x=cx+p.x*unit*pulse,y=cy+(p.y+breathe)*unit*pulse;
      ctx.globalAlpha=reveal*flicker*cycleOpacity;
      ctx.drawImage(art.canvas,x-art.width/2,y-art.height/2,art.width,art.height);
    }
    ctx.globalAlpha=1;
  }
  function tick(now){
    const dt=previous===null?0:Math.min((now-previous)/1000,.1);previous=now;elapsed+=dt;
    if(elapsed-lastPaint>=1/30){draw();lastPaint=elapsed;}
    if(!motion.matches)frame=requestAnimationFrame(tick);else frame=0;
  }
  function schedule(){if(!frame&&!document.hidden){previous=null;frame=requestAnimationFrame(tick);}}
  function replay(){elapsed=0;lastPaint=-100;previous=null;draw();schedule();}
  scene.addEventListener('click',()=>{if(elapsed>11.6)replay();});
  scene.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();replay();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;previous=null;}else schedule();});
  window.addEventListener('resize',resize);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);
  motion.addEventListener('change',()=>{draw();schedule();});
  particles=createParticles();resize();schedule();
})();
