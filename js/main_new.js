'use strict';

// Свернуть/развернуть содержимое контейнера:

function switchContent(event) {
  if (event.target.closest('.switch-cont')) {
    return;
  }
  var container = event.currentTarget.closest('.switch');
  if (!container || container.classList.contains('disabled')) {
    return;
  }
  var toggleIcon = getEl('.switch-icon', container);
  if (!toggleIcon || getComputedStyle(toggleIcon).display === 'none') {
    return;
  }
  container.classList.toggle('close');
  if (container.id && container.classList.contains('save')) {
    if (container.classList.contains('close')) {
      savePosition(container.id, 'close');
    } else {
      savePosition(container.id, 'open');
    }
  }
}

//  Работа обновленных кнопок-тогглов

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
