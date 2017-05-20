
import module1 from './module1';

function getComponent () {
  var element = document.createElement('div');
  element.innerHTML = module1();
  return element;
}

document.body.appendChild(getComponent());