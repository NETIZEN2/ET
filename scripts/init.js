import { initRouter } from './router.js';
import { initA11y } from './a11y.js';

initA11y();
initRouter();

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/scripts/sw.js');
}
