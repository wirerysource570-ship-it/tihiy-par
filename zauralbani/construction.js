"use strict";

// Coordinates are metres in a fixed orthographic view. Every option has its own
// interpolated value so changing a choice mid-build continues from the visible frame.
function createConstructionScene(canvas) {
  const ctx = canvas.getContext("2d");
  const sizes = { "2": [3.8, 2.5], "4": [4.8, 3], "6": [5.9, 3.4], "8": [6.8, 3.8], large: [7.8, 4.3] };
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  const empty = { length: 4.2, depth: 3.5, base: 0, walls: 0, roof: 0, winter: 0, glass: 0, deck: 0, lounge: 0, tub: 0, stove: 0, electric: 0 };
  const values = { ...empty };
  const tracks = new Map();
  let frame = 0;
  let reveal = null;
  let previousSeason;
  const clamp = t => Math.max(0, Math.min(1, t));
  const ease = t => t * t * (3 - 2 * t);
  const materials = {};
  const swatches = { boards: "#9c7857", metal: "#4d504b", window: "#715e46", water: "#598f8a" };
  let camera = 52;
  let backdrop;
  const project = ([x,y,z]) => [385 + camera * (.94*x + .53*y), 248 + camera * (.21*x - .43*y - .97*z)];

  function path(points, fill, stroke, weight = 1) {
    ctx.beginPath();
    points.map(project).forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    if (fill) { ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); }
    if (stroke) { ctx.lineWidth=weight; ctx.strokeStyle=stroke; ctx.stroke(); }
  }
  const line = (a,b,color,width) => path([a,b],null,color,width);

  // Map photographed materials onto a plane. Repeat counts refer to physical
  // dimensions, so longer walls gain boards instead of stretching their grain.
  function surface(origin, right, bottom, material, u=1, v=1, shade) {
    const [o,r,b] = [origin,right,bottom].map(project);
    if(material==="boards" || material==="metal"){u*=.5;v*=.5;}
    const texture = materials[material];
    const width = (texture?.width || 1)*u, height = (texture?.height || 1)*v;
    if (width<=.001 || height<=.001) return;
    ctx.save();
    ctx.transform((r[0]-o[0])/width,(r[1]-o[1])/width,(b[0]-o[0])/height,(b[1]-o[1])/height,o[0],o[1]);
    ctx.fillStyle=texture?.pattern || swatches[material];
    ctx.fillRect(0,0,width,height);
    if(shade){ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);}
    ctx.restore();
  }
  function block(x,y,z,w,d,h,top,front,side) {
    if(Math.min(w,d,h)<.002)return;
    const X=x+w,Y=y+d,Z=z+h;
    path([[x,y,Z],[X,y,Z],[X,y,z],[x,y,z]],front);
    path([[X,y,Z],[X,Y,Z],[X,Y,z],[X,y,z]],side);
    path([[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]],top);
  }
  function cladding(x,y,z,w,d,h) {
    if(Math.min(w,d,h)<.006)return;
    const X=x+w,Y=y+d,Z=z+h;
    surface([x,y,Z],[X,y,Z],[x,y,z],"boards",w/1.6,h/2.4,"#6c432513");
    surface([X,y,Z],[X,Y,Z],[X,y,z],"boards",d/1.6,h/2.4,"#1a201e37");
    path([[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]],"#9c785c");
  }
  function shadow(points, opacity, blur) {
    ctx.save();
    ctx.filter="blur("+blur+"px)";
    path(points,"rgba(36,29,21,"+opacity+")");
    ctx.restore();
  }
  function deck(x,y,w,d,z) {
    if(Math.min(w,d,z)<.008)return;
    block(x,y,.012,w,d,z,"#aa8b6b","#755d47","#655443");
    surface([x,y,z+.012],[x,y+d,z+.012],[x+w,y,z+.012],"boards",d/1.65,w/3,"#d9c5a850");
    line([x,y,z+.012],[x+w,y,z+.012],"#ddc4a57a",1);
    line([x,y,z*.46],[x+w,y,z*.46],"#422d203c",.75);
  }
  function glass(x,y,z,w,h,side=false) {
    if(Math.min(w,h)<.01)return;
    const point = (u,v) => side ? [x,y+u,z+v] : [x+u,y,z+v];
    const rim=Math.min(.052,h*.11,w*.09);
    path([point(0,0),point(w,0),point(w,h),point(0,h)],"#262824");
    surface(point(rim,h-rim),point(w-rim,h-rim),point(rim,rim),"window",1,1,side?"#23303049":"#343f3a38");
    line(point(rim,rim),point(w-rim,rim),"#bbb4a47a",.85);
    const panes=Math.ceil(w/1.45);
    for(let i=1;i<panes;i++)line(point(w*i/panes,rim),point(w*i/panes,h-rim),"#302e28",2.1);
  }
  function lounger(x,y,z,t) {
    if(t<.005)return;
    const w=.61, d=1.72, h=.23*t;
    const front=y-d;
    for(const px of [x+.065,x+w-.10]){
      for(const py of [front+.16,y-.31])block(px,py,z,.04,.08,h,"#493f34","#504435","#352d26");
      block(px,front+.08,z+h-.035,w*.08,d-.14,.06,"#715d49","#796653","#534637");
    }
    // Timber chassis, slim upholstered seat and an inclined linen backrest.
    const knee=y-.65, foot=front+.04, back=y-.035, rise=.53*t;
    block(x,foot,z+h,w,knee-foot,.07*t,"#b39d80","#92795c","#75614c");
    block(x+.018,foot+.02,z+h+.05*t,w-.036,knee-foot-.025,.075*t,"#d5ccba","#c0b5a0","#ab9f89");
    const base=z+h+.08*t, top=base+rise;
    path([[x,knee,base],[x+w,knee,base],[x+w,back,top],[x,back,top]],"#a99171");
    path([[x+.02,knee,base+.035*t],[x+w-.02,knee,base+.035*t],[x+w-.02,back,top+.035*t],[x+.02,back,top+.035*t]],"#ddd5c2");
    for(const distance of [.13,.32]){
      const seam=top+.04*t-distance*rise/(back-knee);
      line([x+.025,back-distance,seam],[x+w-.025,back-distance,seam],"#a79f8b",.65);
    }
    const head=back-.09, headZ=top-.035*t;
    block(x+.057,head-.10,headZ,w-.114,.13,.065*t,"#e3d9c5","#c9baa2","#b2a48d");
  }
  function plunge(x,y,width,depth,z,t) {
    if(t<.006)return;
    const w=(width-.58)*t,d=(depth-.58)*t;
    const cx=x+width/2,cy=y+depth/2;
    const left=cx-w/2, front=cy-d/2, right=cx+w/2, rear=cy+d/2;
    const edge=Math.min(.081,w*.12,d*.12),drop=.15*t;
    const quad=(l,f,r,b)=>[[l,f,z],[r,f,z],[r,b,z],[l,b,z]];
    path(quad(left-edge,front-edge,right+edge,rear+edge),"#b3aea0");
    path(quad(left,front,right,rear),"#2f4945");
    // Clip the lowered water plane to the opening; the far walls remain visible.
    ctx.save();ctx.clip();
    surface([left,rear,z-drop],[right,rear,z-drop],[left,front,z-drop],"water",1,1,"#18393520");
    line([left,rear,z-drop],[right,rear,z-drop],"#d4e7cf77",.85);
    ctx.restore();
    line([left,front,z],[right,front,z],"#e0dbcb",1.3);
    line([right,front,z],[right,rear,z],"#d6d2c2",1.1);
  }
  function outdoor(x,y,L,v) {
    const X=x+L, width=2.24, depth=2.26, front=y-depth;
    const elevation=.28;
    // The terrace ends flush with the pool platform and supports both loungers.
    // Either option supports the outer platform. Removing the basin reveals its boards.
    const t=v.deck, p=v.tub;
    if(t>.005) {
      const run=depth*t;
      deck(x-.16,y-run,L+.16,run,elevation*t);
      deck(X-.92,y-run-.29*t,.88,.29*t,elevation*.46*t);
      for(const offset of [.21,1.05]) {
        const ly=y-.12, lx=x+offset;
        if(t>.2) {
          ctx.save();
          ctx.globalAlpha=ease(clamp((t-.2)/.8));
          shadow([[lx+.04,ly-1.65*t,elevation*t+.013],[lx+.66,ly-1.65*t,elevation*t+.013],[lx+.71,ly+.04,elevation*t+.013],[lx+.04,ly+.04,elevation*t+.013]],.32,2);
          ctx.translate(0,(1-t)*-8);
          const [sx,sy]=project([lx,ly,elevation*t]);
          ctx.translate(sx,sy);ctx.scale(.72+.28*t,.72+.28*t);ctx.translate(-sx,-sy);
          lounger(lx,ly,elevation*t+.016,t);
          ctx.restore();
        }
      }
    }
    const platform=Math.max(t,p);
    if(platform>.005) {
      const h=elevation*ease(clamp(platform/.6));
      const span=width*ease(clamp(platform/.72));
      if(span>.01){
        deck(X,front,span,depth,h);
        if(span>.60)plunge(X,front,span,depth,h+.013,ease(clamp((p-.28)/.72)));
      }
    }
  }

  function draw() {
    if(!ctx)return;
    const w=canvas.clientWidth,h=canvas.clientHeight;
    if(!w||!h)return;
    const ratio=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){
      canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
    }
    const scale=Math.min(canvas.width/800,canvas.height/420);
    ctx.setTransform(1,0,0,1,0,0);
    if(materials.clearing){
      if(!backdrop || backdrop.width!==canvas.width || backdrop.height!==canvas.height){
        backdrop=document.createElement("canvas");
        backdrop.width=canvas.width;backdrop.height=canvas.height;
        const img=materials.clearing, cover=Math.max(canvas.width/img.width,canvas.height/img.height);
        const buffer=backdrop.getContext("2d");
        buffer.imageSmoothingQuality="high";
        buffer.drawImage(img,(canvas.width-img.width*cover)/2,(canvas.height-img.height*cover)/2,img.width*cover,img.height*cover);
      }
      ctx.drawImage(backdrop,0,0);
    }else{ctx.fillStyle="#b7ae9b";ctx.fillRect(0,0,canvas.width,canvas.height);}
    ctx.setTransform(scale,0,0,scale,(canvas.width-800*scale)/2,(canvas.height-420*scale)/2);
    ctx.lineJoin="round"; ctx.lineCap="round";
    const v=values, L=v.length,D=v.depth;
    camera=52-(L-4)*2.25;
    const x=-L/2,y=-D/2+.54,X=x+L,Y=y+D;
    if(v.base<.002 && v.walls<.002)return;
    const z=.32*v.base,H=2.26*v.walls,e=z+H;
    const ext=1.62*v.lounge;
    const shadeReach=1.0*v.walls;
    shadow([[x-ext,y,0],[X,y,0],[X+shadeReach,y-.55*shadeReach,0],[X+shadeReach,Y-.12,0],[x-ext+.4,Y+.18,0]],.29*v.base,8);
    shadow([[x-.04,y-.11,0],[X+.11,y-.11,0],[X+.11,Y+.1,0],[x-.04,Y+.1,0]],.52*v.base,3);
    if(v.deck>.005||v.tub>.005) {
      if(v.deck>.005)shadow([[x-.2,y-2.30*v.deck,0],[X+.12,y-2.30*v.deck,0],[X+.14,y+.12,0],[x-.2,y+.12,0]],.33*v.deck,3);
      shadow([[X,y-2.31,0],[X+2.35,y-2.31,0],[X+2.35,y+.12,0],[X,y+.12,0]],.36*Math.max(v.deck,v.tub),3);
    }
    block(x+.045,y+.045,.004,L-.09,D-.09,z,"#797668","#5c574c","#47463f");
    if(ext>.01){
      const oy=y+.42, d=D-.59;
      block(x-ext,oy,.006,ext,d,z,"#847965","#685e50","#595246");
      cladding(x-ext,oy,z,ext,d,H*.84);
      glass(x-ext+.05,oy-.006,z+H*.12,Math.max(.01,ext-.1),H*.6);
      block(x-ext-.10,oy-.14,z+H*.84,ext+.12,d+.29,.13*v.lounge,"#575954","#393b38","#313431");
    }
    cladding(x,y,z,L,D,H);
    if(H>.03){
      const a=project([0,y,e]), b=project([0,y,e-.52*v.walls]);
      const occlusion=ctx.createLinearGradient(...a,...b);
      occlusion.addColorStop(0,"#201a165c");occlusion.addColorStop(1,"#201a1600");
      path([[x,y,e],[X,y,e],[X,y,e-.52*v.walls],[x,y,e-.52*v.walls]],occlusion);
    }
    const phase=reveal?clamp((performance.now()-reveal.start)/reveal.duration):0;
    const exposed=Math.sin(Math.PI*phase);
    if(exposed>.001 && H>.12){
      const width=L-1.6, count=Math.max(3,Math.round(width/.54)), bay=width/count;
      ctx.save();ctx.globalAlpha=Math.min(1,exposed*2.5);
      path([[x,y,z],[x+width,y,z],[x+width,y,e],[x,y,e]],"#765a3b");
      for(let i=0;i<count;i++){
        const left=x+i*bay+.04,right=x+(i+1)*bay-.032;
        const progress=ease(clamp(phase*2.4-i/count*.76));
        const high=z+.04+(H-.07)*(previousSeason?progress:1-progress);
        path([[left,y,z+.03],[right,y,z+.03],[right,y,high],[left,y,high]],"#c6ad75");
        for(let j=z+.13;j+.13<high;j+=.20)line([left+.015,y,j],[right-.018,y,j+.105],"#ae97663d",1);
      }
      ctx.restore();
    }
    if(H>.015){
      const entry=1.12, doorX=X-entry-.23;
      // Deep portal, smoked glass door and a slim projecting timber surround.
      block(doorX-.12,y-.11,z,entry+.24,.14,H*.93,"#66533e","#67503d","#4f4032");
      surface([doorX+.07,y-.116,z+H*.86],[doorX+entry-.07,y-.116,z+H*.86],[doorX+.07,y-.116,z+.02],"boards",.55,1,"#30291d34");
      glass(doorX+.17,y-.118,z+H*.41,entry-.37,H*.39);
      line([doorX+entry-.23,y-.125,z+H*.31],[doorX+entry-.23,y-.125,z+H*.58],"#b6a27e",1.9);
      block(doorX-.17,y-.39,z+H*.91,entry+.34,.44,.11*v.walls,"#59584e","#443d32","#37382f");
      const windowWidth=.78+(L-2.52)*v.glass;
      glass(x+.22,y-.012,z+H*(.48-.36*v.glass),windowWidth,H*(.34+.43*v.glass));
      const bayY=y+D*.16,bayD=D*.65;
      glass(X+.006,bayY,z+H*.17,bayD,H*.66,true);
      const sy=bayY+bayD*.59, sh=.62*v.stove*v.walls, sz=z+.17*H;
      if(sh>.015){
        block(X+.014,sy,sz,.07,.38,sh,"#727065","#4d4a40","#484742");
        for(let j=0;j<4;j++)line([X+.086,sy+.045+j*.085,sz+.075],[X+.086,sy+.045+j*.085,sz+sh-.06],"#aca99a",.8);
        ctx.save();ctx.globalAlpha=1-v.electric;
        path([[X+.087,sy+.09,sz+.11],[X+.087,sy+.29,sz+.11],[X+.087,sy+.29,sz+.30],[X+.087,sy+.09,sz+.30]],"#c3854c");ctx.restore();
      }
    }
    const gap=.48*exposed,layer=.09*v.winter*v.walls;
    if(layer>.001)block(x,y,e,L,D,layer+gap*.3,"#c5ad7d","#a38c60","#8e7a56");
    if(v.roof>.002){
      ctx.save();ctx.globalAlpha=v.roof;
      const bottom=e+layer+(1-v.roof)*.72+gap;
      // Offset ridge, deep eaves and a sheltered gable give the cabin a long,
      // low silhouette. The soffit and fascia keep the roof visibly thick.
      const ridge=bottom+(D*.33)*v.roof, mid=y+D*.60;
      const left=x-.24,right=X+.36,front=y-.34,back=Y+.26;
      path([[X,y,bottom],[X,Y,bottom],[X,mid,ridge]],"#795d43");
      ctx.save();ctx.clip();
      surface([X,y,ridge],[X,Y,ridge],[X,y,bottom],"boards",D/1.6,(ridge-bottom)/2.4,"#1a201e37");ctx.restore();
      path([[X,y,bottom],[X,mid,ridge],[right,mid,ridge],[right,front,bottom-.12]],"#55493c");
      path([[X,mid,ridge],[X,Y,bottom],[right,back,bottom-.12],[right,mid,ridge]],"#574a3c");
      surface([left,mid,ridge],[right,mid,ridge],[left,back,bottom-.10],"metal",(right-left)/2.1,1,"#242e2924");
      surface([left,mid,ridge],[right,mid,ridge],[left,front,bottom-.10],"metal",(right-left)/2.1,1,"#b5b3a318");
      path([[left,front,bottom-.10],[right,front,bottom-.10],[right,front,bottom-.20],[left,front,bottom-.20]],"#363934");
      line([left,mid,ridge],[right,mid,ridge],"#a6a79b",1.1);
      line([right,front,bottom-.14],[right,mid,ridge],"#4b514b",2.1);
      line([right,mid,ridge],[right,back,bottom-.13],"#474c46",1.8);
      const pipe=(1-v.electric)*v.stove*v.roof;
      if(pipe>.005){
        const px=X-.77,py=mid-.36,pz=ridge-.16;
        block(px-.08,py-.08,pz-.04,.34,.35,.065,"#5e6159","#41423b","#3a3b36");
        block(px,py,pz,.18,.19,.75*pipe,"#797972","#575953","#383c39");
        block(px-.035,py-.035,pz+.75*pipe,.25,.26,.045*pipe,"#797d72","#474a42","#393d37");
      }
      ctx.restore();
    }
    outdoor(x,y,L,v);
  }

  for(const name of ["clearing",...Object.keys(swatches)]){
    const img=new Image();
    img.onload=()=>{
      img.pattern=ctx.createPattern(img,"repeat");
      materials[name]=img;
      draw();
    };
    img.src="../assets/"+name+".webp";
  }

  function tick(now) {
    frame=0;
    for(const [key,track] of tracks) {
      const t=clamp((now-track.start)/track.duration);
      values[key]=track.from+(track.to-track.from)*ease(t);
      if(t>=1)tracks.delete(key);
    }
    if(reveal && now>=reveal.start+reveal.duration) reveal=null;
    draw();
    if(tracks.size || reveal)frame=requestAnimationFrame(tick);
  }
  const resize = new ResizeObserver(draw);
  resize.observe(canvas);
  motionPreference.addEventListener("change", () => {
    if(!motionPreference.matches)return;
    for(const [key,track] of tracks)values[key]=track.to;
    tracks.clear();reveal=null;cancelAnimationFrame(frame);frame=0;draw();
  });

  return { update(data) {
    const key=data.get("capacity"), size=sizes[key], built=Boolean(size);
    const options=data.getAll("extras"), winter=data.get("season")==="winter";
    const goal={...empty,length:size?.[0]??values.length,depth:size?.[1]??values.depth,
      base:+built,walls:+built,roof:+built,stove:+built,winter:+(built&&winter),electric:+(built&&data.get("stove")==="electric")};
    for(const extra of ["glass","deck","lounge","tub"]) goal[extra]=+(built&&options.includes(extra));
    const now=performance.now(), fresh=values.walls<.02&&built;
    if(built && previousSeason!==winter && !motionPreference.matches) reveal={start:now+(fresh?650:0),duration:1700};
    if(!built)reveal=null;
    previousSeason=winter;
    for(const [name,to] of Object.entries(goal)) {
      if(motionPreference.matches){values[name]=to;tracks.delete(name);continue;}
      if(tracks.get(name)?.to===to || (!tracks.has(name)&&values[name]===to))continue;
      const delay=fresh?({walls:160,roof:530,glass:360,stove:280,tub:400}[name]??0):0;
      tracks.set(name,{from:values[name],to,start:now+delay,duration:name==="walls"?650:520});
    }
    if(!frame)tick(now);
    return size?.map(n=>String(n).replace(".",",")).join(" × ");
  }};
}

