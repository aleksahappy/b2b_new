'use strict';

// Глобальные переменные:

var data;

// Запуск страницы профиля:

function startPage() {
  // sendRequest(`../json/profile.json`)
  sendRequest(urlRequest.main, 'profile')
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
  if (isEmptyObj(data)) {
    return
  }
  if (data.gender == '1') {
    data.gender_text = 'муж.';
  } else if (data.gender == '2') {
    data.gender_text = 'жен.';
  }
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
  sendRequest(urlRequest.main, 'profile_save', formData, 'multipart/form-data')
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
    alerts.show('Произошла ошибка, попробуйте позже.');
    hideElement('#profile-edit .loader');
  })
}
