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
      main: 'https://new.topsports.ru/api.php',
      new: 'https://new.topsports.ru/',
      api: 'https://api.topsports.ru/'
    },
    items,
    loader = getEl('#page-loader'),
    message = getEl('#alerts'),
    upBtn = getEl('#up-btn');

// Динамически изменяемые переменные:

var pageUrl = pageId,
    scrollTop,
    tooltip;

if (isCart) {
  var cartId = pageId,
      cartTotals = [],
      cart = {},
      userData = {};
}

// Используемые для проверки регулярные выражения:

var cyrilRegExp = /^[АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЭэЮюЯя][АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщъыьЭэЮюЯя]+$/;
var emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var dateRegExp = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;
var telRegExp = /^([\+]*[7|8])(\(*\d{3}\)*)(\d{3}-*)(\d{2}-*)(\d{2})$/;
var finTelRegExp = /^\+[7]\s\(\d{3}\)\s\d{3}\-\d{2}\-\d{2}$/;
var nicknameRegExp =/^\w+@*\w+\.*\w*$/;

// Запускаем рендеринг страницы:

startPage();

//=====================================================================================================
// Обязательные функции для всех страниц:
//=====================================================================================================

// Запуск страницы:

function startPage() {
  if (loader) {
    loader = new Loader(loader);
  }
  if (message) {
    message = new Message(message);
  }
  var path = location.pathname.replace(/\/[^\/]+.html/g, '').replace(/\//g, '');
  if (path !== '') {
    loader.show();
  }
  showUserInfo();
  initTooltips();
  initPopUps();
  initNotifications();

  if (isCart) {
    window.addEventListener('focus', updateCartTotals);
    getTotals()
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
  sendRequest(urlRequest.main, {action: 'logout'})
  .then(result => {
    clearLocal();
    document.location.href = '/';
  })
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
        data = JSON.stringify(data);
      }
      request.open('POST', url);
      request.setRequestHeader('Content-type', type);
      request.send(data);
    } else {
      request.open('GET', url);
      request.send();
    }
  });
}

// Получение данных об итогах всех корзин с сервера:

function getTotals() {
  return new Promise((resolve, reject) => {
    sendRequest(urlRequest.main, {action: 'get_total'})
    .then(
      result => {
        console.log(result);
        if (!result || JSON.parse(result).err) {
          reject('Итоги не пришли');
        }
        if (JSON.stringify(cartTotals) === result) {
          reject('Итоги не изменились');
        } else {
          console.log('Итоги обновились');
          cartTotals = JSON.parse(result);
          resolve();
        }
      }
    )
    .catch(error => {
      reject(error);
    })
  });
}

// Получение данных конкретной корзины с сервера:

function getCart() {
  return new Promise((resolve, reject) => {
    sendRequest(urlRequest.main, {action: 'get_cart', data: {cart_type: cartId}})
    .then(
      result => {
        console.log(result);
        if (!result || JSON.parse(result).err) {
          reject('Корзина и данные для заказа не пришли');
        }
        result = JSON.parse(result);
        if (!result.cart || result.cart === null) {
          result.cart = {};
        }
        if (JSON.stringify(cart) === JSON.stringify(result.cart)) {
          if (JSON.stringify(userData.contr) !== JSON.stringify(result.user_contr) || JSON.stringify(userData.address) !== JSON.stringify(result.user_address_list)) {
            console.log('Данные для заказа обновились');
            userData.contr = result.user_contr,
            userData.address = result.user_address_list;
            resolve();
          } else {
            reject('Корзина и данные для заказа не изменились');
          }
        } else {
          console.log('Корзина обновилась');
          cart = result.cart;
          userData.contr = result.user_contr,
          userData.address = result.user_address_list;
          resolve('cart');
        }
      }
    )
    .catch(error => {
      reject(error);
    })
  });
}

// Получение данных о товарах/товаре:

function getItems(id) {
  return new Promise((resolve, reject) => {
    var data = {
      action: 'items',
      data: {cat_type: cartId}
    }
    if (id) {
      data.data.list = id;
    }
    console.log(data);
    sendRequest(urlRequest.main, data)
    .then(result => {
      var data = JSON.parse(result);
      console.log(data);
      resolve(data);
    })
    .catch(error => {
      console.log(error);
      reject(error);
    })
  });
}

//=====================================================================================================
// Отображение данных пользователя:
//=====================================================================================================

// Вывод информации о пользователе в шапке страницы:

