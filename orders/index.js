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
    // console.log(data);
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
      width: '10%',
      content: `<div class="row">
                  <a href="" class="download icon"></a>
                  <div>
                    <div>#order_number#</div>
                    <div class="text light">#order_date#</div>
                  </div>
                </div>`
    }, {
      title: 'Статус заказа',
      key: 'order_status',
      sort: 'text',
      search: 'usual',
      filter: true
    }, {
      title: 'Контрагент',
      width: '15%',
      key: 'contr_name',
      sort: 'text',
      search: 'usual'
    }, {
      title: 'Заказчик',
      width: '15%',
      key: 'user_fio',
      sort: 'text',
      search: 'usual'
    }, {
      title: 'Тип заказа',
      key: 'order_type',
      sort: 'text',
      search: 'usual',
      filter: true
    }, {
      title: 'Сумма счета',
      align: 'right',
      key: 'order_sum',
      sort: 'numb',
      search: 'usual'
    }, {
      title: 'ДЗ/КЗ',
      align: 'right',
      key: 'debt',
      sort: 'numb',
      search: 'usual'
    }, {
      title: 'Состояние товаров',
      class: 'pills',
      width: '20%',
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
    var data = [],type, item;
    for (var sum in el.sum) {
      type = sum.substr(-1);
      if (type > 0 && type < 6) {
        item = {};
        if (el.sum[sum] != 0) {
          switch (type) {
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
    }
    el.sum = data;
  });
  return data;
}
