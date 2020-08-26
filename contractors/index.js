'use strict';

// Запускаем рендеринг страницы контрагентов:

startContrPage();

// Запуск страницы контрагентов:

function startContrPage() {
  sendRequest(`../json/contractors_2_data.json`)
  // sendRequest(urlRequest.main, {action: 'get_contr'})
  .then(result => {
    // console.log(result);
    var data = JSON.parse(result);
    // console.log(data);
    // data = convertData(data);
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
    head: true,
    result: false,
    cols: [{
      key: 'access',
      title: 'Доступ',
      content: '<div class="toggle #access#" onclick="toggleAccess(event, #id#)"><div class="toggle-in"></div></div>'
    }, {
      key: 'inn',
      title: 'ИНН/КПП',
      sort: 'numb',
      filter: 'search'
    }, {
      key: 'title',
      title: 'Контрагент',
      sort: 'text',
      filter: 'full'
    }, {
      key: 'system',
      title: 'Система налогообложения',
      sort: 'text',
      filter: 'full'
    }, {
      key: 'date',
      title: 'Дата заведения',
      sort: 'date',
      filter: 'search'
    }, {
      key: 'address',
      title: 'Юридический адрес',
      filter: 'search'
    }, {
      key: 'user',
      title: 'Пользователь',
      sort: 'text',
      filter: 'full'
    }, {
      key: 'docs',
      title: 'Документы',
      content: '<div class="docs row #status-ic#"><div class="mark icon #status#" data-tooltip="#status_info#"></div><a href="url" target="_blank" data-tooltip="#info#" text="left" help>#title#</a></div>'
    }],
    sub: [{area: '.docs', items: 'docs'}]
  };
  initTable('#contr-table', settings);
  fillTemplate({
    area: "#contr-table-adaptive",
    items: data,
    sub: [{area: '.docs', items: 'docs'}]
  });
  initForm('#contr-form');
  loader.hide();
}

// Включение/отключение доступа:

function toggleAccess(event, id) {
  event.currentTarget.classList.toggle('checked');
  // var action = event.currentTarget.classList.contains('checked') ? 'off' : 'on';
  // sendRequest(urlRequest.main, {action: '???', data: {id: id, action: action}})
  // .then(result => {
  //   event.currentTarget.classList.toggle('checked');
  // })
  // .catch(err => {
  //   console.log(err);
  // });
}
