'use strict';

// Динамическе переменные:

var items, prevForm;

// Запуск страницы адресов:

startAddressPage();

function startAddressPage() {
  sendRequest(`../json/addresses.json`)
  //sendRequest(urlRequest.main, {action: 'addresses'})
  .then(result => {
    items = JSON.parse(result);
    convertData();
    initPage();
  })
  .catch(err => {
    console.log(err);
    initPage();
  });
}

// Инициализация страницы:

function initPage() {
  items = items || [];
  fillTemplate({
    area: '#shops',
    items: items,
    sub:[{
      area: '.time',
      items: 'time'
    }]
  });
  initForm('#address');
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  items = items || [];
  var status, tooltip;
  items.forEach(el => {
    if (el.moderate === 'ok') {
      status = 'full';
      tooltip = 'Магазин прошел модерацию';
    } else if (el.moderate === 'process') {
      status = 'limit';
      tooltip = 'Магазин проходит модерацию';
    } else if (el.moderate === 'no') {
      status = 'off';
      tooltip = 'Магазин не прошел модерацию,<br>свяжитесь с вашим менеджером';
    }
    el.status = status;
    el.tooltip = tooltip;
  });
}

// Открытие всплывающего окна с формой:

function openAddressPopUp(id) {
  var addressPopUp = getEl('#address'),
      title = getEl('.pop-up-title .title', addressPopUp);
  if (prevForm !== id) {
    prevForm = id;
    if (id) {
      title.textContent = 'Изменить адрес';
      var data = items.find(el => el.id == id);
      fillForm('#address-form', data);
    } else {
      title.textContent = 'Новый адрес';
      clearForm('#address');
    }
  }
  openPopUp(addressPopUp);
}

// Открытие для заполнения во всплывающем окне времени работы магазина:

function openWorkTime() {
  showElement('#address .work-time');
  hideElement('#address .main');
}

// Блокировка/разблокировка поля выбора типа торговли:

function toggleTradeTypeField() {
  var toggle = getEl('#show'),
      field = getEl('#trade-type');
  if (toggle.checked) {
    field.removeAttribute('disabled');
    field.closest('.form-wrap').setAttribute('required', 'required');
  } else {
    window[`addressForm`][`dropDown0`].clear();
    field.setAttribute('disabled', 'disabled');
    field.closest('.form-wrap').removeAttribute('required', 'required');
  }
}
