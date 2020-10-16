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
  document.querySelectorAll('.shop').forEach(el => checkImg(el));
  initForm('#address-form', sendForm);
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

// Инициализация формы для данной страницы:

function initForm(el, callback) {
  var el = getEl(el);
  if (el && el.id) {
    window[`${el.id}Form`] = new FormAddresses(el, callback);
  }
}

// Доработка объекта формы под конкретные нужды страницы:

function FormAddresses(obj, callback) {
  Form.apply(this, arguments);
  this.btns = obj.querySelectorAll('.btn');
  getEl('#show').addEventListener('change', () => this.checkSubmit());

  // Блокировка/разблокировка кнопок:
  this.toggleBtn = function() {
    if (this.isSubmit) {
      this.btns.forEach(el => el.removeAttribute('disabled'));
    } else {
      this.btns.forEach(el => el.setAttribute('disabled','disabled'));
    }
  }
  this.toggleBtn();
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
  toggleTradeTypeField();
  openPopUp(addressPopUp);
}

// Блокировка/разблокировка поля выбора типа торговли:

function toggleTradeTypeField() {
  var toggle = getEl('#show'),
      field = getEl('#trade-type'),
      addBtn = getEl('#add-btn');
  if (toggle.checked) {
    field.removeAttribute('disabled');
    field.closest('.form-wrap').setAttribute('required', 'required');
    showElement(addBtn);
  } else {
    window['trade-typeDropdown'].clear();
    field.setAttribute('disabled', 'disabled');
    field.closest('.form-wrap').removeAttribute('required', 'required');
    hideElement(addBtn);
  }
}

// Открытие для заполнения во всплывающем окне времени работы магазина:

function openWorkTime() {
  showElement('#address .work-time');
  hideElement('#address .main');
}

// Отправка формы на сервер:

function sendForm(formData) {
  formData.forEach((value, key) => {
    console.log(key, value);
  });
}
