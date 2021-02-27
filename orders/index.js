'use strict';

// Статусы заказа:
// 1: "Ожидает подтверждения"
// 2: "Подтвержден"
// 3: "Не оплачен"
// 4: "Оплачен"
// 5: "Завершен"
// 10: "Отменен"
// ??: "Ожидается оплата"

// Статусы товаров в заказе:
// 1: "Ожидается"
// 2: "В наличии"
// 3: "Собран"
// 4: "Отгружен"
// 5: "Непоставка"
// 6: "Рекламации"

// Запуск страницы заказов:

// getPageData('../json/orders.json')
getPageData(urlRequest.main, 'orderslist')
.then(result => {
  initPage(result);
  loader.hide();
});

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
        content: '<div class="item pill ord c10 ctr" data-status="#value#" data-value="#value#">#title#</div>',
        items: [
          {title: "Ожидается", value: "1"},
          {title: "В наличии", value: "2"},
          {title: "Собран", value: "3"},
          {title: "Отгружен", value: "4"},
          {title: "Непоставка", value: "5"},
          {title: "Без состояния", value: "NA"},
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
                    <div class="#isBill# icon" onclick="getBill(event, #id#)"></div>
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
        keys: ['debit_kredit']
      }, {
        title: 'Состояние товаров',
        class: 'pills',
        width: '25em',
        keys: ['sum'],
        content: '<div class="pill ord c10 #display#" data-status="#value#">#sum#</div>'
      }]
    },
    adaptive: {sub: [{area: '.pill', items: 'sum'}]},
    filters: {
      'order_date': {title: 'По дате заказа', sort: 'date'},
      'order_number': {title: 'По номеру заказа', search: 'usual'},
      'order_status': {title: 'По статусу заказа', sort: 'text', search: 'usual', filter: 'checkbox'},
      'contr_name': {title: 'По контрагенту', sort: 'text', search: 'usual'},
      'user_fio': {title: 'По заказчику', sort: 'text', search: 'usual'},
      'order_type': {title: 'По типу заказа', sort: 'text', search: 'usual', filter: 'checkbox', isMore: true},
      'order_sum': {title: 'По сумме счета', sort: 'numb', search: 'usual'},
      'debt': {title: 'По ДЗ/КЗ', sort: 'numb', search: 'usual'}
    }
  };
  initTable('#orderslist', settings);
}

// Преобразование полученных данных:

function convertData(data) {
  data.forEach(el => {
    if (!el.order_number) {
      el.order_status = 'В обработке';
    }
    var orderStatus = el.order_status.toLowerCase();

    if (orderStatus == 'в обработке') {
      el.isBill = 'loader';
    } else if (orderStatus == 'отменен') {
      el.isBill = 'download disabled';
    } else {
      el.isBill = 'download';
    }

    el.debit_kredit = convertPrice(el.debit_kredit, 2);

    el.order_sum = convertPrice(el.order_sum, 2);
    if (!el.sum) {
      el.sum = {"NA": 0};
    }
    var sum = [], title;
    for (var status in el.sum) {
      if ((status > 0 && status < 6) || status === 'NA') {
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
        } else if (status === 'NA') {
          title = 'Без состояния';
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

// Скачивание счета:

function getBill(event, id) {
  if (event.currentTarget.classList.contains('loader') || event.currentTarget.classList.contains('disabled')) {
    return;
  } else {
    window.open(`../api.php?action=order&order_id=${id}&mode=bill&type=pdf`);
  }
}
