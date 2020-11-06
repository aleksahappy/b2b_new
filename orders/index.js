'use strict';

// Статусы заказов:
// 1: "В пути"
// 2: "В наличии"
// 3: "Собран"
// 4: "Отгружен"
// 5: "Недопоставка"

// Запускаем рендеринг страницы заказов:

startOrdersPage();

// Запуск страницы заказов:

function startOrdersPage() {
  sendRequest(`../json/orders.json`)
  // sendRequest(urlRequest.main, {action: 'orderslist'})
  .then(result => {
    var data = JSON.parse(result);
    // console.log(data);
    initPage(data);
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage(data) {
  if (!data || !data.length) {
    return;
  }
  convertData(data);
  var settings = {
    data: data,
    control: {
      pagination: true,
      search: 'Поиск по типу заказа, номеру, контрагенту, заказчику...',
      setting: true
    },
    desktop: {
      head: true,
      trFunc: 'onclick=showOrder(event,#id#)',
      sub: [{area: '.pill', items: 'sum'}],
      cols: [{
        title: 'Заказ',
        width: '10%',
        keys: ['order_number', 'order_date'],
        content: `<div class="row">
                    <div class="download icon" onclick="openPopUp('#shipment')"></div>
                    <div>
                      <div>#order_number#</div>
                      <div class="text light">#order_date#</div>
                    </div>
                  </div>`
      }, {
        title: 'Статус заказа',
        keys: ['order_status']
      }, {
        title: 'Контрагент',
        width: '15%',
        keys: ['contr_name']
      }, {
        title: 'Заказчик',
        width: '15%',
        keys: ['user_fio']
      }, {
        title: 'Тип заказа',
        keys: ['order_type']
      }, {
        title: 'Сумма счета',
        align: 'right',
        keys: ['order_sum']
      }, {
        title: 'ДЗ/КЗ',
        align: 'right',
        keys: ['debt']
      }, {
        title: 'Состояние товаров',
        class: 'pills',
        width: '15%',
        content: '<div class="pill c10 #type# #display#">#sum#</div>'
      }]
    },
    sorts: {
      'order_date': {title: 'По дате заказа', type: 'date'},
      'order_status': {title: 'По статусу заказа', type: 'text'},
      'contr_name': {title: 'По контрагенту', type: 'text'},
      'user_fio': {title: 'По заказчику', type: 'text'},
      'order_type': {title: 'По типу заказа', type: 'text'},
      'order_sum': {title: 'По сумме счета', type: 'numb'},
      'debt': {title: 'По ДЗ/КЗ', type: 'numb'}
    },
    filters: {
      'order_number': {title: 'По номеру заказа', search: 'usual'},
      'order_status': {title: 'По статусу заказа', search: 'usual', filter: 'checkbox'},
      'contr_name': {title: 'По контрагенту', search: 'usual'},
      'user_fio': {title: 'По заказчику', search: 'usual'},
      'order_type': {title: 'По типу заказа', search: 'usual', filter: 'checkbox'},
      'order_sum': {title: 'По сумме счета', search: 'usual'},
      'debt': {title: 'По ДЗ/КЗ', search: 'usual'}
    }
  };
  initTable('#orderslist', settings);
  fillTemplate({
    area: '.table-adaptive',
    items: data,
    sub: [{area: '.pill', items: 'sum'}]
  });
  loader.hide();
}

// Преобразование полученных данных:

function convertData(data) {
  data.forEach(el => {
    el.order_sum = convertPrice(el.order_sum, 2);
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
          item.sum = convertPrice(el.sum[sum], 2);
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
