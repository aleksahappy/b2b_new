'use strict';

// Запуск страницы контрагентов:

startContrPage();

function startContrPage() {
  sendRequest(`../json/contractors.json`)
  // sendRequest(urlRequest.main, {action: 'get_contr'})
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
      sort: 'numb',
      search: 'usual',
      content: '#inn#/#kpp#'
    }, {
      title: 'Контрагент',
      key: 'title',
      sort: 'text',
      search: 'usual',
      filter: 'true'
    }, {
      title: 'Система налогообложения',
      width: '15%',
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
      width: '20%',
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
  initForm('#contr-form');
  loader.hide();
}

// Преобразование полученных данных:

function convertData(data) {
  data.forEach(el => {});
  return data;
}

// Включение/отключение доступа:

function toggleAccess(event, id) {
  event.currentTarget.classList.toggle('checked');
  // var action = event.currentTarget.classList.contains('checked') ? 'off' : 'on';
  // sendRequest(urlRequest.main, {action: '???', data: {id: id, action: action}})
  // .then(result => {
  //   event.currentTarget.classList.toggle('checked');
  // })
  // .catch(err => {
  //   console.log(err);
  // });
}

// Получение данных по ИНН:
