'use strict';

// Запуск страницы профиля:

startProfPage();

function startProfPage() {
  sendRequest(`../json/profile.json`)
  //sendRequest(urlRequest.main, {action: 'profile'})
  .then(result => {
    var data = JSON.parse(result);
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
  fillTemplate({
    area: '#profile-card',
    items: data,
    sign: '@@'
  });
  initForm('#edit-profile-modal');
  loader.hide();
}
