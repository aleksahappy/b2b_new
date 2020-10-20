'use strict';

// Запуск страницы контрагентов:

startContrPage();

function startContrPage() {
  // sendRequest(`../json/contractors.json`)
  sendRequest(urlRequest.main, {action: 'get_contr'})
  .then(result => {
    // console.log(result);
    var data = JSON.parse(result);
    console.log(data);
    data = convertData(data);
    initPage(data);
  })
  .catch(err => {
    console.log(err);
    initPage();
  });
}

// Инициализация страницы:

function initPage(data = []) {
  var settings = {
    data: data,
    head: true,
    result: false,
    cols: [{
      title: 'Доступ',
      width: '6%',
      key: 'access',
      content: '<div class="toggle #access#" onclick="toggleAccess(event, #contr_id#)"><div class="toggle-in"></div></div>'
    }, {
      title: 'ИНН/КПП',
      width: '11%',
      sort: 'numb',
      search: 'usual',
      content: '#inn##kpp#'
    }, {
      title: 'Контрагент',
      width: '15%',
      key: 'title',
      sort: 'text',
      search: 'usual',
      filter: 'true'
    }, {
      title: 'Система налогообложения',
      key: 'system',
      sort: 'text',
      search: 'usual',
      filter: 'true'
    }, {
      title: 'Дата заведения',
      align: 'center',
      key: 'date',
      sort: 'date',
      search: 'date',
    }, {
      title: 'Юридический адрес',
      width: '20%',
      key: 'address',
      search: 'usual',
    }, {
      title: 'Пользователь',
      key: 'user',
      sort: 'text',
      search: 'usual',
      filter: 'true'
    }, {
      title: 'Документы',
      width: '21%',
      key: 'docs',
      content: `<div class="docs row">
                  <div class="mark icon #status#" data-tooltip="#status_info#"></div>
                  <a href="https://new.topsports.ru/api.php?action=get_dog&contr_id=#contr_id#&id=#id#" data-tooltip="#info#" help>Договор с #title# от #date_start#</a>
                </div>`
    }],
    sub: [{area: '.docs', items: 'docs'}]
  };
  initTable('#contr', settings);
  fillTemplate({
    area: "#contr-adaptive",
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
  });
  return data;
}

// Включение/отключение доступа:

function toggleAccess(event, id) {
  event.currentTarget.classList.toggle('checked');
  var toggle = event.currentTarget.classList.contains('checked') ? '1' : '0';
  console.log(toggle);
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
      alerts.show(result.error, 2000);
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
    alerts.show('Ошибка сервера. Попробуйте позже.', 2000);
  });
}

// Отправка формы на создание контрагента:

function addContr(formData) {
  sendRequest(urlRequest.main, {action: 'save_contr', data: formData}, 'multipart/form-data')
  .then(result => {
    var data = JSON.parse(result);
    console.log(data);
    if (data.error) {
      alerts.show('Ошибка в отправляемых данных. Перепроверьте и попробуйте еще раз.');
    } else {
      data = convertData(data);
      updateTable('#contr', data);
      closePopUp(null, '#contractor');
    }
    hideElement('#contractor .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Ошибка сервера. Попробуйте позже.');
  })
}
