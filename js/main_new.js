'use strict';
//  Используемые для проверки регулярные выражения
var cyrilRegExp = /^[АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЭэЮюЯя][АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщъыьЭэЮюЯя]+$/;
var emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var dateRegExp = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;
var telRegExp = /^([\+]*[7|8])(\(*\d{3}\)*)(\d{3}-*)(\d{2}-*)(\d{2})$/;
var finTelRegExp = /^\+[7]\s\(\d{3}\)\s\d{3}\-\d{2}\-\d{2}$/;
var birthRegExp = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;

//  Найти сумму элементов массива

function arraySum(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}


// Свернуть/развернуть содержимое контейнера:

function switchContent(event) {
  if (event.target.closest('.switch-cont')) {
    return;
  }
  var container = event.currentTarget.closest('.switch');
  if (!container || container.classList.contains('disabled')) {
    return;
  }
  var toggleIcon = getEl('.switch-icon', container);
  if (!toggleIcon || getComputedStyle(toggleIcon).display === 'none') {
    return;
  }
  container.classList.toggle('close');
  if (container.id && container.classList.contains('save')) {
    if (container.classList.contains('close')) {
      savePosition(container.id, 'close');
    } else {
      savePosition(container.id, 'open');
    }
  }
}


//  Работа обновленных кнопок-тогглов

function toggle(event) {
  event.currentTarget.classList.toggle('checked');
}


// Преобразовать полученных данных:

function convertData(data) {
  if (!data) {
    return [];
  }
  data.forEach(el => {
    el.order_sum = convertPrice(el.order_sum);
    var sum;
    for (var i = 1; i <= 5; i++) {
      sum = el[`sum${i}`];
      if (sum && sum != 0) {
        el[`sum${i}`] = convertPrice(sum);
        el[`display${i}`] = '';
      } else {
        el[`display${i}`] = 'displayNone';
      }
    }
  });
  return data;
}

//  Сделать первую букву строки заглавной

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


//  Проверить выполняется ли regExp к инпуту или нет

function checkInput(input, regExp) {
  if (input.value.length !== 0 && regExp.test(input.value)) {
    return true;
  } else {
    return false;
  }
}


//  Проверить валидный ли импут

function isValid(input) {
  var inpAttr = input.getAttribute('data-intype');

  //  cyril
  if (inpAttr === 'cyril') {
    var isvalid = checkInput(input, cyrilRegExp);
    if (isvalid) {
      return true;
    } else {
      return false;
    }
  }

  //  tel
  if (inpAttr === 'tel') {
    var isvalid = checkInput(input, finTelRegExp);
    if (isvalid) {
      return true;
    } else {
      return false;
    }
  }

  //  tel
  if (inpAttr === 'email') {
    var isvalid = checkInput(input, emailRegExp);
    if (isvalid) {
      return true;
    } else {
      return false;
    }
  }
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
  console.log('form is working')
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
