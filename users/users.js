"use strict";
var usersTable = document.querySelector("#users-table");
var usersModal = document.querySelector("#new-user-modal");
var editUserModal = document.querySelector("#edit-user-modal");
var closeEditUserModal = document.querySelector("#edit-user-modal .close");


// Запуск данных таблицы пользователей:

function startUsersTable() {
  sendRequest(`../json/usersData.json`)
    //sendRequest(urlRequest.main, {action: 'dashboardTable'})
    .then((result) => {
      var data = JSON.parse(result);
      data = convertData(data);
      initTable("users-table", data);
      var usersTabletData = {
        area: "users-table-tablet",
        items: data,
        action: "replace",
      };
      var usersMobData = {
        area: "users-table-mob",
        items: data,
        action: "replace",
      };
      fillTemplate(usersTabletData);
      fillTemplate(usersMobData);
      accessTableType();
      initForm2('new-user-modal', testNewUser);
    })
    .catch((err) => {
      console.log(err);
      initTable("users-table");
    });
}
startUsersTable();

function initCalendar() {
  let testCalend = document.querySelector('#user-birth');
  console.log(testCalend);
  //  инстанциирование нового экземпляра календаря
  let calendar = new Calendar({ id: "#user-birth" });
  return calendar;
}


//  Определение расцветки стикера статуса доступа в зависсимости от поданных

function accessTableType() {
  var tbody = usersTable.querySelector("tbody");
  var trs = tbody.querySelectorAll("tr");
  var access = tbody.querySelectorAll(".access");
  var usersTableTablet = document.querySelector("#users-table-tablet");
  var usersTableMob = document.querySelector("#users-table-mob");

  for (let i = 0; i < access.length; i++) {
    if (access[i].innerHTML === "частичный") {
      access[i].classList.add("limited");
    } else if (access[i].innerHTML === "полный") {
      access[i].classList.add("boundless");
    } else if (access[i].innerHTML === "отключен") {
      access[i].classList.add("denied");
    }
  }

  //  Вспомогательная функция для подсветки иконок статусов в таблицах в соответствии с данными

  function checkStatusIcon(table) {
    var infoblocks = table.querySelectorAll(".infoblock");

    for (let i = 0; i < infoblocks.length; i++) {
      var statusIc = infoblocks[i].querySelector(".user-status .icon");
      var checkAccessVal = infoblocks[i].querySelector(".check-access-value");
      var headToggle = infoblocks[i].querySelector(".toggle.dark");

      if (!headToggle.classList.contains("on")) {
        if (checkAccessVal.innerHTML == "частичный") {
          statusIc.classList.add("limited");
          headToggle.classList.add("checked");

        } else if (checkAccessVal.innerHTML == "полный") {
          statusIc.classList.add("boundless");
          headToggle.classList.add("checked");

        } else if (checkAccessVal.innerHTML == "отключен") {
          statusIc.classList.add("denied");
        }
      } else {
        statusIc.classList.add("denied");
      }
    }
  }
  checkStatusIcon(usersTableTablet);
  checkStatusIcon(usersTableMob);
}


//////////////////////////////ФОРМА ДОБАВЛЕНИЯ C ВАЛИДАЦИЕЙ/////////////////////
//=====================================================================================================
// Работа с формами:
//=====================================================================================================

// Инициализация формы:

function initForm2(el, func) {
  var el = getEl(el);
  if (el && el.id) {
    window[`${el.id}Form`] = new Form2(el, func);
  }
}

// Очистка формы:

function clearForm(el) {
  var el = getEl(el);
  if (window[`${el.id}Form`]) {
    window[`${el.id}Form`].clear();
  }
}

// Объект формы:

