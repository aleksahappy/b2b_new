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
  var inpAttr = input.getAttribute('name');

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
