'use strict';

// Запуск страницы профиля:

startProfilePage();

function startProfilePage() {
  sendRequest(`../json/profile.json`)
  // sendRequest(urlRequest.main, {action: 'profile'})
  .then(result => {
    // console.log(result);
    var data = JSON.parse(result);
    // console.log(data);
    initPage(data);
  })
  .catch(err => {
    console.log(err);
    initPage();
  });
}

// Инициализация страницы:

function initPage(data = []) {
  fillTemplate({
    area: '.profile-info .content',
    items: data
  });
  initForm('#profile-form', sendProfile);
  loader.hide();
}

// Отправка формы на сервер:

function sendProfile(formData) {
  formData.forEach((value, key) => {
    console.log(key, value);
  });
  formData.append('action', 'send_profile');
  sendRequest(urlRequest.main, formData, 'multipart/form-data')
  .then(result => {
    console.log(result);
    var data = JSON.parse(result);
    fillTemplate({
      area: '.profile-info .content',
      items: data
    });
  })
  .catch(error => {
    console.log(error);
    hideElement('#profile-edit .loader');
    closePopUp('#profile-edit');
    alerts.show('Данные не были отправлены. Попробуйте еще раз.');
  })
}
