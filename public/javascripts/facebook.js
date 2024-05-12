function init(){
    gsap.registerPlugin(ScrollTrigger);

// Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll

const locoScroll = new LocomotiveScroll({
  el: document.querySelector("#main"),
  smooth: true
});
// each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
locoScroll.on("scroll", ScrollTrigger.update);

// tell ScrollTrigger to use these proxy methods for the "#main" element since Locomotive Scroll is hijacking things
ScrollTrigger.scrollerProxy("#main", {
  scrollTop(value) {
    return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
  }, // we don't have to define a scrollLeft because we're only scrolling vertically.
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
  },
  // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
  pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
});





// each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

// after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
ScrollTrigger.refresh();

}
// init();
var iconsvg = document.querySelectorAll('.pol svg');
var shadow = document.querySelectorAll('.linee1');
var icons = document.querySelectorAll('.pol');
var like = document.querySelector("#lik")



icons.forEach(function(val,index){
    console.log(val);
    val.addEventListener('click',function(){
        dullandbright();
        gsap.to('.linee1',{
            x:index*121,
            ease : Expo.easeInOut,
            duration : .4,
            
        })
        gsap.to(this.children,{
            opacity: 1,
        })
    })
})

function dullandbright(){
    gsap.to(".pol svg ",{
        opacity : 1,
        
    })
}



// var flag = true
// like.addEventListener("click",function(e){
//   if(flag == true ){
//     document.querySelector(".x1d69dk1").style.display = "none"
//     document.querySelector("#pin").style.color = " "
//     document.querySelector("#lik img").style.display = "initial"
//     flag = false;
//   }

    
  
