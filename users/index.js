"use strict";

// Глобальные переменные:

var items = [],
    formMode,
    curId;

// Запуск страницы пользователей:

startUsersPage();

function startUsersPage() {
  // sendRequest(`../json/users.json`)
  sendRequest(urlRequest.main, 'userslist')
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
  var settings = {
    data: items,
    desktop: {
      head: true,
      cols: [{
        title: 'Доступ',
        width: '6%',
        align: 'center',
        class: 'pills',
        content: '<div class="toggle #isChecked#" onclick="toggleAccess(event, #id#)"><div class="toggle-in"></div></div>'
      }, {
        title: 'ФИО',
        width: '15%',
        keys: ['fio']
      }, {
        title: 'Пол',
        keys: ['gender_text']
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
        keys: ['status_text'],
        content: '<div class="pill access #status#">#status_text#</div>'
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
  if (!isAdmin) {
    settings.desktop.cols.shift();
    getEl('.table-adaptive .infoblock .head').removeChild(getEl('.table-adaptive .toggle'));
  }
  initTable("#users", settings);
  fillTemplate({
    area: ".table-adaptive",
    items: items
  });
  initForm('#user-form', sendForm);
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  items.forEach(el => {
    el.isChecked = el.checked > 0 ? 'checked' : '';
    if (el.gender == '1') {
      el.gender_text = 'муж.';
    } else if (el.gender == '2') {
      el.gender_text = 'жен.';
    }
    el.phone = convertPhone(el.phone);
    el.status = el.checked > 0 ? el.access > 0 ? 'full' : 'limit' : 'off';
    el.status_text = el.checked  > 0 ? el.access > 0 ? 'Полный' : 'Частичный' : 'Отключен';
  });
}

// Включение/отключение доступа:

function toggleAccess(event, id) {
  if (!isAdmin) {
    return;
  }
  var toggle = event.currentTarget,
      mode = toggle.classList.contains('checked') ? '0' : '1';
  sendRequest(urlRequest.main, ' change_user_access', {id: id, mode: mode})
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

// Открытие всплывающего окна с формой:

function openUserPopUp(id) {
  var userPopUp = getEl('#user'),
      title = getEl('.pop-up-title .title', userPopUp);
  if (curId !== id) {
    curId = id;
    if (id) {
      formMode = 'edit';
      title.textContent = 'Редактировать пользователя';
      var data = items.find(el => el.id == id);
      fillForm('#user-form', data, true);
    } else {
      formMode = 'add';
      title.textContent = 'Новый пользователь';
      clearForm('#user-form');
    }
  }
  openPopUp(userPopUp);
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
        alerts.show('Пользователь успешно добавлен.');
      } else if (formMode === 'edit') {
        alerts.show('Данные пользователя успешно изменены.');
      }
      items = result;
      convertData();
      updateTable('#users', items);
      closePopUp(null, '#user');
      clearForm('#user-form');
    }
    hideElement('#user .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
    hideElement('#user .loader');
  })
}
