'use strict';

// Глобальные переменные:

var items, prevForm;

// Запуск страницы адресов:

startAddressPage();

function startAddressPage() {
  sendRequest(`../json/addresses.json`)
  //sendRequest(urlRequest.main, {action: 'addresses'})
  .then(result => {
    items = JSON.parse(result);
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
  if (!items || !items.length) {
    return;
  }
  convertData();
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
      fillForm('#address-form', data, true);
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
  formData.append('action', '???');
  sendRequest(urlRequest.main, formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    console.log(result);
    if (result.ok) {
      alerts.show('Успешно.');
      closePopUp(null, '#address');
    } else {
      if (result.error) {
        alerts.show(result.error);
      } else {
        alerts.show('Ошибка в отправляемых данных. Перепроверьте и попробуйте еще раз.');
      }
    }
    hideElement('#address .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Ошибка сервера. Попробуйте позже.');
    hideElement('#address .loader');
  })
}
