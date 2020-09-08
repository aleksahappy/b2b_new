"use strict";

// Динамическе переменные:

var items, prevForm;

// Запуск страницы пользователей:

startUsersPage();

function startUsersPage() {
  sendRequest(`../json/users.json`)
  //sendRequest(urlRequest.main, {action: 'users'})
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
  if (superUser) {
    changeCss('#users th:nth-child(1)', 'display', 'none');
    changeCss('#users td:nth-child(1)', 'display', 'none');
  }
  var settings = {
    data: items,
    head: true,
    cols: [{
      title: 'Доступ',
      content: '<div class="toggle #toggle#" onclick="toggleAccess(event, #id#)"><div class="toggle-in"></div></div>'
    }, {
      key: 'fio',
      title: 'ФИО',
      sort: 'text',
      search: 'usual'
    }, {
      key: 'gender',
      title: 'Пол',
      sort: 'text',
      search: 'usual',
      filter: true
    }, {
      key: 'birth',
      title: 'Дата рождения',
      sort: 'date',
      search: 'date'
    }, {
      key: 'tel',
      title: 'Телефон',
      content: '<a href="tel:#tel#">#tel#</a>'
    }, {
      key: 'email',
      title: 'Email',
      content: '<a href="mailto:#email#">#email#</a>'
    }, {
      key: 'access',
      title: 'Тип доступа',
      sort: 'text',
      search: 'usual',
      filter: true,
      content: '<div class="pill access #status#">#access#</div>'
    }, {
      key: 'date',
      title: 'Дата заведения',
      sort: 'date',
      search: 'date'
    }, {
      key: 'position',
      title: 'Должность',
      sort: 'text',
      search: 'usual'
    }, {
      key: '',
      title: 'Редактировать',
      content: `<div class="edit icon" onclick="openUserPopUp('#id#')"></div>`
    }]
  };
  initTable("#users", settings);
  fillTemplate({
    area: "#users-adaptive",
    items: items
  });
  initForm('#user-form');
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  items = items || [];
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
      fillForm('#user-form', data);
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
