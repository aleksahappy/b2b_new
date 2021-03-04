'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Основные настройки:

var isManager = userInfo ? (userInfo.group_id > 0 ? true : false) : false,
    isUser = isManager ? false : true,
    isAdmin = userInfo ? (userInfo.super_user > 0 ? true : false) : false,
    website = 'ts_b2b',
    pageId = location.pathname.replace('index.html', '').replace(/\//g, '').replace('registr', ''),
    pageUrl = pageId;

// Настройки каруселей:

var fullCardCarousel = {
  isNav: true,
  durationNav: 400,
  isLoupe: true
};

var fullImgCarousel = {
  isNav: true,
  navType: 'dot',
  durationNav: 400
};

// Общие элементы страниц:

var loader,
    alerts,
    upBtn,
    items;

// Данные каталогов и их корзин:

var cartTotals;

// Динамически изменяемые переменные:

var currentElem = null,
    tooltip = null,
    scrollPos,
    resizeHandler = null;

// Запускаем страницy:

startPage();

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
// Обязательные функции для всех страниц:
//=====================================================================================================

// Запуск страницы:

function startPage() {
  addModules();
  if (pageId) {
    window.addEventListener('focus', updateCartTotals);
    includeHTML();
    getTotals(true)
    .then(result => {
      renderTotals();
    })
  }
}

// Получение данных, необходимых для загрузки страницы:

function getPageData(url, action, data) {
  return new Promise((resolve => {
    sendRequest(url, action, data)
    .then(result => {
      if (result) {
        result = JSON.parse(result);
      }
      resolve(result);
    })
    .catch(error => {
      console.log(error);
      loader.hide();
      alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
    })
  }));
}

// Ожидание подгрузки итогов корзин:

function waitCartTotals() {
  return new Promise(resolve => {
    check();
    function check() {
      if (cartTotals) {
        resolve();
      } else {
        setTimeout(check, 10);
      }
    }
  });
}

// Выход из авторизации:

function logOut(event) {
  event.preventDefault();
  sendRequest(urlRequest.main, 'logout')
  .then(result => {
    clearLocal();
    document.location.href = '/';
  })
}

// Отображение/скрытие мобильного меню (адаптивного хедера):

function toggleMobMenu(action) {
  var mobMenu = getEl('#mob-menu'),
      isOpen = mobMenu.classList.contains('open');
  if (action === 'close') {
    setTimeout(() => setPaddingToBody(), 200);
  }
  if (!action) {
    action = isOpen ? 'close' : 'open';
  }
  if (isOpen && action === 'close') {
    closePopUp(null, mobMenu);
  } else if (!isOpen && action === 'open') {
    openPopUp(mobMenu);
  }
}

//=====================================================================================================
// Построение страницы:
//=====================================================================================================

// Добавление обязательных модулей при загрузке страницы:

function addModules() {
  if (getEl('#modules')) {
    return;
  }
  var modules = document.createElement('div');
  modules.id = 'modules';
  document.body.insertBefore(modules, document.body.firstChild);
  loadHTML(modules, pageId ? '../modules/main_full.html' : '../modules/main_short.html');
  loadHTML(modules, '../modules/main_common.html');
  initModules();
}

// Добавление html из других файлов:

function includeHTML(target) {
  var url;
  if (target) {
    target = getEl(target);
    url = target.dataset.html;
    loadHTML(target, url);
  } else {
    document.body.querySelectorAll('[data-html]').forEach(el => {
      url = el.dataset.html;
      loadHTML(el, url);
    });
  }
}

// Получение и вставка html:

function loadHTML(target, url) {
  target = getEl(target);
  if (!target || !url) {
    return;
  }
  var request = new XMLHttpRequest();
  request.open('GET', url , false);
  request.setRequestHeader('Cache-Control', 'no-cache');
  request.setRequestHeader('Cache-Control', 'no-store');
  try {
    request.send();
    if (request.status != 200) {
      console.log(`Ошибка ${request.status}: ${request.statusText}`);
      throw new Error(`Ошибка ${request.status}: ${request.statusText}`);
    } else {
      if (request.response) {
        target.innerHTML += request.responseText;
        target.removeAttribute('data-html');
      }
    }
  } catch(error) {
    console.log(error);
  }
}

//=====================================================================================================
// Инициализация модулей страницы:
//=====================================================================================================

// Запуск инициализации основных модулей страницы:

function initModules() {
  getEl('#footer .current-year').textContent = new Date().getFullYear();
  if (pageId) {
    fillUserInfo();
    // initNotifications();
  }
  initLoader();
  initAlerts();
  initUpBtn();
  initTooltips();
  initInputFiles();
  if (pageId) {
    loader.show();
  }
}

// Вывод информации о пользователе в шапке страницы:

function fillUserInfo() {
  if (window.userInfo) {
    userInfo.fio = userInfo.lastname + ' ' + userInfo.name + ' ' + userInfo.parentname;
    var data = {
      login: userInfo.login,
      username: userInfo.name + ' ' + userInfo.lastname
    }
    loadData('#profile', data);
    loadData('#mob-profile', data);
  } else {
    if (location.pathname !== '/') {
      location.href = '/';
    }
  }
}

//=====================================================================================================
// Запросы на сервер:
//=====================================================================================================

// Отправка запросов на сервер:

function sendRequest(url, action, data, type = 'application/json; charset=utf-8') {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest(),
        requestType = action ? 'POST' : 'GET';
    request.addEventListener('error', () => reject(new Error('Ошибка сети')));
    request.addEventListener('load', () => {
      if (request.status === 200) {
        resolve(request.response);
      }
      reject(new Error(request.status));
    });
    request.open(requestType, url);
    if (action) {
      if (type === 'application/json; charset=utf-8') {
        data = data ? {action: action, data: data} : {action: action};
        data = JSON.stringify(data);
        request.setRequestHeader('Content-type', type);
      } else if (type === 'multipart/form-data') {
        data.append('action', action);
      }
      request.send(data);
    } else {
      request.send();
    }
  });
}

// Получение данных об итогах всех корзин с сервера:

function getTotals(isInitial = false) {
  return new Promise(resolve => {
    sendRequest('../json/cart_totals.json')
    // sendRequest(urlRequest.main, 'get_total')
    .then(
      result => {
        if (!result) {
          throw new Error('Итоги пустые.');
        }
        result = JSON.parse(result);
        if (result.err) {
          throw new Error(result.err);
        } else if (JSON.stringify(cartTotals) === JSON.stringify(result)) {
          console.log('Итоги не изменились.');
          resolve();
        } else {
          console.log('Итоги обновились.');
          cartTotals = result;
          resolve(true);
        }
      }
    )
    .catch(error => {
      console.log('Ошибка получения итогов:' + error);
      if (isInitial) {
        cartTotals = [];
      }
      resolve();
    })
  });
}

// Получение данных о товаре по артикулу:

function getItem(articul) {
  return new Promise((resolve, reject) => {
    sendRequest(urlRequest.main, 'item', {articul: articul})
    .then(result => {
      var data = JSON.parse(result);
      resolve(data);
    })
    .catch(error => {
      console.log(error);
      reject(error);
    })
  });
}

// Получение информации об описании товара:

function getDescribeInfo(data) {
  return new Promise(resolve => {
    if (data.desc !== undefined) {
      resolve();
    } else {
      sendRequest(`../json/describe.json`)
      // sendRequest(urlRequest.main, 'item_descr', {id: data.object_id})
      .then(result => {
        if (result) {
          result = JSON.parse(result);
          if (/\S/.test(result)) {
            result = result.replace(/\s/g, ' ').replace(/\\n/g, '');
            data.desc = result;
            if (data.describe) {
              data.describe.unshift({title: 'Описание товара', info: data.desc});
            }
          } else {
            data.desc = '';
          }
        } else {
          data.desc = '';
        }
        resolve();
      })
      .catch(error => {
        console.log(error);
        resolve();
      })
    }
  });
}

//==================================================================================================
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
// Работа с данными корзины:
//=====================================================================================================

// Обновление итогов корзины при возвращении на страницу:

function updateCartTotals() {
  getTotals()
  .then(result => {
    if (result) {
      renderTotals();
    }
  });
}

// Создание списков каталогов в шапке сайта:

function renderTotals() {
  renderTotalsInHeader('#catalogs', 'catalogs');
  renderTotalsInHeader('#mob-catalogs', 'catalogs');
}

// Создание списка каталогов/корзин в шапке сайта:

function renderTotalsInHeader(area, type) {
  if (!cartTotals.length) {
    return;
  }
  area = getEl(area);
  if (!area) {
    return;
  }
  var data = getDataFromTotals(type);
  loadData(area, data, [{
    area: type === 'catalogs' ? '.catalogs' : '.items',
    source: 'inner',
    items: 'items'
  }]);
}

// Подготовка данных для создания списка каталогов/корзин:

function getDataFromTotals(type) {
  var data = type === 'carts' ? {} : [],
      totals = JSON.parse(JSON.stringify(cartTotals)),
      sum = 0;

  totals.forEach((el, index) => {
    if (!el.id) {
      totals.splice(index, 1);
    } else {
      el.isFull = el.qty > 0 ? 'full' : '';
      el.qty = el.qty > 99 ? (type === 'carts' ? '99' : '99+') : el.qty;
      if (type === 'carts') {
        sum += el.sum;
      }
      el.sum = convertPrice(el.sum);
      if (type === 'catalogs') {
        var section = el.id.indexOf('preorder') == 0 ? 'Предзаказы' : 'Каталоги',
            curSection = data.find(el => el.section === section);
        if (section === 'Предзаказы') {
          el.link = `../preorders/?${el.id}`;
        } else {
          el.link = `../catalogs/?${el.id}`;
        }
        if (curSection) {
          curSection.items.push(el);
        } else {
          data.push({section: section, items: [el]});
        }
      }
      if (type === 'carts' && pageId === 'catalogs' && location.search && location.search.slice(1).split('&')[0] === el.id) {
        totals.unshift(totals.splice(index, 1)[0]);
      }
    }
  });
  if (type === 'catalogs') {
    var preorderIndex = data.findIndex(el => el.section === 'Предзаказы');
    if (preorderIndex) {
      data.unshift(data.splice(preorderIndex, 1)[0]);
    }
  }
  if (type === 'carts') {
    data.sum = convertPrice(sum);
    data.items = totals;
  }

  return data;
}

//=====================================================================================================
// Преобразование входящих данных:
//=====================================================================================================

// Преобразование данных о картинках:

function addImgInfo(item, key = 'images') {
  item[key] = item[key].toString().split(';');
  item.image = item[key].length ? item[key][0] : '';
  item.images_full = [];
  item[key].forEach(el => item.images_full.push(`https://b2b.topsports.ru/c/source/${el}.jpg`));
}

// Преобразование данных для создания списка характеристик:

