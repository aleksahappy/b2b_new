'use strict';

// Статусы заказа:
// 1: "Ожидает подтверждения"
// 2: "Подтвержден"
// 3: "Не оплачен"
// 4: "Оплачен"
// 5: "Завершен"
// 10: "Отменен"

// Статусы товаров в заказе:
// 1: "Ожидается
// 2: "В наличии"
// 3: "Собран"
// 4: "Отгружен"
// 5: "Непоставка"
// 6: "Рекламации"

// Запуск страницы заказов:

startOrdersPage();

function startOrdersPage() {
  // sendRequest(`../json/orders.json`)
  sendRequest(urlRequest.main, 'orderslist')
  .then(result => {
    if (result) {
      var data = JSON.parse(result);
    }
    initPage(data);
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage(data = []) {
  convertData(data);
  var settings = {
    data: data,
    control: {
      pagination: true,
      search: 'Поиск по типу заказа, номеру, контрагенту, заказчику...',
      pill: {
        key: 'sum',
        content: '<div class="pill ord c10 ctr" data-status="#value#" data-value="#value#">#title#</div>',
        items: [
          {title: "Ожидается", value: "1"},
          {title: "В наличии", value: "2"},
          {title: "Собран", value: "3"},
          {title: "Отгружен", value: "4"},
          {title: "Непоставка", value: "5"},
          {title: "Удален", value: "deleted"},
        ]
      },
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
                    #bill_link#
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
        width: '25em',
        keys: ['sum'],
        content: '<div class="pill ord c10 #display#" data-status="#value#">#sum#</div>'
      }]
    },
    filters: {
      'order_date': {title: 'По дате заказа', sort: 'date'},
      'order_number': {title: 'По номеру заказа', search: 'usual'},
      'order_status': {title: 'По статусу заказа', sort: 'text', search: 'usual', filter: 'checkbox'},
      'contr_name': {title: 'По контрагенту', sort: 'text', search: 'usual'},
      'user_fio': {title: 'По заказчику', sort: 'text', search: 'usual'},
      'order_type': {title: 'По типу заказа', sort: 'text', search: 'usual', filter: 'checkbox'},
      'order_sum': {title: 'По сумме счета', sort: 'numb', search: 'usual'},
      'debt': {title: 'По ДЗ/КЗ', sort: 'numb', search: 'usual'}
    }
  };
  initTable('#orderslist', settings);
  // fillTemplate({
  //   area: '.table-adaptive',
  //   items: data,
  //   sub: [{area: '.pill', items: 'sum'}]
  // });
  loader.hide();
}

// Преобразование полученных данных:

function convertData(data) {
  data.forEach(el => {
    if (!el.order_number) {
      el.order_status = 'В обработке';
    }

    var orderStatus = el.order_status.toLowerCase();
    if (orderStatus == 'в обработке' || orderStatus == 'ожидает подтверждения' || orderStatus == 'отменен') {
      el.bill_link = '<div class="loader icon"></div>';
    } else {
      el.bill_link = `<a class="download icon" href="https://new.topsports.ru/api.php?action=order&order_id=${el.id}&mode=bill&type=pdf""></a>`
    }

    el.order_sum = convertPrice(el.order_sum, 2);
    if (!el.sum) {
      el.sum = {"deleted": 0};
    }
    var sum = [], title;
    for (var status in el.sum) {
      if ((status > 0 && status < 6) || status === 'deleted') {
        if (status == '1') {
          title = 'Ожидается';
        } else if (status == '2') {
          title = 'В наличии';
        } else if (status == '3') {
          title = 'Собран';
        } else if (status == '4') {
          title = 'Отгружен';
        } else if (status == '5') {
          title = 'Непоставка';
        } else if (status === 'deleted') {
          title = 'Удален';
        }
        sum.push({
          title: title,
          value: status,
          sum: convertPrice(el.sum[status], 2)
        });
      }
    }
    el.sum = sum;
  });
}

// Загрузка данных о накладных и открытие всплывающего окна отгрузок:

function openShipment(id) {
  sendRequest(urlRequest.main, 'order', {order_id: id})
  .then(result => {
    result = JSON.parse(result);
    result = getNaklsData(result);
    if (result.length) {
      fillTemplate({
        area: '#shipments tbody',
        items: result
      });
      openPopUp('#shipments');
    } else {
      throw new Error('Нет данных.');
    }
  })
  .catch(error => {
    console.log(error);
    alerts.show('Отсутствуют данные для загрузки.');
  });
}

// Получение данных о накладных из csv-формата:

function getNaklsData(data) {
  var result = [];
  if (!data.orderitems || !data.orderitems.arnaklk || !data.orderitems.arnaklv) {
    return result;
  }
  var keys = data.orderitems.arnaklk.split('@$'),
      values = data.orderitems.arnaklv.split('^@^');
  for (var i = 0; i < values.length; i++) {
    var value = values[i].split('@$'),
        list = [];
    for (var ii = 0; ii < value.length; ii++) {
      list[keys[ii]] = value[ii];
    }
    list.id = data.id;
    if (list.rtrac.indexOf('<a ') >= 0) {
      list.rtrac = list.rtrac.match(/\<a.+\<\/a>/gm)[0];
    }
    result[i] = list;
  }
  return result;
}
