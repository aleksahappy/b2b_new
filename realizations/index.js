'use strict';

// Запуск страницы реализаций:

getPageData('../json/realizations.json')
// getPageData(urlRequest.main, '???')
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
      search: 'Поиск...',
      setting: true
    },
    desktop: {
      head: true,
      trFunc: 'onclick="goToPage(event,`realization/?#id#`)"',
      cols: [{
        title: 'Реализация',
        keys: ['realiz_number', 'realiz_date'],
        content:
        `<div class="row">
          <a class="download icon" href="../api.php?action=order&order_id=#id#&mode=nakl&type=pdf&name=#rencname#&id=#rdocid#"></a>
          <div>
            <div>#realiz_number#</div>
            <div class="text light">#realiz_date#</div>
          </div>
        </div>`
      }, {
        title: 'Трек-код',
        align: 'center',
        keys: ['trac']
      }, {
        title: 'Контрагент',
        keys: ['contr_name']
      }, {
        title: 'Заказ',
        keys: ['order_number'],
        content:
        `<div class="row">
          <a class="barcode icon" href="../api.php?action=order&order_id=#id#&mode=bar&type=xls&name=#rencname#&id=#rdocid#" data-tooltip="Скачать штрихкоды"></a>
          <div>#order_number#</div>
        </div>`
      }, {
        title: 'Сумма реализации',
        class: 'desktop',
        align: 'right',
        keys: ['summ']
      }, {
        title: 'Сумма оплаты',
        class: 'desktop',
        align: 'right',
        keys: ['paid']
      }, {
        title: 'Сумма долга',
        class: 'desktop attention',
        align: 'right',
        keys: ['dolg']
      }, {
        title: 'ДЗ/КЗ',
        class: 'desktop',
        align: 'right',
        keys: ['debit_kredit']
      }, {
        title: 'Дата оплаты',
        class: 'desktop attention',
        align: 'center',
        keys: ['dolg_date']
      }, {
        title: 'Долг и д.оплаты',
        class: 'adaptive attention',
        align: 'right',
        keys: ['dolg', 'dolg_date'],
        content:
        `<div>
          <div class="text red">#dolg#</div>
          <div class="text light">#dolg_date#</div>
        </div>`
      }]
    },
    bound: 767,
    filters: {
      'realiz_date': {title: 'По дате реализации', sort: 'date'},
      'realiz_number': {title: 'По номеру реализации', search: 'usual'},
      'trac': {title: 'По номеру трек-кода', search: 'usual'},
      'contr_name': {title: 'По контрагенту', sort: 'text', search: 'usual'},
      'order_number': {title: 'По номеру заказа', sort: 'numb', search: 'usual'},
      'summ': {title: 'По сумме реализации', sort: 'numb', search: 'usual'},
      'paid': {title: 'По сумме оплаты', sort: 'numb', search: 'usual'},
      'dolg': {title: 'По сумме долга', sort: 'numb', search: 'usual'},
      'debit_kredit': {title: 'По сумме ДЗ/КЗ', sort: 'numb', search: 'usual'},
      'dolg_date': {title: 'По дате оплаты', sort: 'date'}
    }
  };
  initTable('#realizations', settings);
}

// Преобразование полученных данных:

function convertData(data) {
  data.forEach(el => {
    el.summ = convertPrice(el.summ, 2);
    el.paid = convertPrice(el.paid, 2);
    el.dolg = convertPrice(el.dolg, 2);
    el.debit_kredit = convertPrice(el.debit_kredit, 2);
  });
}
