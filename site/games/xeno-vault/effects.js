// Draw the event in reel coordinates so it follows the board at any phone width.
export function animateField(canvas,kind,targets,color,duration,paths=[]){
  const box=canvas.getBoundingClientRect(),w=box.width,h=box.height;
  const scale=Math.min(devicePixelRatio||1,2);
  canvas.width=w*scale;canvas.height=h*scale;
  const ctx=canvas.getContext('2d');ctx.scale(scale,scale);
  const point=pos=>[(Math.floor(pos/3)+.5)*w/5,(pos%3+.5)*h/3];
  const ring=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();};
  const stroke=(x,y,a,b)=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(a,b);ctx.stroke();};
  return new Promise(resolve=>{
    const start=performance.now();
    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      ctx.clearRect(0,0,w,h);
      if(t>=1){resolve();return;}
      ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;
      ctx.globalAlpha=Math.min(1,(1-t)*5);
      if(kind==='meteor'){
        targets.forEach((pos,i)=>{
          const [x,y]=point(pos),p=Math.min(1,Math.max(0,t*2.1-i*.18));
          if(p<=0)return;
          const dx=x-(1-p)*w*.45,dy=y-(1-p)*h;
          if(p<1){ctx.lineWidth=4;stroke(dx-20,dy-32,dx,dy);ctx.fillRect(dx-3,dy-3,7,7);}
          else for(let k=0;k<12;k++){
            const a=k*Math.PI/6,r=Math.max(0,t-(1+i*.18)/2.1)*h*.6;
            ctx.fillRect(x+Math.cos(a)*r,y+Math.sin(a)*r,4,4);
          }
        });
      }else if(kind==='tractor'){
        const x=w*(.18+.64*t),y=h*.14;
        for(const pos of targets){
          const [a,b]=point(pos);ctx.lineWidth=1;stroke(x,y,a,b);
          ctx.fillRect(a+(x-a)*t,b+(y-b)*t,5,5);
        }
        ctx.fillStyle='#d3ffec';ctx.beginPath();ctx.ellipse(x,y,24,6,0,0,2*Math.PI);ctx.fill();
        ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y-3,11,Math.PI,2*Math.PI);ctx.fill();
      }else if(kind==='wormhole'){
        for(const x of [w*.1,w*.5]){
          ctx.save();ctx.translate(x,h*.5);ctx.scale(.47,1);
          for(let j=0;j<5;j++)ring(0,0,4+((t+j/5)%1)*h*.48);ctx.restore();
        }
        for(const pos of targets){const [x,y]=point(pos);ctx.fillRect(w*.1+(x-w*.1)*t,y-2,11,4);}
      }else if(kind==='Warden'){
        for(const pos of targets){
          const [x,y]=point(pos),r=(.12+.075*(1-t))*Math.min(w/2,h);
          ctx.beginPath();
          for(let k=0;k<=6;k++){
            const a=k*Math.PI/3-Math.PI/2;
            const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;
            if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
          }
          ctx.stroke();ring(x,y,r*(1-t));
        }
      }else if(kind==='Oracle'){
        const x=w*.5,y=h*.5;
        ctx.beginPath();ctx.ellipse(x,y,w*.21,h*(.04+.12*Math.sin(Math.PI*t)),0,0,2*Math.PI);ctx.stroke();
        ring(x,y,h*.1);ring(x,y,h*(.1+.38*t));
      }else if(kind==='line'){
        for(const path of paths){
          const points=path.map(point);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(...points[0]);
          const end=t*(points.length-1);
          for(let i=1;i<points.length;i++){
            const f=Math.min(1,Math.max(0,end-i+1));
            ctx.lineTo(points[i-1][0]+(points[i][0]-points[i-1][0])*f,points[i-1][1]+(points[i][1]-points[i-1][1])*f);
          }
          ctx.stroke();
        }
      }else{
        const x=w*.5,y=h*.5;
        for(let j=0;j<3;j++)ring(x,y,2+((t+j/3)%1)*w*.6);
        for(let j=0;j<24;j++){
          const a=j*Math.PI/12+t*.3,r=t*w*.62;
          stroke(x+r*Math.cos(a),y+r*Math.sin(a),x+(r+14)*Math.cos(a),y+(r+14)*Math.sin(a));
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}
