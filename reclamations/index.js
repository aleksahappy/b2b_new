'use strict';

// Запуск страницы рекламаций:

startReclmPage();

function startReclmPage() {
  // sendRequest(`../json/reclamations.json`)
  sendRequest(urlRequest.main, {action: 'recllist'})
  .then(result => {
    // console.log(result);
    var data = JSON.parse(result);
    console.log(data);
    initPage(data);
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage() {
  if (!data || !data.length) {
    return;
  }
  convertData(data);
  var settings = {
    data: data,
    control: {
      pagination: true,
      search: 'Поиск...',
      setting: true
    },
    head: true,
    result: false,
    trFunc: 'onclick=showReclm(#id#)',
    cols: [{
      title: '№',
      width: '7%',
      key: 'recl_num',
      sort: 'text',
      search: 'usual'
    }, {
      title: 'Дата',
      width: '10%',
      align: 'center',
      key: 'recl_date',
      sort: 'date',
      search: 'date'
    }, {
      title: 'Наименование',
      width: '30%',
      key: 'item_title',
      sort: 'text',
      search: 'usual'
    }, {
      title: 'Артикул',
      key: 'item_articul',
      sort: 'text',
      search: 'usual'
    }, {
      title: 'Менеджер',
      key: 'manager_lastname',
      sort: 'text',
      search: 'usual',
      filter: true
    }, {
      title: 'Статус',
      class: 'pills',
      align: 'center',
      key: 'status_text',
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
