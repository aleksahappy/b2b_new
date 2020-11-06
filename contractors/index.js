'use strict';

// Запуск страницы контрагентов:

startContrPage();

function startContrPage() {
  // sendRequest(`../json/contractors.json`)
  sendRequest(urlRequest.main, {action: 'get_contr'})
  .then(result => {
    var data = JSON.parse(result);
    // console.log(data);
    initPage(data);
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage(data) {
  if (!data || !data.length) {
    return;
  }
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
        content: '<div class="toggle #access#" onclick="toggleAccess(event, #contr_id#)"><div class="toggle-in"></div></div>'
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
                    <div class="mark icon #status#" data-tooltip="#status_info#"></div>
                    <a href="https://new.topsports.ru/api.php?action=get_dog&contr_id=#contr_id#&id=#id#" data-tooltip="#info#" help>Договор с #title# от #date_start#</a>
                  </div>`
      }]
    },
    adaptive: {
      sub: [{area: '.docs', items: 'docs'}]
    },
    sorts: {
      'inn': {title: 'По ИНН', type: 'numb'},
      'title': {title: 'По контрагенту', type: 'text'},
      'system': {title: 'По системе налогообложения', type: 'text'},
      'date': {title: 'По дате заведения', type: 'date'},
      'user': {title: 'По пользователю', type: 'text'}
    },
    filters: {
      'inn': {title: 'По ИНН', search: 'usual'},
      'title': {title: 'По контрагенту', search: 'usual', filter: 'checkbox'},
      'system': {title: 'По системе налогообложения', search: 'usual', filter: 'checkbox'},
      'date': {title: 'По дате заведения', search: 'date'},
      'address': {title: 'По юридическому адресу', search: 'usual'},
      'user': {title: 'По пользователю', search: 'usual', filter: 'checkbox'}
    }
  };
  if (!superUser) {
    settings.desktop.cols.shift();
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
    el.kpp = el.kpp ? '/' + el.kpp : '';
    el.accessType = superUser ? '' : 'displayNone';
  });
}

// Включение/отключение доступа:

function toggleAccess(event, id) {
  if (!superUser) {
    return;
  }
  event.currentTarget.classList.toggle('checked');
  var toggle = event.currentTarget.classList.contains('checked') ? '1' : '0';
  // console.log(toggle);
  sendRequest(urlRequest.main, {action: '???', data: {id: id, action: toggle}})
  .then(result => {
    event.currentTarget.classList.toggle('checked');
  })
  .catch(err => {
    console.log(err);
    alerts.show('Ошибка сервера. Попробуйте позже.', 2000);
  });
}

// Получение данных по ИНН:

var isFillForm = false;

function addByInn(event) {
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
  sendRequest(urlRequest.main, {action: 'check_inn', data: {inn: value}})
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
    alerts.show('Ошибка сервера. Попробуйте позже.');
  });
}

// Отправка формы на сервер:

function addContr(formData) {
  formData.set('action', 'save_contr');
  sendRequest(urlRequest.main, formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    console.log(result);
    if (result.ok) {
      convertData(result);
      updateTable('#contr', result);
      closePopUp(null, '#contractor');
      clearForm('#contr-form');
    } else {
      if (result.error) {
        alerts.show(result.error);
      } else {
        alerts.show('Ошибка в отправляемых данных. Перепроверьте и попробуйте еще раз.');
      }
    }
    hideElement('#contractor .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Ошибка сервера. Попробуйте позже.');
    hideElement('#contractor .loader');
  })
}
