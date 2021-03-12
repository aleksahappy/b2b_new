'use strict';

// Запуск страницы контрагентов:

// getPageData('../json/contractors.json')
getPageData(urlRequest.main, 'get_contr')
.then(result => {
  initPage(result);
  loader.hide();
});

// Инициализация страницы:

function initPage(data = []) {
  convertData(data);
  var settings = {
    data: data,
    desktop: {
      head: true,
      result: false,
      sub: [{area: '.docs', items: 'docs'}],
      cols: [{
        title: 'Доступ',
        width: '7.5em',
        class: 'pills',
        keys: ['access'],
        content: '<div class="toggle #isChecked#" onclick="toggleAccess(event, #contr_id#)"><div class="toggle-in"></div></div>'
      }, {
        title: 'ИНН/КПП',
        width: '11%',
        keys: ['inn', 'kpp']
      }, {
        title: 'Контрагент',
        width: '15%',
        keys: ['title']
      }, {
        title: 'Система налогообложения',
        keys: ['system']
      }, {
        title: 'Дата заведения',
        align: 'center',
        keys: ['date']
      }, {
        title: 'Юридический адрес',
        width: '20%',
        keys: ['address']
      }, {
        title: 'Пользователь',
        keys: ['user']
      }, {
        title: 'Документы',
        width: '21%',
        keys: ['docs'],
        content: `<div class="docs row">
                    <div class="mark icon" data-status="#status#" data-tooltip="#status_text#"></div>
                    <a href="../api.php?action=get_dog&contr_id=#contr_id#&id=#id#" target="_blank" data-tooltip="#info#" help>Договор с #title# от #date_start#</a>
                  </div>`
      }]
    },
    adaptive: {sub: [{area: '.docs', items: 'docs'}]},
    filters: {
      'inn': {title: 'По ИНН', sort: 'numb', search: 'usual'},
      'title': {title: 'По контрагенту', sort: 'text', search: 'usual', filter: 'checkbox'},
      'system': {title: 'По системе налогообложения', sort: 'text', search: 'usual', filter: 'checkbox'},
      'date': {title: 'По дате заведения', sort: 'date', search: 'date'},
      'address': {title: 'По юридическому адресу', search: 'usual'},
      'user': {title: 'По пользователю', sort: 'text', search: 'usual', filter: 'checkbox'}
    }
  };
  if (!isAdmin) {
    settings.desktop.cols.shift();
    getEl('.table-adaptive .head').removeChild(getEl('.table-adaptive .toggle'));
  }
  initTable('#contr', settings);
  initForm('#contr-form', addContr);
  loader.hide();
}

// Преобразование полученных данных:

function convertData(data) {
  data.forEach(el => {
    el.isChecked = el.checked > 0 ? 'checked' : '';
    el.kpp = el.kpp ? '/' + el.kpp : '';
  });
}

// Включение/отключение доступа:

function toggleAccess(event, id) {
  if (!isAdmin) {
    return;
  }
  var toggle = event.currentTarget,
      mode = toggle.classList.contains('checked') ? '0' : '1';
  sendRequest(urlRequest.main, 'change_contr_access', {id: id, mode: mode})
  .then(result => {
    result = JSON.parse(result);
    if (result.ok) {
      toggle.classList.toggle('checked');
    } else {
      throw new Error('Ошибка');
    }
  })
  .catch(err => {
    console.log(err);
    alerts.show('Произошла ошибка, попробуйте позже.');
  });
}

// Получение данных по ИНН:

var isFillForm = false;

function addByInn(event) {
  onlyNumb(event);
  var value = event.currentTarget.value,
      isValid = innValidate(value);
  if (!isValid.result) {
    if (isFillForm) {
      isFillForm = false;
      clearForm('#contr-form');
      resetInputs();
      event.currentTarget.value = value;
    }
    return;
  }
  getEl('#inn-loader').style.visibility = 'visible';
  sendRequest(urlRequest.main, 'check_inn', {inn: value})
  .then(result => {
    result = JSON.parse(result);
    if (result.error) {
      resetInputs();
      showFormError('#contr-form', result.error);
    } else {
      isFillForm = true;
      updateInputs(result);
      fillForm('#contr-form', result);
    }
  })
  .catch(err => {
    console.log(err);
    resetInputs();
    alerts.show('Произошла ошибка, попробуйте позже.');
  });
}

// Сброс полей формы до изначального состояния:

function resetInputs() {
  document.querySelectorAll('#contr-form .after-inn').forEach(el => el.setAttribute('disabled', 'disabled'));
  getEl('[name="contr_name"]').setAttribute('readonly', true);
  getEl('[name="address"]').setAttribute('readonly', true);
  getEl('#inn-loader').style.visibility = 'hidden';
}

// Обновление состояния полей формы после получения данных по ИНН:

function updateInputs(result) {
  var isPersonInn = getEl('[name="contr_inn"]').value.length === 12,
      afterInn = document.querySelectorAll(`#contr-form .after-inn${isPersonInn ? ':not([name="kpp"])' : ''}`),
      nameField = getEl('[name="contr_name"]'),
      addressField = getEl('[name="address"]');
  afterInn.forEach(el => el.removeAttribute('disabled'));
  if (result.contr_name) {
    nameField.setAttribute('readonly', true);
  } else {
    nameField.removeAttribute('readonly');
  }
  if (result.address) {
    addressField.setAttribute('readonly', true);
  } else {
    addressField.removeAttribute('readonly');
  }
  getEl('#inn-loader').style.visibility = 'hidden';
}

// Отправка формы на сервер:

function addContr(formData) {
  sendRequest(urlRequest.main, 'save_contr', formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    if (result.error) {
      showFormError('#contr-form', result.error);
    } else {
      alerts.show('Контрагент успешно добавлен.');
      convertData(result);
      updateTable('#contr', result);
      closePopUp(null, '#contractor');
      clearForm('#contr-form');
    }
    hideElement('#contractor .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
    hideElement('#contractor .loader');
  })
}
