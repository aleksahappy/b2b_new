'use strict';

// Статусы рекламаций:
// 1: "Зарегистрирована"
// 2: "Обрабатывается"
// 3: "Удовлетворена"
// 4: "Не удовлетворена"
// 5: "Исполнена"

// Запуск страницы рекламаций:

startReclmPage();

function startReclmPage() {
  // sendRequest(`../json/reclamations.json`)
  sendRequest(urlRequest.main, {action: 'recllist'})
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
  var settings = {
    data: data,
    control: {
      pagination: true,
      search: 'Поиск...',
      setting: true
    },
    desktop: {
      head: true,
      result: false,
      trFunc: 'onclick=showReclm(event,#id#)',
      cols: [{
        title: '№',
        width: '7%',
        keys: ['recl_num']
      }, {
        title: 'Дата',
        width: '10%',
        align: 'center',
        keys: ['recl_date']
      }, {
        title: 'Наименование',
        width: '30%',
        keys: ['item_title']
      }, {
        title: 'Артикул',
        keys: ['item_articul']
      }, {
        title: 'Менеджер',
        keys: ['manager_lastname']
      }, {
        title: 'Статус',
        class: 'pills',
        align: 'center',
        keys: ['status_text'],
        content: `<div class="recl pill" data-status="#status#">#status_text#</div>`
      }]
    },
    filters: {
      'recl_num': {title: 'По номеру рекламации', sort: 'text', search: 'usual'},
      'recl_date': {title: 'По дате создания', sort: 'date', search: 'date'},
      'item_articul': {title: 'По артикулу', sort: 'text', search: 'usual'},
      'manager_lastname': {title: 'По менеджеру', search: 'usual', filter: 'checkbox'},
      'status_text': {title: 'По статусу рекламации', search: 'usual', filter: 'checkbox'}
    }
  };
  initTable('#reclm', settings);
  fillTemplate({
    area: '.table-adaptive',
    items: data
  });
  loader.hide();
}