function Form2(obj, func) {
  // Элементы для работы:
  this.form = obj;
  this.submitBtn = getEl('input[type="submit"]', obj)
  this.dropDowns = this.form.querySelectorAll('.activate');

  // Инициализация выпадающих списков если они есть:
  this.dropDowns.forEach((el, index) => {
    this[`dropDown${index}`] = new DropDown(el);
  });

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    this.form.addEventListener('submit', event => this.send(event));
  }
  this.setEventListeners();

  // Отправка формы:
  this.send = function(event) {
    //  на нашем сайте все отправки формы будут идти через sendRequest c параметрами
    //  поэтому event.preventDefault(); на все событие сабмит
    event.preventDefault();
    if (!this.submitBtn || this.submitBtn.hasAttribute('disabled')) {
      //event.preventDefault();
      return;
    }
    var send = this.check();
    //console.log(send);
    if (send) {
      var data = this.getData();
      if (func) {
        func(data);
      }
      //console.log(data);
    }
  }

  //  Добавить событие input на все вводимые поля для валидации
  this.setInputEvents = function() {
    this.form.querySelectorAll('input[type="text"]').forEach(el => {
      el.addEventListener('input', event => this.inputCheck(event));
    });
  }
  this.setInputEvents();

  //  Определить тип поля, и в зависимости от него, применить необходимый RegExp
  this.inputCheck = function(event) {
    var inpType = event.target.getAttribute('data-intype');
    var val = event.target.value;

    // cyril
    if (inpType === 'cyril') {
      var elVal = capitalizeFirstLetter(event.target.value);
      event.target.value = elVal;
      let test = elVal.length === 0 || cyrilRegExp.test(elVal);
      if (test) {
        event.target.closest('.form-wrap').classList.remove('error');
      } else {
        event.target.closest('.form-wrap').classList.add('error');
        this.submitBtn.setAttribute('disabled','disabled');
      }

    // birth
    } else if (inpType === 'birth') {
      let test = val.length === 0 || birthRegExp.test(val);
      if (test) {
        event.target.closest('.form-wrap').classList.remove('error');
      } else {
        event.target.closest('.form-wrap').classList.add('error');
      }

    // tel
    } else if (inpType === 'tel') {
      let test = val.length === 0 || telRegExp.test(val);
      if (test) {
        event.target.closest('.form-wrap').classList.remove('error');
        //  при вводе без пробелов и без "+7" приводит все равно к нужному формату
        var x = val.replace(/\D/g, '').match(telRegExp);
        event.target.value = !x[3] ? x[2] : '+7 (' + x[2] + ') ' + x[3] + (x[4]
                             ? '-' + x[4] + '-' + x[5] : '');
      } else {
        event.target.closest('.form-wrap').classList.add('error');
        this.submitBtn.setAttribute('disabled','disabled');
      }

    // email
    } else if (inpType === 'email') {
      let test = val.length === 0 || emailRegExp.test(val);
      if (test) {
        event.target.closest('.form-wrap').classList.remove('error');

      } else {
        event.target.closest('.form-wrap').classList.add('error');
        this.submitBtn.setAttribute('disabled','disabled');
      }
    }
    this.checkSubmit();
  }

  //  Проверить все ли поля required заполнены и если все, то разрешить submit
  this.checkSubmit = function() {
    var testingArr = [];
    var requiredWraps = this.form.querySelectorAll('.form-wrap');

    for (let i = 0; i < requiredWraps.length; i++) {
        if (requiredWraps[i].hasAttribute('required')) {
        var valItem = isValid(requiredWraps[i].querySelector('input'));
        testingArr.push(valItem);
      }
    }
    var isAllEqual = testingArr.every((val, i, arr) => val === arr[0] && val !== false);
    if (isAllEqual) {
      var disabledBtn = this.form.querySelector('input[type="submit"]');
      this.submitBtn.removeAttribute('disabled');
    } else {
      return;
    }
  }

  // Проверка на заполнение всех обязательных полей:
  this.check = function() {
    var isSend = true;
    console.log('isSend', isSend);
    this.form.querySelectorAll('[required]').forEach(el => {
      var value;
      el.classList.remove('error');
      el.querySelectorAll('input[type="radio"]').forEach(el => value = el.checked ? true : undefined);
      el.querySelectorAll('input[type="checkbox"]').forEach(el => value = el.checked ? true : undefined);
      el.querySelectorAll('input[type="text"]').forEach(el => value = el.value);
      el.querySelectorAll('textarea').forEach(el => value = el.value);
      el.querySelectorAll('.activate').forEach(el => value = el.value);
      console.log(value);
      if (!value) {
        //console.log(el);
        el.classList.add('error');
        isSend = false;
      }
    });
    return(isSend);
  }

  // Получение данных формы:
  this.getData = function() {
    var data = {};
    this.form.querySelectorAll('[name]').forEach(el => {
      console.log(el.value);
      if (el.value && el.value !== '') {
        var key = el.getAttribute('name');
        data[key] = el.value;
      }
    });
    return data;
  }

  // Очистка формы поиска:
  this.clear = function() {
    this.form.querySelectorAll('textarea').forEach(el => el.value = '');
    this.form.querySelectorAll('input:not([type="submit"])').forEach(el => el.value = '');
    this.dropDowns.forEach((el, index) => this[`dropDown${index}`].clear());
  }
}


function testNewUser() {
  console.log('sending data');
  clearForm('new-user-modal');
}
