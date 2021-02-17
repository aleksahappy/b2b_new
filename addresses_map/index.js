'use strict';

// Глобальные переменные:

var items = [],
    formMode,
    curId;

// Запуск страницы адресов:

function startPage() {
  sendRequest(`../json/addresses_test.json`)
  // sendRequest(urlRequest.main, 'get_delivery')
  .then(result => {
    if (result) {
      items = JSON.parse(result);
    }
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
  loadData('#addresses', items, [{area: '.time', items: 'time'}]);
  document.querySelectorAll('.address img').forEach(el => checkMedia(el, 'delete'));
  initForm('#address-form', sendForm);
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  items.forEach(el => {
    el.status_text = el.status == '1' ? 'Магазин прошел модерацию' : el.status == '0' ? 'Магазин не прошел модерацию,<br>свяжитесь с вашим менеджером' : 'Магазин проходит модерацию';
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
  if (curId !== id) {
    curId = id;
    if (id) {
      formMode = 'edit';
      title.textContent = 'Изменить адрес';
      var data = items.find(el => el.id == id);
      fillForm('#address-form', data);
    } else {
      formMode = 'add';
      title.textContent = 'Новый адрес';
      clearForm('#address-form');
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

// Открытие для заполнения в форме времени работы магазина:

function openWorkTime() {
  showElement('#address .work-time');
  hideElement('#address .main');
}

// Отправка формы на сервер:

function sendForm(formData) {
  if (formMode === 'add') {
    formData.append('id',  '0');
  } else if (formMode === 'edit') {
    formData.append('id', curId);
  }
  sendRequest(urlRequest.main, 'save_delivery', formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    console.log(result);
    if (result.ok && result.user_address_list.length) {
      if (formMode === 'add') {
        alerts.show('Адрес успешно добавлен.');
      } else if (formMode === 'edit') {
        alerts.show('Данные по адресу успешно изменены.');
      }
      items = result.user_address_list;
      convertData();
      updateTable('#addresses', items);
      closePopUp(null, '#address');
      clearForm('#address-form');
      curId = undefined;
    } else {
      showFormError('#address-form', result.error);
    }
    hideElement('#address .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
    hideElement('#address .loader');
  })
}