function showUserInfo() {
  if (window.userInfo) {
    fillTemplate({
      area: '#profile',
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
  getTotals()
  .then(result => {
    renderTotals();
  }, reject => {
    console.log(reject);
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
  var area = type === 'cart' ? getEl('#header-cart') : getEl('#catalogs');
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
// Работа всплывающего окна уведомлений:
//=====================================================================================================

// Инициализация работы окна уведомлений:

function initNotifications() {
  // sendRequest(urlRequest.main, {action: 'notifications'})
  sendRequest(`../json/data_notifications.json`)
  .then(result => {
    var data = JSON.parse(result),
        notifications = getEl('#notifications'),
        body = getEl('.pop-up-body', notifications);
    fillTemplate({
      area: body,
      items: data
    });
    getEl('.loader', notifications).style.display = 'none';
  })
  .catch(err => {
    console.log(err);
  });
}

//=====================================================================================================
// Сортировка массива объектов:
//=====================================================================================================

// Сортировка массива объектов по указанному полю:

function sortBy(key, type) {
  var sortOrder = 1;
  if (key[0] === "-") {
      sortOrder = -1;
      key = key.substr(1);
  }

  function getValue(item) {
    var value = item[key];
    if (value === '&ndash;') {
      return null;
    }
    switch (type) {
      case 'text':
        return '' + value;
      case 'numb':
        return +value;
      case 'date':
        return getDateObj(value, 'dd.mm.yy');
    }
  }

  var result;
  return function (a, b) {
    a = getValue(a);
    b = getValue(b);
    switch (type) {
      case 'text':
        result = (a < b) ? -1 : (a > b) ? 1 : 0;
        break;
      case 'numb':
        result = a - b;
        break;
      case 'date':
        result = b - a;
        break;
    }
    return result * sortOrder;
  }
}

//=====================================================================================================
// Сортировка объектов:
//=====================================================================================================

// Сортировка по ключу:

function sortObjByKey(obj, type = 'string') {
  var arrayObj = Object.keys(obj),
      sortedObj = {};
  switch (type) {
    case 'string':
      arrayObj = arrayObj.sort();
      break;
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
// Работа со storage и cookie:
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

// Очистка данных storage и cookie:

function clearLocal() {
  window.localStorage.clear();
  window.sessionStorage.clear();
  if (getCookie(website)) {
    deleteCookie(website);
  }
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
// Функции для работы с контентом на странице:
//=====================================================================================================

// Установка отступов документа:

// window.addEventListener('resize', setPaddingToBody);

function setPaddingToBody() {
  var headerHeight = getEl('.header').clientHeight;
  var footerHeight = getEl('.footer').clientHeight;
  document.body.style.paddingTop = `${headerHeight}px`;
  document.body.style.paddingBottom = `${footerHeight + 20}px`;
}

// Проверка загружено ли изображение и вставка заглушки при отсутствии изображения:

function checkImg(element) {
  getEl('img', element).addEventListener('error', (event) => {
    event.currentTarget.src = '../img/no_img.jpg';
  });
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

function getDocumentScroll() {
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
}

// Установка прокрутки документа:

function setDocumentScroll(top = scrollTop) {
  document.documentElement.scrollTop = top;
  document.body.scrollTop = top;
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

// Отображение количества знаков, оставшихся для заполнения в textarea:

function textareaCounter(textarea) {
  var maxLength = textarea.getAttribute('maxlength');
  if (maxLength) {
    var counter = getEl(`[data-count="${textarea.getAttribute('name')}"] span`);
    if (counter) {
      counter.textContent = parseInt(maxLength, 10) - textarea.value.length;
    }
  }
}

//=====================================================================================================
// Функции сворачивания/разворачивания контейнеров:
//=====================================================================================================

// Свернуть/развернуть контейнер:

function toggleEl(name, className = 'displayNone') {
  if (!name) {
    return;
  }
  var el = getEl(name);
  if (el) {
    el.classList.toggle(className);
  }
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

// Сохранение данных о состоянии контейнера (открыт/закрыт):

function savePosition(key, value) {
  var positions = getInfo('positions', 'sessionStorage');
  if (!positions[pageUrl]) {
    positions[pageUrl] = {};
  }
  positions[pageUrl][key] = value;
  saveInfo('positions', positions, 'sessionStorage');
}

// Удаление данных о состоянии контейнеров (открыты/закрыты):

function removePositions() {
  var positions = getInfo('positions', 'sessionStorage');
  positions[pageUrl] = {};
  saveInfo(`positions`, positions, 'sessionStorage');
}

// Проверка сохраненных положений контейнеров (открыты/закрыты):

function checkPositions() {
  var positions = getInfo('positions', 'sessionStorage')[pageUrl],
      el;
  for (var key in positions) {
    el = getEl(key);
    if (el) {
      if (positions[key] === 'close') {
        el.classList.add('close');
      } else {
        el.classList.remove('close');
      }
    }
  }
}

//=====================================================================================================
// Функции степпера:
//=====================================================================================================

// Запрет на ввод в инпут любого значения кроме цифр:

function onlyNumb(event) {
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

// Изменение количества степпером:

function changeQty(event, maxQty, minQty = 0, text) {
  if (minQty === maxQty) {
    return;
  }
  var current = event.currentTarget;
  if (current.closest('.qty-box.disabled')) {
    return;
  }
  var sign = undefined,
      qtyWrap = current.closest('.qty'),
      input = getEl('.choiced-qty', qtyWrap),
      qty = parseInt(input.value, 10);
  if (input.hasAttribute('disabled')) {
    return;
  }
  if (event.currentTarget.classList.contains('btn-minus')) {
    sign = '-';
  }
  if (event.currentTarget.classList.contains('btn-plus')) {
    sign = '+';
  }
  qty = countQty(sign, qty, maxQty, minQty);
  input.value = qty;
  input.dataset.value = qty;
  changeColors(qtyWrap, qty);
  changeNameBtn(getEl('.name.click', qtyWrap), qty, text);
  return qty;
}

// Подсчет количества:

function countQty(sign, qty, maxQty, minQty) {
  if (sign) {
    if (sign == '-') {
      if (qty > minQty) {
        qty--;
      }
    } else if (sign == '+') {
      if (qty < maxQty) {
        qty++;
      }
    } else if (sign == 'Удалить') {
      qty = 0;
    } else {
      qty = 1;
    }
  } else {
    if (isNaN(qty)) {
      qty = minQty;
    }
    if (qty < minQty) {
      qty = minQty;
    }
    if (qty > maxQty) {
      qty = maxQty;
    }
  }
  return qty;
}

// Изменение цвета элементов степпера:

function changeColors(el, qty) {
  if (el) {
    if (qty == 0) {
      el.classList.remove('added');
    } else {
      el.classList.add('added');
    }
  }
}

// Изменение названия кнопки в степпере:

function changeNameBtn(el, qty, text = 'В корзину') {
  if (el) {
    if (qty == 0) {
      el.textContent = text;
    } else {
      el.textContent = 'Удалить';
    }
  }
}

//=====================================================================================================
// Работа всплывающих подсказок:
//=====================================================================================================

// Включение работы подсказок:

function initTooltips() {
  document.addEventListener('mouseover', event => showTooltip(event));
  document.addEventListener('mouseout', hideTooltip);
}

// Отображение подсказки:

function showTooltip(event) {
  if (tooltip) {
    hideTooltip();
  }
  var element = event.target,
      tooltipHtml = element.dataset.tooltip;
  if (element.classList.contains('.disabled') || element.hasAttribute('disabled') || !tooltipHtml) {
    return;
  }
  createTooltip(element, tooltipHtml);
}

// Создание подсказки:

function createTooltip(element, tooltipHtml) {
  tooltip = document.createElement('div');
  tooltip.classList.add('tooltip');

  var flow = element.getAttribute('flow'),
  textAlign = element.getAttribute('text'),
  help = element.hasAttribute('help');

  if (flow) {
    tooltip.setAttribute('flow', flow);
  }
  if (textAlign) {
    tooltip.setAttribute('text', textAlign);
  }
  if (help) {
    tooltip.setAttribute('help', '');
  }
  tooltip.innerHTML = tooltipHtml;
  document.body.append(tooltip);
  positionTooltip(element, flow);
}

// Позиционирование подсказки:

function positionTooltip(element, flow) {
  var coords = element.getBoundingClientRect(),
      windowWidth = window.innerWidth + window.pageXOffset,
      windowHeight = window.innerHeight + window.pageYOffset;

  var x, y;
  if (!flow || flow === 'up' || flow === 'down') {
    // Позиционирование сверху:
    if (!flow || flow === 'up') {
      y = coords.top - tooltip.offsetHeight - 7;
      // Если подсказка не помещается сверху, то отображать её снизу:
      if (y < 0) {
        y = coords.bottom + 7;
      }
    // Позиционирование снизу:
    } else {
      y = coords.bottom + 7;
      // Если подсказка не помещается снизу, то отображать её сверху:
      if (y + tooltip.offsetHeight > windowHeight) {
        y = coords.top - tooltip.offsetHeight - 7;
      }
    }
    var x = coords.left + (element.offsetWidth - tooltip.offsetWidth) / 2;
    // Не заезжать за левый край окна:
    if (x < 0) {
      x = 0;
    }
    // Не заезжать за правый край окна:
    if (x + tooltip.offsetWidth > windowWidth) {
      x = windowWidth - tooltip.offsetWidth;
    }
  } else if (flow === 'left' || flow === 'right') {
    // Позиционирование слева:
    if (flow === 'left') {
      x = coords.left - tooltip.offsetWidth - 7;
      // Если подсказка не помещается слева, то отображать её справа:
      if (x < 0) {
        x = coords.right + 7;
      }
    // Позиционирование справа:
    } else {
      x = coords.right + 7;
      // Если подсказка не помещается справа, то отображать её слева:
      if (x + tooltip.offsetWidth > windowWidth) {
        x = coords.left - tooltip.offsetWidth - 7;
      }
    }
    var y = coords.top + (element.offsetHeight - tooltip.offsetHeight) / 2;
    // Не заезжать за верхний край окна:
    if (y < 0) {
      y = 0;
    }
    // Не заезжать за нижний край окна:
    if (y + tooltip.offsetHeight > windowHeight) {
      y = windowHeight - tooltip.offsetHeight;
    }
  }
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

// Скрытие подсказки:

function hideTooltip() {
  if (!tooltip) {
    return;
  }
  tooltip.remove();
  tooltip = null;
}

//=====================================================================================================
// Вспомогательные функции:
//=====================================================================================================

// Получение элемента по id или селектору:

function getEl(el, area = document) {
  if (typeof el === 'string') {
    el = el.trim();
    area = typeof area === 'string' ? getEl(area.trim()): area;
    var wordCount = el.split(' ');
    if (el[0] === '#' && wordCount.length === 1) {
      el = document.getElementById(el.substr(1));
    } else {
      el = area.querySelector(el);
    }
  }
  return el || undefined;
}

// Проверка пустой ли объект:

function isEmptyObj(obj) {
  if (Object.keys(obj).length) {
    return false;
  }
  return true;
}

// Нахождение суммы элементов массива:

function arraySum(arr) {
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// Получение сколько процентов составляет часть в целом:

function getPercent(item, all) {
  if (!item) {
    return 0;
  }
  return parseInt(+item) * 100 / all;
}

// Изменение первой буквы строки на заглавную:

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Изменение свойств css непосредственно в css-документе:

function changeCss(selector, key, value) {
  var docStyles = Array.from(document.styleSheets),
      docPath = location.href.replace('index.html', '').replace(/\?.*/gi, '') + 'index.css',
      curStyle = docStyles.find(el => el.href === docPath);
  if (curStyle) {
    var rules = curStyle.cssRules || curStyle.rules,
        rule;
    for (var el of rules) {
      if (el.selectorText === selector) {
        rule = el;
        break;
      }
    }
    if (!rule) {
      curStyle.insertRule(selector + '{}', curStyle.rules.length);
      rule = rules[rules.length - 1];
    }
    if (Array.isArray(key)) {
      key.forEach(curKey => rule.style[curKey] = value);
    } else if (typeof key === 'string') {
      rule.style[key] = value;
    }
  }
}

// Ограничение частоты вызова функций:

function throttle(callback) {
  let isWaiting = false;
    return function () {
    if (!isWaiting) {
      callback.apply(this, arguments);
      isWaiting = true;
      requestAnimationFrame(() => {
        isWaiting = false;
    });
    }
  }
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

//=====================================================================================================
// Работа с датами:
//=====================================================================================================

// Создание объекта даты из строки:

function getDateObj(value, format) {
  if (format === 'yy-mm-dd') {
    value = value.replace(/(\d+)-(\d+)-(\d+)/, '$2/$3/$1');
  } else if (format === 'dd.mm.yy'){
    value = value.replace(/(\d+).(\d+).(\d+)/, '$2/$1/$3');
  }
  return new Date(value);
}


// Проверка актуальности даты в периоде (принимает объекты даты):

function checkDate(date, start, end) {
  if (!start && !end) {
    return true;
  }
  if (!date) {
    date = new Date();
  }
  if (!start) {
    start = new Date();
    start.setDate(date.getDate() - 1);
  }
  if (!end) {
    end = new Date();
    end.setDate(date.getDate() + 1);
  }
  if (date > start && date < end) {
    return true;
  } else {
    return false;
  }
}

//=====================================================================================================
// Конвертирующие функции:
//=====================================================================================================

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

// Выбор правильного склонения слова в соответствии с числительным:

function declOfNum(number, titles) {
  var cases = [2, 0, 1, 1, 1, 2];
  return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
}

// Функция преобразования цены к формату с пробелами:

function convertPrice(price) {
  if (isNaN(Number(price))) {
    return price;
  }
  price = Number(price).toFixed(2);
  return (price + '').replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ').replace('.', ',');
  // второй вариант (менее кросс-браузерный):
  // return Number(price).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

//=====================================================================================================
// Переход на другие страницы:
//=====================================================================================================

// Переход на страницу заказа:

function showOrder(event, id) {
  if (event.target.closest('.download')) {
    return;
  }
  window.open(`/order/?${id}`);
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

  if (!data.sign) {
    data.sign = '#';
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
    if (data.type === 'list' || (items[0] && typeof items[0] === 'object')) { //данные - массив или объект, содержащий массивы и/или объекты
      txt = fillList(data, items, temp);
    } else if (data.type === 'vars' || Array.isArray(items)) { //данные - массив (строк или чисел)
      txt = fillList(data, items, temp);
    } else if (data.type === 'obj' || !Array.isArray(items)) { //данные - объект (ключ: значение)
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
    var regEx = new RegExp(`${data.sign}[^${data.sign}]+${data.sign}`, 'gi'),
        props = temp.match(regEx);
    props = props || [];
    props = props.reduce((unique, el) => {
      var reg = new RegExp(`${data.sign}`, 'g');
      el = el.replace(reg, '');
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
      items: items[sub.items] ? items[sub.items] : [],
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
  var value = key ? items[key] : items;
      value = value === null ? '' : value;
  if (value !== undefined && typeof value !== 'object') {
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
  this.show = function(text = '') {
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

function initPopUps() {
  document.addEventListener('keydown', (event) => closePopUp(event));
  document.querySelectorAll('.pop-up-container').forEach(el => el.addEventListener('click', (event) => closePopUp(event)));
}

// Открытие всплывающего окна:

function openPopUp(el) {
  el = getEl(el);
  if (el) {
    if (!getEl('.pop-up-container.open')) {
      getDocumentScroll();
      el.scrollTop = 0;
      document.body.classList.add('no-scroll');
    }
    el.classList.add('open');
  }
}

// Закрытие всплывающего окна:

function closePopUp(event, el) {
  if (event) {
    if (event.type === 'keydown') {
      if (event.code === 'Escape') {
        el = getEl('.pop-up-container.open');
      }
    } else {
      if (!event.target.closest('.pop-up-title .close') && event.target.closest('.pop-up')) {
        return;
      }
      el = event.currentTarget;
    }
  } else {
    el = getEl(el);
  }
  if (el) {
    loader.hide();
    el.classList.remove('open');
    if (!document.querySelector('.pop-up-container.open')) {
      document.body.classList.remove('no-scroll');
      setDocumentScroll();
    }
    return true;
  }
}

//=====================================================================================================
// Работа c полной карточкой товара и изображением на весь экран:
//=====================================================================================================

// Отображение полной карточки товара:

function showFullCard(id) {
  event.preventDefault();
  loader.show();
  var fullCardContainer = getEl('#full-card-container');
  fullCardContainer.style.opacity = 0;
  openPopUp(fullCardContainer);

  fillTemplate({
    area: fullCardContainer,
    items: items.find(item => item.object_id == id),
    sub: [{
      area: '.carousel-item',
      items: 'images'
    }, {
      area: '.card-size',
      items: 'sizes'
    }, {
      area: '.card-option',
      items: 'options'
    }, {
      area: '.manuf-row',
      items: 'manuf_table'
    }]
  });
  checkCart(getEl('.full-card'));

  var curCarousel = getEl('.carousel', fullCardContainer);
  renderCarousel(curCarousel)
  .then(
    result => {
      if (getEl('img', curCarousel).src.indexOf('/no_img.jpg') === -1) {
        getEl('.carousel-gallery-wrap', curCarousel).addEventListener('click', (event) => showFullImg(event, id));
        getEl('.maximize', curCarousel).addEventListener('click', (event) => showFullImg(event, id));
      }
    }
  );
  fullCardContainer.style.opacity = 1;
  loader.hide();
}

// Открытие картинки полного размера:

function showFullImg(event, id) {
  if (event.target.classList.contains('control')) {
    return;
  }
  loader.show();
  var fullImgContainer = getEl('#full-img-container');
  fullImgContainer.style.opacity = 0;
  openPopUp(fullImgContainer);

  fillTemplate({
    area: fullImgContainer,
    items: items.find(item => item.object_id == id),
    sub: [{
      area: '.carousel-item',
      items: 'images'
    }]
  });

  var curCarousel = getEl('.carousel', fullImgContainer),
      curImg = event.currentTarget.closest('.carousel').dataset.img;

  renderCarousel(curCarousel, curImg)
  .then(
    result => {
      getEl('#full-card-container').style.opacity = 0;
      fullImgContainer.style.opacity = 1;
      loader.hide();
    }
  );
}

// Закрытие картинки полного размера:

function closeFullImg(event) {
  if (closePopUp(event)) {
    getEl('#full-card-container').style.opacity = 1;
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
        text = `${files.length} ${declOfNum(files.length, ['файл', 'файла', 'файлов'])} выбрано`;
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
// Работа с формами:
//=====================================================================================================

// Инициализация формы:

function initForm(el, func) {
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

// Проверка инпута на валидность:

function checkInput(input) {
  var type = input.dataset.type,
      value = input.value,
      regEx;
  if (!value.length) {
    return true;
  }
  if (type === 'cyril') {
    regEx = cyrilRegExp;
  } else if (type === 'date') {
    regEx = dateRegExp;
  } else if (type === 'tel') {
    var test = telRegExp.test(value);
    if (!test) {
      test = finTelRegExp.test(value);
    }
    return test;
  } else if (type === 'email') {
    regEx = emailRegExp;
  } else if (type === 'nickname') {
    regEx = nicknameRegExp;
  } else {
    return true;
  }
  return regEx.test(value);
}

// Объект формы:

function Form(obj, func) {
  // Элементы для работы:
  this.form = obj;
  this.submitBtn = getEl('input[type="submit"]', obj);
  this.dropDowns = this.form.querySelectorAll('.activate');
  // this.calendars = this.form.querySelectorAll('.???');

  // Динамические переменные:
  this.isSubmit = false;

  // Инициализация выпадающих списков (если они есть):
  this.dropDowns.forEach(el => new DropDown(el));

  // Инициализация календарей (если они есть):
  // this.calendars.forEach(el => new DropDown(el));

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    this.form.querySelectorAll('input[data-type]').forEach(el => {
      el.addEventListener('input', event => this.checkInput(event));
    });
    this.form.querySelectorAll('[required]').forEach(el => {
      el.querySelectorAll('textarea').forEach(el => el.addEventListener('input', () => this.checkSubmit()));
      el.querySelectorAll('.activate').forEach(el => el.addEventListener('change', () => this.checkSubmit()));
      el.querySelectorAll('input[type="radio"]').forEach(el => el.addEventListener('change', () => this.checkSubmit()));
      el.querySelectorAll('input[type="checkbox"]').forEach(el => el.addEventListener('change', () => this.checkSubmit()));
      el.querySelectorAll('input[type="file"]').forEach(el => el.addEventListener('change', () => this.checkSubmit()));
      // el.querySelectorAll('.choiced-qty').forEach(el => el.addEventListener('change', () => this.checkSubmit())); - не работает, нужно как-то генерить событие
      // el.querySelectorAll('.???').forEach(el => el.addEventListener('change', () => this.checkSubmit())); - не работает, нужно как-то генерить событие календаря и дать ему класс чтобы инициализировать
      el.querySelectorAll('input:not([data-type]):not([type="radio"]):not([type="checkbox"]):not([type="file"]):not(.choiced-qty)').forEach(el => el.addEventListener('input', () => this.checkSubmit()));
    });
  }
  this.setEventListeners();

  // Определение типа поля и его проверка по соответствующему регулярному выражению:
  this.checkInput = function(event) {
    var input = event.currentTarget,
        isValid = checkInput(input),
        type = input.dataset.type;
    if (type === 'cyril' && input.value.length === 1) {
      input.value = capitalizeFirstLetter(input.value);
    }
    if (isValid) {
      if (type === 'tel' && input.value.length) {
        // приведение к формату с "+7" и пробелами
        var numbs = input.value.replace(/\D/g, '').match(telRegExp);
        input.value = !numbs[3] ? numbs[2] : ('+7 (' + numbs[2] + ') ' + numbs[3] + (numbs[4] ? '-' + numbs[4] + '-' + numbs[5] : ''));
      }
      input.closest('.form-wrap').classList.remove('error');
      this.checkSubmit();
    } else {
      input.closest('.form-wrap').classList.add('error');
      this.submitBtn.setAttribute('disabled','disabled');
    }
  }

  // Проверка на заполнение всех обязательных полей и блокировка/разблокировка кнопки submit:
  this.checkSubmit = function() {
    var required = Array.from(this.form.querySelectorAll('[required]'));
    this.isSubmit = required.every(el => {
      var fields = el.querySelectorAll('[name]'),
          type,
          value;
      for (var field of fields) {
        // console.log(field);
        type = field.getAttribute('type');
        value = field.value.trim();
        if (field.hasAttribute('data-type')) {
          var isValid = checkInput(field);
          // console.log(isValid);
          // console.log(field.value.length);
          if (isValid && value && value.length) {
            return true;
          }
        } else if (type === 'radio' || type === 'checkbox') {
          // console.log(field.checked);
          if (field.checked) {
            return true;
          }
        } else if (field.classList.contains('choiced-qty')) {
          // console.log(value);
          if (value != 0) {
            return true;
          }
        } else if (type === 'file') {
          // ???
        } else {
          // console.log(field.value);
          // console.log(field.value.length);
          if (value && value.length) {
            return true;
          }
        }
      }
    });
    if (this.isSubmit) {
      this.submitBtn.removeAttribute('disabled');
    } else {
      this.submitBtn.setAttribute('disabled', 'disabled');
    }
  }

  // Отправка формы:
  this.send = function(event) {
    event.preventDefault();
    if (!this.isSubmit || !this.submitBtn || this.submitBtn.hasAttribute('disabled')) {
      return;
    }
    var data = this.getData();
    if (func) {
      func(data);
    }
  }

  // Получение данных формы:
  this.getData = function() {
    var data = {};
    formData = new FormData(this.form);
    formData.forEach((value, key) => {
      data[key] = value;
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
    window[`${el.id}Search`].clear();
  }
}

// Объект поля поиска:

function Search(obj, func) {
  // Элементы для работы:
  this.form = obj;
  this.input = getEl('input[type="text"]', obj);
  this.searchBtn = getEl('.search', obj);
  this.cancelBtn = getEl('.close', obj);
  this.items = getEl('.items', obj);
  this.notFound = getEl('.not-found', obj);
  this.result = getEl(`.search-info[data-search="${this.form.id}"]`);

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    this.form.addEventListener('submit', event => {
      event.preventDefault();
      this.search();
    });
    this.input.addEventListener('focus', () => this.onFocus());
    this.input.addEventListener('blur', () => this.onBlur());
    if (this.items) {
      this.input.addEventListener('input', () => this.showHints());
      this.items.addEventListener('click', event => this.selectHint(event));
    }
    this.cancelBtn.addEventListener('click', () => this.cancel());
    if (this.result) {
      getEl('.close', this.result).addEventListener('click', () => this.cancel());
    }
  }
  this.setEventListeners();

  // Отображение подсказок:
  this.showHints = function() {
    var textToFind = this.input.value.trim();
    if (textToFind === '') {
      this.closeHints();
      return;
    }

    var regEx = RegExp(textToFind, 'gi'),
        items = Array.from(this.items.querySelectorAll('.item')),
        curItems = items.filter(el => el.dataset.value.search(regEx) >= 0);

    items.forEach(el => hideElement(el));
    if (curItems.length > 0) {
      hideElement(this.notFound);
      curItems.forEach(el => showElement(el, 'flex'));
    } else {
      showElement(this.notFound);
    }
    this.form.classList.add('open');
  }

  // Cкрытие подсказок:
  this.closeHints = function() {
    if (!this.items) {
      return;
    }
    this.items.querySelectorAll('.item').forEach(el => hideElement(el));
    hideElement(this.notFound);
    this.form.classList.remove('open');
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

  // Удаление значения из инпута при его фокусе и скрытие/отображение подсказок:
  this.onFocus = function() {
    onFocusInput(this.input);
    this.closeHints();
  }

  // Восстановление последнего найденного значения в инпуте при потере им фокуса и скрытие/отображение подсказок:
  this.onBlur = function() {
    setTimeout(() => {
      onBlurInput(this.input);
      this.closeHints();
    }, 100);
  }

  // Поиск:
  this.search = function() {
    var textToFind = this.input.value.trim();
    if (textToFind === '') {
      return;
    }
    if (func) {
      var length = func(this.form, textToFind);
    }
    this.input.dataset.value = this.input.value;
    this.toggleInfo(textToFind, length);
    hideElement(this.searchBtn);
    showElement(this.cancelBtn);
  }

  // Очистка поля поиска:
  this.clear = function() {
    this.input.value = this.input.dataset.value = '';
    this.closeHints();
    this.toggleInfo();
    hideElement(this.cancelBtn);
    showElement(this.searchBtn);
  }

  // Сброс поиска:
  this.cancel = function() {
    this.clear();
    if (func) {
      func(this.form);
    }
  }

  // Отображение/скрытие информации о поиске:
  this.toggleInfo = function(text, count) {
    if (!this.result) {
      return;
    }
    if (text) {
      getEl('.search-text', this.result).textContent = text;
      getEl('.search-count', this.result).textContent = count;
      showElement(this.result, 'flex');
    } else {
      hideElement(this.result);
    }
  }
}

// Объект поля поиска для выпадающего списка:

function SearchInBox(obj, func) {
  Search.apply(this, arguments);

  // Элементы для работы:
  this.items = obj.closest('.drop-down');

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.items) {
      this.input.addEventListener('input', () => this.showHints());
    }
  }
  this.setEventListeners();

  // Восстановление изначального вида подсказок:
  this.restoreHints = function() {
    this.items.querySelectorAll('.item').forEach(el => showElement(el, 'flex'));
    hideElement(this.notFound);
  }

  // Отображение подсказок:
  this.showHints = function() {
    var textToFind = this.input.value.trim();
    if (textToFind === '') {
      this.restoreHints();
      return;
    }

    var regEx = RegExp(textToFind, 'gi'),
        items = Array.from(this.items.querySelectorAll('.item')),
        curItems = items.filter(el => el.dataset.value.search(regEx) >= 0);

    items.forEach(el => hideElement(el));
    if (curItems.length > 0) {
      hideElement(this.notFound);
      curItems.forEach(el => showElement(el, 'flex'));
    } else {
      showElement(this.notFound);
    }
    this.form.classList.add('open');
  }

  // Удаление значения из инпута при его фокусе и отображение подсказок:
  this.onFocus = function() {
    onFocusInput(this.input);
    this.restoreHints();
  }

  // Восстановление последнего найденного значения в инпуте при потере им фокуса и отображение подсказок:
  this.onBlur = function() {
    setTimeout(() => {
      onBlurInput(this.input);
      this.showHints();
    }, 100);
  }

  // Очистка поля поиска:
  this.clear = function() {
    this.input.value = this.input.dataset.value = '';
    this.restoreHints();
    this.toggleInfo();
    hideElement(this.cancelBtn);
    showElement(this.searchBtn);
  }
}

//=====================================================================================================
// Работа выпадающих списков:
//=====================================================================================================

// Инициализация выпадающего списка:

function initDropDown(el, handler) {
  var el = getEl(el);
  if (el && el.id) {
    window[`${el.id}Dropdown`] = new DropDown(el);
    if (handler) {
      el.addEventListener('change', event => handler(event));
    }
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

document.addEventListener('click', closeDropDown);

function closeDropDown(event) {
  var target = event.target;
  if (!target.closest('.activate.open')) {
    var dropDownOpen = getEl('.activate.open');
    if (dropDownOpen) {
      dropDownOpen.classList.remove('open');
    }
  }
}

// Объект выпадающего списка:

function DropDown(obj) {
  // Элементы для работы:
  this.filter = obj;
  this.hiddenInput = getEl('input[type="hidden"]', obj);
  this.head = getEl('.head', obj);
  this.title = getEl('.head .title', obj);
  this.sort = getEl('.sort-box', obj);
  this.search = getEl('form.search', obj);
  this.items = getEl('.items', obj) || getEl('.drop-down', obj);
  this.clearBtn = getEl('.clear-btn', obj);

  // Константы:
  this.titleText = this.title.textContent;

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.head) {
      this.head.addEventListener('click', () => this.toggle());
    }
    if (this.sort) {
      this.sort.addEventListener('click', event => this.sortValue(event))
    }
    if (this.items) {
      this.items.addEventListener('click', event => this.selectValue(event));
    }
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.clear());
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
      var dropDownOpen = getEl('.activate.open');
      if (dropDownOpen) {
        dropDownOpen.classList.remove('open');
      }
      this.filter.classList.add('open');
    }
  }

  // Изменение заголовка:
  this.changeTitle = function(newTitle) {
    if (this.title) {
      if (newTitle) {
        this.title.textContent = newTitle;
        this.filter.classList.add('checked');
      } else {
        this.title.textContent = this.titleText;
        this.filter.classList.remove('checked');
      }
    }
  }

  // Сортировка значений:
  this.sortValue = function(event) {
    var sort = event.target.closest('.row');
    if (sort.classList.contains('checked')) {
      sort.classList.remove('checked');
    } else {
      var curSort = getEl('.checked.row', this.sort);
      if (curSort) {
        curSort.classList.remove('checked');
      }
      sort.classList.add('checked');
    }
    sort.dispatchEvent(new Event('change', {"bubbles": true}));
  }

  // Поиск значения:
  this.searchValue = (search, textToFind) => {
    if (this.items) {
      this.items.querySelectorAll('.item.checked').forEach(el => el.classList.remove('checked'));
    }
    if (textToFind) {
      this.changeTitle('Поиск: ' + textToFind);
      this.filter.value = textToFind;
    } else {
      this.clear(event);
    }
    search.dispatchEvent(new Event('change', {"bubbles": true}));
  }

  // Выбор значения из списка:
  this.selectValue = function(event, curItem) {
    if (event) {
      curItem = event.target.closest('.item');
    }
    if (!curItem) {
      return;
    }
    if (this.search) {
      this.search.clear();
    }

    var value;
    if (this.filter.classList.contains('select')) {
      if (curItem.dataset.value === 'default') {
        this.clear();
      } else {
        this.changeTitle(curItem.textContent);
        value = curItem.dataset.value;
      }
      this.filter.classList.remove('open');
    } else {
      curItem.classList.toggle('checked');
      var checked = this.items.querySelectorAll('.item.checked');
      if (checked.length === 0) {
        this.clear();
      } else {
        this.changeTitle('Выбрано: ' + checked.length);
        value = [];
        checked.forEach(el => value.push(el.dataset.value));
      }
    }
    this.filter.value = value;
    if (this.hiddenInput) {
      this.hiddenInput.value = value;
    }
    curItem.dispatchEvent(new Event('change', {"bubbles": true}));
  }

  // Установка значения:
  this.setValue = function(value) {
    this.filter.querySelectorAll('.item').forEach(el => {
      if ((el.dataset.value).toLowerCase() === value.toLowerCase()) {
        this.selectValue(null, el);
      }
    });
  }

  // Очистка:
  this.clear = function() {
    this.changeTitle();
    if (this.search) {
      this.search.clear();
    }
    if (this.items) {
      this.items.querySelectorAll('.item.checked').forEach(el => el.classList.remove('checked'));
    }
    this.filter.value = undefined;
    if (this.hiddenInput) {
      this.hiddenInput.value = undefined;
    }
  }

  // Инициализация поиска (если есть):
  if (this.search) {
    this.search = new Search(this.search, this.searchValue);
  }
}

// Объект выпадающего списка для таблиц:

function DropDownTable(obj) {
  DropDown.apply(this, arguments);
  this.filterIcon = getEl('.filter.icon', obj);

  // Изменение заголовка:
  this.changeTitle = function(newTitle) {
    if (this.filterIcon) {
      if (newTitle) {
        this.filterIcon.style.visibility = 'visible';
      } else {
        this.filterIcon.style.visibility = 'hidden';
      }
    }
  }
}
