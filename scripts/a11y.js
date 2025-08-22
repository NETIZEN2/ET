export function initA11y(){
  // move focus to main when skip link activated
  const skip=document.querySelector('.skip-link');
  skip.addEventListener('click',e=>{
    const main=document.getElementById('main');
    main.setAttribute('tabindex','-1');
    main.focus();
  });
}
