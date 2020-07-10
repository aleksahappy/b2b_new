'use strict';

// Запускаем рендеринг страницы заказов:

startPage();

//=====================================================================================================
// Получение и отображение информации о заказах:
//=====================================================================================================

// Запуск страницы заказа:

function startPage() {
  // sendRequest(`/data.json`)
  sendRequest(urlRequest.main, {action: 'orderslist'})
  .then(result => {
    var data = JSON.parse(result);
    console.log(data);
    data = convertData(data);
    initTable('orderslist', data);
  })
  .catch(err => {
    console.log(err);
    initTable('orderslist');
  });
}

//=====================================================================================================
// Преобразование полученных данных:
//=====================================================================================================

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
