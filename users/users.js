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
      initForm2('new-user-modal');
    })
    .catch((err) => {
      console.log(err);
      initTable("users-table");
    });
}
startUsersTable();


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


/////////////////////////ФОРМА ДОБАВЛЕНИЯ КОНТРАГЕНТА///////////////////////////
//=====================================================================================================
// Работа с формами:
//=====================================================================================================

// Инициализация формы:

function initForm2(el, func) {
  var el = getEl(el);
  if (el && el.id) {
    window[`${el.id}Form`] = new Form(el, func);
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

function Form(obj, func) {
  //  Используемые для проверки регулярные выражения
  var cyrilRegExp = /^[АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЭэЮюЯя][АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщъыьЭэЮюЯя]+$/;
  var emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var dateRegExp = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;

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
    event.preventDefault();
    if (!this.submitBtn || this.submitBtn.hasAttribute('disabled')) {
      return;
    }
    var send = this.check();
    console.log(send);
    if (send) {
      var data = this.getData();
      if (func) {
        func(data);
      }
      // console.log(data);
    }
  }

  this.setInputEvents = function() {
    this.form.querySelectorAll('input[type="text"]').forEach(el => {
      el.addEventListener('input', event => this.inputCheck(event));
    });
  }
  this.setInputEvents();


  this.inputCheck = function(event) {
    var inpType = event.target.getAttribute('name');
    var val = event.target.value;
    if (val !== 0 && val.length < 4) {
      event.target.closest('.form-wrap').classList.add('error');
    }
    if (val.length < 1 || val.length > 4) {
      event.target.closest('.form-wrap').classList.remove('error');
    }
  }

  // Проверка на заполнение всех обязательных полей:
  this.check = function() {
    var isSend = true;
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
        console.log(el);
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
