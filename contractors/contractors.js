'use strict';

var addContraBtn = document.querySelector('#addContraBtn');
var addContraBtnMob = document.querySelector('#addContraBtnMob');
var contraModal = document.querySelector('#contraModal');
var closeContraModal = document.querySelector('#addContra .close-btn');

modalWin(addContraBtn, closeContraModal, contraModal);
modalWin(addContraBtnMob, closeContraModal, contraModal);


// Запуск данных таблицы контрагентов:

function startUsersTable() {
  sendRequest(`../json/contractorsData.json`)
  //sendRequest(urlRequest.main, {action: 'desktopTable'})
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
