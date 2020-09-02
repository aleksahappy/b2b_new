'use strict';

// Запускаем рендеринг страницы заказов:

startOrdersPage();

// Запуск страницы заказов:

function startOrdersPage() {
  sendRequest(`../json/orders.json`)
  // sendRequest(urlRequest.main, {action: 'orderslist'})
  .then(result => {
    var data = JSON.parse(result);
    data = convertData(data);
    initPage(data);
  })
  .catch(err => {
    console.log(err);
    initPage();
  });
}

// Инициализация страницы:

function initPage(data = []) {
  var settings = {
    data: data,
    control: {
      pagination: true,
      search: 'Поиск по типу заказа, номеру, контрагенту, заказчику...',
      setting: true
    },
    head: true,
    trFunc: 'onclick=showOrder(event,#id#)',
    cols: [{
      title: 'Заказ',
      content: `<div class="row">
                  <a href="" class="download icon"></a>
                  <div>
                    <div>#order_number#</div>
                    <div class="text light">#order_date#</div>
                  </div>
                </div>`
    }, {
      key: 'order_status',
      title: 'Статус заказа',
      sort: 'text',
      search: 'usual',
      filter: true
    }, {
      key: 'contr_name',
      title: 'Контрагент',
      sort: 'text',
      search: 'usual'
    }, {
      key: 'user_fio',
      title: 'Заказчик',
      sort: 'text',
      search: 'usual'
    }, {
      key: 'order_type',
      title: 'Тип заказа',
      sort: 'text',
      filter: 'full'
    }, {
      key: 'order_sum',
      title: 'Сумма счета',
      sort: 'numb',
      filter: 'search'
    }, {
      key: 'debt',
      title: 'ДЗ/КЗ',
      sort: 'numb',
      filter: 'search'
    }, {
      key: '',
      title: 'Состояние товаров',
      content: `<div class="row">
                  <div class="pill vputi c10 #type#">#sum#</div>
                </div>`
    }],
    sub: [{area: '.pills', items: 'sum'}]
  }
  initTable('#orderslist', settings);
  loader.hide();
}

// Преобразование полученных данных:

function convertData(data) {
  data.forEach(el => {
    el.order_sum = convertPrice(el.order_sum);
    for (var sum in el.sum) {
      if (el.sum[sum] != 0) {
        el.sum[sum] = convertPrice(el.sum[sum]);
        el.sum.display = '';
      } else {
        el.sum.display = 'displayNone';
      }
    }
  });
  return data;
}


// 1 - vputi
// 2 - vnali
// 3 - sobrn
// 4 - otgrz
// 5 - nedop

// sum: [{
//   title: 'В пути',
//   type: 'vputi',
//   sum: 10000
// }, {
//   title: 'Собран',
//   type: 'sobrn',
//   sum: 5000
// }]

// <div class="pills" data-key="sum">
//   <div class="pill" data-key="type" data-value="vputi"></div>
//   <div class="pill" data-key="type" data-value="vnali"></div>
//   <div class="pill" data-key="type" data-value="sobrn"></div>
//   <div class="pill" data-key="type" data-value="otgrz"></div>
//   <div class="pill" data-key="type" data-value="nedop"></div>
// </div>


// function
// items.find(el => {
//   el[key].forEach(el => {
//     if (el[key] === value)
//   });
// });