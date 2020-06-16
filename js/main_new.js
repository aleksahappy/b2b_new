'use strict';

//  Работа универсального модального окна

function modalWin(btn, close, modal) {
  btn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  close.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', function (event) {
      if (event.target === this) {
        modal.style.display = 'none';
      }
  });

  window.addEventListener('keydown', function (event) {
      if(event.key === 'Escape') {
        modal.style.display = 'none';
      }
  });
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
