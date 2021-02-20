'use strict';

// Глобальные переменные:

var data;

// Запуск страницы профиля:

// getPageData('../json/profile.json')
getPageData(urlRequest.main, 'profile')
.then(result => {
  data = result;
  initPage();
  loader.hide();
});

// Инициализация страницы:

function initPage() {
  fillContent();
  initForm('#profile-form', sendProfile);
}

// Заполнение/перезаполнение основного содержимого страницы:

function fillContent() {
  convertData();
  fillTemplate({
    area: '.profile-info .content',
    items: data,
    replace: '&ndash;'
  });
}

// Преобразование полученных данных:

function convertData() {
  if (isEmptyObj(data)) {
    return;
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
  fillForm('#profile-form', data);
  openPopUp('#profile-edit');
}

// Отправка формы на сервер:

function sendProfile(formData) {
  sendRequest(urlRequest.main, 'profile_save', formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    if (result.data && !isEmptyObj(result.data)) {
      data = result.data;
      fillContent()
      closePopUp(null, '#profile-edit');
    } else {
      showFormError('#profile-form', result.error);
    }
    hideElement('#profile-edit .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
    hideElement('#profile-edit .loader');
  })
}
