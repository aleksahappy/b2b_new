'use strict';

// Запускаем рендеринг страницы документов:

startReclmPage();

// Запуск страницы документов:

function startReclmPage() {
  sendRequest(`../json/recls_data.json`)
  // sendRequest(urlRequest.main, {action: '???'})
  .then(result => {
    var data = JSON.parse(result);
    initPage(data);
  })
  .catch(err => {
    console.log(err);
    initPage();
  });
}

// Инициализация страницы:

function initPage(data) {
  var settings = {
    data: data,
    head: true,
    result: false,
    trFunc: 'onclick=showReclm(#id#)',
    cols: [{
      key: 'num',
      title: '№',
      sort: 'text',
      filter: 'search'
    }, {
      key: 'date',
      title: 'Дата',
      sort: 'date'
    }, {
      key: 'name',
      title: 'Наименование',
      sort: 'text',
      filter: 'search'
    }, {
      key: 'articul',
      title: 'Артикул',
      sort: 'text',
      filter: 'search'
    }, {
      key: 'manager',
      title: 'Менеджер',
      sort: 'text',
      filter: 'full'
    }, {
      key: 'trac',
      title: 'Статус',
      sort: 'text',
      filter: 'full',
      content: `<div class="#status# recl pill">#trac#</div>`
    }]
  };
  initTable('#reclm', settings);
  loader.hide();
}
