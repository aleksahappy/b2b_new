'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Константы:

var website = document.body.dataset.website,
    pageId = document.body.id,
    isCart = document.body.dataset.cart,
    urlRequest = 'http://new.topsports.ru/api',
    // urlRequest = 'http://127.0.0.1:5500/test',
    loader = document.getElementById('loader'),
    message = document.getElementById('message-container');
if (loader) {
  loader = new Loader(loader);
}
if (message) {
  message = new Message(message);
}

// Запуск проверки авторизации:

// checkAuth();
startPage();

// Динамические переменные:

var isSearch;

// Вместе с данными о корзине будет приходить информация для заполения формы заказа, тогда это удалить:
var partnerInfo = {
  "user_contr": {
    "472":["ООО \"АСПОРТ\""],
    "347":["ТРИАЛ-СПОРТ ООО"]},
  "user_address_list": {
    "278":["443082, Самара, Тухачевского, 22"],
    "279":["443079, Самара, Карла Маркса, 177в"],
    "468":["354392, Россия, Краснодарский край, городской округ Сочи, посёлок городского типа Красная Поляна, улица Мичурина, 1"]
  }
};

if (isCart) {
  var cartId = document.body.dataset.cartId,
      cart = {},
      cartTotals = {},
      cartChanges = {},
      cartContent = document.getElementById('cart');
}

//=====================================================================================================
// Авторизация на сайте при загрузке страницы:
//=====================================================================================================

// Проверка авторизован ли пользователь:

function checkAuth() {
  loader.show();
  if (pageId === 'auth' && document.location.search === '?error=1') {
    loader.hide();
    startPage();
    showElement(document.getElementById('error'));
  } else {
    sendRequest(`${urlRequest}/check_auth.php`)
    .then(result => {
      console.log(result);
      var data = JSON.parse(result);
      if (data.ok) {
        if (pageId === 'auth') {
          document.location.href = '/desktop';
        }
        if (pageId === 'desktop') {
          loader.hide();
        }
        showUserInfo(data.user_info);
        if (data.cart) {
          cart = data.cart;
        }
        startPage();
      } else {
        if (pageId !== 'auth') {
          document.location.href = '/';
        } else {
          loader.hide();
          startPage();
        }
      }
    })
    .catch(err => {
      console.log(err);
      if (pageId !== 'auth') {
        document.location.href = '/';
      } else {
        loader.hide();
        startPage();
      }
    });
  }
}

// Выход из авторизации:

function logOut(event) {
  event.preventDefault();
  sendRequest(`${urlRequest}/user_logout.php`)
  .then(result => document.location.href = '/')
}

//=====================================================================================================
// Запросы на сервер:
//=====================================================================================================

// Отправка запросов на сервер:

