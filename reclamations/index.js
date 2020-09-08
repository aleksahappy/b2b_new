'use strict';

// Запуск страницы рекламаций:

startReclmPage();

function startReclmPage() {
  // sendRequest(`../json/reclamations.json`)
  sendRequest(urlRequest.main, {action: 'recllist'})
  .then(result => {
    // console.log(result);
    var data = JSON.parse(result);
    data = convertData(data);
    console.log(data);
    initPage(data);
  })
  .catch(err => {
    console.log(err);
    initPage();
  });
}

// Инициализация страницы:

function initPage(data) {
  data = data || [];
  var settings = {
    data: data,
    control: {
      pagination: true,
      search: 'Поиск по типу заказа, номеру, контрагенту, заказчику...',
      setting: true
    },
    head: true,
    result: false,
    trFunc: 'onclick=showReclm(#id#)',
    cols: [{
      key: 'recl_num',
      title: '№',
      sort: 'text',
      search: 'usual'
    }, {
      key: 'recl_date',
      title: 'Дата',
      sort: 'date',
      search: 'date'
    }, {
      key: 'item_title',
      title: 'Наименование',
      sort: 'text',
      search: 'usual'
    }, {
      key: 'item_articul',
      title: 'Артикул',
      sort: 'text',
      search: 'usual'
    }, {
      key: 'manager_lastname',
      title: 'Менеджер',
      sort: 'text',
      search: 'usual',
      filter: true
    }, {
      key: 'status_text',
      title: 'Статус',
      sort: 'text',
      search: 'usual',
      filter: true,
      content: `<div class="#status# recl pill">#status_text#</div>`
    }]
  };
  initTable('#reclm', settings);
  fillTemplate({
    area: '#reclm-adaptive .table',
    items: data
  });
  loader.hide();
}

// Преобразование полученных данных:

function convertData(data) {
  var status;
  data.forEach(el => {
    switch (el.status) {
      case '1':
        status = 'registr';
        break;
      case '2':
        status = 'wait';
        break;
      case '3':
        status = 'yes';
        break;
      case '4':
        status = 'no';
        break;
      case '5':
        status = 'done';
        break;
    }
    el.status = status;
  });
  return data;
}

// 1: "Зарегистрирована"
// 2: "Обрабатывается"
// 3: "Удовлетворена"
// 4: "Не удовлетворена"
// 5: "Исполнена"
