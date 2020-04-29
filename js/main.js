'use strict';

//=====================================================================================================
// Полифиллы:
//=====================================================================================================

(function() {
  // проверяем поддержку
  if (!Element.prototype.closest) {
    // реализуем
    Element.prototype.closest = function(css) {
      var node = this;
      while (node) {
        if (node.matches(css)) {
          return node;
        } else {
          node = node.parentElement;
        }
      }
      return null;
    };
  }
})();

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Константы:

var website = document.body.dataset.website,
    pageId = document.body.id,
    isCart = document.body.dataset.cart,
    urlRequest = {
      new: 'http://new.topsports.ru/api/',
      api: 'http://api.topsports.ru/',
      test: 'http://127.0.0.1:5500/test/'
    },
    loader = getEl('loader'),
    message = getEl('message-container'),
    upBtn = getEl('up-btn');

// Динамически изменяемые переменные:

if (isCart) {
  var cartId = pageId,
      cartTotals = [],
      cart = {};
}

// Инициализация прелоадера и поля с сообщениями:

if (loader) {
  loader = new Loader(loader);
}
if (message) {
  message = new Message(message);
}

// Запускаем рендеринг страницы:

startPage();

//=====================================================================================================
// Общие действия на всех страницах:
//=====================================================================================================

// Запуск страницы:

function startPage() {
  var path = location.pathname.replace(/\/[^\/]+.html/g, '').replace(/\//g, '');
  if (path !== '' && path !== 'desktop') {
    loader.show();
  }
  setPaddingToBody();
  showUserInfo();
  if (isCart) {
    window.addEventListener('focus', updateCartTotals);
    getCart('totals')
    .then(result => {
      renderTotals();
    }, reject => {
      console.log(reject);
      renderTotals();
    });
  }
}

// Выход из авторизации:

function logOut(event) {
  event.preventDefault();
  sendRequest(`${urlRequest.new}user_logout.php`)
  .then(result => document.location.href = '/')
}

//=====================================================================================================
// Запросы на сервер:
//=====================================================================================================

// Отправка запросов на сервер:

function sendRequest(url, data, type = 'application/json; charset=utf-8') {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.addEventListener('error', () => reject(new Error('Ошибка сети')));
    request.addEventListener('load', () => {
      if (request.status !== 200) {
        reject(new Error(request.status + ':' + request.statusText));
      }
      resolve(request.response);
    });
    if (data) {
      if (type === 'application/json; charset=utf-8') {
        data = JSON.stringify({
          sessid: getCookie('iam'),
          data: data
        });
      } else if (type === 'multipart/form-data') {
        data.append('sessid', getCookie('iam'));
      }
      // console.log(requestData);
      request.open('POST', url);
      request.setRequestHeader('Content-type', type);
      request.send(data);
    } else {
      request.open('GET', url);
      request.send();
    }
  });
}

//=====================================================================================================
// Отображение данных пользователя:
//=====================================================================================================

// Вывод информации о пользователе в шапке страницы:

function showUserInfo() {
  if (window.userInfo) {
    fillTemplate({
      area: 'profile',
      items: {
        login: userInfo.login,
        username: userInfo.name + ' ' + userInfo.lastname
      }
    });
  } else {
    // if (location.pathname !== '/') {
    //   location.href = '/';
    // }
  }
}

//=====================================================================================================
// Работа с данными корзины:
//=====================================================================================================

// Обновление итогов корзины при возвращении на страницу:

function updateCartTotals() {
  getCart('totals')
  .then(result => {
    renderTotals();
  }, reject => {
    console.log(reject);
  });
}

// Получение данных корзины с сервера:

function getCart(totals = false) {
  var url, data;
  if (totals) {
    url = `${urlRequest.api}baskets/get_total.php`;
    data = {};
  } else {
    url = `${urlRequest.api}baskets/get_cart.php`;
    data = {'cart_type': cartId};
  }
  return new Promise((resolve, reject) => {
    sendRequest(url, data)
    .then(
      result => {
        console.log(result);
        if (!result || JSON.parse(result).err) {
          reject('Корзина пустая');
        } else if (totals && JSON.stringify(cartTotals) === result) {
          reject('Итоги не изменились');
        } else if (!totals && JSON.stringify(cart) === result) {
          reject('Корзина не изменилась');
        } else {
          if (totals) {
            console.log('Итоги обновились');
            cartTotals = JSON.parse(result);
          } else {
            console.log('Корзина обновилась');
            cart = JSON.parse(result);
          }
          resolve();
        }
      }
    )
    .catch(error => {
      reject(error);
    })
  });
}

// Создание списков каталогов и корзин в шапке сайта:

function renderTotals() {
  if (!isCart || !cartTotals.length) {
    return;
  }
  renderCartList('cart');
  renderCartList('catalog');
}

// Создание списка каталогов/корзин в шапке сайта:

function renderCartList(type) {
  var area = type === 'cart' ? getEl('header-cart') : getEl('catalogs');
  if (!area) {
    return;
  }
  var data = getDataFromTotals(type);
  fillTemplate({
    area: area,
    items: data,
    sub: type === 'cart' ? [{area: '.item', items: 'items'}] : null
  });
}

// Подготовка данных для создания списка каталогов/корзин:

