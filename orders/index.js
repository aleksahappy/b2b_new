'use strict';

// Запускаем рендеринг страницы заказов:

startOrdersPage();

// Запуск страницы заказов:

function startOrdersPage() {
  // sendRequest(`../json/orders.json`)
  sendRequest(urlRequest.main, {action: 'orderslist'})
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
      content: '<div class="pill c10 #type# #display#">#sum#</div>'
    }],
    sub: [{area: '.pill', items: 'sum'}]
  }
  initTable('#orderslist', settings);
  loader.hide();
}

// Преобразование полученных данных:

function convertData(data) {
  data.forEach(el => {
    el.order_sum = convertPrice(el.order_sum);
    var data = [], item, type;
    for (var sum in el.sum) {
      item = {}
      if (el.sum[sum] != 0) {
        switch (sum.substr(-1)) {
          case '1':
            type = 'vputi';
            break;
          case '2':
            type = 'vnali';
            break;
          case '3':
            type = 'sobrn';
            break;
          case '4':
            type = 'otgrz';
            break;
          case '5':
            type = 'nedop';
            break;
        }
        item.sum = convertPrice(el.sum[sum]);
        item.type = type;
        item.display = '';
      } else {
        item.display =  'displayNone';
      }
      data.push(item);
    }
    el.sum = data;
  });
  console.log(data);
  return data;
}