// type : 'multipart/form-data', 'application/json; charset=utf-8'
function sendRequest(url, data, type = 'application/json; charset=utf-8') {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.addEventListener('error', () => reject(new Error('Ошибка сети')));
    request.addEventListener('load', () => {
      if (request.status !== 200) {
        reject(new Error(request.status + ':' +request.statusText));
      }
      resolve(request.responseText);
    });
    if (data) {
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
// При запуске страницы:
//=====================================================================================================

// Общие действия на всех страницах при загрузке:

function startPage() {
  document.body.style.visibility = 'visible';
  setPaddingToBody();
  if (isCart) {
    window.addEventListener('focus', updateCartTotals);
    updateCartTotals();
  }
}

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
// Работа с данными пользователя:
//=====================================================================================================

// Вывод информации о пользователе в шапке страницы:

function showUserInfo(userInfo) {
  var data = {
    area: 'profile',
    items: {
      login: userInfo.login,
      username: userInfo.name + ' ' + userInfo.lastname
    }
  }
  fillTemplate(data);
}

//=====================================================================================================
// Работа с данными корзины:
//=====================================================================================================

// Получение данных корзины с сервера:

// function getCart(totals = false) {
//   var url;
//   if (totals) {
//     url = urlRequest + 'cart';
//   } else {
//     url = urlRequest + 'cartTotals';
//   }
//   return new Promise((resolve, reject) => {
//     sendRequest(url)
//     .then(
//       result => {
//         if (totals && JSON.stringify(cartTotals) === result) {
//           reject('Корзина не изменилась');
//         } else if (JSON.stringify(cart[cartId]) === result) {
//           reject('Корзина не изменилась');
//         } else {
//           console.log('Корзина обновилась');
//           if (totals) {
//             cartTotals = JSON.parse(result);
//           } else {
//             cart[cartId] = JSON.parse(result);
//           }
//           resolve();
//         }
//       }
//     )
//     .catch(error => {
//       reject(error);
//     })
//   });
// }

// Получение данных корзины из cookie:

function getCart(totals = false) {
  var key;
  if (totals) {
    key = `cartTotals`;
  } else {
    key = `cart_${cartId}`;
  }
  return new Promise((resolve, reject) => {
    var result = getCookie(key);
    if (totals && (!result || JSON.stringify(cartTotals) === result)) {
      console.log('Итоги не изменились');
      reject('Итоги не изменились');
    } else if (!result || JSON.stringify(cart[cartId]) === result) {
      console.log('Корзина не изменилась');
      reject('Корзина не изменилась');
    } else {
      if (totals) {
        console.log('Итоги обновились');
        cartTotals = JSON.parse(result);
      } else {
        console.log('Корзина обновилась');
        cart[cartId] = JSON.parse(result);
      }
      resolve();
    }
  });
}

// Отображение информации о корзине в шапке сайта:

function changeCartInHeader() {
  if (isCart) {
    var headerCart = document.getElementById('header-cart');
    if (headerCart) {
      var amount = headerCart.querySelector('.amount span'),
          qty = headerCart.querySelector('.qty');

      if (cartTotals[cartId]) {
        amount.textContent = cartTotals[cartId].amount.toLocaleString();
        if (cartTotals[cartId].qty > 0) {
          if (cartTotals[cartId].qty > 99) {
            qty.textContent = '99';
          } else {
            qty.textContent = cartTotals[cartId].qty;
          }
          showElement(qty);
        } else {
          hideElement(qty);
        }
      } else {
        amount.textContent = 0;
        qty.textContent = 0;
        hideElement(qty);
      }
    }
    for (let key in cartTotals) {
      changeCatalogCart(key, cartTotals[key]);
    }
  }
}

// Вывод информации обо всех имеющихся корзинах в шапке сайта:

function changeCatalogCart(cartName, totals) {
  var curCart = document.getElementById(`cart-${cartName}`);
  if (curCart) {
    var qty = curCart.querySelector('.qty'),
        qtyShort = curCart.querySelector('.qty-short'),
        amount = curCart.querySelector('.amount');
    if (qty) {
      qty.textContent = totals.qty;
    }
    if (qtyShort) {
      if (totals.qty > 0) {
        qtyShort.classList.add('full');
        if (totals.qty > 99) {
          qtyShort.textContent = '99+';
        } else {
          qtyShort.textContent = totals.qty;
        }
      } else {
        qtyShort.classList.remove('full');
        qtyShort.textContent = 0;
      }
    }
    if (amount) {
      amount.textContent = totals.amount;
    }
  }
}

// Обновление итогов корзины при возвращении на страницу:

function updateCartTotals() {
  getCart('totals')
  .then(result => {
    changeCartInHeader();
  }, reject => {
    console.log(reject)
  });
}

//=====================================================================================================
// Создание данных для фильтров каталога:
//=====================================================================================================

// Создание фильтра каталога из данных options или actions:

function createFilterData(curArray, optNumb) {
  if (!curArray) {
    return;
  }
  var filter = {},
      name;
  if (curArray === actions) {
    filter.is_new = 'Новинка';
    for (let action in actions) {
      filter[action] = actions[action].title;
    }
    return filter;
  }
  curArray.forEach(item => {
    if (item.options && item.options != 0) {
      name = item.options[optNumb];
    }
    if (item.dtitle) {
      name = item.dtitle;
    }
    if (name != undefined && filter[name] == undefined) {
      filter[name] = 1;
    }
  });
  return filter;
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
  var headerHeight = document.querySelector('.header').clientHeight;
  var footerHeight = document.querySelector('.footer').clientHeight;
  document.body.style.paddingTop = `${headerHeight}px`;
  document.body.style.paddingBottom = `${footerHeight + 20}px`;
}

// Вставка заглушки при ошибке загрузки изображения:

function replaceImg(img) {
  img.src = '../img/no_img.jpg';
}

// Показ элемента:

function showElement(el, style = 'block') {
  if (el) {
    el.style.display = style;
  }
}

// Скрытие элемента:

function hideElement(el) {
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

// Открытие всплывающего окна:

function openPopUp(el, style = 'flex') {
  if (typeof el != 'object') {
    el = document.getElementById(el);
  }
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
    if (typeof el != 'object') {
      el = document.getElementById(el);
    }
  }
  if (el) {
    loader.hide();
    hideElement(el);
    document.body.classList.remove('no-scroll');
    setDocumentScroll();
  }
}

// Открытие/закрытие поля формы для добавления адреса вручную:

function toggleAddByHand() {
  document.getElementById('add-hand').classList.toggle('displayNone')
}

// Отображение количества знаков, оставшихся в поле комментариев:

function countSigns(textarea) {
  document.getElementById('textarea-counter').textContent = 300 - textarea.value.length;
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

// Закрытие окон при клике вне их самих:

document.addEventListener('click', (event) => {
  var target = event.target;
  if (!target.closest('.activate.open')) {
    var dropDownOpen = document.querySelector('.activate.open');
    if (dropDownOpen) {
      dropDownOpen.classList.remove('open');
    }
  }
  if (!target.classList.contains('search-manage') && !target.closest('.search.open')) {
    var searchOpen = document.querySelector('.search.open');
    if (searchOpen) {
      searchOpen.classList.remove('open');
    }
  }
});

//=====================================================================================================
// Вспомогательные функции:
//=====================================================================================================

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
  if (Object.keys(obj).length > 0) {
    return false;
  }
  return true;
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
      dateStart = start.split('.'),
      dateEnd = end.split('.');
  dateStart = new Date(dateStart[2], dateStart[1] - 1, dateStart[0], 0, 0, 0, 0);
  dateEnd = new Date(dateEnd[2], dateEnd[1] - 1, dateEnd[0], 23, 59, 59, 999);
  if (curDate > dateStart && curDate < dateEnd) {
    return true;
  } else {
    return false;
  }
}

//=====================================================================================================
// Работа прелоадера:
//=====================================================================================================

function Loader(obj) {
  this.loader = obj;
  this.text = obj.querySelector('.text');

  this.show = function(text) {
    if (!text) {
      text = '';
    }
    this.text.textContent = text;
    showElement(this.loader, 'flex');
  }

  this.hide = function() {
    hideElement(this.loader);
  }
}

//=====================================================================================================
// Работа окна с сообщениями:
//=====================================================================================================

function Message(obj) {
  this.message = obj;
  this.text = obj.querySelector('.text');

  this.message.addEventListener('click', () => this.hide());

  this.show = function(text) {
    if (!text) {
      return;
    }
    this.text.textContent = text;
    openPopUp(this.message);
    setTimeout(() => {
      closePopUp(null, this.message);
    }, 2000);
  }

  this.hide = function() {
    closePopUp(null, this.message);
  }
}

//=====================================================================================================
// Работа кнопки "Наверх страницы":
//=====================================================================================================

var upBtn = document.getElementById('up-btn');

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
// Работа выпадающих списков:
//=====================================================================================================

function DropDown(obj) {
  // Элементы для работы:
  this.filter = obj;
  this.head = obj.querySelector('.head');
  this.title = obj.querySelector('.title');
  this.clearBtn = obj.querySelector('.clear-btn');

  // Константы:
  this.titleText = this.title.textContent;

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.head) {
      this.head.addEventListener('click', () => this.toggle());
    }
    this.filter.addEventListener('click', (event) => this.selectValue(event));
    if (this.clearFilterBtn) {
      this.clearFilterBtn.addEventListener('click', event => this.clear(event));
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
  this.selectValue = function (event) {
    if (!event.target.closest('.item')) {
      return;
    }
    var curItem = event.target.closest('.item');

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
    var event = new Event('change');
    this.filter.dispatchEvent(event);
  }

  // Установка определенного значения фильтра:
  this.setValue = function (value) {
    if (!this.filter.classList.contains('select')) {
      return;
    }
    obj.querySelectorAll('.item').forEach(el => {
      if ((el.dataset.value).toLowerCase() == value.toLowerCase()) {
        this.title.textContent = el.textContent;
        this.filter.value = el.dataset.value;
        this.filter.classList.remove('open');
        var event = new Event('change');
        this.filter.dispatchEvent(event);
      }
    });
  }

  // Очистка фильтра:
  this.clear = function () {
    this.title.textContent = this.titleText;
    this.filter.querySelectorAll('.item.checked').forEach(el => el.classList.remove('checked'));
  }
}

//=====================================================================================================
// Работа с таблицами:
//=====================================================================================================

// Создание объектов таблиц при запуске страницы:

function initTables() {
  loader.show();
  document.querySelectorAll('.table-wrap').forEach(el => {
    var data = window[`${el.id}out`] ? window[`${el.id}out`] : [];
    data = data.filter(el => el);
    new Table(el, data);
  });
}

// Объект таблицы:

function Table(obj, data) {
  // Элементы для работы:
  this.table = obj;
  this.id = obj.id;
  this.tab = document.querySelector(`.tab.${this.id}`);
  this.head = obj.querySelector('.table-head');
  this.results = this.head.querySelector('.results');
  this.body = obj.querySelector('.table-body');
  this.resizeBtns = this.head.querySelectorAll('.resize-btn');
  this.dropDown = obj.querySelectorAll('.activate');
  this.sort = obj.querySelectorAll('.sort');
  this.search = obj.querySelectorAll('.search');

  // Константы:
  this.data = data;

  // Динамические переменные:
  this.countItems = 0;
  this.countItemsTo = 0;
  this.itemsToLoad = this.data;
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
      new DropDown(el, data);
      el.addEventListener('change', event => this.filterData(event, el.dataset.key));
    });

    this.sort.forEach(el => {
      new DropDown(el);
      el.addEventListener('click', event => this.sortData(event, el.dataset.key, el.dataset.type));
    });
    this.search.forEach(el => {
      new DropDown(el);
      el.addEventListener('submit', event => this.searchData(event, el.dataset.key));
      el.querySelector('.search.icon').addEventListener(event => this.searchData(event, el.dataset.key));
      el.querySelector('.close.icon').addEventListener(event => this.clearSearch(event, el.dataset.key));
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
    if (this.countItemsTo == this.itemsToLoad.length) {
      return;
    }
    this.countItemsTo = this.countItems + this.incr;
    if (this.countItemsTo > this.itemsToLoad.length) {
      this.countItemsTo = this.itemsToLoad.length;
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
    if (!this.results) {
      return;
    }
    this.results.querySelectorAll('.result').forEach(result => {
      var total = 0;
      this.itemsToLoad.forEach(el => {
        total += parseFloat(el[result.dataset.key].replace(' ', ''), 10);
      });
      result.textContent = Math.ceil(total).toLocaleString();
    });
  }

  // Выравнивание столбцов таблицы при загрузке:
  this.alignHead = function() {
    if (!this.head) {
      return;
    }
    var headCells = this.head.querySelectorAll('tr:first-child > th');
    headCells.forEach(headCell => {
      var bodyCell = this.body.querySelector(`tr:first-child > td:nth-child(${headCell.id})`);
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
    var activeTable = document.querySelector('.table-wrap.active');
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
    this.head.querySelector('.sort.cheched').classList.remove('checked');
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

//=====================================================================================================
// Заполенение контента из данных по id:
//=====================================================================================================

function fillById(data) {
  var el;
  for (let key in data) {
    el = document.getElementById(`#${key}#`);
    if (el) {
      el.textContent = data[key];
    }
  }
}

//=====================================================================================================
// Заполенение контента по шаблону:
//=====================================================================================================

// Получение свойств "#...#" из шаблонов HTML:

function extractProps(template) {
  return template.match(/#[^#]+#/gi).map(prop => prop = prop.replace(/#/g, ''));
}

// Заполнение блока по шаблону:

function fillByTemplate(template, data, target) {
  var list = createListByTemplate(template, data);
  target.innerHTML = list;
}

// Создание списка элементов на основе шаблона:

function createListByTemplate(template, data) {
  var list = '', newEl;
  data.forEach(dataItem => {
    newEl = template;
    newEl = createElByTemplate(newEl, dataItem);
    list += newEl;
  });
  return list;
}

// Создание одного элемента на основе шаблона:

function createElByTemplate(newEl, data) {
  var props = extractProps(newEl),
      propRegExp,
      value;
  props.forEach(key => {
    propRegExp = new RegExp('#' + key + '#', 'gi');
    if (typeof data === 'object') {
      if (data[key]) {
        value = data[key];
      } else {
        value = '';
      }
    } else {
      value = data;
    }
    newEl = newEl.replace(propRegExp, value);
  });
  return newEl;
}

//=====================================================================================================
// Переход на другие страницы:
//=====================================================================================================

// Переход на страницу заказа:

function showOrder(id) {
  document.location.href = '/order/?order_id=' + id;
}

// Переход на страницу рекламации:

function showReclm(id) {
  // document.location.href = '/reclamation/?recl_id=' + id;
  document.location.href = '../reclamation';
}

//=====================================================================================================
// Универсальное заполнение данных по шаблону:
//=====================================================================================================

// Примеры данных:

// * - обязательное поле, остальные можно пропускать

// var data = {
//   * area: элемент или id или селектор,     (сам элемент, его id или селектор, откуда будет браться шаблон)
//     source: 'inner' или 'outer',           (как извлекать шаблон - весь тег целиком или его внутреннюю часть, по умолчанию - inner)
//     target: id элемента,                   (id области куда будет вставляться результат, если нужно вставить в другое место отличное от того где извлекали шаблон)
//   * items: массив объектов или объект,     (данные для заполнения шаблона)
//     sub: объект,                           (где ключи - это названия ключей в данных, откуда брать информацию для заполнения подшаблонов, а значения - селекторы, по которым нужно найти подшаблон в шаблоне)
//     action: 'replace' или return',         (действие с данными, если 'replace' - вставит шаблон на страницу, если 'return' - вернет строку с шаблоном, по умолчанию - 'replace')
// }

// var data = {
//   area: 'big-card',
//   source: 'outer',
//   target: 'gallery',
//   items: items,
//   sub: {'images': '.carousel-gallery', 'sizes': '.card-sizes', 'options': '.card-options', 'manuf': '.manuf-row'},
//   action: 'replace',
// }

// Универсальная функция заполнения данных по шаблону:

function fillTemplate(data, sign = '#') {
  if (!data.area || !data.items) {
    return;
  }

  var sub = data.sub;
  if (data.target) {
    var target = document.getElementById(data.target);
  }

  var area, areaName; //место содержащее шаблон
  if (typeof data.area !== 'string') {
    area = data.area;
    areaName = data.area.id ? data.area.id : data.area.classList[0];
  } else {
    areaName = data.area;
    if (data.area.indexOf('.') === 0) {
      area = document.querySelector(data.area);
    } else {
      area = document.getElementById(data.area);
    }
  }

  if (!area) {
    return;
  }

  var temp = window[`${areaName}Temp`]; // шаблон
  if (!temp) {
    if (data.source && data.source === 'outer') {
      window[`${areaName}Temp`] = temp = area.outerHTML;
    } else {
      window[`${areaName}Temp`] = temp = area.innerHTML;
    }
  }

  var txt;
  if (Array.isArray(data.items) && typeof data.items[0] === 'object') { //данные - массив объектов
    txt = fillList(areaName, area, data.items, temp, sign, sub);
  } else if (typeof data.items === 'object') { //данные - объект
    txt = fillEl(areaName, area, data.items, temp, sign, sub);
  }

  if (data.action && data.action === 'return') {
    return txt;
  } else {
    var targetEl = area;
    if (target) {
      targetEl = target;
    }
    insertText(targetEl, txt);
  }
}

// Замена данных в шаблоне из массива объектов:

function fillList(areaName, area, data, temp, sign, sub, objKey) {
  var result = '',
      newEl;
  for (let arrKey in data) {
    newEl = temp;
    newEl = fillEl(areaName, area, data[arrKey], temp, sign, sub, objKey);
    result += newEl;
  }
  return result;
}

// Замена данных в шаблоне из объекта:

function fillEl(areaName, area, data, temp, sign, sub, objKey) {
  if (sub) { // Если есть подшаблоны
    var list,
        subNames = [];
    for (let subKey in sub) {
      list = '';
      if (data[subKey]) {
        subNames.push(subKey);
        var subTemp = window[`${areaName}${subKey}Temp`]; // подшаблон
        if (!subTemp) {
          window[`${areaName}${subKey}Temp`] = subTemp = area.querySelector(sub[subKey]).outerHTML;
        }
        if (data[subKey][0] && typeof data[subKey][0] === 'object') {
          list = fillList(areaName, area, data[subKey], subTemp, sign);
        } else if (data[subKey][0]) {
          list = fillList(areaName, area, data[subKey], subTemp, sign, null, subKey);
        } else {
          list = fillEl(areaName, area, data[subKey], subTemp, sign);
        }
      }
      temp = temp.replace(subTemp, list);
    }
  }

  if (objKey) {
    temp = replaceInTemp(objKey, data, temp, sign);
  } else {
    var value;
    for (let key in data) {
      if (!sub || subNames.indexOf(key) === -1) {
        value = data[key];
        temp = replaceInTemp(key, value, temp, sign);
      }
    }
  }
  return temp;
}

// Замена в полученном шаблоне всех найденных данных:

function replaceInTemp(key, val, temp, sign) {
  var regex = new RegExp(sign + key + sign, 'gi'),
      res = temp.replace(regex, val);
  return res;
}

// Вставка заполненного шаблона в документ:

function insertText(el, txt) {
  el.classList.remove('template');
  txt = txt.replace('template', '');
  el.innerHTML = txt;
}
