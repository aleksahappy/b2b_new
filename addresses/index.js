'use strict';

// Глобальные переменные:

var items,
    formMode,
    curId;

// Запуск страницы адресов:

// getPageData('../json/addresses_test.json')
getPageData(urlRequest.main, 'get_delivery')
.then(result => {
  items = result.user_address_list || [];
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
      result: false,
      cols: [{
        title: '',
        width: '7.5em',
        align: 'center',
        class: 'pills',
        content: '<div class="toggle #isChecked#" onclick="toggleAccess(event, #id#)"><div class="toggle-in"></div></div>'
      }, {
        title: 'Адрес',
        // width: '50%',
        class: 'address',
        keys: ['title']
      }, {
      //   title: 'Название',
      //   class: 'name',
      //   keys: ['address_name', 'type'],
      //   content: `<div>#address_name#</div><div class="text light">#type#</div>`
      // }, {
        title: 'Редактировать',
        align: 'center',
        class: 'edit pills',
        content: `<div class="edit icon" onclick="openAddressPopUp('#id#')"></div>`
      }]
    },
    filters: {
      'title': {title: 'По адресу', sort: 'text', search: 'usual'}
    }
  }
  if (!isAdmin) {
    settings.desktop.cols.shift();
  }
  initTable('#addresses', settings);
  initForm('#address-form', sendForm);
  initFias('address-form');
}

// Преобразование полученных данных:

function convertData() {
  items.forEach(el => {
    el.isChecked = el.checked > 0 ? 'checked' : '';
  });
}

// Включение/отключение доступа:

function toggleAccess(event, id) {
  if (!isAdmin) {
    return;
  }
  var toggle = event.currentTarget,
      mode = toggle.classList.contains('checked') ? '0' : '1';
  sendRequest(urlRequest.main, 'change_delivery_access', {id: id, mode: mode})
  .then(result => {
    result = JSON.parse(result);
    if (result.ok) {
      toggle.classList.toggle('checked');
    } else {
      throw new Error('Ошибка');
    }
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
  });
}

// Открытие всплывающего окна с формой:

function openAddressPopUp(id) {
  var addressPopUp = getEl('#address'),
      title = getEl('.pop-up-title .title', addressPopUp);
  formMode = id ? 'edit' : 'add';
  title.textContent = id ? 'Редактирование адреса' : 'Добавление адреса';
  if (curId !== id) {
    curId = id;
    var form = getEl('#address-form');
    if (id) {
      var addressData = items.find(el => el.id == id);
      fillForm(form, addressData);
      setFiasConnect('address-form');
    } else {
      clearForm(form);
    }
  }
  openPopUp(addressPopUp);
}

// Отправка формы на сервер:

function sendForm(formData) {
  if (formMode === 'add') {
    formData.append('id',  '0');
  } else if (formMode === 'edit') {
    formData.append('id', curId);
  }
  sendRequest(urlRequest.main, 'save_delivery', formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    if (result.ok && result.user_address_list.length) {
      if (formMode === 'add') {
        alerts.show('Адрес успешно добавлен.');
      } else if (formMode === 'edit') {
        alerts.show('Адрес успешно изменен.');
      }
      items = result.user_address_list;
      convertData();
      updateTable('#addresses', items);
      closePopUp(null, '#address');
      clearForm('#address-form');
      curId = undefined;
    } else {
      showFormError('#address-form', result.error);
    }
    hideElement('#address .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
    hideElement('#address .loader');
  })
}
