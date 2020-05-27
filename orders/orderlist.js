'use strict';

// Запускаем рендеринг страницы заказов:

startPage();

//=====================================================================================================
// Получение и отображение информации о заказах:
//=====================================================================================================

// Запуск страницы заказа:

function startPage() {
  sendRequest(`/data.json`)
  // sendRequest(urlRequest.main, {action: 'orderslist'})
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
    el.vputi = getPercent(el.objects_status[1], el.count);
    el.vnali = getPercent(el.objects_status[3], el.count);
    el.sobrn = getPercent(el.objects_status[2], el.count);
    el.otgrz = getPercent(el.objects_status[6], el.count);
    el.nedop = getPercent(el.objects_status[4] + el.objects_status[5], el.count);
  });
  return data;
}


