"use strict";

// Глобальные переменные:

var items, prevForm;

// Запуск страницы пользователей:

startUsersPage();

function startUsersPage() {
  sendRequest(`../json/users.json`)
  //sendRequest(urlRequest.main, {action: 'users'})
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
  var settings = {
    data: items,
    desktop: {
      head: true,
      cols: [{
        title: 'Доступ',
        width: '6%',
        align: 'center',
        class: 'pills',
        content: '<div class="toggle #toggle#" onclick="toggleAccess(event, #id#)"><div class="toggle-in"></div></div>'
      }, {
        title: 'ФИО',
        width: '15%',
        keys: ['fio']
      }, {
        title: 'Пол',
        keys: ['gender']
      }, {
        title: 'Дата рождения',
        align: 'center',
        keys: ['birth']
      }, {
        title: 'Телефон',
        keys: ['phone'],
        content: '<a href="tel:#phone#">#phone#</a>'
      }, {
        title: 'Email',
        keys: ['email'],
        content: '<a href="mailto:#email#">#email#</a>'
      }, {
        title: 'Тип доступа',
        align: 'center',
        class: 'pills',
        keys: ['access'],
        content: '<div class="pill access #status#">#access#</div>'
      }, {
        title: 'Дата заведения',
        align: 'center',
        keys: ['date']
      }, {
        title: 'Должность',
        keys: ['position']
      }, {
        title: 'Редактировать',
        align: 'center',
        class: 'pills',
        content: `<div class="edit icon" onclick="openUserPopUp('#id#')"></div>`
      }]
    },
    filters: {
      'fio': {title: 'По ФИО', sort: 'text', search: 'usual'},
      'gender': {title: 'По полу', sort: 'text', search: 'usual', filter: 'checkbox'},
      'birth': {title: 'По дате рождения', sort: 'date', search: 'date'},
      'access': {title: 'По типу доступа', sort: 'text', search: 'usual', filter: 'checkbox'},
      'date': {title: 'По дате заведения', sort: 'date', search: 'date'},
      'position': {title: 'По должности', sort: 'text', search: 'usual'},
    }
  };
  if (!superUser) {
    settings.desktop.cols.shift();
  }
  initTable("#users", settings);
  fillTemplate({
    area: ".table-adaptive",
    items: items
  });
  initForm('#user-form');
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  var status, toggle;
  items.forEach(el => {
    if (el.access === 'полный') {
      status = 'full';
      toggle = 'checked';
    } else if (el.access === 'частичный') {
      status = 'limit';
      toggle = 'checked';
    } else if (el.access === 'отключен') {
      status = 'off';
      toggle = '';
    }
    el.status = status;
    el.toggle = toggle;
    el.accessType = superUser ? '' : 'displayNone';
  });
}

// Открытие всплывающего окна с формой:

function openUserPopUp(id) {
  var userPopUp = getEl('#user'),
      title = getEl('.pop-up-title .title', userPopUp);
  if (prevForm !== id) {
    prevForm = id;
    if (id) {
      title.textContent = 'Редактировать пользователя';
      var data = items.find(el => el.id == id);
      fillForm('#user-form', data, true);
    } else {
      title.textContent = 'Новый пользователь';
      clearForm('#user-form');
    }
  }
  openPopUp(userPopUp);
}

// Включение/отключение доступа:

function toggleAccess(event, id) {
  if (!superUser) {
    return;
  }
  var toggle = event.currentTarget.classList.contains('checked') ? '0' : '1';
  // console.log(toggle);
  sendRequest(urlRequest.main, {action: '???', data: {id: id, action: toggle}})
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
