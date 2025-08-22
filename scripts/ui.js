/** Create element helper */
export function el(tag, attrs={}, children=[]) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if(k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if(v!=null) e.setAttribute(k, v);
  });
  children.forEach(c=>{
    if(typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if(c) e.appendChild(c);
  });
  return e;
}

/** Empty an element */
export function clear(node){
  while(node.firstChild) node.removeChild(node.firstChild);
}