function getDataFromTotals(type) {
  var data = JSON.parse(JSON.stringify(cartTotals)),
      curTitle = getEl('.topmenu-item.active'),
      sum = 0;
  data.forEach((el, index) => {
    if (el.qty > 0) {
      el.isFull = 'full';
      if (el.qty > 99) {
        el.qty = type === 'cart' ? '99' : '99+';
      }
    } else {
      el.isFull = '';
    }

    if (type === 'cart') {
      sum += el.sum;
    }
    el.sum = el.sum.toLocaleString('ru-RU');

    if (curTitle && el.id === curTitle.dataset.href) {
      el.isFunc = 'openPage(event)';
      if (type === 'cart') {
        data.unshift(data.splice(index, 1)[0]);
      }
    } else {
      el.isFunc = '';
    }
  });
  if (type === 'cart') {
    data = {
      sum: sum.toLocaleString('ru-RU'),
      items: data
    };
  }
  return data;
}

//=====================================================================================================
// Сортировка массива:
//=====================================================================================================

// Сортировка массива объектов по указанному значению:

function dynamicSort(prop) {
  var sortOrder = 1,
      result;
  if (prop[0] === "-") {
      sortOrder = -1;
      prop = prop.substr(1);
  }
  if (prop == 'price1') {
    return function (a, b) {
      result = a[prop] - b[prop];
      return result * sortOrder;
    }
  } else {
    return function (a, b) {
      result = (a[prop] < b[prop]) ? -1 : (a[prop] > b[prop]) ? 1 : 0;
      return result * sortOrder;
    }
  }
}

//=====================================================================================================
// Сортировка объекта:
//=====================================================================================================

// Сортировка по ключу:

function sortObjByKey(obj, type = 'string') {
  var arrayObj = Object.keys(obj),
      sortedObj = {};
  switch (type) {
    case 'string':
      arrayObj = arrayObj.sort();
    case 'number':
      arrayObj = arrayObj.sort((a,b) =>  a - b);
      break;
    case 'number from string':
      arrayObj = arrayObj.sort((a,b) => parseInt(a, 10) - parseInt(b, 10));
      break;
  }
  arrayObj.forEach(key => sortedObj[key] = obj[key]);
  return sortedObj;
}

// Сортировка по значению:

function sortObjByValue(obj, type = 'string') {
  var arrayObj = Object.keys(obj),
      sortedObj = {};
  switch (type) {
    case 'string':
      arrayObj = arrayObj.sort((a,b) => {
        if (obj[a] < obj[b]) {
          return -1;
        }
        if (obj[a] > obj[b]) {
          return 1;
        }
        return 0;
      });
    case 'number':
      arrayObj = arrayObj.sort((a,b) => obj[a] - obj[b]);
      break;
    case 'number from string':
      arrayObj = arrayObj.sort((a,b) => parseInt(obj[a], 10) - parseInt(obj[b], 10));
      break;
  }
  arrayObj.forEach(key => sortedObj[key] = obj[key]);
  return sortedObj;
}

//=====================================================================================================
// Сохранение и извлечение данных на компьютере пользователя:
//=====================================================================================================

// Получение данных о странице по ключу:

function getInfo(key, type = 'localStorage') {
  var info = getFromLocal(key, type);
  return info[key];
}

// Сохранение данных о странице по ключу:

function saveInfo(key, data, type = 'localStorage') {
  var info = getFromLocal(key, type);
  info[key] = data;
  saveInLocal(info, type);
}

// Удаление всех данных о странице по ключу:

function removeInfo(key, type = 'localStorage') {
  var info = getFromLocal(key, type);
  info[key] = {};
  saveInLocal(info, type);
}

// Сохранение данныx в storage или cookie:

function saveInLocal(data, type) {
  var stringData = JSON.stringify(data);
  if (storageAvailable(type)) {
    window[type][website] = stringData;
  }
  else {
    if (getCookie(website)) {
      deleteCookie(website);
    }
    setCookie(website, stringData);
  }
}

// Получение данных из storage или cookie:

function getFromLocal(key, type) {
  var info = {};
  if (storageAvailable(type)) {
    if (window[type][website]) {
      try {
        info = JSON.parse(window[type][website]);
      } catch(error) {
        console.log(error);
      }
    }
  }
  else {
    if (getCookie(website)) {
      try {
        info = JSON.parse(getCookie(website));
      } catch(error) {
        console.log(error);
      }
    }
  }
  if (!info[key]) {
    info[key] = {};
  }
  return info;
}

// Проверка доступности storage:

function storageAvailable(type) {
  var storage, test;
	try {
		storage = window[type];
    test = '__storage_test__';
		storage.setItem(test, test);
		storage.removeItem(test);
		return true;
	}
	catch(error) {
		return false;
	}
}

// Сохранение данных в cookie:

function saveCookie(key, data) {
  var stringData = JSON.stringify(data);
  if (getCookie(key)) {
    deleteCookie(key);
  }
  setCookie(key, stringData);
}

// Получение данных из cookie:

function readCookie(key) {
  var info;
  if (getCookie(key)) {
    try {
      info = JSON.parse(getCookie(key));
    } catch(error) {
      console.log(error);
    }
  }
  return info;
}

// Запись cookie:

function setCookie(key, value, options = {}) {
  options = {
    path: '/',
    expires: getDateExpires(30),
    ...options
  };
  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var date = new Date();
    date.setTime(date.getTime() + expires * 1000);
    expires = options.expires = date;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);
  var updatedCookie = key + '=' + value;

  for (let key in options) {
    updatedCookie += "; " + key;
    var propValue = options[key];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }
  document.cookie = updatedCookie;
}

