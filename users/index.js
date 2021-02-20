"use strict";

// Глобальные переменные:

var items,
    formMode,
    curId;

// Запуск страницы пользователей:

// getPageData('../json/users.json')
getPageData(urlRequest.main, 'userslist')
.then(result => {
  items = result || [],
  initPage();
  loader.hide();
});

// Инициализация страницы:

function initPage() {
  convertData();
  var settings = {
    data: items,
    desktop: {
      head: true,
      cols: [{
        title: 'Доступ',
        width: '7.5em',
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
        content: '<div class="pill access #status#" data-id=#id#>#status_text#</div>'
      }, {
      //   title: 'Дата заведения',
      //   align: 'center',
      //   keys: ['date']
      // }, {
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
  initTable('#users', settings);
  loadData('.table-adaptive', items);
  initForm('#user-form', sendForm);
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
    getStatus(el);
  });
}

// Определение статуса пользователя:

function getStatus(data) {
  data.status = data.checked > 0 ? (data.access > 0 ? 'full' : 'limit') : 'off';
  data.status_text = data.checked  > 0 ? (data.access > 0 ? 'Полный' : 'Частичный') : 'Отключен';
}

// Включение/отключение доступа:

function toggleAccess(event, id) {
  if (!isAdmin) {
    return;
  }
  var toggle = event.currentTarget,
      mode = toggle.classList.contains('checked') ? '0' : '1';
  sendRequest(urlRequest.main, 'change_user_access', {id: id, mode: mode})
  .then(result => {
    result = JSON.parse(result);
    if (result.ok) {
      toggle.classList.toggle('checked');
      var userData = items.find(el => el.id == id),
          curPill = getEl(`[data-id="${id}"]`);
      userData.checked = mode;
      if (mode === '0') {
        curPill.textContent = 'Отключен';
        curPill.classList.remove('full', 'limit');
        curPill.classList.add('off');
      } else {
        curPill.textContent = userData.access > 0 ? 'Полный' : 'Частичный';
        curPill.classList.remove('off');
        curPill.classList.add(userData.access > 0 ? 'full' : 'limit');
      }
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
  formMode = id ? 'edit' : 'add';
  title.textContent = id ? 'Редактировать пользователя' : 'Новый пользователь';
  if (curId !== id) {
    curId = id;
    if (id) {
      var userData = items.find(el => el.id == id);
      fillForm('#user-form', userData);
    } else {
      clearForm('#user-form');
    }
  }
  openPopUp(userPopUp);
}

// Отправка формы на сервер:

function sendForm(formData) {
  if (formMode === 'add') {
    formData.append('id',  '0');
  } else if (formMode === 'edit') {
    formData.append('id', curId);
  }
  sendRequest(urlRequest.main, 'user_save', formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    if (result.ok && result.userslist.length) {
      if (formMode === 'add') {
        alerts.show('Пользователь успешно добавлен.');
      } else if (formMode === 'edit') {
        alerts.show('Данные пользователя успешно изменены.');
      }
      items = result.userslist;
      convertData();
      updateTable('#users', items);
      loadData('.table-adaptive', items);
      closePopUp(null, '#user');
      clearForm('#user-form');
      curId = undefined;
    } else {
      showFormError('#user-form', result.error);
    }
    hideElement('#user .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
    hideElement('#user .loader');
  })
}
