'use strict';

// Глобальные переменные:

var items = [],
    formMode,
    curId;

// Запуск страницы адресов:

startAddressPage();

function startAddressPage() {
  sendRequest(`../json/addresses.json`)
  //sendRequest(urlRequest.main, '???')
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
  document.addEventListener('click', toggleAddress);
  convertData();
  var settings = {
    data: items,
    desktop: {
      head: true,
      result: false,
      // sub: [{area: '.time', items: 'time'}],
      cols: [{
        title: 'Адрес',
        width: '30%',
        class: 'name',
        keys: ['full_address']
      }, {
        title: 'Название',
        width: '15%',
        keys: ['title', 'type'],
        content: `<div>#title#</div><div class="text light">#type#</div>`
      }, {
        title: 'Сайт',
        keys: ['site'],
        content: '<a href="http://#site#" target="_blank">#site#</a>'
      }, {
        title: 'Телефон',
        keys: ['phone'],
        content: '<a href="tel:#phone#">#phone#</a>'
      }, {
      //   title: 'Время работы',
      //   keys: ['time'],
      //   content: `<div class="time row">
      //               <div>#day#</div>
      //               <div>#time#</div>
      //             </div>`
      // }, {
        title: 'Статус модерации',
        align: 'center',
        class: 'pills',
        keys: ['status_text'],
        content: `<div class="status pill" data-status="#status#">#status_text#</div>`
      }, {
        title: 'Редактировать',
        width: '8%',
        align: 'center',
        class: 'pills',
        content: `<div class="edit icon" onclick="openAddressPopUp('#id#')"></div>`
      }, {
        title: 'Удалить',
        width: '6%',
        align: 'center',
        class: 'pills',
        content: `<div class="trash icon" onclick="deleteAddress('#id#')"></div>`
      }]
    },
    filters: {
      'full_address': {title: 'По адресу', sort: 'text', search: 'usual'},
      'title': {title: 'По названию', sort: 'text', search: 'usual'},
      'type': {title: 'По типу торговли', filter: 'checkbox'},
      'site': {title: 'По сайту', sort: 'text', search: 'usual'},
      'status': {title: 'По статусу модерации', sort: 'text', search: 'usual', filter: 'checkbox'}
    }
  }
  initTable('#addresses', settings);
  fillTemplate({
    area: ".table-adaptive",
    items: items,
    sub: [{area: '.time', items: 'time'}]
  });
  document.querySelectorAll('.address img').forEach(el => checkMedia(el, 'delete'));
  initForm('#address-form', sendForm);
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  items.forEach(el => {
    el.status_text = el.status == '1' ? 'Успешно' : el.status == '0' ? 'Ошибка' : 'В обработке';
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


function toggleAddress(event) {
  var openAddress = getEl('.address.open'),
      curAddress = event.target.closest('.address');
  if (curAddress) {
    if (checkIsAction(event)) {
      return;
    }
    curAddress.classList.toggle('open');
  }
  if (openAddress) {
    openAddress.classList.remove('open');
  }
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
      fillForm('#address-form', data, true);
    } else {
      formMode = 'add';
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
  var action;
  if (formMode === 'add') {
    action = '???';
  } else if (formMode === 'edit') {
    action = '???';
  }
  formData.append('id', curId);
  sendRequest(urlRequest.main, action, formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    console.log(result);
    if (result.error) {
      alerts.show(result.error);
    } else {
      if (formMode === 'add') {
        alerts.show('Адрес успешно добавлен.');
      } else if (formMode === 'edit') {
        alerts.show('Данные по адресу успешно изменены.');
      }
      items = result;
      convertData();
      updateTable('#addresses', result);
      fillTemplate({
        area: ".table-adaptive",
        items: data,
        sub: [{area: '.time', items: 'time'}]
      });
      document.querySelectorAll('.address img').forEach(el => checkMedia(el, 'delete'));
      closePopUp(null, '#address');
      clearForm('#address-form');
    }
    hideElement('#address .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
    hideElement('#address .loader');
  })
}

// Удаление адреса:

function deleteAddress(id) {
  sendRequest(urlRequest.main, '???', {id: id})
  .then(result => {
    result = JSON.parse(result);
    console.log(result);
    if (result.ok) {
      alerts.show('Адрес успешно удален.');
      items = result;
      convertData();
      updateTable('#addresses', result);
      fillTemplate({
        area: ".table-adaptive",
        items: data,
        sub: [{area: '.time', items: 'time'}]
      });
      document.querySelectorAll('.address img').forEach(el => checkMedia(el, 'delete'));
    } else {
      throw new Error('Ошибка.');
    }
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
  })
}