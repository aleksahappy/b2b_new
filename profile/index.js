'use strict';

// Глобальные переменные:

var data;

// Запуск страницы профиля:

startProfilePage();

function startProfilePage() {
  // sendRequest(`../json/profile.json`)
  sendRequest(urlRequest.main, {action: 'profile'})
  .then(result => {
    data = JSON.parse(result);
    initPage();
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage() {
  if (!data || isEmptyObj(data)) {
    return;
  }
  convertData();
  fillTemplate({
    area: '.profile-info .content',
    items: data
  });
  initForm('#profile-form', sendProfile);
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  data.gender_text = data.gender == '1' ? 'муж.' : 'жен.';
  data.phone = convertPhone(data.phone);
  data.work_phone = convertPhone(data.phone);
}

// Открытие всплывающего окна с формой:

function openProfilePopUp() {
  fillForm('#profile-form', data, true);
  openPopUp('#profile-edit');
}

// Отправка формы на сервер:

function sendProfile(formData) {
  formData.append('action', 'profile_save');
  sendRequest(urlRequest.main, formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    console.log(result);
    if (result.data && !isEmptyObj(result.data)) {
      data = result.data;
      convertData();
      fillTemplate({
        area: '.profile-info .content',
        items: data
      });
      closePopUp(null, '#profile-edit');
    } else {
      if (result.error) {
        alerts.show(result.error);
      } else {
        alerts.show('Ошибка в отправляемых данных. Перепроверьте и попробуйте еще раз.');
      }
    }
    hideElement('#profile-edit .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Ошибка сервера. Попробуйте позже.');
    hideElement('#profile-edit .loader');
  })
}
