'use strict';

// Запуск данных таблицы контрагентов:

function startUsersTable() {
  sendRequest(`../json/contractorsData2.json`)
  //sendRequest(urlRequest.main, {action: 'dashboardTable'})
  .then(result => {
    var data = JSON.parse(result);
    loader.hide();
    data = convertData(data);
    console.log(data)
    var settings = {
      data: data,
      head: true,
      result: false,
      cols: [{
        key: 'access',
        title: 'Доступ',
        content: '<div class="toggle #access#" onclick="toggle(event)"><div class="toggle-in"></div></div>'
      }, {
        key: 'inn',
        title: 'ИНН/КПП',
        sort: 'numb',
        filter: 'search'
      }, {
        key: 'contr',
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
        subkey: 'status_info',
        title: 'Документы',
        content: '<div class="docs row #status-ic#"><div class="mark icon #status#" data-tooltip="#status_info#"></div><a href="url" target="_blank" data-tooltip="#info#" text="left" help>#title#</a></div>',
        filter: 'checkbox'
      }],
      sub: [{area: '.docs', items: 'docs'}]
    };
    initTable('contra-table', settings);
    var contrasAdaptiveData = {
      area: 'contras-table',
      items: data,
      sub: [{
        area: '.docs',
        items: 'doc'
      }]
    }
    fillTemplate(contrasAdaptiveData);
  })
  .catch(err => {
    loader.hide();
    console.log(err);
    initTable('contra-table');
  });
}
startUsersTable();
