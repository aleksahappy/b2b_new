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
  if (!superUser) {
    changeCss('#users th:nth-child(1)', 'display', 'none');
    changeCss('#users td:nth-child(1)', 'display', 'none');
  }
  var settings = {
    data: items,
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
      key: 'fio',
      sort: 'text',
      search: 'usual'
    }, {
      title: 'Пол',
      key: 'gender',
      sort: 'text',
      search: 'usual',
      filter: true
    }, {
      title: 'Дата рождения',
      align: 'center',
      key: 'birth',
      sort: 'date',
      search: 'date'
    }, {
      title: 'Телефон',
      key: 'phone',
      content: '<a href="tel:#phone#">#phone#</a>'
    }, {
      title: 'Email',
      key: 'email',
      content: '<a href="mailto:#email#">#email#</a>'
    }, {
      title: 'Тип доступа',
      align: 'center',
      class: 'pills',
      key: 'access',
      sort: 'text',
      search: 'usual',
      filter: true,
      content: '<div class="pill access #status#">#access#</div>'
    }, {
      title: 'Дата заведения',
      align: 'center',
      key: 'date',
      sort: 'date',
      search: 'date'
    }, {
      title: 'Должность',
      key: 'position',
      sort: 'text',
      search: 'usual'
    }, {
      title: 'Редактировать',
      align: 'center',
      class: 'pills',
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
