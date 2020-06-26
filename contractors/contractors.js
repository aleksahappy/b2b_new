'use strict';

// Запуск данных таблицы контрагентов:

function startUsersTable() {
  sendRequest(`../json/contractorsData.json`)
  //sendRequest(urlRequest.main, {action: 'dashboardTable'})
  .then(result => {
    var data = JSON.parse(result);
    data = convertData(data);
    initTable('contra-table', data);
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
    console.log(err);
    initTable('contra-table');
  });
}
startUsersTable();
