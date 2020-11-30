'use strict';

// Запуск страницы контрагентов:

startContrPage();

function startContrPage() {
  // sendRequest(`../json/contractors.json`)
  sendRequest(urlRequest.main, 'get_contr')
  .then(result => {
    if (result) {
      var data = JSON.parse(result);
    }
    initPage(data);
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

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
        width: '6%',
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
                    <a href="https://new.topsports.ru/api.php?action=get_dog&contr_id=#contr_id#&id=#id#" data-tooltip="#info#" help>Договор с #title# от #date_start#</a>
                  </div>`
      }]
    },
    adaptive: {
      sub: [{area: '.docs', items: 'docs'}]
    },
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
  fillTemplate({
    area: ".table-adaptive",
    items: data,
    sub: [{area: '.docs', items: 'docs'}]
  });
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
  var toggle = event.currentTarget.classList.contains('checked') ? '0' : '1';
  // console.log(toggle);
  sendRequest(urlRequest.main, '???', {id: id, action: toggle})
  .then(result => {
    result = JSON.parse(result);
    if (result.ok) {
      event.currentTarget.classList.toggle('checked');
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
      clearForm('#contr-form');
      event.currentTarget.value = value;
      document.querySelectorAll('#contr-form .after-inn').forEach(el => el.setAttribute('disabled', 'disabled'));
      isFillForm = false;
    }
    return;
  }
  getEl('#inn-loader').style.visibility = 'visible';
  sendRequest(urlRequest.main, 'check_inn', {inn: value})
  .then(result => {
    var data = JSON.parse(result);
    if (data.error) {
      document.querySelectorAll('#contr-form .after-inn').forEach(el => el.setAttribute('disabled', 'disabled'));
      alerts.show(result.error);
    } else {
      document.querySelectorAll('#contr-form .after-inn').forEach(el => el.removeAttribute('disabled'));
      isFillForm = true;
      fillForm('#contr-form', data);
    }
    getEl('#inn-loader').style.visibility = 'hidden';
  })
  .catch(err => {
    console.log(err);
    document.querySelectorAll('#contr-form .after-inn').forEach(el => el.setAttribute('disabled', 'disabled'));
    getEl('#inn-loader').style.visibility = 'hidden';
    alerts.show('Произошла ошибка, попробуйте позже.');
  });
}

// Отправка формы на сервер:

function addContr(formData) {
  sendRequest(urlRequest.main, 'save_contr', formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    console.log(result);
    if (result.error) {
      alerts.show(result.error);
    } else {
      alerts.show('Контрагент успешно добавлен.');
      convertData(result);
      updateTable('#contr', result);
      fillTemplate({
        area: ".table-adaptive",
        items: data,
        sub: [{area: '.docs', items: 'docs'}]
      });
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
