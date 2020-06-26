'use strict';

// Запуск данных таблицы контрагентов:

function startUsersTable() {
  sendRequest(`../json/contractorsData.json`)
  //sendRequest(urlRequest.main, {action: 'dashboardTable'})
  .then(result => {
    var data = JSON.parse(result);
    data = convertData(data);
    initTable('contraTable', data);
    var contrasAdaptiveData = {
      area: 'contrasTable',
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
    initTable('contraTable');
  });
}
startUsersTable();
