'use strict';
(() => {
  const paper=document.getElementById('paper'),lamp=document.getElementById('lamp');
  const canvas=document.getElementById('lamp-head'),ctx=canvas.getContext('2d');
  const beam=document.getElementById('light-beam'),light=beam.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let manifest,frames=[],angle=0,target=0,lit=true,raf=0,lastTime=0,caret={x:60,y:300};
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function schedule(){if(!raf)raf=requestAnimationFrame(tick);}
  function tick(time){
    raf=0;const dt=lastTime?Math.min(50,time-lastTime):16;lastTime=time;
    angle=reduced?target:angle+(target-angle)*(1-Math.exp(-dt/140));
    if(Math.abs(angle-target)<.025)angle=target;
    draw();if(angle!==target)schedule();else lastTime=0;
  }
  function draw(){
    if(!frames.length)return;
    const candidates=frames.filter(f=>f.lit===lit);
    const frame=candidates.reduce((best,f)=>Math.abs(f.degrees-angle)<Math.abs(best.degrees-angle)?f:best,candidates[0]);
    const pivot=manifest.lampPivot,delta=-(angle-frame.degrees)*Math.PI/180*.94;
    ctx.clearRect(0,0,900,900);ctx.save();ctx.translate(pivot.x,pivot.y);ctx.rotate(delta);
    ctx.drawImage(frame.image,-pivot.x,-pivot.y,900,900);ctx.restore();
    const w=paper.clientWidth,h=paper.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
    if(beam.width!==Math.round(w*dpr)||beam.height!==Math.round(h*dpr)){beam.width=Math.round(w*dpr);beam.height=Math.round(h*dpr);}
    light.setTransform(dpr,0,0,dpr,0,0);light.clearRect(0,0,w,h);
    const dx=frame.mouth.x-pivot.x,dy=frame.mouth.y-pivot.y;
    const mouth={x:pivot.x+dx*Math.cos(delta)-dy*Math.sin(delta),y:pivot.y+dx*Math.sin(delta)+dy*Math.cos(delta)};
    const ratio=lamp.clientWidth/900;
    const sx=lamp.offsetLeft+mouth.x*ratio,sy=lamp.offsetTop+mouth.y*ratio;
    // A tapered soft cone starts at the actual rendered shade opening.
    const length=clamp(caret.y-sy+110,130,390);
    const direction=(angle+11)*Math.PI/180;
    const ex=sx+Math.sin(direction)*length,ey=sy+Math.cos(direction)*length;
    if(lit){
      for(let i=0;i>=0;i--){
        const spread=1+i*.11;
        const near=lamp.clientWidth*.145,far=length*.31*spread;
        const g=light.createLinearGradient(sx,sy,ex,ey);
        g.addColorStop(0,`rgba(255,246,203,${.48})`);
        g.addColorStop(.15,`rgba(255,238,169,${.28})`);
        g.addColorStop(.62,`rgba(255,237,178,${.12})`);
        g.addColorStop(1,'rgba(255,240,195,0)');
        light.fillStyle=g;light.filter=`blur(14px)`;
        light.beginPath();light.moveTo(sx-near,sy-3);
        light.quadraticCurveTo(sx-near*.9+(ex-sx)*.3,sy+length*.38,ex-far,ey);
        light.quadraticCurveTo(ex,ey+length*.12,ex+far,ey);
        light.quadraticCurveTo(sx+near*.9+(ex-sx)*.3,sy+length*.38,sx+near,sy-3);
        light.closePath();light.fill();
      }
      light.filter='none';
    }
    lamp.dataset.angle=angle.toFixed(2);lamp.dataset.mouthX=sx.toFixed(2);lamp.dataset.mouthY=sy.toFixed(2);
  }
  window.paperLamp={
    follow(x,y){caret={x,y};const editing=document.querySelector('.app').classList.contains('editing');target=editing?clamp((x/paper.clientWidth-.38)*35,-14,18):0;schedule();},
    setLit(value){lit=Boolean(value);schedule();},
    state(){return {angle,target,lit,loaded:frames.length,pivot:manifest?.lampPivot,caret};}
  };
  new ResizeObserver(schedule).observe(paper);
  fetch('/assets/manifest.json').then(r=>{if(!r.ok)throw Error('Material manifest failed');return r.json();}).then(async data=>{
    manifest=data;
    frames=await Promise.all(data.angles.map(async f=>{const image=new Image();image.src='/assets/'+f.file.replace('.png','.webp');await image.decode();return {...f,image};}));
    lamp.classList.add('assets-ready');schedule();window.dispatchEvent(new Event('paper-lamp-ready'));
  }).catch(error=>{console.error(error);lamp.dataset.assetError='true';});
})();
