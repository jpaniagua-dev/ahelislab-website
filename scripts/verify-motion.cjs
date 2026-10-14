// Verify direct planet interactions, settling and accessibility without a browser.
// Usage: node scripts/verify-motion.cjs. This script does not modify project files.
const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'../src/scripts/site.js'),'utf8');
function scene(width,reduced=false){
 let context;
 const node=()=>({dataset:{},style:{setProperty(k,v){this[k]=v}},events:{},classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this[k]=v},getAttribute(k){return this[k]},addEventListener(k,f){(this.events[k]||=[]).push(f)},emit(k,e={}){for(const f of this.events[k]||[])f(e)},cloneNode(){return node()},querySelector(){return null},querySelectorAll(){return []},closest(s){return s==='.planet-dock'?this.parentElement:null}});
 const stage=node(),control=node();control.querySelector=()=>({textContent:''});
 const docks=[{top:180,width:Math.min(width-40,500),height:300},{top:1200,width:240,height:225}].map(r=>Object.assign(node(),{offsetWidth:r.width,offsetHeight:r.height,dataset:{size:560},getBoundingClientRect(){return {left:20,top:r.top-context.scrollY,width:r.width,height:r.height}},querySelector(sel){return sel==='.planet-stage'?this.visual:sel==='.planet-interact'?this.interact:null},closest(){return null},append(n){n.parentElement=this;if(n.className==='planet-interact')this.interact=n;else this.visual=n}}));
 const doc=node();Object.assign(doc,{hidden:false,documentElement:node(),body:{dataset:{page:'home'}},createElement(){return node()},querySelector(s){return s==='.planet-stage'?stage:s==='.motion-control'?control:null},querySelectorAll(s){return s==='[data-planet-dock]'?docks:[]}});
 context={document:doc,scrollY:0,innerWidth:width,innerHeight:800,localStorage:{getItem(){return null},setItem(){}},matchMedia(q){return {matches:q.includes('reduced-motion')?reduced:q.includes('coarse')?width<620:false,addEventListener(){}}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},console};context.window=context;context.addEventListener=()=>{};
 vm.createContext(context);vm.runInContext(source+'\nglobalThis.api={animate,setMotion,measure,state:()=>({pointer,smoothPointer,orbitPointer,pulse,orbitAngle,smoothOrbitAngle})};',context);
 return {context,docks,stage,control,doc};
}
for(const width of [360,390,620,900,1440]){
 const {context:c,docks,stage,doc}=scene(width);const button=docks[0].interact;
 c.api.animate(100);assert.equal(stage.parentElement,docks[0]);
 button.emit('pointerdown',{clientX:width-30,clientY:220,pointerType:'touch'});c.api.animate(140);
 assert.ok(Number(stage.style['--energy'])>1.025,'Touch feedback is visible');assert.ok(Number(stage.style['--px'])>.1,'Pointer produces local tilt');
 if(width<620){const x=Number(stage.style.transform.match(/translate3d\(([-\d.]+)/)[1]);assert.ok(Math.abs(x-(docks[0].offsetWidth/2-280))<=2.01,'Touch does not translate the scene across the page');}
 button.emit('pointerup');for(let t=180;t<=1200;t+=40)c.api.animate(t);assert.ok(Math.abs(c.api.state().smoothPointer.x)<.001,'Touch settles back to rest');
 button.emit('click',{detail:0});c.api.animate(1240);assert.ok(c.api.state().orbitAngle===24,'Keyboard activation triggers an orbit');assert.ok(c.api.state().smoothOrbitAngle<24,'Orbit response is eased');
 c.scrollY=60;c.api.animate(1280);assert.ok(c.api.state().orbitAngle>24,'Scroll feeds the orbit');
 c.api.setMotion(false);const stopped=stage.style.transform;c.api.animate(1400);assert.equal(stage.style.transform,stopped);assert.ok(button.disabled);
 c.api.setMotion(true);c.api.animate(1440);doc.hidden=true;const hidden=stage.style.transform;c.api.animate(1500);assert.equal(stage.style.transform,hidden);
 const reduced=scene(width,true);assert.equal(reduced.context.document.documentElement.dataset.motion,'off');assert.ok(reduced.docks[0].interact.disabled);
}
console.log('Lottie reactivity checks passed: 5 widths, direct touch/pointer, eased keyboard orbit, scroll, settling, permanent hero, pause, reduced motion and hidden tab.');
