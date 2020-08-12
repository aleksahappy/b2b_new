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

function toggleMenuItems(el) {
  var sublist = el.nextElementSibling;
  var arrow = el.querySelector('.icon');
  var arrowDiv = arrow.parentElement;

  sublist.classList.toggle('displayNone');
  arrowDiv.classList.toggle('close');
}
