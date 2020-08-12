'use strict';

//  Для мобильного меню
//  Показыть/скрыть мобильное меню

function mobMenu() {
  var mobMenu = document.querySelector('#mob-menu');
  mobMenu.classList.toggle('active');
}

function runMobileMenu() {

}
runMobileMenu();

// Показать/скрыть
function toggleMenuItems(el) {
  var sublist = el.nextElementSibling;
  var arrow = el.querySelector('.icon');
  var arrowDiv = arrow.parentElement;

  console.log()
  sublist.classList.toggle('displayNone');
  arrowDiv.classList.toggle('close');
  // if (event.target.className === 'edit icon') {
  //   return;
  // }
  // if (el.classList.contains('item-wrap')) {
  //   var parentEl = el.parentElement;
  //   var outerTarget = parentEl.querySelector('.outer-target');
  //   outerTarget.classList.toggle('displayNone');
  // }
}
