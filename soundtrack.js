/* Background soundtrack from the supplied reference video, without visible controls.
   Browsers that require activation start it on the first pointer or keyboard gesture. */
(() => {
  'use strict';
  const audio=document.getElementById('background-audio');
  audio.volume=.6;
  let starting=false;
  async function start(){
    if(starting||!audio.paused)return;
    starting=true;
    try{await audio.play();}catch{/* Keep gesture listeners active if autoplay is blocked. */}
    finally{starting=false;}
  }
  document.addEventListener('pointerdown',start,{passive:true});
  document.addEventListener('keydown',start);
  window.addEventListener('pageshow',start);
  start();
})();