function addOptionsInfo(item, optnames, key = 'options') {
  if (!item[key] || item[key] == 0) {
    return;
  }
  var options = [], title, value;
  for (var k in item[key]) {
    if (k.indexOf('id_' == 0)) {
      if (optnames) {
        title = optnames[k.replace('id_', '')];
      } else {
        break;
      }
    } else {
      title = k;
    }
    if (title == 'Производитель техники' ||
      title == 'OEM' ||
      title == 'Модель техники' ||
      title == 'Год модели техники') {
      continue;
    }
    value = item[key][k];
    if (item.search) {
      item.search.push(value.toString().replace(/\"/g, ''));
    }
    value = value.toString().replace(/\,/gi, ', ').replace(/\//gi, '/ ');
    if (title == 'Категория' ||
      title == 'Бренд' ||
      title == 'Модель' ||
      title == 'Серия' ||
      title == 'Цвет' ||
      title == 'Цвет оригинальный' ||
      title == 'Статус товара' ||
      title == 'Тип линзы' ||
      title == 'Размер обуви' ||
      title == 'Размер для сайта' ||
      title == 'Размер поставщика' ||
      title == 'Размер взрослый' ||
      title == 'Размер детский' ||
      title == 'Размер для фильтров' ||
      title == 'Американский размер' ||
      title == 'Европейский размер' ||
      title == 'Размер американский взрослый' ||
      title == 'Размер американский детский' ||
      title == 'Длина стельки взрослый' ||
      title == 'Вес, грамм' ||
      title == 'Длина, мм' ||
      title == 'Высота, мм' ||
      title == 'Ширина, мм' ||
      title == 'Порядок' ||
      title == 'Контент менеджер') {
      continue;
    }
    options.push({
      title: title,
      value: value
    });
  }
  item.options = options;
}

//=====================================================================================================
// Функции для работы с контентом на странице:
//=====================================================================================================

// Установка отступов документа:

function setPaddingToBody() {
  var headerHeight = getEl('#header').clientHeight,
      footerHeight = getEl('#footer').clientHeight;
  document.body.style.paddingTop = `${headerHeight}px`;
  document.body.style.paddingBottom = `${footerHeight + 20}px`;
}

// Проверка загруженности всех изображений карусели и ее инициализация:

function renderCarousel(carousel, curImg = 0) {
  if (!carousel) {
    return;
  }
  return new Promise(resolve => {
    var imgs = carousel.querySelectorAll('img');
    imgs.forEach((img, index) => {
      if (index === imgs.length - 1) {
        img.addEventListener('load', () => {
          setTimeout(() => render(carousel), 100);
        });
        img.addEventListener('error', () => {
          img.parentElement.remove();
          setTimeout(() => render(carousel), 100);
        });
      } else {
        img.addEventListener('error', () => {
          img.parentElement.remove();
        });
      }
    });

    function render(carousel) {
      var imgs = carousel.querySelectorAll('img'),
          count = imgs.length;
      if (count === 0 || (count === 1 && imgs[0].src.indexOf('no_img.jpg') >= 0)) {
        var parent = carousel.parentElement;
        if (parent) {
          parent.removeChild(carousel);
          parent.insertAdjacentHTML('afterbegin', '<div class="img-wrap row"><img src="../img/no_img.jpg"></div>');
        }
      } else {
        startCarouselInit(carousel, curImg);
      }
      resolve('карусель готова');
    }
  });
}

// Проверка загружено ли изображение/видео и вставка заглушки/удаление при его отсутствии:

function checkMedia(element, action = 'replace', path = '../img/no_img.jpg') {
  element = getEl(element);
  if (element) {
    element.addEventListener('error', (event) => {
      var el = event.currentTarget;
      if (action === 'replace') {
        var type = el.tagName.toLowerCase();
        if (type == 'img') {
          el.src = path;
        } else if (type == 'video') {
          var parent = el.parentElement,
              newEl = document.createElement('img');
          newEl.src = path;
          parent.removeChild(el);
          parent.appendChild(newEl);
        }
      } else if (action === 'delete') {
        event.currentTarget.remove();
      }
    });
  }
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

// Запрет на скролл страницы:

function stopBodyScroll(event) {
  var el = event.currentTarget,
      scrollTo = null;
  if (event.type == 'mousewheel') {
    scrollTo = (event.wheelDelta * -1);
  } else if (event.type == 'DOMMouseScroll') {
    scrollTo = 40 * event.detail;
  }
  if (scrollTo) {
    event.preventDefault();
    el.scrollTop = scrollTo + el.scrollTop;
  }
}

// Получение текущей прокрутки документа:

function getDocumentScroll() {
  scrollPos = {x: window.pageXOffset, y: window.pageYOffset};
}

// Установка прокрутки документа:

function setDocumentScroll(x, y) {
  if (x === undefined && y === undefined) {
    window.scrollTo(scrollPos.x, scrollPos.y);
  } else {
    window.scrollTo(x || 0, y || 0);
  }
}

// Удаление значения из инпута при его фокусе:

function onFocusInput(input) {
  if (input.value != '') {
    input.value = '';
  }
}

// Возвращение значения в инпут при потере им фокуса:

function onBlurInput(input) {
  input.value = input.dataset.value || '';
}

// Выделение слов в тексте:

function highlightText(el, textToFind) {
  el = getEl(el);
  if (!el || !textToFind) {
    return;
  }
  var children = Array.prototype.slice.call(el.childNodes);
  children.forEach(child => {
    if (child.nodeType === 3) {
      checkAndReplace(child);
    } else if (child.nodeType === 1) {
      highlightText(child, textToFind);
    }
  });

  function checkAndReplace(node) {
    var nodeVal = node.nodeValue,
        parentNode = node.parentNode;
    if (/\S/.test(nodeVal)) {
      var isFirst = true,
          textNode, begin, matched, span;

      while (true) {
        var index = nodeVal.toLowerCase().indexOf(textToFind.toLowerCase());

        if (index < 0) {
          if (isFirst)
            break;
          if (nodeVal) {
            textNode = document.createTextNode(nodeVal);
            parentNode.insertBefore(textNode, node);
          }
          parentNode.removeChild(node);
          break;
        }

        isFirst = false;
        begin = nodeVal.substring(0, index);
        matched = nodeVal.substr(index, textToFind.length);
        if (begin) {
          textNode = document.createTextNode(begin);
          parentNode.insertBefore(textNode, node);
        }
        span = document.createElement('span');
        span.classList.add('highlight');
        span.appendChild(document.createTextNode(matched));
        parentNode.insertBefore(span, node);

        nodeVal = nodeVal.substring(index + textToFind.length);
      }
    }
  }
};

//=====================================================================================================
// Функции сворачивания/разворачивания контейнеров:
//=====================================================================================================

// Свернуть/развернуть сам контейнер:

function toggleEl(event, className = 'close') {
  if (checkIsAction(event)) {
    return;
  }
  event.currentTarget.classList.toggle(className);
}

// Свернуть/развернуть содержимое контейнера:

function switchContent(event) {
  if (checkIsAction(event)) {
    return;
  }
  var container = event.currentTarget.closest('.switch');
  if (!container || container.classList.contains('disabled')) {
    return;
  }
  var toggleIcon = getEl('.switch-icon', container);
  if (toggleIcon) {
    if (window.getComputedStyle(toggleIcon).display === 'none') {
      return;
    }
  }
  if (container.classList.contains('close')) {
    container.classList.remove('close');
  } else {
    container.classList.add('close');
  }
  if (container.classList.contains('save') && (container.id || container.dataset.key)) {
    if (container.classList.contains('close')) {
      savePosition(container.id || container.dataset.key, 'close');
    } else {
      savePosition(container.id || container.dataset.key, 'open');
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
  delete positions[pageUrl];
  saveInfo(`positions`, positions, 'sessionStorage');
}

// Проверка сохраненных положений контейнеров (открыты/закрыты):

function checkPositions() {
  var positions = getInfo('positions', 'sessionStorage')[pageUrl];
  for (var key in positions) {
    var el = getEl(`#${key}`) || getEl(`.save[data-key="${key}"]`);
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
// Вспомогательные функции:
//=====================================================================================================

// Получение элемента по селектору:

function getEl(el, area) {
  area = arguments.length === 1 ? document : area;
  if (typeof el === 'string') {
    el = el.trim();
    area = typeof area === 'string' ? getEl(area): area;
    el = area ? area.querySelector(el) : undefined;
  }
  return el || undefined;
}

// Проверка на объект:

function isNativeObject(object) {
  return Object.prototype.toString.call(object) === '[object Object]';
}

// Проверка пустой ли объект:

function isEmptyObj(obj) {
  if (Object.keys(obj).length) {
    return false;
  }
  return true;
}

// Проверка кликнутого элемента на наличие действия в нем или родителе:

function checkIsAction(event) {
  var target = event.target;
  if (event.target !== event.currentTarget) {
    var onclickEl = target.closest('[onclick]');
    if ((onclickEl && onclickEl !== event.currentTarget) || target.closest('a') || target.closest('[data-tooltip]')) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// Замена символов переноса в тексте на тег <br/>:

function brText(text) {
	text = text.trim();
	text = text.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '<br/>');
	return text;
}

// Нахождение суммы элементов массива:

function arraySum(arr) {
  var sum = 0;
  arr.forEach(el => sum += getNumb(el));
  return sum;
}

// Получение числа из строки:

function getNumb(item) {
  return parseFloat(item.toString().replace(',', '.').replace(/\s/g, ''));
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
      curStyle = docStyles.find(el => el && el.href && el.href.replace(/\?.*/g, '') === docPath);
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

// Вызов функций по окончанию группы событий:

function debounce(callback, delay) {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      callback();
    }, delay);
  };
};

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
// Сортировка массива объектов:
//=====================================================================================================

// Сортировка массива объектов по указанному полю:

function sortBy(key, type = 'text') {
  var sortOrder = 1;
  if (key[0] === "-") {
    sortOrder = -1;
    key = key.substr(1);
  }
  if (type == 'size') {
    var sizeTemp = [
      'XXXXS', '4XS',
      'XXXXS/XXXS', 'XXXXS-XXXS', '4XS/3XS', '4XS-3XS',
      'XXXS', '3XS',
      'XXXS/XXS', 'XXXS-XXS', '3XS/2XS', '3XS-2XS',
      'XXS', '2XS',
      'XXS/XS', 'XXS-XS', '2XS/XS', '2XS-XS',
      'XS',
      'XS/S', 'XS-S',
      'S',
      'S/M', 'S-M', 'SM',
      'M',
      'M/L', 'M-L', 'ML',
      'L',
      'L/XL', 'L-XL',
      'XL',
      'XL/XXL', 'XL-XXL', 'XL/2XL', 'XL-2XL',
      'XXL', '2XL',
      'XXL/XXXL', 'XXL-XXXL', 'XXL/3XL', 'XXL-3XL',
      'XXXL', '3XL',
      'XXXXL', '4XL',
      'XXXL/XXXXL', 'XXXL-XXXXL', 'XXXL/4XL', 'XXXL-4XL'];
  }

  function getValue(item) {
    var value = item[key];
    if (!value && value != 0) {
      return null;
    }
    switch (type) {
      case 'text':
        return '' + value;
      case 'numb':
        return parseFloat(value.toString().replace(/\s/g, ''));
      case 'date':
        return getDateObj(value, 'dd.mm.yy');
      case 'size':
        value = value.replace(/\s/g, '');
        var sizeIndex = sizeTemp.findIndex(el => el === value);
        if (sizeIndex >= 0) {
          value = sizeIndex;
        } else {
          if (value === 'OS' || value === 'NA') {
            value = Infinity;
          } else if (/\D/.test(value.replace(/\-|\/|\./gi, ''))) {
            value = null;
          } else {
            value = parseFloat(value.toString().replace(/\s/g, '')) + sizeTemp.length;
          }
        }
        return value;
    }
  }

  return function (a, b) {
    var result;
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
      case 'size':
        result = a - b;
        break;
    }
    return result * sortOrder;
  }
}

//=====================================================================================================
// Сортировка объектов:
//=====================================================================================================

// Сортировка объекта по ключу:

function sortObjByKey(obj, type = 'text', sortOrder = 1) {
  var arrayObj = Object.keys(obj),
      sortedObj = {};
  arrayObj = arrayObj.sort(sortObj());

  function sortObj() {
    return function (a, b) {
      var result;
      switch (type) {
        case 'text':
          result = (a < b) ? -1 : (a > b) ? 1 : 0;
          break;
        case 'numb':
          a = typeof a === 'string' ? parseFloat(a.toString().replace(/\s/g, '')) : a;
          b = typeof b === 'string' ? parseFloat(b.toString().replace(/\s/g, '')) : b;
          result = a - b;
          break;
        case 'date':
          a = getDateObj(a, 'dd.mm.yy');
          b = getDateObj(b, 'dd.mm.yy');
          result = b - a;
          break;
      }
      return result * sortOrder;
    }
  }
  arrayObj.forEach(key => sortedObj[key] = obj[key]);
  return sortedObj;
}

// Сортировка объекта по значению:

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

// Перемещение данных по ключy в конец объекта:

function moveToEndObj(obj, key) {
  var movable = obj[key];
  if (movable) {
    delete obj[key];
    obj[key] = movable;
  }
}

//=====================================================================================================
// Работа с датами:
//=====================================================================================================

// Получение объекта даты срока истечения:

function getDateExpires(days, date = new Date()) {
  if (isNaN(date.getTime())) {
    return;
  }
  date.setDate(date.getDate() + days);
  return date;
}

// Создание объекта даты из строки:

function getDateObj(string, format = 'dd.mm.yyyy') {
  if (!string) {
    return string;
  }
  if (format === 'dd.mm.yy' || format === 'dd.mm.yyyy'){
    string = string.replace(/(\d+).(\d+).(\d+)/, '$2/$1/$3');
  } else if (format === 'yy-mm-dd' || format === 'yyyy-mm-dd') {
    string = string.replace(/(\d+)-(\d+)-(\d+)/, '$2/$3/$1');
  }
  var date = new Date(string);
  if (isNaN(date.getTime())) {
    return;
  }
  return date;
}

// Получение строки с датой из объекта даты:

function getDateStr(date = new Date(), format = 'dd.mm.yyyy') {
  if (isNaN(date.getTime())) {
    return;
  }
  var day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate(),
      month = (date.getMonth() < 10) ? '0' + parseInt(date.getMonth() + 1) : parseInt(date.getMonth() + 1),
      year = date.getFullYear(),
      string;
  if (format === 'dd.mm.yyyy'){
    string = `${day}.${month}.${year}`;
  } else if (format === 'dd.mm.yy') {
    string = `${day}.${month}.${year.toString().slice(2, 4)}`;
  } else if (format === 'yyyy-mm-dd') {
    string = `${year}.${month}.${day}`;
  } else if (format === 'yy-mm-dd') {
    string = `${year.toString().slice(2, 4)}.${month}.${day}`;
  }
  return string;
}

// Проверка актуальности даты в периоде (принимает объекты даты):

function checkDate(start, end, date = new Date()) {
  if (!start && !end) {
    return true;
  }
  if (!start) {
    start = new Date().setDate(date.getDate() - 1);
  }
  if (!end) {
    end = new Date().setDate(date.getDate() + 1);
  }
  if (date >= start && date <= end) {
    return true;
  } else {
    return false;
  }
}

//=====================================================================================================
// Работа с регулярными выражениями:
//=====================================================================================================

// Получение регулярного выражения:

function getRegExp(value) {
  if (/^\d+[\d\s]*(\.{0,1}|\,{0,1}){0,1}[\d\s]*$/.test(value)) {
    value = value.replace(/\s/g, '').replace(/[/.,/]/, '[/.,/]');
  }
  return RegExp(value, 'gi');
}

// Поиск в значении регулярным выражением:

function findByRegExp(value, regExp) {
  if (/^\d+[\d\s]*(\.{0,1}|\,{0,1}){0,1}[\d\s]*$/.test(value)) {
    value = value.replace(/\s/g, '');
  }
  if (value != 0 && value && value.toString().search(regExp) >= 0) {
    return true;
  }
}

// Проверка значения на соответствие регулярному выражению/ям:

function testValue(value, regExp) {
  var result;
  if (!Array.isArray(regExp)) {
    regExp = [regExp];
  }
  for (var exp of regExp) {
    result = exp.test(value);
    if (result) {
      return result;
    }
  }
  return false;
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

function convertToString(el) {
  var string = '';
  convert(el);
  return string;

  function convert(el) {
    if (typeof el === 'string' || typeof el === 'number') {
      el = el.toString();
      el = el.replace(/\s/g, ' ');
      if (/^\d+[\d\s]*(\.{0,1}|\,{0,1}){0,1}[\d\s]*$/.test(el)) {
        el = el.replace(/\s/g, '');
      }
      string += el + ';';
    } else if (typeof el === 'object') {
      for (var k in el) {
        convert(el[k]);
      }
    }
  }
}

// Выбор правильного склонения слова в соответствии с числительным:

function declOfNum(number, titles) {
  var cases = [2, 0, 1, 1, 1, 2];
  return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

// Функция преобразования числа к ценовому формату (с пробелами):

function convertPrice(numb, fix = 0, sign = ',', separator = ' ') {
  try {
    if (/[^\d|\.|\,|\-|\s]/g.test(numb)) {
      return numb;
    }
    var price = parseFloat(numb.toString().replace(',', '.').replace(/\s/g, ''), 10);
    price = Number(price).toFixed(fix);
    return (price + '').replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1${separator}`).replace('.', sign);
  } catch(error) {
    return numb;
  }
  // второй вариант (менее кросс-браузерный и без возможности замены разделителя разрядов):
  // return Number(price).toLocaleString('ru-RU', { minimumFractionDigits: fix, maximumFractionDigits: fix });
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

// Преобразование номера телефона в формат +7 (000) 000-00-00:

function convertPhone(phone) {
  if (!phone) {
    return phone;
  }
  var numbs = phone.replace(/\D/g, '').match(/^([\+]*[7|8])(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return '+7 (' + numbs[2] + ') ' + numbs[3] + '-' + numbs[4] + '-' + numbs[5];
}

//=====================================================================================================
// Переход на другие страницы:
//=====================================================================================================

// Переход на страницу:

function goToPage(event, href) {
  if (checkIsAction(event)) {
    return;
  }
  location.href = `/${href}`;
}

// Переход на старый интерфейс:

function goToOldInterface() {
  var path = location.pathname.replace('index.html', '').replace(/\//g, '');
  var links = {
    dashboard: '',
    profile: 'cabinet/',
    orders: 'orders/',
    order: 'orders/order',
    reclamations: 'recl/',
    reclamation: `recl/recl`,
    documents: 'documents/',
    certificates: 'sertifikaty/',
    users: '',
    contractors: 'cabinet/',
    addresses: 'cabinet/'
  };
  if (path === 'catalogs') {
    location.href = 'https://b2b.topsports.ru/' + getCatalogLink();
  } else if (path === 'order') {
    location.href = 'https://b2b.topsports.ru/' + links[path] + `${location.search.replace(/\D/g, '')}.html`;
  } else if (path === 'reclamation') {
    location.href = 'https://b2b.topsports.ru/' + links[path] + `${data.recl.order_id}_${data.recl.recl_code_1c}.html`;
  } else {
    location.href = 'https://b2b.topsports.ru/' + links[path];
  }
}

// Получение ссылки на старый интерфейс для страниц каталога:

function getCatalogLink() {
  var path = location.search ? location.search.slice(1).split('&').filter(el => el && el.indexOf('=') == -1) : undefined,
      catalogId = path[0],
      catalogSection = path[1];
  if (catalogSection === 'cart') {
    return 'cart/';
  }
  if (catalogId === 'equip') {
    switch (catalogSection) {
      case 'odegda':
        return 'odezhda/';
      case 'obuv':
        return 'obuv/';
      case 'shlem':
        return 'shlemy/';
      case 'optic':
        return 'optika/';
      case 'snarag':
        return 'snaryazhenie/';
      case 'zashita':
        return 'zashita/';
      case 'sumruk':
        return 'sumki_i_ryukzaki/';
      case 'merch':
        return 'merchequip/';
      default:
        return 'ekipirovka/';
    }
  }
  if (catalogId === 'boats') {
    switch (catalogSection) {
      case 'propeller':
        return 'lodki_i_motory/?filter[orig_subsubcat_title]=%D0%92%D0%B8%D0%BD%D1%82%D1%8B+%D0%B3%D1%80%D0%B5%D0%B1%D0%BD%D1%8B%D0%B5&filter[orig_cat_title][%d0%92%d0%b8%d0%bd%d1%82%d1%8b+%d0%b3%d1%80%d0%b5%d0%b1%d0%bd%d1%8b%d0%b5]=%D0%92%D0%B8%D0%BD%D1%82%D1%8B+%D0%B3%D1%80%D0%B5%D0%B1%D0%BD%D1%8B%D0%B5';
      default:
        return 'lodki_i_motory/';
    }
  }
  if (catalogId === 'snow') {
    switch (catalogSection) {
      default:
        return 'snegohody/';
    }
  }
  if (catalogId === 'snowbike') {
    switch (catalogSection) {
      case 'kit':
        return 'technics/';
      default:
        return 'snowbike/';
    }
  }
}

//=====================================================================================================
// Заполнение данных по шаблону:
//=====================================================================================================

// В каком виде данные нужно передавать в функцию fillTemplate:
//
// * - обязательное поле, остальные можно пропускать
//
// var data = {
//   area *: элемент / селектор элемента,               Откуда будет браться шаблон, можно передать:
//                                                      - переменная, в которой хранится уже найденный в DOM элемент
//                                                      - селектор, по которому нужно найти элемент в DOM
//
//   items *: массив объектов / объект / массив         Данные для заполнения шаблона, они могут быть такие:
//                                                      - массив или объект с ключами 0,1,2.. содержащий массивы и/или объекты
//                                                      - объект (ключ: значение)
//                                                      - массив содержащий строки и/или цифры
//
//   type: 'list' / 'vars' / 'obj'                     Тип данных (по умолчанию - определится по типу переданных данных):
//                                                      - 'list' - массив или объект, содержащий массивы и/или объекты (для создания множества элементов на основе шаблона)
//                                                      - 'vars' - массив содержащий строки и/или цифры (для создания множества элементов на основе простейшего шаблона)
//                                                      - 'obj' - объект (ключ: значение) (для создания одного элемента на основе шаблон)
//
//   source: 'inner' / 'outer',                        Как получать шаблон из DOM (по умолчанию - 'inner'):
//                                                      - весь тег целиком, т.е. с помощью outerHTML
//                                                      - внутреннюю часть тега, т.е. с помощью innerHTML
//
//   target: селектор элемента,                        Куда нужно вставить шаблон (по умолчанию - data.area, т.е. туда, откуда взяли):
//                                                     - селектор области куда будет вставляться результат
//
//   sign: '#' / '@@' / другой,                        Символ для поиска мест замены в html (по умолчанию - '#'):
//                                                     - # (тогда в html прописываем #...#)
//                                                     - @@ (тогда в html прописываем @@...@@)
//                                                     - можно применять и другие символы
//
//   sub: [{                                           Данные о подшаблонах (по умолчанию подшаблонов нет).
//     area: селектор элемента                         Вносить только в виде массива объектов, даже если объект один.
//     items: название ключа из data.items             Каждый объект аналогичен объекту data, который мы сейчас учимся заполнять.
//     sub : (если есть подшаблон) [{                  Каждый объект содержит (обязательны только area и items):
//       area: id / селектор                           - area * - id или селектор, по которому нужно найти подшаблон в шаблоне
//       items: название ключа из sub.items            - items * - ключ, по которому в данных необходимо взять информацию для заполнения подшаблона
//     }],                                             - sub - если есть подшаблон у этого подшаблона, то здесь указывается такая же структура массива объектов
//     sign: '#' / '@@' / другой,                      - sign - cимвол для поиска места замены, если отличен от того, что в родительском шаблоне
//     iterate: 'temp' / 'data'                        - iterate - как производить перебор при замене, если метод отличен от метода в родительском шаблоне
//   }, {
//     area: id / селектор
//     items: название ключа из data.items
//   }...]
//
//   action: 'replace' / return',                      Действие с данными (по умолчанию - 'replace'):
//                                                     - replace - вставит заполненный шаблон на страницу
//                                                     - return - вернет строку с заполненным шаблоном
//
//   method: 'inner' /                                 Метод вставки шаблона на страницу (по умолчанию - 'inner'):
//           'beforebegin' / 'afterbegin' /            - inner - замена содержимого елемента
//           'beforeend' / 'afterend'                  - beforebegin - до самого елемента (до открывающего тега)
//                                                     - afterbegin - перед первым потомком елемента
//                                                     - beforeend - после последнего потомка елемента
//                                                     - afterend - после самого елемента (после закрывающего тега)
//
//   replace: тире('&ndash;') и пр.                    Чем заменить ключ если нет данных (по умолчанию пустой строкой - ''):
//
//   iterate: 'temp' / 'data'                          Как производить перебор при замене данных в шаблоне (по умолчанию - 'temp'):
// }                                                   - перебором всех мест замены (#...#) в шаблоне:
//                                                       * берем каждое место замены
//                                                       * если в данных есть ключ с таким названием, то производим замену
//                                                       * удобно, если в данных много лишних ключей
//                                                     - перебором всех ключей в данных:
//                                                       * берем каждый ключ
//                                                       * если есть место замены с таким названием, то производим замену
//                                                       * удобно если в данных нет ничего лишнего, а места замены наоборот повторяют содержимое

// Универсальная функция заполнения данных по шаблону:

function fillTemplate(data) {
  if (!data.area || !data.items) {
    return;
  }

  if (typeof data.area === 'string') {
    data.areaName = (data.parentAreaName || '') + data.area;
    data.area = data.parentArea ? getEl(data.area, data.parentArea) : getEl(data.area);
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
    txt = prepareText(txt, data);
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
    var regEx = new RegExp(data.sign + '[^' + data.sign + '|\\s]+' + data.sign, 'gm'),
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
      type: sub.type,
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
  if (value !== undefined && value !== null && typeof value !== 'object') {
    var regex = new RegExp(sign + (key || 'item') + sign, 'gi');
    temp = temp.replace(regex, value);
  }
  return temp;
}

// Окончательная подготовка шаблона для вставки в документ:

function prepareText(txt, data) {
  var sign = data.sign,
      replace = data.replace || '';
  // удаление класса 'template' из шаблона
  txt = txt.replace(/template/gi, '');
  // удаление назаполненных данными ключей
  var regex = new RegExp(sign + '[^' + sign + '|\\s]+' + sign, 'gm');
  txt = txt.replace(regex, replace);
  return txt;
}

// Вставка заполненного шаблона в документ:

function insertText(target, txt, method = 'inner') {
  // удаление класса 'template' из места вставки
  target.classList.remove('template');
  if (!method || method === 'inner') {
    target.innerHTML = txt;
  } else {
    if ((method === 'afterbegin' || method === 'beforeend') && (target.childNodes.length === 1 && target.firstChild.classList.contains('template'))) {
      target.innerHTML = txt;
    }
    target.insertAdjacentHTML(method, txt);
  }
}

//=====================================================================================================
// Функции для заполнения данных по шаблону:
//=====================================================================================================

// Преобразование данных для использования их в заполнении по шаблону:
// на входе: {key1: value1, key2: value2}
// на выходе: [{title: key1:, value: value1}, {title: key2:, value: value2}])

function convertDataForFillTemp(data, isFix) {
  var items = [];
  if (!data) {
    return items;
  }
  if (typeof data === 'object') {
    var title,
        item;
    Object.keys(data).forEach(key => {
      title = getTitle(key, data[key], isFix);
      item = {
        title: title,
        value: Array.isArray(data) ? title : key
      };
      if (data[key] && typeof data[key] === 'object' && !data[key].title) {
        item.key = item.value;
        item.items = convertDataForFillTemp(data[key], isFix);
      }
      items.push(item);
    });
  }
  return items;
}

// Получение основного заголовка:

function getTitle(key, value, isFix) {
  var title;
  if (isFix) {
    title = value;
  } else if (value && typeof value === 'object') {
    title = value.title || key;
  } else if (!value || value == 1) {
    title = key;
  } else {
    title = value;
  }

  if (title == 'SpyOptic') {
    title = 'Spy Optic';
  } else if (title == 'TroyLeeDesigns') {
    title = 'Troy Lee Designs';
  } else if (title == 'KingDolphin') {
    title = 'King Dolphin';
  } else if (title == 'LASleeve') {
    title = 'LA Sleeve';
  }
  return title;
}

// Заполнение данных по шаблону:

function loadData(area, items, sub) {
  var area = getEl(area);
  fillTemplate({
    area: area,
    items: items,
    sub: sub
  });
}

// Заполнение данных по шаблону/отображение информации о том, что ничего не найдено:

function loadSearchData(area, items, sub) {
  var area = getEl(area);
  if (items.length) {
    loadData(area, items, sub);
  } else {
    area.innerHTML = '<div class="notice">По вашему запросу ничего не найдено.</div>';
  }
}

//=====================================================================================================
// Функции степпера:
//=====================================================================================================

// Запрет на ввод в инпут любого значения кроме цифр:

function onlyNumb(event) {
  event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
}

// Запрет на ввод в инпут любого значения кроме тех что допускаются в дат:

function onlyDateChar(event) {
  if (event.currentTarget.dataset.type === 'range') {
    event.currentTarget.value = event.currentTarget.value.replace(/[^\d|\.|\-|\s]/g, '');
  } else {
    event.currentTarget.value = event.currentTarget.value.replace(/[^\d|\.]/g, '');
  }
}

// Запрет на ввод в инпут любого значения кроме тех что допускаются в номере телефона:

function onlyPhoneChar(event) {
  event.currentTarget.value = event.currentTarget.value.replace(/[^\d|\+|\-|\(|\/)\s]/g, '');
}

// Изменение количества степпером:

function changeQty(event, maxQty, minQty = 0) {
  if (maxQty && maxQty == minQty) {
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
  if (event.currentTarget.classList.contains('minus')) {
    sign = '-';
  }
  if (event.currentTarget.classList.contains('plus')) {
    sign = '+';
  }
  qty = countQty(sign, qty, maxQty, minQty);
  input.value = qty;
  input.dataset.value = qty;
  changeColors(qtyWrap, qty);
  if (sign) {
    input.dispatchEvent(new CustomEvent('change', {'bubbles': true}));
  }
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
      if (maxQty) {
        if (qty < maxQty) {
          qty++;
        }
      } else {
        qty++;
      }
    } else if (sign == 'Удалить') {
      qty = 0;
    } else {
      qty = 1;
    }
  } else {
    if (isNaN(+qty)) {
      qty = minQty;
    } else if (qty < minQty) {
      qty = minQty;
    } else if (maxQty && qty > maxQty) {
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

//=====================================================================================================
// Работа всплывающих подсказок:
//=====================================================================================================

// Включение работы подсказок:

function initTooltips() {
  window.addEventListener('scroll', () => removeTooltip());
  document.addEventListener('mouseover', event => showTooltip(event));
  document.addEventListener('mouseout', event => hideTooltip(event));
}

// Отображение подсказки:

function showTooltip(event) {
  if (currentElem) {
    return;
  }
  var target = event.target.closest('[data-tooltip]');
  if (!target) {
    return;
  }
  var tooltipHtml = target.dataset.tooltip;
  if (target.classList.contains('disabled') || target.hasAttribute('disabled') || target.closest('.disabled') || !tooltipHtml) {
    return;
  }
  currentElem = target;
  if (tooltip) {
    hideTooltip(event);
  }
  createTooltip(target, tooltipHtml);
}

// Создание подсказки:

function createTooltip(element, tooltipHtml) {
  tooltip = document.createElement('div');
  tooltip.classList.add('tooltip');

  var textAlign = element.getAttribute('text'),
      help = element.hasAttribute('help');
  if (textAlign) {
    tooltip.setAttribute('text', textAlign);
  }
  if (help) {
    tooltip.setAttribute('help', '');
  }
  tooltip.dataset.parent = element.classList;
  tooltip.innerHTML = tooltipHtml;
  document.body.append(tooltip);
  positionTooltip(element);
}

// Позиционирование подсказки:

function positionTooltip(element, flow) {
  var flow = element.getAttribute('flow'),
      coords = element.getBoundingClientRect(),
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
        tooltip.setAttribute('flow', 'down');
      } else {
        tooltip.setAttribute('flow', 'up');
      }
    // Позиционирование снизу:
    } else {
      y = coords.bottom + 7;
      // Если подсказка не помещается снизу, то отображать её сверху:
      if (y + tooltip.offsetHeight > windowHeight) {
        y = coords.top - tooltip.offsetHeight - 7;
        tooltip.setAttribute('flow', 'up');
      } else {
        tooltip.setAttribute('flow', 'down');
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
        tooltip.setAttribute('flow', 'right');
      } else {
        tooltip.setAttribute('flow', 'left');
      }
    // Позиционирование справа:
    } else {
      x = coords.right + 7;
      // Если подсказка не помещается справа, то отображать её слева:
      if (x + tooltip.offsetWidth > windowWidth) {
        x = coords.left - tooltip.offsetWidth - 7;
        tooltip.setAttribute('flow', 'left');
      } else {
        tooltip.setAttribute('flow', 'right');
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

function hideTooltip(event) {
  if (!currentElem || !tooltip) {
    return;
  }
  var relatedTarget = event.relatedTarget;
  while (relatedTarget) {
    if (relatedTarget == currentElem) {
      return;
    }
    relatedTarget = relatedTarget.parentNode;
  }
  removeTooltip();
}

// Удаление подсказки со страницы:

function removeTooltip() {
  if (tooltip) {
    tooltip.remove();
    currentElem = null;
    tooltip = null;
  }
}

//=====================================================================================================
// Работа текстовых полей:
//=====================================================================================================

// Включение ресайза текстовых полей:

function initResizeTextarea() {
  window.addEventListener('resize', () => {
    document.querySelectorAll('textarea[oninput^="setTextareaHeight"]').forEach(el => {
      setTextareaHeight(el);
    });
  });
}

// Изменение высоты textarea в зависимости от содержимого:

function setTextareaHeight(textarea, min = 40, max = 150) {
  if (textarea.scrollTop == 0) {
    textarea.style.overflow = 'hidden';
    textarea.style.height = min + 'px';
  }
  if (textarea.scrollHeight < min) {
    textarea.style.overflow = 'hidden';
    textarea.style.height = min + 'px';
  } else if (textarea.scrollHeight < max) {
    textarea.style.overflow = 'hidden';
    textarea.style.height = textarea.scrollHeight + 'px';
  } else {
    textarea.style.overflowY = 'scroll';
    textarea.style.height = max + 'px';
  }
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
// Работа кнопки "Наверх страницы":
//=====================================================================================================

// Инициализация работы кнопки "Наверх страницы":

function initUpBtn() {
  upBtn = getEl('#up-btn');
  if (upBtn) {
    window.addEventListener('scroll', toggleBtnGoTop);
  }
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

// Прокрутка наверх страницы:

function goToTop() {
  var scrolled = window.pageYOffset;
  if (scrolled > 0 && scrolled <= 1500) {
    window.scrollBy(0, -150);
    setTimeout(goToTop, 0);
  } else if (scrolled > 1500) {
    window.scrollTo(0, 1500);
    goToTop();
  }
}

//=====================================================================================================
// Работа всплывающих окон:
//=====================================================================================================

// Открытие всплывающего окна:

function openPopUp(el, event) {
  if (event) {
    event.preventDefault();
    if (event.currentTarget.classList.contains('disabled') || event.currentTarget.hasAttribute('disabled')) {
      return;
    }
  }
  el = getEl(el);
  if (el) {
    if (el.classList.contains('preload')) {
      el.style.opacity = '0';
    }
    showElement(el, 'flex');
    var bound = el.dataset.bound;
    if (bound) {
      bound = bound === 'true' ? 1359 : bound;
      resizeHandler = () => closePopUpAtBound(el, bound, el.dataset.boundReverse);
      window.addEventListener('resize', resizeHandler);
    }
    setTimeout(() => {
      if (!getEl('.pop-up-container.open')) {
        document.addEventListener('click', closePopUp);
        document.addEventListener('keydown', closePopUp);
      }
      el.classList.add('open');
      el.scrollTop = 0;
      // document.querySelectorAll(`.pop-up-container.open:not(#${el.id})`).forEach(el => hideElement(el));
      document.body.classList.add('no-scroll');
    }, 50);
    if (el.id === 'mob-menu') {
      setTimeout(() => hideElement('.header-bottom'), 80);
    }
  }
}

// Закрытие всплывающего окна:

function closePopUp(event, el) {
  if (event && event !== el) {
    if (event.type === 'keydown') {
      if (event.code && event.code.toLowerCase() === 'escape') {
        el = getEl('.pop-up-container.open');
      } else {
        return;
      }
    } else {
      if ((event.target.closest('.pop-up') && !event.target.closest('.pop-up-title .close') ||
          event.target.closest('.calendar-wrap')) ||
          (document.activeElement && document.activeElement.closest('.pop-up'))
      ) {
        return;
      }
      el = event.target.closest('.pop-up-container');
    }
  } else {
    el = getEl(el);
  }
  if (el) {
    // document.querySelectorAll(`.pop-up-container.open:not(#${el.id})`).forEach(el => showElement(el, 'flex'));
    loader.hide();
    el.classList.remove('open');
    if (!getEl('.pop-up-container.open')) {
      document.removeEventListener('click', closePopUp);
      document.removeEventListener('keydown', closePopUp);
    }
    if (el.dataset.bound) {
      window.removeEventListener('resize', resizeHandler);
    }
    if (el.classList.contains('full-img-container')) {
      document.removeEventListener('keydown', moveFullImg);
    }
    setTimeout(() => {
      hideElement(el);
      if (!document.querySelector('.pop-up-container.open')) {
        document.body.classList.remove('no-scroll');
      }
    }, 200);
    if (el.id === 'mob-menu') {
      setTimeout(() => showElement('.header-bottom'), 190);
    }
  }
}

// Автоматическое закрытие всплывающих окон:

function closePopUpAtBound(el, bound, isReverse) {
  clearTimeout(window.resizedFinished);
  window.resizedFinished = setTimeout(() => {
    if (isReverse) {
      if (window.innerWidth <= bound) {
        closePopUp(null, el);
      }
    } else {
      if (window.innerWidth > bound) {
        closePopUp(null, el);
      }
    }
  }, 250);
}

//=====================================================================================================
// Работа окна уведомлений:
//=====================================================================================================

// Инициализация работы окна уведомлений:

function initNotifications() {
  sendRequest(`../json/notifications.json`)
  // sendRequest(urlRequest.main, 'notifications')
  .then(result => {
    var data = JSON.parse(result),
        notifications = getEl('#notifications');
    if (notifications) {
      var body = getEl('.pop-up-body', notifications);
      loadData(body, data);
      getEl('.loader', notifications).style.display = 'none';
    }
  })
  .catch(err => {
    console.log(err);
  });
}

//=====================================================================================================
// Работа c информационной карточкой товара и изображением на весь экран:
//=====================================================================================================

// Отображение информационной карточки товара:

function showInfoCard(articul) {
  loader.show();
  getItem(articul)
  .then(result => {
    var item = result.items[0],
        optnames = result.optnames;
    if (item && optnames) {
      addImgInfo(item);
      addOptionsInfo(item, optnames);
      openInfoCard(item);
    } else {
      throw new Error('Ошибка');
    }
  }, reject => {
    console.log(reject);
    loader.hide();
    alerts.show('При загрузке карточки товара произошла ошибка.');
  });
}

// Открытие информационной карточки товара:

function openInfoCard(data) {
  if (!data) {
    return;
  }
  loader.show();
  getDescribeInfo(data)
  .then(result => {
    var infoCardContainer = getEl('#info-card-container');
    data.isDesc = data.desc ? '' : 'displayNone';
    loadData(infoCardContainer, data, [{area: '.card-option', items: 'options'}]);
    checkMedia(getEl('img', infoCardContainer));
    getEl('.img-wrap', infoCardContainer).addEventListener('click', (event) => openFullImg(event, data));
    openPopUp(infoCardContainer);
    loader.hide();
  })
}

// Отображение изображения/ий на весь экран:

function showFullImg(event, articul) {
  if (event.target.classList.contains('left-btn') || event.target.classList.contains('right-btn')) {
    return;
  }
  loader.show();
  getItem(articul)
  .then(result => {
    if (result.item) {
      openFullImg(event, result.item);
    } else {
    throw new Error('Ошибка');
    }
  }, reject => {
    console.log(reject);
    loader.hide();
    alerts.show('При загрузке изображения произошла ошибка.');
  });
}

// Открытие изображения/ий на весь экран:

function openFullImg(event, data, curImg) {
  if (!data) {
    return;
  }
  var fullImgContainer = getEl('#full-img-container');
  loadData(fullImgContainer, data, [{area: '.carousel-item', items: 'images_full'}]);
  var fullCarousel = getEl('.carousel', fullImgContainer),
      curCarousel = event ? event.currentTarget.closest('.carousel') : null;
  curImg = curImg || (curCarousel ? curCarousel.dataset.img : null);
  openPopUp(fullImgContainer);
  renderCarousel(fullCarousel, curImg)
  .then(result => {
    if (getEl('img',fullImgContainer).src.indexOf('/img/no_img.jpg') >= 0) {
      closePopUp(null, fullImgContainer);
      alerts.show('При загрузке изображения произошла ошибка.');
    } else {
      document.addEventListener('keydown', moveFullImg);
    }
  });
}

// Переклчючение изображений кнопками клавиатуры:

function moveFullImg(event) {
  if (event.code.toLowerCase() == 'arrowleft') {
    window['fullimgCarousel'].startMoveImg('prev', event);
  }
  if (event.code.toLowerCase() == 'arrowright') {
    window['fullimgCarousel'].startMoveImg('next', event);
  }
}

//=====================================================================================================
// Работа полей загрузки файлов:
//=====================================================================================================

// Включение работы полей загрузки файлов:

function initInputFiles() {
  document.querySelectorAll('.file-wrap input[type="file"]').forEach(el => el.addEventListener('change', event => showSelectFiles(event)));
}

// Отображение выбранных файлов:

function showSelectFiles(event) {
  var wrap = event.currentTarget.closest('.file-wrap'),
      fileName = getEl('.file-name', wrap),
      filePreview = getEl('.file-preview', wrap),
      files = event.currentTarget.files,
      imageTypeRegExp = /^image\//,
      file;
  if (fileName) {
    var text = '';
    if (files && files.length > 1) {
      text = `Выбрано ${files.length} ${declOfNum(files.length, ['файл', 'файла', 'файлов'])}`;
    } else if (files.length) {
      text = event.currentTarget.value.split('\\').pop();
    } else {
      text = 'Файл не выбран';
    }
    fileName.textContent = text;
  }
  if (filePreview) {
    var reader;
    for (var i = 0; i < files.length; i++) {
      file = files[i];
      if (!imageTypeRegExp.test(file.type)) {
        return;
      }
      var reader = new FileReader();
      reader.addEventListener('load', function(event) {
        var img = document.createElement('img');
        img.src = event.target.result;
        filePreview.innerHTML = '';
        filePreview.insertBefore(img, null);
      });
      if (file) {
        wrap.classList.add('added');
        reader.readAsDataURL(file);
      }
    }
    if (!files || !files.length) {
      wrap.classList.remove('added');
      filePreview.innerHTML = '';
    }
  }
}

//=====================================================================================================
// Работа прелоадера:
//=====================================================================================================

// Инициализация работы лоадера страницы:

function initLoader() {
  loader = getEl('#page-loader');
  loader = loader ? new Loader(loader) : {};
}

// Объект лоадера страницы:

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
// Работа системного окна сообщений:
//=====================================================================================================

// Инициализация работы системного окна сообщений:

function initAlerts() {
  alerts = getEl('#alerts');
  alerts = alerts ? new Alerts(alerts) : {};
}

// Объект системного окна сообщений (обязательно передавать текст):

function Alerts(obj) {
  // Элементы для работы:
  this.alerts = obj;
  this.text = getEl('.text', obj);
  this.btns = this.alerts.querySelectorAll('.btn');

  // Динамические переменные:
  this.callback;

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    this.btns.forEach(el => el.addEventListener('click', event => this.confirmHandler(event)));
  }
  this.setEventListeners();

  // Отображение окна сообщений:
  this.show = function(text, timer) {
    if (!text) {
      return;
    }
    this.text.innerHTML = text;
    openPopUp(this.alerts, null);
    if (timer) {
      setTimeout(() => this.hide(), timer);
    }
  }

  // Отображение окна сообщений c вопросом:
  this.confirm = function(question, callback) {
    this.callback = callback;
    this.alerts.classList.add('confirm');
    this.show(question);
    document.addEventListener('keydown', this.confirmHandler);
  }

  // Обработчик событий для кнопок согласия/отмены:
  this.confirmHandler = event => {
    if (event.type === 'keydown' && (!event.code || (event.code.toLowerCase() !== 'enter' && event.code.toLowerCase() !== 'escape'))) {
      return;
    }
    if (this.callback && (event.code && event.code.toLowerCase() === 'enter') || event.currentTarget.classList.contains('accept')) {
      this.callback();
      this.callback = null;
    }
    this.alerts.classList.remove('confirm');
    this.hide();
    document.removeEventListener('keydown', this.confirmHandler);
  };

  // Скрытие окна сообщений:
  this.hide = function() {
    closePopUp(null, this.alerts);
  }
}

//=====================================================================================================
// Валидация полей формы:
//=====================================================================================================

// Регулярные выражения для валидации полей форм:

var textValidate = /[^\s]{2,}/;
var nameValidate = /^[a-zA-Z|\-|\s]|[АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщъыьЭэЮюЯя|\-|\s]{2,30}$/;
var emailValidate = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var nicknameValidate =/^\w+@*\w+\.*\w*$/;
var timeValidate = /^([01][0-9]|2[0-3]):([0-5][0-9])\s*-\s*([01][0-9]|2[0-4]):([0-5][0-9])$/;
var siteValidate = /^((https?|ftp)\:\/\/)?([a-z0-9]{1})((\.[a-z0-9-])|([a-z0-9-]))*\.([a-z]{2,6})(\/?)$/;
var dateValidate = /^(((0[1-9]|[12]\d|3[01])\.(0[13578]|1[02])\.((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\.(0[123456789]|1[012])\.((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;

// Валидация телефонного номера:

function phoneValidate(phone) {
  var result = {result: false, error: null},
      numbs = phone.match(/\d/g);
  if (numbs && numbs.length < 11) {
    result.error = 'Номер введен неверно';
  } else if (numbs && numbs.length > 11) {
    result.error = 'Номер введен неверно';
  } else {
    phone = phone.replace(/\s/g, '');
    if (/^([\+]*[7|8])((\(*\d{3}\)*)|(\-*\d{3}\-*))(\d{3}-*)(\d{2}-*)(\d{2})$/.test(phone)) {
      result.result = true;
    } else {
      result.error = 'Номер введен неверно';
    }
  }
  return result;
}

// Валидация периода дат:

function rangeValidate(range) {
  var result = {result: false, error: null};
  range = range.replace(/\s/g, '');
  if (!range.length) {
    result.error = 'Период пуст';
  } else if (range.length !== 21) {
		result.error = 'Недостаточное количество символов';
	} else {
    var isValid = /^(((0[1-9]|[12]\d|3[01])\.(0[13578]|1[02])\.((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\.(0[123456789]|1[012])\.((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))\-(((0[1-9]|[12]\d|3[01])\.(0[13578]|1[02])\.((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\.(0[123456789]|1[012])\.((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/.test(range);
    if (isValid) {
      range = range.split('-');
      var dateFrom = getDateObj(range[0], 'dd.mm.yyyy'),
          dateTo = getDateObj(range[1], 'dd.mm.yyyy');
      if (dateFrom && dateTo && dateFrom < dateTo) {
        result.result = true;
      } else {
        isValid = false;
      }
    }
    if (!isValid) {
      result.error = 'Неправильно введен период';
    }
	}
	return result;
}

// Валидация ИНН:

function innValidate(inn) {
  var result = {result: false, error: null};
  if (typeof inn === 'number') {
		inn = inn.toString();
	} else if (typeof inn !== 'string') {
		inn = '';
	}
	if (!inn.length) {
		result.error = 'ИНН пуст';
  } else if ([10, 12].indexOf(inn.length) === -1) {
		result.error = 'ИНН может состоять только из 10 или 12 цифр';
	} else {
		var checkDigit = function (inn, coefficients) {
			var n = 0;
			for (var i in coefficients) {
				n += coefficients[i] * inn[i];
			}
			return parseInt(n % 11 % 10);
		};
		switch (inn.length) {
			case 10:
				var n10 = checkDigit(inn, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
				if (n10 === parseInt(inn[9])) {
					result.result = true;
				}
				break;
			case 12:
				var n11 = checkDigit(inn, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
				var n12 = checkDigit(inn, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
				if ((n11 === parseInt(inn[10])) && (n12 === parseInt(inn[11]))) {
					result.result = true;
				}
				break;
		}
		if (!result.result) {
			result.error = 'Неправильное контрольное число';
		}
	}
	return result;
}

// Валидация КПП:

function kppValidate(kpp) {
	var result = {result: false, error: null};
	if (typeof kpp === 'number') {
		kpp = kpp.toString();
	} else if (typeof kpp !== 'string') {
		kpp = '';
	}
	if (!kpp.length) {
		result.error = 'КПП пуст';
	} else if (kpp.length !== 9) {
		result.error = 'КПП может состоять только из 9 знаков';
	} else if (!/^[0-9]{4}[0-9A-Z]{2}[0-9]{3}$/.test(kpp)) {
		result.error = 'Неправильный формат КПП';
	} else {
		result.result = true;
	}
	return result;
}

// Проверка инпута на валидность:

function checkInput(input) {
  var result = {result: true},
      type = input.dataset.type,
      value = input.value;
  if (!type || !value.length) {
    return result;
  }
  var validate = window[`${type}Validate`];
  if (!validate) {
    return result;
  }
  if (typeof validate === 'function') {
    return validate(value);
  } else {
    return {result: testValue(value, validate)};
  }
}

//=====================================================================================================
// Работа с формами:
//=====================================================================================================

// Инициализация формы:

function initForm(el, callback) {
  el = getEl(el);
  if (el) {
    if (el.id) {
      return window[`${el.id}Form`] = new Form(el, callback);
    } else {
      return new Form(el, callback);
    }
  }
}

// Очистка формы:

function clearForm(el) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Form`]) {
    window[`${el.id}Form`].clear();
  }
}

// Заполнение формы данными:

function fillForm(el, data, isFull) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Form`] && data) {
    window[`${el.id}Form`].fill(data, isFull);
  }
}

// Отображение ошибок формы, приходящих с сервера:

function showFormError(el, error) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Form`]) {
    window[`${el.id}Form`].showServerError(error);
  }
}

// Объект формы:

function Form(obj, callback) {
  // Динамические переменные:
  this.isSubmit = false;

  // Инициализация формы:
  this.init = function() {
    this.getElements();
    this.initElements();
    this.toggleBtn();
    this.setEventListeners();
  }

  // Получение элементов для работы:
  this.getElements = function() {
    this.form = obj;
    this.submitBtn = getEl('input[type="submit"]', obj);
    this.dropDowns = this.form.querySelectorAll('.activate');
    this.calendars = this.form.querySelectorAll('div:not(.activate) .calendar-wrap');
  }

  // Инициализация элементов для работы:
  this.initElements = function() {
    this.dropDowns.forEach((el, index) => this[`dropDown${index}`] = initDropDown(el));
    this.calendars.forEach(el => initCalendar(el));
  }

  // Блокировка/разблокировка кнопки отправки формы:
  this.toggleBtn = function() {
    if (this.isSubmit) {
      this.submitBtn.removeAttribute('disabled');
    } else {
      this.submitBtn.setAttribute('disabled','disabled');
    }
  }

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    this.form.addEventListener('submit', event => {
      event.preventDefault();
      this.send();
    });
    this.dropDowns.forEach(el => el.addEventListener('change', event => this.check(event)));
    this.calendars.forEach(el => getEl('input', el).addEventListener('change', event => this.check(event)));
    this.form.querySelectorAll('textarea').forEach(el => el.addEventListener('input', event => this.check(event)));
    this.form.querySelectorAll('.choiced-qty').forEach(el => el.addEventListener('change', event=> this.check(event)));
    this.form.querySelectorAll('input:not([type="text"]):not([type="hidden"])').forEach(el => el.addEventListener('change', event => this.check(event)));
    this.form.querySelectorAll('input[type="text"]:not([type="hidden"]').forEach(el => el.addEventListener('input', event => this.check(event)));
  }

  // Проверка поля:
  this.check = function(event) {
    this.checkSubmit();
    this.checkInput(event);
  }

  // Определение типа поля и его проверка по соответствующему регулярному выражению:
  this.checkInput = function(event) {
    if (!event.currentTarget.hasAttribute('data-type')) {
      return;
    }
    var input = event.currentTarget,
        isValid = checkInput(input),
        type = input.dataset.type;
    if (type === 'name') {
      input.value = capitalizeFirstLetter(input.value);
    }
    var formWrap = input.closest('.form-wrap');
    if (isValid.result) {
      if (type === 'phone') {
        input.value = convertPhone(input.value);
      }
      formWrap.classList.remove('error');
    } else {
      this.showError(formWrap, isValid.error);
    }
  }

  // Отображение ошибки в поле формы:
  this.showError = function(formWrap, errText) {
    formWrap.classList.add('error');
    var error = getEl('.err', formWrap);
    if (!error) {
      error = document.createElement('div');
      error.classList.add('err');
      formWrap.appendChild(error);
    }
    if (errText) {
      error.textContent = errText;
    } else {
      error.textContent = 'Поле заполнено неверно';
    }
    this.isSubmit = false;
    this.toggleBtn();
  }

  // Отображение ошибок в форме, полученных с сервера:
  this.showServerError = function(error) {
    if (typeof error === 'string') {
      alerts.show(error);
    } else if (isNativeObject(error)) {
      var input, formWrap;
      for (var key in error) {
        input = getEl(`[name=${key}]`, this.form);
        if (input) {
          formWrap = input.closest('.form-wrap');
        }
        if (formWrap) {
          this.showError(formWrap, error[key]);
        } else {
          alerts.show('Произошла ошибка, попробуйте позже.');
        }
      }
    } else {
      alerts.show('Произошла ошибка, попробуйте позже.');
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
        type = field.getAttribute('type');
        value = field.value.trim();
        if (field.hasAttribute('data-type')) {
          var isValid = checkInput(field);
          if (isValid.result && value && !field.classList.contains('kladr-error')) {
            return true;
          }
        } else if (type === 'radio' || type === 'checkbox') {
          if (field.checked) {
            return true;
          }
        } else if (field.classList.contains('choiced-qty')) {
          if (value != 0) {
            return true;
          }
        } else {
          if (value) {
            return true;
          }
        }
      }
    });
    this.toggleBtn();
  }

  // Отправка формы:
  this.send = function(event) {
    if (!this.isSubmit || !this.submitBtn || this.submitBtn.hasAttribute('disabled')) {
      return;
    }
    var formData = new FormData(this.form);
    // formData.forEach((value, key) => {
    //   console.log(key, value);
    // });
    if (callback) {
      showElement(getEl('.loader', this.form), 'flex');
      callback(formData);
    }
  }

  // Очистка формы:
  this.clear = function() {
    this.form.querySelectorAll('textarea').forEach(el => el.value = '');
    this.form.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="submit"])').forEach(el => el.value = '');
    this.form.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
    this.form.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    this.dropDowns.forEach((el, index) => this[`dropDown${index}`].clear());
    this.form.querySelectorAll('input[data-kladr-id]').forEach(el => el.removeAttribute('data-kladr-id'));
    this.form.querySelectorAll('.form-wrap.error, input.kladr-error').forEach(el => el.classList.remove('error', 'kladr-error'));
    this.isSubmit = false;
    this.toggleBtn();
  }

  // Заполнение/перезаполнение формы данными:
  this.fill = function(data, isFull = true) {
    if (isFull) {
      this.clear();
    }
    var fields = [], type;
    for (var key in data) {
      if (typeof data[key] === 'string') {
        fields = this.form.querySelectorAll(`[name="${key}"]`);
        fields.forEach(field => {
          type = field.getAttribute('type');
          if (type === 'radio' || type === 'checkbox') {
            if (field.value.toLowerCase() === data[key].toLowerCase()) {
              field.checked = true;
            }
          } else if (type === 'hidden' && field.closest('.activate')) {
            this.dropDowns.forEach((el, index) => {
              if (getEl('input', el) === field) {
                this[`dropDown${index}`].selectValue(data[key]);
              }
            });
          } else {
            field.value = data[key];
          }
        });
      }
    }
  }

  this.init();
}

//=====================================================================================================
// Работа полей поиска:
//=====================================================================================================

// Инициализация поля поиска:

function initSearch(el, callback) {
  el = getEl(el);
  if (el) {
    var type = el.dataset.type;
    if (el.id) {
      return window[`${el.id}Search`] = type === 'fast' ? new SearchFast(el, callback) : new Search(el, callback);
    } else {
      return type === 'fast' ? new SearchFast(el, callback) : new Search(el, callback);
    }
  }
}

// Очистка поля поиска:

function clearSearch(el) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Search`]) {
    window[`${el.id}Search`].clear();
  }
}

// Объект поля поиска:

function Search(obj, callback) {
  // Инициализация поиска:
  this.init = function() {
    this.getElements();
    this.setEventListeners();
    this.initElements();
  }

  // Получение элементов для работы:
  this.getElements = function() {
    this.obj = obj;
    this.activate = obj.closest('.activate');
    this.group = this.obj.closest('.group');
    this.input = getEl('input[type="text"]', obj);
    this.calendar = this.input.closest('.calendar-wrap');
    this.searchBtn = getEl('.search', obj);
    this.cancelBtn = getEl('.close', obj);
    this.result = getEl(`[data-search="${this.obj.id}"]`);
    if (this.activate) {
      this.items = getEl('.items', this.activate);
      this.notFound = getEl('.not-found', this.activate);
    }
    if (this.group) {
      this.items = getEl('.items', this.group);
      this.notFound = getEl('.not-found', this.group);
      this.more = getEl('.more', this.group);
    }
    this.type = this.group ? 'inGroup' : (this.activate && !this.obj.classList.contains('activate') ? 'inSearchBox' : 'usual');
  }

  // Инициализация элементов для работы:
  this.initElements = function() {
    if (this.calendar) {
      initCalendar(this.calendar);
    }
  }

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    this.input.addEventListener('change', event => event.detail ? this.search() : event.stopPropagation());

    this.obj.addEventListener('submit', event => {
      event.preventDefault();
      if (this.type === 'inSearchBox' || (this.type === 'inGroup' && this.items)) {
        return;
      }
      this.search();
    });
    if (!this.obj.classList.contains('positioned') && (this.type !== 'inGroup' || this.type === 'inGroup' && !this.items)) {
      this.input.addEventListener('focus', () => {
        document.addEventListener('click', this.blurInput);
        if (this.type === 'inSearchBox') {
          onFocusInput(this.input);
        }
      });
    }
    if (this.items) {
      // if (!this.items.closest('.pop-up-container.filters')) {
      //   this.items.addEventListener('mouseenter', () => document.body.classList.add('no-scroll'));
      //   this.items.addEventListener('mouseleave', () => document.body.classList.remove('no-scroll'));
      // }
      this.input.addEventListener('input', () => this.showHints());
      this.items.addEventListener('click', event => this.selectHint(event));
    }
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', (event) => this.cancel(event));
    }
    if (this.result) {
      getEl('.pill', this.result).addEventListener('click', (event) => this.cancel(event));
    }
  }

// Возвращение значения в инпут при потере фокуса поиском:
  this.blurInput = event => {
    if (event && event.target.closest('form.search') === this.obj) {
      return;
    }
    onBlurInput(this.input);
    this.toggleHints();
    document.removeEventListener('click', this.blurInput);
  }

  // Отображение подсказок:
  this.showHints = function() {
    if (!this.items) {
      return;
    }
    var textToFind = this.input.value.trim();
    if (!/\S/.test(textToFind)) {
      this.toggleHints();
      return;
    }
    var regExp = getRegExp(textToFind),
        items = Array.from(this.items.querySelectorAll('.item')),
        curItems = items.filter(el => findByRegExp(el.textContent, regExp));

    items.forEach(el => el.classList.add('displayNone'));
    if (curItems.length > 0) {
      hideElement(this.notFound);
      curItems.forEach(el => el.classList.remove('displayNone'));
    } else {
      showElement(this.notFound);
    }
    if (this.activate) {
      this.activate.classList.add('open');
    }
    if (this.type === 'inGroup') {
      this.toggleBtns();
      this.toggleMore();
    }
  }

  // Переключение подсказок:
  this.toggleHints = function() {
    if (!this.items) {
      return;
    }
    hideElement(this.notFound);
    if (this.type !== 'usual') {
      this.items.querySelectorAll('.item').forEach(el => el.classList.remove('displayNone'));
    } else {
      this.items.querySelectorAll('.item').forEach(el => el.classList.add('displayNone'));
      if (this.activate) {
        this.activate.classList.remove('open');
      }
    }
    if (this.type === 'inGroup') {
      this.toggleBtns();
      this.toggleMore();
    }
  }

  // Поиск по подсказке:
  this.selectHint = function(event) {
    if (this.type === 'inGroup') {
      return;
    }
    var curItem = event.target.closest('.item');
    if (!curItem) {
      return;
    }
    var value;
    if (this.activate.classList.contains('checkbox')) {
      value = Array.from(this.items.querySelectorAll('.item')).filter(el => el.classList.contains('checked')).length;
      value = value ? 'Выбрано: ' + value : '';
    } else {
      value = !curItem.dataset.value ? curItem.dataset.value : curItem.textContent;
    }
    this.input.value = value;
    this.search();
  }

  // Поиск:
  this.search = function() {
    var textToFind = this.input.value.trim();
    if (!/\S/.test(textToFind)) {
      this.cancel();
      return;
    }
    this.input.dataset.value = this.input.value;
    if (this.type === 'inSearchBox') {
      return;
    }
    textToFind = textToFind.replace(/\s*\,\s*/gm, ',').replace(/\s*\/\s*/gi, '/');
    if (callback && !(this.group && this.items)) {
      var count = callback(this.obj, textToFind);
    }
    if (this.type === 'usual') {
      this.input.focus();
      if (count !== undefined) {
        this.toggleInfo(textToFind, count);
      }
      if (this.activate) {
        this.activate.classList.remove('open');
      }
    }
    this.toggleBtns();
  }

  // Изменение значения в поиске:
  this.setValue = function(value) {
    if (value) {
      this.input.value = value;
      this.input.dataset.value = value;
    } else {
      this.clear();
    }
    this.toggleBtns();
    if (this.group) {
      if (this.items) {
        value ? this.group.classList.remove('close') : (this.items.querySelectorAll('.checked').length ? '' : this.group.classList.add('close'));
      } else {
        value ? this.group.classList.remove('close') : this.group.classList.add('close');
      }
    }
  }

  // Очистка поля поиска:
  this.clear = function() {
    this.input.value = '';
    this.input.dataset.value = '';
    this.toggleHints();
    this.toggleBtns();
    this.toggleInfo();
  }

  // Сброс поиска:
  this.cancel = function(event) {
    if (event && event.currentTarget.classList.contains('close')) {
      this.input.focus();
    }
    this.clear();
    if (callback && !(this.group && this.items)) {
      callback(this.obj);
    }
  }

  // Перключение кнопок поиска и сброса:
  this.toggleBtns = function() {
    var textToFind = this.input.value.trim();
    if (/\S/.test(textToFind)) {
      this.searchBtn.style.visibility = 'hidden';
      this.cancelBtn.style.visibility = 'visible';
    } else {
      this.cancelBtn.style.visibility = 'hidden';
      this.searchBtn.style.visibility = 'visible';
    }
  }

  // Отображение/скрытие кнопки "Больше/меньше":
  this.toggleMore = function() {
    var maxHeight = this.items.dataset.maxHeight;
    if (!maxHeight) {
      return;
    }
    var count = this.items.querySelectorAll('.item:not(.displayNone)').length,
        maxCount = parseFloat(this.items.dataset.maxCount, 10);
    if (count > maxCount + 3) {
      this.items.style.maxHeight = maxHeight;
      showElement(this.more, 'flex');
    } else {
      this.items.style.maxHeight = 'none';
      hideElement(this.more);
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
      this.result.classList.add('show');
    } else {
      this.result.classList.remove('show');
    }
  }

  this.init();
}

// Объект быстрого поля поиска(поиск во время ввода):

function SearchFast(obj, callback) {
  Search.apply(this, arguments);
  this.input.addEventListener('input', debounce(() => {
    if (this.items) {
      return;
    }
    this.search();
  }, 500));
}

//=====================================================================================================
// Работа выпадающих списков:
//=====================================================================================================

// Инициализация выпадающего списка:

function initDropDown(el, handler, data, defaultValue) {
  el = getEl(el);
  if (el) {
    if (el.id) {
      return window[`${el.id}Dropdown`] = new DropDown(el, handler, data, defaultValue);
    } else {
      return new DropDown(el, handler, data, defaultValue);
    }
  }
}

// Заполнение выпадающего списка данными:

function fillDropDown(el, data, defaultValue) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Dropdown`]) {
    window[`${el.id}Dropdown`].fillItems(data, defaultValue);
  }
}

// Очистка значения выпадающего списка:

function clearDropDown(el) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Dropdown`]) {
    window[`${el.id}Dropdown`].clear();
  }
}

// Выбор значения выпадающего списка:

function selectValueDropDown(el, value) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Dropdown`]) {
    window[`${el.id}Dropdown`].selectValue(value);
  }
}

// Изменение значения выпадающего списка:

function setValueDropDown(el, type, key, value) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Dropdown`]) {
    window[`${el.id}Dropdown`].setValue(type, key, value);
  }
}

// Объект выпадающего списка:

function DropDown(obj, handler, data, defaultValue) {
  // Инициализация выпадающего списка:
  this.init = function() {
    this.getElements();
    this.setEventListeners();
    this.initElements();
    this.fillItems(data, defaultValue);
  }

  // Получение элементов для работы:
  this.getElements = function() {
    this.obj = obj;
    this.hiddenInput = getEl('input[type="hidden"]', obj);
    this.head = getEl('.head', obj);
    this.title = getEl('.head .title', obj);
    this.sort = getEl('.group.sort', obj);
    this.search = getEl('form.search', obj);
    if (!this.search) {
      this.calendar = getEl('.calendar-wrap', obj);
    }
    this.items = getEl('.items', obj);
    this.clearBtn = getEl('.clear-btn', obj);
    this.type = this.obj.classList.contains('box') ? 'box' : (this.obj.classList.contains('search') ? 'searchBox' : 'usual')
    this.titleText = this.title ? this.title.textContent : null;
  }

  // Инициализация элементов для работы:
  this.initElements = function() {
    if (this.search) {
      this.search = initSearch(this.search, this.toggleSearch);
    }
    if (this.calendar) {
      initCalendar(this.calendar);
    }
  }

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (handler) {
      this.obj.addEventListener('change', event => handler(event));
    }
    if (this.head) {
      this.head.addEventListener('click', event => this.toggle(event));
    }
    if (this.sort) {
      this.sort.addEventListener('click', event => this.toggleSort(event))
    }
    if (this.calendar) {
      this.calendar.addEventListener('change', event => {
        event.stopPropagation();
        var textToFind = event.currentTarget.value;
        this.toggleSearch(event.currentTarget, textToFind);
      });
    }
    if (this.items) {
      this.items.addEventListener('click', event => this.toggleItem(event));
    }
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.clear());
    }
  }

  // Открытие/закрытие выпадающего списка:
  this.toggle = function(event) {
    if (!event.pageX) {
      return;
    }
    if (this.obj.closest('.disabled') || this.obj.closest('[disabled]')) {
      return;
    }
    if (this.obj.classList.contains('open')) {
      if (this.type === 'searchBox') {
        if (event.target.classList.contains('icon')) {
          this.obj.classList.remove('open');
          document.removeEventListener('click', this.close);
        }
      } else {
        this.obj.classList.remove('open');
        document.removeEventListener('click', this.close);
      }
    } else {
      this.obj.classList.add('open');
      document.addEventListener('click', this.close);
    }
  }

  // Закрытие выпадающего списка при клике вне его самого:
  this.close = event => {
    if (event && event.target.closest('.activate') === this.obj) {
      return;
    }
    this.obj.classList.remove('open');
    document.removeEventListener('click', this.close);
  }

  // Заполнение выпадающего списка:
  this.fillItems = function(data, defaultValue) {
    if (!this.items || !data) {
      return;
    }
    loadData(this.items, data);
    if (defaultValue && this.obj.classList.contains('select')) {
      this.items.insertAdjacentHTML('afterbegin', `<div class="item" data-value="default">${defaultValue}</div>`)
    }
  }

  // Изменение заголовка:
  this.changeTitle = function(newTitle) {
    if (this.type !== 'searchBox') {
      if (newTitle) {
        this.obj.classList.add('changed');
        if (this.type === 'usual') {
          this.title.textContent = newTitle;
        }
      } else {
        this.obj.classList.remove('changed');
        if (this.type === 'usual') {
          this.title.textContent = this.titleText;
        }
      }
    }
  }

  // Работа с пунктами сортировки:
  this.toggleSort = function(event, curItem) {
    if (event) {
      curItem = event.target.closest('.item.sort');
    }
    if (!curItem) {
      return;
    }
    if (curItem.classList.contains('checked')) {
      curItem.classList.remove('checked');
    } else {
      this.sort.querySelectorAll('.checked').forEach(el => el.classList.remove('checked'));
      curItem.classList.add('checked');
    }
    if (event) {
      curItem.dispatchEvent(new CustomEvent('change', {'detail': 'sort', 'bubbles': true}));
    }
  }

  // Работа с поиском:
  this.toggleSearch = (search, textToFind) => {
    var newTitle = textToFind ? 'Поиск: ' + textToFind : '';
    this.changeTitle(newTitle);
    this.writeValue(textToFind);
    if (search) {
      search.closest('.group').dispatchEvent(new CustomEvent('change', {'detail': 'search', 'bubbles': true}));
    }
  }

  // Работа с пунктами списка:
  this.toggleItem = function(event, curItem) {
    if (event) {
      curItem = event.target.closest('.item');
    }
    if (!curItem) {
      return;
    }
    var value;
    if (this.obj.classList.contains('select')) {
      this.items.querySelectorAll('.item.checked').forEach(el => el.classList.remove('checked'));
      if (curItem.dataset.value === 'default') {
        this.changeTitle();
      } else {
        this.changeTitle(curItem.textContent);
        curItem.classList.add('checked');
      }
      value = curItem.dataset.value === 'default' ? '' : curItem.dataset.value;
      if (!this.obj.classList.contains('box')) {
        this.obj.classList.remove('open');
      }
    } else {
      curItem.classList.toggle('checked');
      var checked = this.items.querySelectorAll('.item.checked');
      if (checked.length === 0) {
        this.changeTitle();
        value = '';
      } else {
        this.changeTitle('Выбрано: ' + checked.length);
        value = [];
        checked.forEach(el => value.push(el.dataset.value));
      }
    }
    this.writeValue(value);
    if (event) {
      curItem.dispatchEvent(new CustomEvent('change', {'detail': 'filter', 'bubbles': true}));
    }
  }

    // Выбор пункта списка:
    this.selectValue = function(value) {
      this.obj.querySelectorAll('.item').forEach(el => {
        if ((el.dataset.value).toLowerCase() === value.toLowerCase()) {
          el.dispatchEvent(new CustomEvent('click', {'bubbles': true}));
        }
      });
    }

  // Установка значения:
  this.setValue = function(type, key, value) {
    if (type === 'search') {
      if (this.search) {
        this.search.setValue(value);
        this.toggleSearch(null, value);
      }
    } else {
      var curEl = key ? getEl(`.group[data-key="${key}"] [data-value="${value}"]`, this.obj) : getEl(`[data-value="${value}"]`);
      if (curEl) {
        if (type === 'sort') {
          this.toggleSort(null, curEl);
        } else {
          this.toggleItem(null, curEl);
        }
      }
    }
  }

  // Запись выбранных значений в value объекта:

  this.writeValue = function(value = '') {
    this.obj.value = value;
    if (this.hiddenInput) {
      this.hiddenInput.value = value;
    }
  }

  // Очистка выпадающего списка:
  this.clear = function() {
    if (this.sort) {
      this.sort.querySelectorAll('.row').forEach(el => el.classList.remove('checked'));
    }
    if (this.search) {
      this.search.clear();
    }
    if (this.items) {
      this.items.querySelectorAll('.item.checked').forEach(el => el.classList.remove('checked'));
    }
    this.changeTitle();
    this.writeValue();
  }

  this.init();
}

//=====================================================================================================
// Создание и работа блока фильтров:
//=====================================================================================================

// В каком виде нужно передавать данные для создания фильтров:

// var settings = {
//   filters: {                                       Перечень сортировок и фильтров:
//     key1: {                                          - ключ в данных, по которому находится информация
//       title: 'Заголовок'                               - заголовок сортировки
//       sort: 'text' / 'numb' / 'date'                   - формат сортировки (по умолчанию text)
//       search: 'usual' / 'date'                         - нужен ли поиск по ключу и его формат (по умолчанию отсутствует)
//       filter: 'checkbox' / 'select'                    - нужна ли фильтрация по ключу и ее формат (по умолчанию отсутствует)
//       items:                                           - данные для заполнения фильтра (чекбоксов или селектов):
//        [{                                                1) первый вариант заполенения (когда название отличается от значения и/или есть подфильтры):
//           title: 'заголовок'                               - заголовок пункта фильтра
//           value: 'значение для поиска'                     - значение, которое будет искаться в данных
//           (Если есть подфильтры:)
//           key: 'ключ для подфильтров'                      - ключ в данных, по которому находится информация для подфильтров (если нужно, если нет то пропускаем)
//           items: [{                                        - данные для заполнения подфильтра (если нужно, если нет то пропускаем)
//             title: 'Заголовок'
//             value: 'значение для поиска'
//             key: ...
//             items: ...
//           }]
//         }, {...}]
//         или ['значение1', 'значение2', ...]              2) второй вариант заполнения (когда название и значение одинаковые и нет подфильтров)
//       isOpen: true / false                             - открыт ли фильтр по умолчанию (по умолчанию false - закрыт, true - открыт)
//       isMore: true / false / 'количество'              - скрывать ли значения фильтра и больше скольки (по умолчанию false - не срывать, true - скрывать больше 4-х, 'количество' - то скрывать больше этого количества)
//     },
//     key2: {...}
//   },
//   bound: число пикселей (например 768)             Разрешение свыше которого всплывающее окно с фильтрами должно закрываться (по умолчанию - 1359px)
//   isSave: true / false                             Cохранять ли положение групп фильтров в текущей сессии браузера (открыты/закрыты) (по умолчанию false - не сохраняются)
//   isVisible: true / false                          Cделать фильтры видимыми на всех разрешениях (по умолчанию false - не видно до 1359px)
// }

// Инициализация блока фильтров:

function initFilter(el, settings, handler) {
  el = getEl(el);
  if (el) {
    if (el.id) {
      return window[`${el.id}Filter`] = new Filter(el, settings, handler);
    } else {
      return new Filter(el, settings, handler);
    }
  }
}

// Заполнение блока фильтров новыми значениями:

function fillFilter(el, data) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Filter`]) {
    window[`${el.id}Filter`].fillItems(data);
  }
}

// Переключение кнопок блока фильтров:

function toggleFilterBtns(el, count) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Filter`]) {
    window[`${el.id}Filter`].toggleBtns(count);
  }
}

// Установка значения в блок фильтров:

function setValueFilter(el, type, key, value) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Filter`]) {
    window[`${el.id}Filter`].setValue(type, key, value);
  }
}

// Очистка блока фильтров:

function clearFilter(el) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Filter`]) {
    window[`${el.id}Filter`].clearFilter();
  }
}

// Создание блока фильтров:

function createFilter(area, settings) {
  var mainTitle,
      sortList = '',
      filterList = '',
      isSave = settings.isSave ? 'save' : '';

  for (var k in settings.filters) {
    var data = settings.filters[k],
        result;

    if (data.section) {
      var sortSection = '',
          filterSection = '',
          isOpen = data.isOpen ? 'default-open' : 'close',
          title = data.title,
          mode = '';

      if (data.mode) {
        var list = '', tooltip;
        for (var key in data.mode) {
          tooltip = data.mode[key];
          list += `<span data-mode="${key}" data-tooltip="${tooltip}">${key}</span>`;
        }
        mode =`<span class="mode">${list}</span>`;
      }

      for (var kk in data.section) {
        result = createEl(kk, data.section[kk], 'section');
        sortSection += result.sort;
        filterSection += result.filter;
      }

      if (sortSection) {
        sortList +=
        `<div class="section switch ${isSave} ${isOpen}" data-key="${k}">
          <div class="title row" onclick="switchContent(event)">
            <div class="title white h3">${title}${mode}</div>
            <div class="open white icon switch-icon"></div>
          </div>
          <div class="switch-cont">
            ${sortSection}
          </div>
        </div>`;
      }
      if (filterSection) {
        filterList +=
        `<div class="section switch ${isSave} ${isOpen}" data-key="${k}">
          <div class="title row" onclick="switchContent(event)">
            <div class="title white h3">${title}${mode}</div>
            <div class="open white icon switch-icon"></div>
          </div>
          <div class="switch-cont">
            ${filterSection}
          </div>
        </div>`;
      }
    } else {
      result = createEl(k, data);
      sortList += result.sort;
      filterList += result.filter;
    }
  }

  function createEl(key, data, type) {
    var isOpen = data.isOpen ? 'default-open' : 'close',
        title = data.title,
        sort = data.sort,
        search = data.search,
        filter = data.filter,
        items = data.items,
        mode = data.mode ? `data-mode="${data.mode}"` : '',
        result = {sort: '', filter: ''};

    if (sort) {
      if (!mainTitle) {
        mainTitle = 'Сортировки';
      }
      if (type) {
        result.sort =
        `<div class="group sort" data-key="${key}" data-type="${sort}" ${mode}>
        <div class="title">${title}</div>
        <div class="content">
          <div class="item sort down row" data-value="down">
            <div class="radio icon"></div>
            <div>${getSortText('down', sort)}</div>
          </div>
          <div class="item sort up row" data-value="up">
            <div class="radio icon"></div>
            <div>${getSortText('up', sort)}</div>
          </div>
        </div>
      </div>`;
      } else {
        result.sort =
        `<div class="group sort switch ${isSave} ${isOpen}" data-key="${key}" data-type="${sort}" ${mode}>
        <div class="title row" onclick="switchContent(event)">
          <div class="title white h3">${title}</div>
          <div class="open white icon switch-icon"></div>
        </div>
        <div class="content switch-cont">
          <div class="item sort down row" data-value="down">
            <div class="radio icon"></div>
            <div>${getSortText('down', sort)}</div>
          </div>
          <div class="item sort up row" data-value="up">
            <div class="radio icon"></div>
            <div>${getSortText('up', sort)}</div>
          </div>
        </div>
      </div>`;
      }
    }

    if (search || filter) {
      var content = '';
      if (search) {
        if (search === 'date') {
          filter = undefined;
          search =
          `<div class="calendar-wrap">
            <input type="text" value="" data-type="date" placeholder="ДД.ММ.ГГГГ" maxlength="10" autocomplete="off" oninput="onlyDateChar(event)">
          </div>`;
        } else {
          search =
          `<form class="search row" data-type="fast" action="#">
            <input type="text" data-value="" placeholder="Поиск...">
            <input class="search icon" type="submit" value="">
            <div class="close icon"></div>
          </form>`;
        }
        content += search;
      }
      if (filter) {
        content +=
        `<div class="not-found">Совпадений не найдено</div>
        <div class="items"></div>`;
        if (data.isMore) {
          content +=
          `<div class="more row">
            <div>Больше</div>
            <div class="open light icon"></div>
          </div>`;
        }
      }
      if (type) {
        result.filter =
        `<div class="group" data-key="${key}" ${mode}>
          <div class="title">${title}</div>
          <div class="content">
            ${content}
          </div>
        </div>`;
      } else {
        result.filter =
        `<div class="group switch ${isSave} ${isOpen}" data-key="${key}" ${mode}>
          <div class="title row" onclick="switchContent(event)">
            <div class="title white h3">${title}</div>
            <div class="open white icon switch-icon"></div>
          </div>
          <div class="content switch-cont">
            ${content}
          </div>
        </div>`;
      }
    }
    return result;
  }

  if (mainTitle) {
    filterList =
    `<div class="title row">
      <div class="title h2">Фильтры</div>
    </div>` + filterList;
  } else {
    mainTitle = 'Фильтры';
  }

  var filterBlock = getEl('.pop-up-container.filters', area);
  if (filterBlock) {
    area.removeChild(filterBlock);
  }

  filterBlock = document.createElement('div');
  filterBlock.classList.add('pop-up-container', 'filters');
  filterBlock.dataset.bound = settings.bound || true;
  if (settings.isVisible) {
    filterBlock.classList.add('visible');
  }
  filterBlock.id = area.id + '-filters';
  filterBlock.innerHTML =
  `<div class="pop-up">
    <div class="pop-up-title row">
      <div class="title h2">${mainTitle}</div>
      <div class="close icon"></div>
    </div>
    <div class="pop-up-body">
      ${sortList + filterList}
    </div>
    <div class="btns-wrap">
      <div class="clear-btn row">
        <div>Сбросить</div>
        <div class="close icon"></div>
      </div>
      <div class="btn act disabled">Показать (<span>0</span>)</div>
    </div>
  </div>`;
  area.appendChild(filterBlock);
}

// Получение текста для кнопок сортировки:

function getSortText(sortOrder, type) {
  var text;
  if (sortOrder === 'down') {
    text = type === 'numb' ? 'По возрастанию' : (type === 'date' ? 'Сначала новые' : 'От А до Я');
  } else if (sortOrder = 'up') {
    text = type === 'numb' ? 'По убыванию' : (type === 'date' ? 'Сначала старые' : 'От Я до А');
  }
  return text;
}

// Заполнение фильтра значениями:

function fillFilterItems(type, data, isFirst) {
  var items = '';
  if (data && Array.isArray(data)) {
    data.forEach((el, index) => {
      var numb = isFirst ? `data-numb="${index + 1}"` : '',
          title, value;
      if (typeof el === 'object') {
        title = el.title;
        value = el.value;
      } else {
        title = value = el;
      }
      if (el.items) {
        items +=
        `<div class="item switch close" ${numb} data-value="${value}">
          <div class="row">
            <div class="title row">
              <div class="checkbox icon"></div>
              <div class="text">${title}</div>
            </div>
            <div class="open icon switch-icon" onclick="switchContent(event)"></div>
          </div>
          <div class="items switch-cont" data-key="${el.key || ''}">
            ${fillFilterItems(type, el.items)}
          </div>
        </div>`
      } else {
        var iconType;
        if (type === 'select') {
          iconType = 'radio';
        } else if (type === 'checkbox') {
          iconType = 'checkbox';
        }
        items +=
        `<div class="item row" ${numb} data-value="${value}">
          <div class="${iconType} icon"></div>
          <div class="text">${title}</div>
        </div>`;
      }
    });
  }
  return items;
}

// Объект фильтра:

function Filter(obj, settings, handler) {
  // Инициализация блока фильтров:
  this.init = function() {
    this.create();
    this.getElements();
    this.initElements();
    this.fillItems(settings.filters);
    this.setEventListeners();
  }

  // Создание разметки фильтра:
  this.create = function() {
    createFilter(obj, settings);
  }

  // Получение элементов фильтра для работы:
  this.getElements = function()  {
    this.filter = getEl('.pop-up-container.filters', obj);
    this.searches = this.filter.querySelectorAll('form.search');
    // this.calendars = this.filter.querySelectorAll('.calendar-wrap');
    this.openBtn = getEl('.relay.icon', obj);
    this.clearBtn = getEl('.clear-btn', this.filter);
    this.showBtn = getEl('.btn.act', this.filter);
    this.showCount = getEl('span', this.showBtn);
  }

  // Инициализация элементов фильтра для работы:
  this.initElements = function() {
    this.searches.forEach((el, index) => {
      var key = el.closest('.group').dataset.key;
      this[`search${index}`] = this[`search${key}`] = initSearch(el, this.toggleSearch);
    });
    // this.filter.querySelectorAll('.calendar-wrap').forEach(el => initCalendar(el));
  }

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => openPopUp(this.filter));
    }
    this.filter.querySelectorAll('.group').forEach(el => el.addEventListener('click', event => this.toggleItem(event)));
    this.filter.querySelectorAll('.more').forEach(el => el.addEventListener('click', event => this.toggleMore(event)));
    this.filter.querySelectorAll('.mode').forEach(el => el.addEventListener('click', event => this.toggleMode(event)));
    this.clearBtn.addEventListener('click', event => this.clearFilter(event));
    this.showBtn.addEventListener('click', event => this.closeFilter(event));
  }

  // Заполнение фильтров значениями:
  this.fillItems = function(info) {
    if (!info) {
      return;
    }
    var filter, data, activeMode;
    for (var k in info) {
      filter = info[k];
      if (filter.section) {
        var section = getEl(`.section[data-key="${k}"]`,this.filter);
        if (section) {
          var isSection = false;
          if (filter.mode) {
            for (var key in filter.mode) {
              var modeBtn = getEl(`[data-mode="${key}"]`, this.filter);
              if (modeBtn) {
                var modeFilter, isDisplay = 'displayNone';
                for (var kk in filter.section) {
                  modeFilter = filter.section[kk];
                  if (modeFilter.mode && modeFilter.mode == key && modeFilter.items && modeFilter.items.length) {
                    isDisplay = '';
                  }
                }
                activeMode = !activeMode && !isDisplay ? key : activeMode;
              }
              if (isDisplay) {
                modeBtn.classList.add('displayNone');
              } else {
                modeBtn.classList.remove('displayNone');
              }
              if (activeMode == key) {
                modeBtn.classList.add('active');
              } else {
                modeBtn.classList.remove('active');
              }
            }
          }
          for (var kk in filter.section) {
            data = filter.section[kk];
            fill(kk, this.filter);
            if (data.items && data.items.length) {
              isSection = true;
            }
          }
          if (isSection) {
            section.classList.remove('displayNone');
          } else {
            section.classList.add('displayNone');
          }
        }
      } else {
        data = filter;
        fill(k, this.filter);
      }
    }

    function fill(key, filterBlock) {
      if (!data.filter || !data.items || !data.items.length) {
        return;
      }
      var group = getEl(`.group:not(.sort)[data-key="${key}"]`, filterBlock),
          groupItems = getEl('.items', group);
      if (groupItems) {
        groupItems.innerHTML = fillFilterItems(data.filter, data.items, true);
        var items = data.items,
            isSearch = data.search,
            isMore = data.isMore;

        if (items && items.length) {
          group.classList.remove('displayNone');
        } else {
          group.classList.add('displayNone');
          return;
        }

        if (isSearch) {
          var search = getEl('form.search', group);
          if (search) {
            if (items && items.length > 8) {
              search.classList.remove('displayNone');
            } else {
              search.classList.add('displayNone');
            }
          }
        }

        if (isMore) {
          var moreBtn = getEl('.more', group);
          if (moreBtn) {
            isMore = isMore === true ? 4 : isMore;
            groupItems.dataset.maxHeight = 2.1 * Number(isMore) + 'em';
            groupItems.dataset.maxCount = isMore;
            if (items.length > isMore + 3) {
              groupItems.style.maxHeight = groupItems.dataset.maxHeight;
              moreBtn.classList.remove('displayNone');
            } else {
              groupItems.style.maxHeight = 'none';
              moreBtn.classList.add('displayNone');
            }
          }
        }

        if (data.mode && data.mode == activeMode) {
          group.classList.add('active');
        } else {
          group.classList.remove('active');
        }
      }
    }
  }

  // Отображение/скрытие значений фильтра:
  this.toggleMore = function(event) {
    var items = event.currentTarget.previousElementSibling;
    if (items.classList.contains('full')) {
      items.classList.remove('full');
      event.currentTarget.firstElementChild.textContent = 'Больше';
    } else {
      items.classList.add('full');
      event.currentTarget.firstElementChild.textContent = 'Меньше';
    }
  }

  // Работа со значениями фильтра:
  this.toggleItem = function(event, curEl) {
    if (event && event.target.classList.contains('switch-icon')) {
      return;
    }
    if (event) {
      curEl = event.target.closest('.item');
    }
    if (!curEl || curEl.classList.contains('disabled')) {
      return;
    }
    var group = curEl.closest('.group');
    if (getEl('.radio', curEl)) {
      this.toggleRadio(group, curEl);
    } else {
      this.toggleCheckbox(group, curEl);
    }
    if (event && handler) {
      var count = handler(curEl);
      if (!group.classList.contains('sort')) {
        this.toggleBtns(count);
      }
    }
    if (group.querySelectorAll('.checked').length) {
      group.classList.remove('close');
    } else if (!event) {
      group.classList.add('close');
    }
  }

  // Переключение радио-кнопок:
  this.toggleRadio = function(group, curEl) {
    if (curEl.classList.contains('checked')) {
      curEl.classList.remove('checked');
    } else {
      var items;
      if (group.classList.contains('sort')) {
        items = this.filter.querySelectorAll('.group.sort .item');
      } else {
        items = group.querySelectorAll('.item');
      }
      items.forEach(el => el.classList.remove('checked'))
      curEl.classList.add('checked');
    }
  }

  // Переключение чекбоксов:
  this.toggleCheckbox = function(group, curEl) {
    if (curEl.classList.contains('checked')) {
      curEl.classList.remove('checked');
      curEl.classList.add('close');
      curEl.querySelectorAll('.item.checked').forEach(subItem => subItem.classList.remove('checked'));
    } else {
      curEl.classList.add('checked');
      curEl.classList.remove('close');
      var parentItem = curEl.closest('.items').closest('.item');
      if (parentItem && !parentItem.classList.contains('checked')) {
        parentItem.classList.add('checked');
        parentItem.classList.remove('close');
      }
      var items = getEl('.items', group);
      if (parseFloat(curEl.dataset.numb, 10) > parseFloat(items.dataset.maxCount, 10)) {
        items.classList.add('full');
        var moreBtn = getEl('.more', group);
        if (moreBtn) {
          moreBtn.firstElementChild.textContent = 'Меньше';
        }
      }
      var section = curEl.closest('.section.switch');
      if (section) {
        var mode = group.dataset.mode;
        section.classList.remove('close');
        section.querySelectorAll('.mode span').forEach(el => {
          if (el.dataset.mode === mode && !el.classList.contains('active')) {
            el.dispatchEvent(new CustomEvent('click', {'bubbles': true}));
          }
        });
      }
    }
  }

  // Работа с поисками фильтра:
  this.toggleSearch = (search, textToFind) => {
    if (handler) {
      var curEl = getEl('input', search),
          count = handler(curEl);
      this.toggleBtns(count);
    }
  }

  // Установка значения в фильтре:
  this.setValue = function(type, key, value) {
    var curEl;
    if (type === 'search') {
      curEl = this[`search${key}`];
      if (curEl) {
        curEl.setValue(value);
      }
    } else {
      curEl = getEl(`.group[data-key="${key}"] [data-value="${value}"]`, this.filter);
      if (curEl) {
        this.toggleItem(null, curEl);
      }
    }
  }

  // Переключение сгруппированных фильтров:
  this.toggleMode = function(event) {
    var section = event.currentTarget.closest('.section.switch'),
        mode = event.target.dataset.mode;
    event.currentTarget.querySelectorAll('span').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    section.querySelectorAll('.group[data-mode]').forEach(el => {
      if (el.dataset.mode === mode) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
        el.querySelectorAll('.item.checked').forEach(item => item.dispatchEvent(new CustomEvent('click', {'bubbles': true})));
      }
    });
  }

  // Переключение кнопок фильтра:
  this.toggleBtns = function(count) {
    if (count === undefined) {
      return;
    }
    if (count) {
      showElement(this.clearBtn, 'flex')
      this.showBtn.classList.remove('disabled');
      this.showCount.textContent = count;
    } else {
      hideElement(this.clearBtn);
      this.showBtn.classList.add('disabled');
      this.showCount.textContent = 0;
    }
  }

  // Очистка блока фильтров:

  this.clearFilter = function(event) {
    this.filter.querySelectorAll('.item').forEach(el => el.classList.remove('checked', 'disabled'));
    this.filter.querySelectorAll('.switch').forEach(el => {
      if (el.classList.contains('default-open')) {
        el.classList.remove('close');
      } else {
        el.classList.add('close');
      }
    });
    this.filter.querySelectorAll('.full').forEach(el => el.classList.remove('full'));
    this.filter.querySelectorAll('.more').forEach(el => el.firstElementChild.textContent = 'Больше');
    this.searches.forEach((el, index) => this[`search${index}`].clear());
    this.toggleBtns(0);
    if (event && handler) {
      handler();
    }
  }

  // Закрытие блока фильтров:

  this.closeFilter = function(event) {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    closePopUp(null, this.filter);
  }

  this.init();
}