// Функция для установки срока хранения cookie:

function getDateExpires(days) {
  var date = new Date;
  date.setDate(date.getDate() + days);
  return date;
}

// Чтение cookie:

function getCookie(key) {
  var matches = document.cookie.match(new RegExp(
    '(?:^|; )' + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Удаление cookie:

function deleteCookie(key) {
  setCookie(key, '', {expires: -1});
}

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Установка отступов документа:

window.addEventListener('resize', setPaddingToBody);

function setPaddingToBody() {
  var headerHeight = getEl('.header').clientHeight;
  var footerHeight = getEl('.footer').clientHeight;
  document.body.style.paddingTop = `${headerHeight}px`;
  document.body.style.paddingBottom = `${footerHeight + 20}px`;
}

// Вставка заглушки при ошибке загрузки изображения:

function replaceImg(img) {
  img.src = '../img/no_img.jpg';
}

// Показ элемента:

function showElement(el, style = 'block') {
  el = getEl(el);
  if (el) {
    el.style.display = style;
  }
}

// Скрытие элемента:

function hideElement(el) {
  el = getEl(el);
  if (el) {
    el.style.display = 'none';
  }
}

// Получение текущей прокрутки документа:

var scrollTop;

function getDocumentScroll() {
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
}

// Установка прокрутки документа:

function setDocumentScroll(top = scrollTop) {
  document.documentElement.scrollTop = top;
  document.body.scrollTop = top;
}

// Открытие/закрытие поля формы для добавления адреса вручную:

function toggleAddByHand() {
  getEl('add-hand').classList.toggle('displayNone')
}

// Отображение количества знаков, оставшихся в поле комментариев:

function countSigns(textarea) {
  getEl('textarea-counter').textContent = 300 - textarea.value.length;
}

// Удаление значения из инпута при его фокусе:

function onFocusInput(input) {
  if (input.value != '') {
    input.value = '';
  }
}

// Возвращение значения в инпут при потере им фокуса:

function onBlurInput(input) {
  input.value = input.dataset.value;
}

// Запрет на ввод в инпут любого значения кроме цифр:

function checkValue(event) {
  if (event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }
  var chr = getChar(event);
  if (chr == null) {
    return;
  }
  if (chr < '0' || chr > '9') {
    return false;
  }
}

// Добавление всплывающих подсказок:

function addTooltips(key) {
  var elements = document.querySelectorAll(`[data-key=${key}]`);
  if (elements) {
    elements.forEach(el => {
      el.setAttribute('tooltip', el.textContent.trim());
    });
  }
}

//=====================================================================================================
// Вспомогательные функции:
//=====================================================================================================

// Получение элемента по id или селектору:

function getEl(el, area = document) {
  if (typeof el === 'string') {
    area = typeof area === 'string' ? getEl(area): area;
    if (el.indexOf('.') === 0 || el.indexOf('[') === 0) {
      el = area.querySelector(el);
    } else if (area === document) {
      el = area.getElementById(el);
    } else {
      el = area.querySelector(el);
    }
  }
  return el || undefined;
}

// Динамическая загрузка скриптов:

function loadScript(url) {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script');
    script.src = url;
    script.onload = resolve();
    script.onerror = reject();
    document.body.appendChild(script);
  });
}

// Конвертация всей вложенности свойств объекта в строку:

function convertToString(obj) {
  var objProps = '';
  crossObj(obj);
  return objProps;

  function crossObj(obj) {
    var prop;
    for (let k in obj) {
      prop = obj[k];
      if (typeof prop === 'string') {
        objProps += prop + ',';
      } else if (typeof prop === 'object') {
        crossObj(prop);
      }
    }
  }
}

// Кросс-браузерная функция для получения символа из события keypress:

function getChar(event) {
  if (event.which == null) { // IE
    if (event.keyCode < 32) {
      return null; // спец. символ
    }
    return String.fromCharCode(event.keyCode);
  }
  if (event.which != 0 && event.charCode != 0) { // все кроме IE
    if (event.which < 32) {
      return null; // спец. символ
    }
    return String.fromCharCode(event.which); // остальные
  }
  return null; // спец. символ
}

// Проверка пустой ли объект:

function isEmptyObj(obj) {
  if (Object.keys(obj).length) {
    return false;
  }
  return true;
}

// Отображение правильного окончания в слове:
// * без окончания (товар, файл) - 1 | 21 | 31 | 41 | 51 | 61 |71 | 81 | 91 | 101 ...
// * окончание "а" (товара, файла) - 2 | 3 | 4 | 22 | 23 | 24 | 32 | 33 | 34 ...
// * окончание "ов" (товаров, файлов) - 0 | 5 | 6 | 7 | 8 | 9 | 10-20 | 25-30 | 35-40 ...

function getWordEnd(word, qty) {
  if ((qty === 1) || (qty > 20 && qty % 10 === 1)) {
    return word;
  } else if ((qty >= 2 && qty <= 4) || (qty > 20 && qty % 10 >= 2 && qty % 10 <= 4)) {
    return word + 'а';
  } else {
    return word + 'ов';
  }
}

// Функция преобразования цены к формату с пробелами:

function convertPrice(price) {
  return (price + '').replace(/(\d{1,3})(?=((\d{3})*)$)/g, " $1");
}

// Функция преобразования строки с годами к укороченному формату:

function convertYears(stringYears) {
  var years = stringYears.split(',');
  var resultYears = [];
  var curYear, nextYear, prevYear;

  if (years.length <= 2) {
    return stringYears.replace(/\,/gi, ', ');
  }

  for (let i = 0; i < years.length; i++) {
    curYear = parseInt(years[i].trim(), 10);
    nextYear = parseInt(years[i + 1], 10);
    prevYear = parseInt(years[i - 1], 10);

    if (curYear + 1 != nextYear) {
      if (i === years.length -  1) {
        resultYears.push(curYear);
      } else {
        resultYears.push(curYear + ', ');
      }
    } else if (curYear - 1 !== prevYear) {
      resultYears.push(curYear);
    } else if (curYear + 1 === nextYear && resultYears[resultYears.length - 1] !== ' &ndash; ') {
      resultYears.push(' &ndash; ');
    }
  }
  return resultYears = resultYears.join('');
}

// Проверка актуальности даты в периоде:

function checkDate(start, end) {
  var curDate = new Date(),
      dateStart, dateEnd;
  if (!start) {
    dateStart = new Date(data[0], + data[1] - 1, + data[2] - 1, 0, 0, 0, 0);
  } else {
    dateStart = start.split('-');
    dateStart = new Date(dateStart[0], dateStart[1] - 1, dateStart[2], 0, 0, 0, 0);
  }
  if (!end) {
    dateEnd = new Date(data[0], + data[1] - 1, + data[2] + 1, 0, 0, 0, 0);
  } else {
    dateEnd = end.split('-');
    dateEnd = new Date(dateEnd[0], dateEnd[1] - 1, dateEnd[2], 23, 59, 59, 999);
  }
  if (curDate > dateStart && curDate < dateEnd) {
    return true;
  } else {
    return false;
  }
}

//=====================================================================================================
// Переход на другие страницы:
//=====================================================================================================

// Переход на страницу заказа:

function showOrder(id) {
  location.href = '/order/?order_id=' + id;
}

// Переход на страницу рекламации:

function showReclm(id) {
  location.href = '/reclamation/?recl_id=' + id;
}

//=====================================================================================================
// Универсальное заполнение данных по шаблону:
//=====================================================================================================

// Универсальная функция заполнения данных по шаблону:

function fillTemplate(data) {
  if (!data.area || !data.items) {
    return;
  }

  if (typeof data.area === 'string') {
    data.areaName = (data.parentAreaName || '') + data.area;
    data.area = getEl(data.area, data.parentArea);
  } else {
    data.areaName = data.area.id || data.area.classList[0];
  }

  var temp = window[`${data.areaName}Temp`]; // шаблон
  if (!temp) {
    if (!data.area) {
      if (data.parentTemp) {
        return data.parentTemp;
      }
      return;
    }
    if (data.source && data.source === 'outer') {
      temp = window[`${data.areaName}Temp`] = data.area.outerHTML;
    } else {
      temp = window[`${data.areaName}Temp`] = data.area.innerHTML;
    }
  }

  var txt = fillTemp(data, data.items, temp);
  if (data.parentTemp) {
    return data.parentTemp.replace(temp, txt);
  } else {
    if (data.action && data.action === 'return') {
      return txt;
    } else {
      var targetEl = data.area;
      if (data.target) {
        var target = getEl(data.target);
        if (target) {
          targetEl = target;
        }
      }
      insertText(targetEl, txt, data.method);
    }
  }
}

// Определение функции для замены данных:

function fillTemp(data, items, temp) {
  var txt = '';
  if (typeof items === 'object') { // данные - это всегда массив или объект
    if (items[0] && typeof items[0] === 'object') { //данные - массив или объект с ключами 0,1,2.. содержащий массивы и/или объекты
      txt = fillList(data, items, temp);
    } else if (Array.isArray(items)) { //данные - массив (строк или чисел)
      txt = fillList(data, items, temp);
    } else if (!Array.isArray(items)) { //данные - объект (ключ: значение)
      txt = fillEl(data, items, temp);
    }
  }
  return txt;
}

// Создание нескольких элементов на основе данных:

function fillList(data, items, temp) {
  var result = '',
      newEl;
  for (var arrKey in items) {
    newEl = fillEl(data, items[arrKey], temp);
    result += newEl;
  }
  return result;
}

// Создание одного элемента на основе данных:

function fillEl(data, items, temp) {
  if (data.sub) { // Если есть подшаблоны
    temp = fillSubTemp(data, items, temp);
  }

  if (typeof items === 'string' || typeof items === 'number') { //Данные - строка/число
    temp = replaceInTemp(null, items, temp, data.sign);
  } else if (data.iterate && data.iterate === 'data') {
    for (var key in items) {
      temp = replaceInTemp(key, items, temp, data.sign);
    }
  } else {
    var props = temp.match(/#[^#]+#/gi);
    props = props || [];
    props = props.reduce((unique, el) => {
      el = el.replace(/#/g, '');
      if (unique.indexOf(el) === -1) {
        unique.push(el);
      }
      return unique;
    }, []);
    props.forEach(key => temp = replaceInTemp(key, items, temp, data.sign));
  }
  return temp;
}


// Заполнение подшаблонов:

function fillSubTemp(data, items, temp) {
  var subData;
  for (var sub of data.sub) {
    subData = {
      area: sub.area,
      items: items[sub.items] ? Object.assign(items[sub.items]) : [],
      sub: sub.sub,
      parentArea: data.area,
      parentAreaName: data.areaName,
      parentTemp: temp,
      source: sub.source || 'outer',
      sign: sub.sign || data.sign,
      iterate: sub.iterate || data.iterate,
    };
    temp = fillTemplate(subData);
  }
  return temp;
}

// Подстановка данных в шаблон:

function replaceInTemp(key, items, temp, sign) {
  var sign = sign || '#',
      value = key ? items[key] : items;
  if (typeof value === 'string' || typeof value === 'number') {
    var regex = new RegExp(sign + (key || 'item') + sign, 'gi');
    temp = temp.replace(regex, value);
  }
  return temp;
}

// Вставка заполненного шаблона в документ:

function insertText(el, txt, method = 'inner') {
  el.classList.remove('template');
  txt = txt.replace('template', '');
  if (!method || method === 'inner') {
    el.innerHTML = txt;
  } else {
    if ((method === 'afterbegin' || method === 'beforeend') && (el.childNodes.length === 1 && el.firstChild.classList.contains('template'))) {
      el.innerHTML = txt;
    }
    el.insertAdjacentHTML(method, txt);
  }
}

//=====================================================================================================
// Работа прелоадера:
//=====================================================================================================

function Loader(obj) {
  this.loader = obj;
  this.text = getEl('.text', obj);

  // Отображение лоадера (можно с текстом):
  this.show = function(text) {
    if (!text) {
      text = '';
    }
    this.text.textContent = text;
    showElement(this.loader, 'flex');
  }

  // Скрытие лоадера:
  this.hide = function() {
    hideElement(this.loader);
  }
}

//=====================================================================================================
// Работа окна сообщений:
//=====================================================================================================

function Message(obj) {
  this.message = obj;
  this.text = getEl('.text', obj);

  // Отображение окна сообщений (обязательно с текстом):
  this.show = function(text, timer) {
    if (!text) {
      return;
    }
    this.text.innerHTML = text;
    openPopUp(this.message);
    if (timer) {
      setTimeout(() => {
        closePopUp(null, this.message);
      }, timer);
    }
  }

  // Скрытие окна сообщений:
  this.hide = function() {
    closePopUp(null, this.message);
  }
}

//=====================================================================================================
// Работа кнопки "Наверх страницы":
//=====================================================================================================

if (upBtn) {
  window.addEventListener('scroll', toggleBtnGoTop);
}

// Отображение/скрытие кнопки "Наверх страницы":

function toggleBtnGoTop() {
  var scrolled = window.pageYOffset,
      coords = window.innerHeight / 2;

  if (scrolled > coords) {
    upBtn.classList.add('show');
  }
  if (scrolled < coords) {
    upBtn.classList.remove('show');
  }
}

// Вернуться наверх страницы:

function goToTop() {
  var scrolled = window.pageYOffset;
  if (scrolled > 0 && scrolled <= 5000) {
    window.scrollBy(0, -80);
    setTimeout(goToTop, 0);
  } else if (scrolled > 5000) {
    window.scrollTo(0, 5000);
    goToTop();
  }
}

//=====================================================================================================
// Работа всплывающих окон:
//=====================================================================================================

// Открытие всплывающего окна:

function openPopUp(el, style = 'flex') {
  el = getEl(el);
  if (el) {
    getDocumentScroll();
    document.body.classList.add('no-scroll');
    showElement(el, style);
  }
}

// Закрытие всплывающего окна:

function closePopUp(event, el) {
  if (event) {
    if (!event.target.closest('.close-btn') && event.target.closest('.pop-up')) {
      return;
    }
    el = event.currentTarget;
  } else {
    el = getEl(el);
  }
  if (el) {
    loader.hide();
    hideElement(el);
    document.body.classList.remove('no-scroll');
    setDocumentScroll();
  }
}

//=====================================================================================================
// Работа полей для загрузки файлов:
//=====================================================================================================

document.querySelectorAll('input[type="file"]').forEach(input => showFiles(input));

// Отображение названия файла или количества выбранных файлов:

function showFiles(input) {
  var form = input.closest('form');
  if (!form) {
    return;
  }
  var fileName = getEl('.file-name', form),
      loadBtn = getEl('label', form),
      submitBtn = getEl('input[type="submit"]', form);
  if (fileName) {
    input.addEventListener('change', event => {
      var text = '',
          files = event.currentTarget.files;
      if (files && files.length > 1) {
        text = `${files.length} ${getWordEnd('файл', files.length)} выбрано`;
      } else {
        text = event.currentTarget.value.split('\\').pop();
      }
      console.log(fileName);
      fileName.textContent = text;
      if (submitBtn) {
        if (files && files.length) {
          hideElement(loadBtn);
          showElement(submitBtn);
        } else {
          showElement(loadBtn);
          hideElement(submitBtn);
        }
      }
    });
  }
}

//=====================================================================================================
// Работа полей поиска:
//=====================================================================================================

// Инициализация поля поиска:

function initSearch(el, func) {
  var el = getEl(el);
  if (el && el.id) {
    window[`${el.id}Search`] = new Search(el, func);
  }
}

// Очистка поля поиска:

function clearSearch(el) {
  var el = getEl(el);
  if (window[`${el.id}Search`]) {
    window[`${el.id}Search`].clear(true);
  }
}

// Объект поля поиска:

function Search(obj, func) {
  // Элементы для работы:
  this.form = obj;
  this.toggleBtn = getEl('.toggle', obj);
  this.input = getEl('input[type="text"]', obj);
  this.cancelBtn = getEl('.close', obj);
  this.dropDown = getEl('.drop-down', obj);
  this.info = getEl(`${this.form.id}-info`);

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    this.form.addEventListener('submit', (event) =>{
      event.preventDefault();
      this.search();
    });
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }
    if (this.dropDown) {
      this.form.addEventListener('input', () => this.showHints());
      this.form.addEventListener('click', event => this.selectHint(event));
      this.input.addEventListener('focus', () => this.onFocus());
      this.input.addEventListener('blur', () => this.onBlur());
    } else {
      this.input.addEventListener('focus', () => onFocusInput(this.input));
      this.input.addEventListener('blur', () => onBlurInput(this.input));
    }
    this.cancelBtn.addEventListener('click', () => this.cancel());
    if (this.info) {
      getEl('.close', this.info).addEventListener('click', () => this.cancel());
    }
  }

  // Отображение/скрытие формы поиска:
  this.toggle = function() {
    this.form.classList.toggle('show');
    if (this.form.classList.contains('show')) {
      this.input.focus();
    }
  }

  // Отображение подсказок:
  this.showHints = function() {
    console.log('this.showHints');
    var textToFind = this.input.value.trim();
    if (textToFind === '') {
      this.closeHints();
      return;
    }
    var regEx = RegExp(textToFind, 'gi'),
        list = getEl('.list', this.dropDown),
        notFound = getEl('.not-found', this.dropDown),
        items = Array.from(list.querySelectorAll('.item')),
        curItems = items.filter(el => el.dataset.value.search(regEx) >= 0);

    items.forEach(el => hideElement(el));
    if (curItems.length > 0) {
      hideElement(notFound);
      showElement(list);
      curItems.forEach(el => showElement(el));
    } else {
      showElement(notFound);
      hideElement(list);
    }
    this.form.classList.add('open');
  }

  // Cкрытие подсказок:
  this.closeHints = function() {
    if (!this.dropDown) {
      return;
    }
    var list = getEl('.list', this.dropDown),
        notFound = getEl('.not-found', this.dropDown);
    hideElement(list);
    hideElement(notFound);
    this.form.classList.remove('open');
  }

  // Удаление значения из инпута при его фокусе и скрытие подсказок:
  this.onFocus = function() {
    onFocusInput(this.input);
    this.closeHints();
  }

  // Восстановление последнего найденного значения в инпуте при потере им фокуса и скрытие подсказок:
  this.onBlur = function() {
    setTimeout(() => {
      onBlurInput(this.input);
      this.closeHints();
    }, 100);
  }

  // Поиск по подсказке:
  this.selectHint = function(event) {
    var curItem = event.target.closest('.item');
    if (!curItem) {
      return;
    }
    this.input.value = curItem.dataset.value;
    this.search();
  }

  // Поиск:
  this.search = function() {
    var textToFind = this.input.value.trim();
    if (textToFind === '') {
      return;
    }
    var length = func(this.form.id, textToFind);
    this.input.dataset.value = this.input.value;
    this.toggleInfo(textToFind, length);
    showElement(this.cancelBtn);
  }

  // Сброс поиска:
  this.cancel = function() {
    this.clear();
    func();
  }

  // Очистка поля поиска:
  this.clear = function(isFull) {
    this.input.value = this.input.dataset.value = '';
    this.toggleInfo();
    this.closeHints();
    hideElement(this.cancelBtn);
    if (isFull) {
      this.form.classList.remove('show');
    }
  }

  // Отображение/скрытие информации о поиске:
  this.toggleInfo = function(text, count) {
    if (!this.info) {
      return;
    }
    if (text) {
      getEl('.search-text', this.info).textContent = text;
      getEl('.search-count', this.info).textContent = count;
      showElement(this.info, 'flex');
    } else {
      hideElement(this.info);
    }
  }

  this.setEventListeners();
}

//=====================================================================================================
// Работа выпадающих списков:
//=====================================================================================================

// Инициализация выпадающего списка:

function initDropDown(el, handler) {
  var el = getEl(el);
  if (el && el.id) {
    window[`${el.id}Dropdown`] = new DropDown(el);
    el.addEventListener('change', event => handler(event));
  }
}

// Очистка значения выпадающего списка:

function clearDropDown(el) {
  var el = getEl(el);
  if (window[`${el.id}Dropdown`]) {
    window[`${el.id}Dropdown`].clear();
  }
}

// Установка значения выпадающего списка:

function setValueDropDown(id, value) {
  if (window[`${id}Dropdown`]) {
    window[`${id}Dropdown`].setValue(value);
  }
}

// Закрытие выпадающих списков при клике вне их самих:

document.addEventListener('click', (event) => {
  var target = event.target;
  if (!target.closest('.activate.open')) {
    var dropDownOpen = getEl('.activate.open');
    if (dropDownOpen) {
      dropDownOpen.classList.remove('open');
    }
  }
});

// Объект выпадающего списка:

function DropDown(obj) {
  // Элементы для работы:
  this.filter = obj;
  this.head = getEl('.head', obj);
  this.title = getEl('.title', obj);
  this.clearBtn = getEl('.clear-btn', obj);

  // Константы:
  this.titleText = this.title.textContent;

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.head) {
      this.head.addEventListener('click', () => this.toggle());
    }
    this.filter.addEventListener('click', event => this.selectValue(event));
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', event => this.clear(event));
    }
  }
  this.setEventListeners();

  // Открытие/закрытие выпадающего списка:
  this.toggle = function() {
    if (this.filter.hasAttribute('disabled')) {
      return;
    }
    if (this.filter.classList.contains('open')) {
      this.filter.classList.remove('open');
    } else {
      document.querySelectorAll('.activate.open').forEach(el => el.classList.remove('open'));
      this.filter.classList.add('open');
    }
  }

  // Выбор значения:
  this.selectValue = function (event, curItem) {
    if (event) {
      curItem = event.target.closest('.item');
    }
    if (!curItem) {
      return;
    }

    if (this.filter.classList.contains('select')) {
      this.title.textContent = curItem.textContent;
      this.filter.value = curItem.dataset.value;
      this.filter.classList.remove('open');
    }

    if (this.filter.classList.contains('checkbox')) {
      curItem.classList.toggle('checked');
      var checked = this.filter.querySelectorAll('.item.checked');
      if (checked.length === 0) {
        this.clearFilter(event);
      } else {
        this.title.textContent = 'Выбрано: ' + checked.length;
        var value = [];
        checked.forEach(el => value.push(el.dataset.value));
        this.filter.value = value;
      }
    }
    this.filter.dispatchEvent(new Event('change'));
  }

  // Установка определенного значения фильтра:
  this.setValue = function (value) {
    this.filter.querySelectorAll('.item').forEach(el => {
      if ((el.dataset.value).toLowerCase() === value.toLowerCase()) {
        this.selectValue(null, el);
      }
    });
  }

  // Очистка фильтра:
  this.clear = function () {
    this.title.textContent = this.titleText;
    this.filter.querySelectorAll('.item.checked').forEach(el => el.classList.remove('checked'));
    this.filter.value = undefined;
  }
}

