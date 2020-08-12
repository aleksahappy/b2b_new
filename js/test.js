'use strict';

//=====================================================================================================
// Функции для презентации верстки с тестовыми json:
//=====================================================================================================

// Переключение состояния элементов на checked:

function toggle(event) {
  event.currentTarget.classList.toggle('checked');
}

// Преобразование полученных данных:

function convertData(data) {
  if (!data) {
    return [];
  }
  data.forEach(el => {
    el.order_sum = convertPrice(el.order_sum);
    var sum;
    for (var i = 1; i <= 5; i++) {
      sum = el[`sum${i}`];
      if (sum && sum != 0) {
        el[`sum${i}`] = convertPrice(sum);
        el[`display${i}`] = '';
      } else {
        el[`display${i}`] = 'displayNone';
      }
    }
  });
  return data;
}

// Тестирование формы:

function testNewUser() {
  console.log('sending data');
  clearForm('new-user-modal');
}


//  Для мобильного меню
//  Показыть/скрыть мобильное меню

function mobMenu() {
  var mobMenu = document.querySelector('#mob-menu');
  mobMenu.classList.toggle('active');
}

function runMobileMenu() {

}
runMobileMenu();