//=====================================================================================================
// Работа таблиц:
//=====================================================================================================

// Инициализация всех таблиц на странице:

function initTables() {
  document.querySelectorAll('.table-wrap').forEach(el => {
    window[`${el.id}Table`] = new Table(el);
  });
}

// Объект таблицы:

function Table(obj) {
  // Константы:
  this.data = Array.isArray(window[`${obj.id}Data`]) ? window[`${obj.id}Data`].filter(el => el) : [];

  // Элементы для работы:
  this.table = obj;
  this.tab = getEl(`.tab.${obj.id}`);
  this.head = getEl('.table-head', obj);
  this.results = getEl('.results', this.head);
  this.body = getEl('.table-body', obj);
  this.resizeBtns = this.head.querySelectorAll('.resize-btn');
  this.dropDown = obj.querySelectorAll('.activate');
  this.sort = obj.querySelectorAll('.sort');
  this.search = obj.querySelectorAll('.search');

  // Динамические переменные:
  this.countItems = 0;
  this.countItemsTo = 0;
  this.itemsToLoad;
  this.incr = 60;
  this.curColumn = null;
  this.startOffset = 0;

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.tab) {
      this.tab.addEventListener('click', (event) => this.open(event));
    }

    this.table.addEventListener('scroll', () => this.scrollTable());

    if (this.resizeBtns.length > 0) {
      this.resizeBtns.forEach(el => el.addEventListener('mousedown', (event) => this.startResize(event)));
      this.table.addEventListener('mouseleave', () => this.stopResize());
      document.addEventListener('mousemove', event => this.resize(event));
      document.addEventListener('mouseup', () => this.stopResize());
    }

    this.dropDown.forEach(el => {
      el.addEventListener('change', event => this.filterData(event, el.dataset.key));
    });

    this.sort.forEach(el => {
      el.addEventListener('click', event => this.sortData(event, el.dataset.key, el.dataset.type));
    });

    this.search.forEach(el => {
      el.addEventListener('submit', event => this.searchData(event, el.dataset.key));
      getEl('.search.icon', el).addEventListener(event => this.searchData(event, el.dataset.key));
      getEl('.close.icon', el).addEventListener(event => this.clearSearch(event, el.dataset.key));
    });
  }
  this.setEventListeners();

  // Включение/отключение вкладки таблицы в зависимости от наличия данных:
  this.toggleTab = function() {
    if (this.tab) {
      showElement(this.tab, 'flex');
      if (this.data.length === 0) {
        if (this.tab && !this.tab.classList.contains('nomen')) {
          this.tab.classList.add('disabled');
        }
      }
    }
  }

  // Загрузка данных в таблицу:
  this.loadData = function(data) {
    if (data && data.length === 0) {
      this.body.innerHTML = '';
      return;
    }
    if (data) {
      this.countItems = 0;
      this.itemsToLoad = data;
    } else {
      this.countItems = this.countItemsTo;
    }
    this.countItemsTo =  + this.incr;
    if (this.countItemsTo > this.itemsToLoad.length) {
      this.countItemsTo = this.itemsToLoad.length;
    }
    if (this.countItems === this.countItemsTo) {
      return;
    }

    var tableItems = [];
    for (let i = this.countItems; i < this.countItemsTo; i++) {
      tableItems.push(this.itemsToLoad[i]);
    }
    var tableData = {
      area: this.body,
      items: tableItems,
      action: 'return'
    };
    var list = fillTemplate(tableData);

    if (this.countItems === 0) {
      this.body.innerHTML = list;
    } else {
      this.body.insertAdjacentHTML('beforeend', list);
      // for (let i = 0; i <= this.countItemsTo - this.countItems; i++) {
      //   this.body.removeChild(this.body.children[i]);
      // }
      this.alignBody();
    };
  }

  // Подгрузка таблицы при скролле:
  this.scrollTable = function() {
    if (this.table.scrollTop * 2 + this.table.clientHeight >= this.table.scrollHeight) {
      this.loadData();
    }
  }

  // Заполнение итогов таблицы:
  this.fillResults = function() {
    if (!this.results || !this.itemsToLoad || !this.itemsToLoad.length) {
      return;
    }
    this.results.querySelectorAll('.result').forEach(result => {
      var total = 0;
      this.itemsToLoad.forEach(el => {
        total += parseFloat(el[result.dataset.key].replace(' ', ''), 10);
      });
      result.textContent = Math.ceil(total).toLocaleString('ru-RU');
    });
  }

  // Выравнивание столбцов таблицы при загрузке:
  this.alignHead = function() {
    if (!this.head) {
      return;
    }
    var headCells = this.head.querySelectorAll('tr:first-child > th');
    headCells.forEach(headCell => {
      var bodyCell = getEl(`tr:first-child > td:nth-child(${headCell.id})`, this.body);
      if (bodyCell) {
        var newWidth = bodyCell.offsetWidth;
        headCell.style.width = newWidth + 'px';
        headCell.style.minWidth = newWidth + 'px';
        headCell.style.maxWidth = newWidth + 'px';
        this.body.querySelectorAll(`td:nth-child(${headCell.id})`).forEach(bodyCell => {
          var newWidth = headCell.offsetWidth;
          bodyCell.style.width = newWidth + 'px';
          bodyCell.style.minWidth = newWidth + 'px';
          bodyCell.style.maxWidth = newWidth + 'px';
        });
      }
    });
  }

  // Выравнивание столбцов таблицы при последующей подгрузке:
  this.alignBody = function() {
    if (!this.head) {
      return;
    }
    var headCells = this.head.querySelectorAll('tr:first-child > th');
    headCells.forEach(headCell => {
      this.body.querySelectorAll(`td:nth-child(${headCell.id})`).forEach(bodyCell => {
        var newWidth = headCell.offsetWidth;
        bodyCell.style.width = newWidth + 'px';
        bodyCell.style.minWidth = newWidth + 'px';
        bodyCell.style.maxWidth = newWidth + 'px';
      });
    });
  }

  // Открытие таблицы при клике на вкладку:
  this.open = function(event) {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    loader.show();
    var activeTable = getEl('.table-wrap.active');
    if (activeTable) {
      hideElement(activeTable);
      activeTable.classList.remove('active');
    }
    this.show();
  }

  // Фильтрация таблицы:
  this.filterData = function(event, key) {
    var data = this.data.filter(el => el[key] === event.currentTarget.value);
    this.loadData(data);
  }

  // Сортировка таблицы:
  this.sortData = function(event, key, type) {
    var sortBtn = event.currentTarget;
    getEl('.sort.cheched', this.head).classList.remove('checked');
    if (sortBtn.classList.contains('checked')) {
      this.loadData(this.itemsToLoad);
    } else {
      sortBtn.classList.add('checked');
      var copyItems = JSON.parse(JSON.stringify(this.itemsToLoad));
      copy.sort(dynamicSort(key, type));
      this.loadData(copyItems);
    }
  }

  // Поиск по столбцу таблицы:
  this.searchData = function(event, key) {

  }

  // Сброс поиска:
  this.clearSearch = function(event) {

  }

  // Запуск перетаскивания столбца:
  this.startResize = function(event) {
    this.curColumn = event.currentTarget.parentElement;
    this.startOffset = this.curColumn.offsetWidth - event.pageX;
  }

  // Перетаскивание столбца:
  this.resize = function(event) {
    if (this.curColumn) {
      var newWidth = this.startOffset + event.pageX;
          newWidth = newWidth > 3 ? newWidth + 'px' : '3px';
      this.curColumn.style.width = newWidth;
      this.curColumn.style.minWidth = newWidth;
      this.curColumn.style.maxWidth = newWidth;
      this.head.querySelectorAll(`th:nth-child(${this.curColumn.id})`).forEach(el => {
        el.style.width = newWidth;
        el.style.minWidth = newWidth;
        el.style.maxWidth = newWidth;
      });
      this.body.querySelectorAll(`td:nth-child(${this.curColumn.id})`).forEach(el => {
        el.style.width = newWidth;
        el.style.minWidth = newWidth;
        el.style.maxWidth = newWidth;
      });
    }
  }

  // Остановка перетаскивания столбца:
  this.stopResize = function() {
    this.curColumn = null;
  }

  // Визуальное отображение таблицы:
  this.show = function() {
    showElement(this.table);
    loader.hide();
    this.alignHead();
    this.table.classList.add('active');
  }

  // Инициализация таблицы:
  this.init = function() {
    this.toggleTab();
    this.loadData(this.data);
    this.fillResults();
    if (this.table.classList.contains('active')) {
      this.show();
    }
  }
  this.init();
}
