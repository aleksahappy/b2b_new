'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Динамически изменяемые переменные:

var path,
    pageUrl,
    cardsType,
    isPreorder,
    view,
    userView,
    items = [],
    cartItems = {},
    curItems,
    itemsToLoad,
    filterItems = [],
    curSelect = null,
    searchText = null;

// Шаблоны карточек (сохраняем, потому что данные перезапишутся):

var minCard, bigCard;

//=====================================================================================================
// При запуске страницы:
//=====================================================================================================

// Запуск страницы каталога:

function startPage() {
  setPaddingToBody();
  defineCatalog();
  addCatalogModules();
  renderTotalsInHeader('#carts', 'carts');
  var menuData = setCatalogName();
  setCatalogEventListeners();
  if (view === 'product') {
    // getItems(location.search.replace('?',''))
    // .then(
    //   result => {
    //     items = [result];
    //     convertItems();
    //     initCart();
    //   },
    //   reject => {
    //     location.href = '../err404.html';
    //   }
    // )
  } else {
    // getItems()
    sendRequest(`../json/${pageId}.json`)
    .then(
      result => {
        result = JSON.parse(result); //удалить
        for (var key in result) {
          window[key] = result[key];
        }
        fillCatalogSubmenu(menuData);
        convertActions();
        fillCatalogFilters();
        convertItems();
        initFilters();
        initCart();
      }
    )
    .catch(error => {
      console.log(error);
      loader.hide();
      alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
    })
  }
}

// Инициализация корзины:

function initCart() {
  getCart()
  .then(result => {
    fillOrderForm();
    initForm('#order-form', sendOrder);
    return createCartData();
  }, reject => console.log(reject))
  .then(result => initPage())
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage() {
  loader.hide();
  initDropDown('#gallery-sort', sortItems);
  initSearch('#search', selectCards);
  initSearch('#oem', selectCards);
  initSearch('#cart-search', findInCart);
  renderContent();
}

//=====================================================================================================
// Запросы на сервер:
//=====================================================================================================

// Получение данных обо всех товарах или наборе товаров по их id:

function getItems(id) {
  return new Promise((resolve, reject) => {
    var data = {cat_type: pageId};
    if (id) {
      data.list = id;
    }
    sendRequest(urlRequest.main, 'items', data)
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

//=====================================================================================================
// Построение страницы:
//=====================================================================================================

// Определение загружаемого каталога:

function defineCatalog() {
  path = location.search ? location.search.slice(1).split('&').filter(el => el && el.indexOf('=') == -1) : undefined;
  if (path && path.length <= 2 && cartTotals.find(el => el.id === path[0])) {
    pageId = path[0];
    document.body.id = pageId;
    cardsType = pageId.indexOf('equip') >= 0 || pageId.indexOf('preorder') >= 0 ? 'equip' : 'zip';
    isPreorder = pageId.indexOf('preorder') == 0 ? true : false;
  } else {
    location.href = '../err404.html';
  }
}

// Построение каталога из модулей:

function addCatalogModules() {
  document.body.dataset.cards = cardsType;
  document.body.dataset.preorder = isPreorder;

  var catalogHeader = document.createElement('div');
  catalogHeader.classList.add('header-bottom');
  catalogHeader.dataset.html = '../modules/catalog_header.html';
  getEl('#header').appendChild(catalogHeader);

  var catalogMain = document.createElement('div');
  catalogMain.id = 'main';
  catalogMain.dataset.html = '../modules/catalog_main.html';
  document.body.insertBefore(catalogMain, getEl('#modules').nextElementSibling);
  includeHTML();

  var catalogGallery = document.createElement('div');
  catalogGallery.id = 'gallery';
  catalogGallery.dataset.html = `../modules/catalog_${cardsType}.html`;
  getEl('#content').appendChild(catalogGallery);

  var popUpModules = document.createElement('div');
  popUpModules.classList.add('popup-modules');
  popUpModules.dataset.html = `../modules/infocard_and_img.html`;
  document.body.insertBefore(popUpModules, catalogMain.nextElementSibling);
  includeHTML();

  document.querySelectorAll('.full-card-container').forEach(el => {
    popUpModules.insertBefore(el, popUpModules.firstElementChild);
  });

  minCard = getEl('.min-card');
  bigCard = getEl('.big-card');
  cartSectionTemp = getEl('.cart-section');
  cartRowTemp = getEl('.cart-row');
}

// Добавление основного названия каталогу:

function setCatalogName() {
  var data = JSON.parse(JSON.stringify(cartTotals.find(el => el.id === pageId)));
  fillTemplate({
    area: '.topmenu',
    items: data
  });
  return data;
}

// Добавление обработчиков событий:

function setCatalogEventListeners() {
  window.addEventListener('resize', () => {
    setPaddingToBody();
    adaptMenu();
  });
  window.addEventListener('popstate', (event) => openPage(event));
  window.addEventListener('focus', updateCart);
}

// Динамическое заполнение второго уровня меню:

function fillCatalogSubmenu(data) {
  var subMenuData = {
    equip: {
      'odegda': 'Одежда',
      'obuv': 'Обувь',
      'shlem': 'Шлемы',
      'optic': 'Оптика',
      'snarag': 'Снаряжение',
      'zashita': 'Защита',
      'sumruk': 'Сумки и рюкзаки',
      'merch': 'Мерчандайзинг'
    },
    boats: {
      'zip': 'Запчасти',
      'acc': 'Аксессуары',
      'propeller': 'Винты гребные'
    },
    snow: {
      'zip': 'Запчасти',
      'acc': 'Аксессуары'
    },
    snowbike: {
      'kit': 'Комплекты',
      'adapter': 'Адаптеры',
      'zip': 'Запчасти',
      'acc': 'Аксессуары',
      'snarag': 'Снаряжение',
      'zashita': 'Защита',
      'sumruk': 'Сумки и рюкзаки',
      'merch': 'Мерчандайзинг'
    }
  }
  // if (!window.submenu) {
  //   return;
  // }
  data.items = convertDataForFillTemp(subMenuData[data.id]);
  // data.items = convertDataForFillTemp(submenu);
  fillTemplate({
    area: '.submenu',
    items: data,
    sub: [{area: '.submenu-item', items: 'items'}]
  });
  adaptMenu();
}

//=====================================================================================================
// Преобразование входящих данных:
//=====================================================================================================

// Преобразование входящих данных об акциях:

function convertActions() {
  if (!window.actions) {
    window.actions = {};
  }
  for (var key in actions) {
    var action = actions[key];
    action.begin = getDateObj(action.begin,);
    action.begin.setHours(0, 0, 1);
    action.expire = getDateObj(action.expire);
    action.expire.setHours(23, 59, 59);
    if (action.art_cnt_perc) {
      action.art_cnt_perc = action.art_cnt_perc.split(';').map(el => el.split(','));
    }
  }
  actions.is_new = {title: "Новинка"}; // Костыль для добавления в фильтры спецпредложений новинок:
}

// Преобразование входящих данных и получение информации для фильтров и корзины:

function convertItems() {
  items.forEach(item => convertItem(item));
}

// Преобразование данных по одному товару:

function convertItem(item) {
  addManufInfo(item);
  item.title = item.title.replace(/\s/g, ' ');
  item.isOemList = item.oemList ? '' : 'displayNone';
  item.isManufTable = item.manuf_table ? '' : 'displayNone';
  item.search = [item.title, item.brand, item.cat, item.subcat]; // добавление данных для поиска по странице (далее в функциях будут дополняться)
  addQtyInfo(item);
  addImgInfo(item);
  addActionInfo(item);
  addPriceInfo(item);
  addMarkupInfo(item);
  addSizeInfo(item);
  getDataForFilters(item);
  addOptionsInfo(item, optnames);
  addDescrInfo(item);
  addFiltersInfo(item);
  item.search = item.search.join(';').replace(/\s/g, ' ');
  return item;
}

// Преобразование данных о производителе для фильтров, построения таблицы и добавление данных об OEM:

function addManufInfo(item) {
  var mainTableKey = 'brand',
      mainKeys = [],
      tableData = [],
      oemList = '';
  addInfo('manuf1');
  addInfo('manuf2');

  function addInfo(manuf) {
    if (!item[manuf]) {
      return;
    }
    item[manuf].forEach(el => {
      for (var key in el) {
        if (key === 'oem' && manuf === 'manuf2') {
          oemList += el[key] + ';';
        }
        if (el[key].indexOf(';') >= 0) {
          el[key] = el[key].split(';');
        };
        if (key === mainTableKey && manuf === 'manuf2') {
          getUniqManufValue(mainKeys, el[key]);
        }
      }
    });
    if (manuf === 'manuf2') {
      var rowData;
      if (!mainKeys.length) {
        mainKeys.push('&mdash;');
      }
      mainKeys.forEach(mainKey => {
        rowData = {
          oem: [],
          years: [],
          brand: [],
          models: []
        };

        item[manuf].forEach(el => {
          var isFound;
          if (mainKey === '&mdash;') {
            isFound = true;
          } else {
            isFound = checkManufEl({[mainTableKey]: mainKey}, el);
          }
          if (isFound) {
            for (var rowKey in rowData) {
              if (rowKey !== mainTableKey) {
                getUniqManufValue(rowData[rowKey], el[rowKey]);
              }
            }
          }
        });

        for (var rowKey in rowData) {
          rowData[rowKey] = rowData[rowKey].join(', ');
          if (rowData[rowKey] && rowKey === 'years') {
            rowData[rowKey] = convertYears(rowData[rowKey]);
          }
          rowData[rowKey] = rowData[rowKey] || '&mdash;';
        }
        rowData[mainTableKey] = mainKey;
        tableData.push(rowData);
      });;
    }
  }

  if (tableData.length) {
    item.manuf_table = tableData.sort(sortBy('oem'));
  }
  item.oemList = oemList.slice(0, -1).replace(/;/g, ', ');
}

// Получение уникальных значений из manuf:

function getUniqManufValue(data, value) {
  if (value) {
    if (Array.isArray(value)) {
      value.forEach(el => {
        addValue(el)
      });
    } else {
      addValue(value);
    }
  }

  function addValue(value) {
    value = value.trim();
    if (value && !data.find(el => el.toLowerCase() === value.toLowerCase())) {
      data.push(value);
    }
  }
}

// Проверка элемента manuf на соответствие фильтрам:

function checkManufEl(filters, el) {
  var isFound, value;
  for (var key in filters) {
    isFound = false;
    value = el[key];
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(el => {
          if (el.trim().toLowerCase() === filters[key].toLowerCase()) {
            isFound = true;
          }
        });
      } else if (value.trim().toLowerCase() === filters[key].toLowerCase()) {
        isFound = true;
      }
    }
    if (!isFound) {
      break;
    }
  }
  return isFound;
}

// Преобразование данных о наличии:

function addQtyInfo(item) {
  item.free_qty = isPreorder ? '' : item.free_qty;
  item.arrive_qty = isPreorder ? '' : item.arrive_qty;

  item.arrive_qty1 = item.arrive_qty > 0 ? `${item.arrive_qty} шт.` : '';
  item.arrive_date1 = item.arrive_date > 0 ? `к ${item.arrive_date}` : '';

  item.isFree = item.free_qty > 0 ? '' : 'displayNone';
  item.isArrive = (isPreorder ? item.arrive_date : item.arrive_qty) > 0 ? '' : 'displayNone';

  item.total_qty = parseInt(item.free_qty > 0 ? item.free_qty : 0, 10) + parseInt(item.arrive_qty > 0 ? item.arrive_qty : 0, 10);
}

// Проверка действия акции и добавление данных о ней:

function addActionInfo(item) {
  item.isAction = item.actiontitle ? '' : 'hidden';
  if (actions && item.action_id > 0) {
    var action = actions[item.action_id];
    if (action && (checkDate(action.begin, action.unending > 0 ? undefined : action.expire))) {
      item.actiontitle = action.title;
      item.actioncolor = action.color ? `#${action.color}` : '';
      item.actiondescr = action.descr;
      item.actionexpire = action.unending > 0 ? '' : `до: ${getDateStr(action.expire)}`;
      item.isAction = '';
      return;
    }
  }
  item.action_id = '0';
}

// Добавление данных о текущей цене и отображении/скрытии старой:

function addPriceInfo(item) {
  if (item.price_user1 !== item.price_action1 && item.action_id && item.price_action1 > 0) {
    item.isOldPrice = '';
    item.price_cur = item.price_action;
    item.price_cur1 = item.price_action1;
  } else {
    item.isOldPrice = 'displayNone',
    item.price_cur = item.price,
    item.price_cur1 = item.price1;
  }
}

// Добавление данных о торговой наценке:

function addMarkupInfo(item) {
  item.markup = ((item.price_user1 - item.price_cur1) / item.price_cur1 * 100).toFixed(0);
}

// Добавление данных о размерах, общем количестве и создание cartItems (использовать после addActionInfo):

function addSizeInfo(item) {
  if (!item.sizes || item.sizes == 0) {
    item.sizes = {};
    item.sizes[0] = {
      articul: item.articul,
      object_id: item.object_id,
      free_qty: item.free_qty,
      arrive_qty: item.arrive_qty,
      arrive_date: item.arrive_date,
      arrive_qty1: item.arrive_qty1,
      arrive_date1: item.arrive_date1
    };
  }
  var size;
  for (var key in item.sizes) {
    size = item.sizes[key];
    size.size = typeof size.size === 'string' ? size.size : 'OS';
    addQtyInfo(size);

    // добавление данных для поиска по странице
    item.search.push(item.sizes[key].articul);

    // создание cartItems для работы корзины
    var cartItem = cartItems['id_' + size.object_id] = Object.assign({}, size);
    cartItem.id = item.object_id;
    cartItem.image = item.image;
    cartItem.title = item.title;
    cartItem.options = item.options['id_40'] ? `(${item.options['id_40']}, ${size.size})` : `(${size.size})`;
    cartItem.price_cur = item.price_cur;
    cartItem.price_cur1 = item.price_cur1;
    cartItem.price_user = item.price_user;
    cartItem.price_user1 = item.price_user1;
    cartItem.action_id = item.action_id;
    cartItem.action_name = actions && actions[item.action_id] ? actions[item.action_id].title : 'Склад';
  }
}

// Добавление данных для создания блоков описаний:

function addDescrInfo(item) {
  item.describe = [];
  if (item.actiondescr) {
    item.actiondescr = item.actiondescr.replace(/\\n/g, '');
    item.describe.push({title: 'Условия акции', info: item.actiondescr, isClose: 'close'});
    delete item.actiondescr;
  }
  if (item.defect_desc) {
    item.defect_desc = item.defect_desc.replace(/\\n/g, '');
    item.describe.push({title: 'Описание дефекта', info: item.defect_desc, isClose: 'close'});
    delete item.defect_desc;
  }
}

// Добавление данных для фильтрации:

function addFiltersInfo(item) {
  // фильтр по доступности
  if (item.free_qty > 0) {
    item.free = '1';
  }
  if (item.arrive_qty > 0) {
    item.arrive = '1';
  }
}

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Скрытие не умещающихся пунктов меню в кнопку "Еще":

function adaptMenu() {
  if (window.innerWidth > 1359) {
    var container = getEl('#header-menu .container'),
        searchWidth = path[path.length - 1] === 'cart' ? 0 : 5,
        maxWidth = container.clientWidth - (34 + searchWidth) * parseInt(window.getComputedStyle(container).fontSize, 10) - getEl('#submenu-hide').clientWidth,
        menuItems = document.querySelectorAll('#header-menu .submenu-item'),
        width = 0,
        isHide = false;
    menuItems.forEach((el, index) => {
      width += el.clientWidth;
      if (width > maxWidth) {
        isHide = true;
        getEl('#submenu-hide .drop-down').appendChild(el);
      } else {
        getEl('#header-menu .submenu').insertBefore(el, getEl('#submenu-hide'));
      }
    });
    if (isHide) {
      showElement('#submenu-hide');
    } else {
      hideElement('#submenu-hide');
    }
  } else {
    document.querySelectorAll('#submenu-hide .submenu-item').forEach(el => getEl('#header-menu .submenu').insertBefore(el, getEl('#submenu-hide')));
  }
}

// Изменение позиционирования меню фильтров (на данный момент не задействована):

function setFiltersPosition() {
  if (window.innerWidth > 1359) {
    var gallery = getEl('#gallery'),
        filters = getEl('#filters'),
        filtersContent = getEl('#filters .pop-up');
    if (!filters.style.position || filters.style.position === 'fixed') {
      if (filtersContent.clientHeight >= gallery.clientHeight) {
        filters.style.position = 'static';
        filters.style.top = '0px';
        filters.style.maxHeight = 'none';
      } else {
        setFiltersHeight();
      }
    } else {
      if (filtersContent.clientHeight < gallery.clientHeight) {
        filters.style.position = 'fixed';
        setFiltersHeight();
      }
    }
  }
}

// Установка высоты меню фильтров:

function setFiltersHeight() {
  var filters = getEl('#filters'),
      headerHeight = getEl('#header').clientHeight,
      footerHeight = Math.max((window.innerHeight + window.pageYOffset - getEl('#footer').offsetTop) + 20, 0),
      filtersHeight = window.innerHeight - headerHeight - footerHeight;
  filters.style.top = headerHeight + 'px';
  filters.style.maxHeight = filtersHeight + 'px';
}

// Установка ширины малых карточек товаров:

function setMinCardWidth(width) {
  if (view === 'list') {
    return;
  }
  var gallery = getEl('#gallery'),
      width = window.innerWidth > 768 ? 18 : 16.5,
      standartWidth = width * parseInt(getComputedStyle(gallery).fontSize, 10),
      countCards = Math.floor(gallery.clientWidth / standartWidth),
      restGallery = gallery.clientWidth - countCards * standartWidth,
      changeMinCard = restGallery / countCards,
      minCardWidth = 0;
  if (restGallery >= 0) {
    minCardWidth = Math.floor(standartWidth + changeMinCard);
  } else {
    countCards = countCards - 1;
    minCardWidth = gallery.clientWidth / countCards;
  }
  var style = gallery.style.justifyContent;
  if (countCards - 1 === 1 && style !== 'center') {
    gallery.style.justifyContent = 'center';
  } else if (countCards - 1 > 1 && style !== 'flex-start') {
    gallery.style.justifyContent = 'flex-start';
  }
  document.querySelectorAll('.min-card').forEach(minCard => {
    minCard.style.width = minCardWidth + 'px';
  });
}

//=====================================================================================================
// Динамическая смена URL и данных на странице:
//=====================================================================================================

// Переход по вкладкам страницы с изменением URL без перезагрузки:

function openPage(event) {
  event.preventDefault();
  if (event.type == 'popstate') {
    if (event.state) {
      path = event.state.path;
    } else {
      return;
    }
  } else {
    var oldPath = path;
    path = event.currentTarget.href.replace(/https*:\/\/[^\/]+\//g, '').replace(/\/[^\/]+.html/g, '').replace('catalogs/?', '').split('&').filter(el => el && el.indexOf('=') == -1);
    if (JSON.stringify(oldPath) === JSON.stringify(path)) {
      return;
    }
    if (oldPath[0] !== path[0]) {
      location.href = event.currentTarget.href;
    }
    document.querySelectorAll(`.pop-up-container.open`).forEach(el => closePopUp(null, el));
    window.history.pushState({'path': path}, '', event.currentTarget.href);
  }
  renderContent();
}

// Изменение контента страницы:

function renderContent() {
  hideContent();
  changePageTitle();
  toggleMenuItems();
  changeMainNav();
  changeLinks();
  if (path[path.length - 1] === 'cart') {
    renderCart();
  } else if (view === 'product') {
    renderProductPage();
  } else {
    renderGallery();
  }
  toggleMobMenu('close');
  setPaddingToBody();
  setDocumentScroll(0,0);
}

// Скрытие неактуальных частей страницы:

function hideContent() {
  hideElement('#search');
  hideElement('#header-catalog');
  hideElement('#header-cart');
  hideElement('#page-title', 'flex');
  hideElement('#cart-name');
  hideElement('#filters-container');
  hideElement('#content');
  hideElement('#cart');
}

// Изменение заголовка страницы:

function changePageTitle() {
  var title = '',
      curTitle = getEl(`#header-menu [href$="${path[path.length - 1]}"]`);
  if (view === 'product') {
    title += items[0].title;
  } else if (curTitle) {
    title += curTitle.dataset.title;
  } else {
    location.href = '../err404.html';
  }
  document.title = 'ТОП СПОРТС - ' + title;
  var pageTitle = getEl('#page-title');
  if (pageTitle) {
    pageTitle.textContent = title;
  }
}

// Изменение активных разделов меню:

function toggleMenuItems() {
  document.querySelectorAll('#header-menu .active').forEach(item => item.classList.remove('active'));
  path.forEach(key => {
    var curTitle = getEl(`#header-menu [href$="${key}"]`);
    if (curTitle) {
      curTitle.classList.add('active');
    }
  });
}

// Изменение хлебных крошек:

function changeMainNav() {
  if (!getEl('#main-nav')) {
    return;
  }
  var data = {items: []}, curTitle;
  path.forEach(el => {
    curTitle = getEl(`#header-menu [href$="${key}"]`);
    if (curTitle) {
      var item = {
        href: view === 'product' ? '#' : curTitle.href,
        title: view === 'product' ? items[0].title : curTitle.dataset.title
      };
      data.items.push(item);
    } else {
      location.href = '../err404.html';
    }
  });
  fillTemplate({
    area: '#main-nav',
    items: data,
    sub: [{
      area: '.item',
      items: 'items'
    }]
  });
  showElement('#main-header', 'flex');
}

// Изменение динамических ссылок в соответствии с выбранным разделом:

function changeLinks() {
  document.querySelectorAll('.dinamic-link').forEach(item => {
    var curTitle = getEl(`#header-menu [href$="${path[path.length - 1]}"]`);
    if (curTitle) {
      item.href = curTitle.href + '?' + path[path.length - 1];
    }
  });
}

// Создание контента страницы товара:

function renderProductPage() {
  fillTemplate({
    area: '.product-card',
    target: 'gallery',
    items: items[0],
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
  var card = getEl('.product-card');
  renderCarousel(getEl('.carousel', card))
  .then(
    result => {
      card.style.opacity = '1';
    }
  )
}

// Создание контента галереи:

function renderGallery() {
  pageUrl = path.join('/');
  if (window[`${pageUrl}Items`]) {
    curItems = JSON.parse(JSON.stringify(window[`${pageUrl}Items`]));
  } else {
    curItems = items;
    path.forEach(key => {
      if (key != pageId) {
        curItems = curItems.filter(item => item[key] == 1);
      }
    });
    window[`${pageUrl}Items`] = JSON.parse(JSON.stringify(curItems));
  }
  itemsToLoad = curItems;
  if (!curItems.length) {
    return;
  }
  clearCurSelect(null, false);
  setValueDropDown('#gallery-sort', '-price_cur1');
  showElement('#search', 'flex');
  showElement('#header-catalog');
  showElement('#content', 'flex');
  toggleEventListeners('on');
  toggleFilters();
  toggleView(window.innerWidth > 499 && view ? view : 'blocks');
  showCards();
}

// Добавление/удаление обработчиков событий на странице:

function toggleEventListeners(toggle) {
  if (toggle === 'on') {
    window.addEventListener('scroll', scrollActs);
    window.addEventListener('resize', resizeActs);
  } else if (toggle === 'off') {
    window.removeEventListener('scroll', scrollActs);
    window.removeEventListener('resize', resizeActs);
  }
}

// Запуск обработчиков событий при скролле:

function scrollActs() {
  setFiltersHeight();
  scrollGallery();
}

// Запуск обработчиков событий при ресайзе:

function resizeActs() {
  setFiltersHeight();
  setMinCardWidth()
  setView();
  scrollGallery();
}

//=====================================================================================================
//  Функции для работы с галереей:
//=====================================================================================================

// Отображение карточек на странице:

function showCards() {
  if (itemsToLoad.length) {
    loadCards(itemsToLoad);
  } else {
    getEl('#gallery').innerHTML = '<div class="notice">По вашему запросу ничего не найдено.</div>';
  }
  setDocumentScroll(0,0);
  setMinCardWidth();
  setFiltersHeight();
  toggleCatalogFilterBtns();
}

// Добавление новых карточек при скролле страницы:

function scrollGallery() {
  if (window.pageYOffset * 2 + window.innerHeight >= document.body.clientHeight) {
    loadCards();
    setMinCardWidth();
  }
}

// Создание карточек товаров из массива:

var countItems = 0,
    countItemsTo = 0,
    incr;

function loadCards(cards) {
  if (cards) {
    countItems = 0;
  } else {
    countItems = countItemsTo;
  }
  if (window.innerWidth > 2000) {
    if (view === 'list') {
      incr = 30;
    } else {
      incr = 60;
    }
  } else if (window.innerWidth < 1080) {
    if (view === 'list') {
      incr = 10;
    } else {
      incr = 20;
    }
  } else {
    if (view === 'list') {
      incr = 20;
    } else {
      incr = 40;
    }
  }
  countItemsTo = countItems + incr;
  if (countItemsTo > itemsToLoad.length) {
    countItemsTo = itemsToLoad.length;
  }
  if (countItems === countItemsTo) {
    return;
  }

  var data = [];
  for (var i = countItems; i < countItemsTo; i++) {
    data.push(itemsToLoad[i]);
  }
  var sub;
  if (view === 'list') {
    sub = [{
      area: '.carousel-item',
      items: 'images'
    }, {
      area: '.card-size',
      items: 'sizes'
    }];
  } else {
    sub = [{
      area: '.card-size',
      items: 'sizes'
    }];
  }
  fillTemplate({
    area: view === 'list' ? bigCard : minCard,
    source: 'outer',
    items: data,
    target: '#gallery',
    sub: sub,
    method: countItems === 0 ? 'inner' : 'beforeend'
  });
  if (view === 'list') {
    document.querySelectorAll('.big-card.new').forEach(card => {
      card.classList.remove('new');
      renderCarousel(getEl('.carousel', card), undefined, card);
      checkCart(card);
      addActionTooltip(card);
    });
  }
  if (view === 'blocks') {
    document.querySelectorAll('.min-card.new').forEach(card => {
      card.classList.remove('new');
      checkMedia(getEl('img', card));
      checkCart(card);
      addActionTooltip(card);
    });
  }
  setFiltersHeight();
}

// Вывод информации об акции в подсказке в карточке товара:

function addActionTooltip(card) {
  var id = card.dataset.action;
  if (id && actions && actions[id]) {
    var pill = getEl('.pill', card);
    pill.dataset.tooltip = actions[id].descr || '';
  }
}

// Переключение вида каталога:

function toggleView(newView, isAuto) {
  if (view != newView) {
    if (window.innerWidth <= 768 && newView === 'list') {
      return;
    }
    var viewBtn = getEl(`.view .${view}.icon`),
        newViewBtn = getEl(`.view .${newView}.icon`),
        gallery = getEl('#gallery');
    if (viewBtn) {
      viewBtn.classList.remove('active')
    }
    if (newViewBtn) {
      newViewBtn.classList.add('active');
    }
    view = newView;
    if (!isAuto) {
      userView = newView;
    }
    gallery.style.opacity = '0';
    showCards();
    gallery.style.opacity = '1';
  }
}

// Автоматическое переключение вида каталога на разных разрешениях:

function setView() {
  if (window.innerWidth > 768) {
    if (view !== userView) {
      toggleView(userView);
    }
  } else {
    toggleView('blocks', true);
  }
}

// Поиск данных для отображения карточек товаров/изображения на весь экран:

function findItemData(id, type) {
  var data = items.find(item => item.object_id == id);
  if (!data && type === 'cart') {
    data = soldOutItems.find(item => item.object_id == id);
  }
  return data;
}

// Отображение полной карточки товара:

function showFullCard(id) {
  event.preventDefault();
  loader.show();
  var data = findItemData(id);
  if (!data) {
    loader.hide();
    alerts.show('При загрузке карточки товара произошла ошибка.');
    return;
  }

  var fullCardContainer;
  if (data.kit == 1) {
    fullCardContainer = getEl('.full-card-kit');
  } else {
    fullCardContainer = getEl('.full-card-container');
  }

  getDescribeInfo(data)
  .then(result => getDetailsInfo(fullCardContainer, data))
  .then(result => {
    fillTemplate({
      area: fullCardContainer,
      items: data,
      sub: [{
        area: '.carousel-item',
        items: 'images'
      }, {
        area: '.card-size',
        items: 'sizes'
      }, {
        area: '.desk .card-option',
        items: 'options'
      }, {
        area: '.adaptive .card-option',
        items: 'options'
      }, {
        area: '.manuf-row',
        items: 'manuf_table'
      }, {
        area: '.card-describe',
        items: 'describe',
      }, {
        area: '.details',
        items: 'details',
      }]
    });

    var curCarousel = getEl('.carousel', fullCardContainer);
    renderCarousel(curCarousel)
    .then(result => {
      curCarousel = getEl('.carousel', fullCardContainer);
      if (curCarousel) {
        getEl('.carousel-gallery-wrap', curCarousel).addEventListener('click', (event) => showFullImg(event, data));
        getEl('.maximize', curCarousel).addEventListener('click', (event) => showFullImg(event, data));
      }
    });

    checkCart(getEl('.full-card'));
    addActionTooltip(getEl('.full-card'));
    openPopUp(fullCardContainer);
    loader.hide();
  })
}

// Получение информации о применяемости деталей:

function getDetailsInfo(card, data) {
  return new Promise(resolve => {
    if (!getEl('.card-details', card) || data.details) {
      resolve();
    } else {
      sendRequest(`../json/details.json`)
      // sendRequest(urlRequest.main, 'item_models', {id: data.object_id})
      .then(result => {
        if (result) {
          result = JSON.parse(result);
          var list = [], text;
          result.forEach(el => {
            text = '';
            Object.keys(el).forEach((key, index) => {
              if (el[key]) {
                if (index === 0) {
                  text += el[key];
                } else {
                  text += ' – ' + el[key];
                }
              }
            });
            list.push(text);
          });
          data.details = list;
          initSearch(getEl('.detail-search', card), detailsSearch);
          getEl('.card-details', card).classList.remove('displayNone');
        } else {
          data.details = [];
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

// Поиск по применяемости:

function detailsSearch(search, textToFind) {
  var data = findItemData(getEl('.full-card').dataset.id);
  if (data && data.details) {
    data = data.details;
    if (textToFind) {
      var regExp = getRegExp(textToFind);
      data = data.filter(item => findByRegExp(item, regExp));
    }
    fillTemplate({
      area: '#details',
      items: data,
      sign: '@'
    });
    if (data.length) {
      hideElement('.card-details .notice');
      highlightText('#details', textToFind);
    } else {
      showElement('.card-details .notice');
    }
  }
}

// Отображение информационной карточки товара:

function showInfoCard(id) {
  loader.show();
  var data = findItemData(id, 'cart');
  if (data) {
    openInfoCard(data);
  } else {
    loader.hide();
    alerts.show('При загрузке карточки товара произошла ошибка.');
  }
}

// Отображение картинки на весь экран:

function showFullImg(event, data) {
  if (event.target.classList.contains('left-btn') || event.target.classList.contains('right-btn')) {
    return;
  }
  loader.show();
  if (typeof data !== 'object') {
    data = findItemData(data);
  }
  if (data) {
    openFullImg(event, data);
  } else {
    loader.hide();
    alerts.show('При загрузке изображения произошла ошибка.');
  }
}

// Копирование артикула из карточки товара:

function copyArticul(event, articul) {
  var name = event.currentTarget.parentElement,
      textArea = document.createElement('textarea');
  name.appendChild(textArea);
  textArea.value = articul;
  textArea.focus();
  textArea.setSelectionRange(0, textArea.value.length);
  try {
    document.execCommand('copy');
    alerts.show('Артикул скопирован в буфер обмена.', 2000)
  } catch (error) {
    alerts.show('Не удалось скопировать артикул.', 2000)
  }
  name.removeChild(textArea);
}

//=====================================================================================================
//  Общие функции для работы с фильтрами:
//=====================================================================================================

// Инициализация всех фильтров галереи:

function initFilters() {
  initFiltersCatalog();
  initFiltersStep();
}

// Переключение фильтров галереи на актуальные:

function toggleFilters() {
  toggleFiltersCatalog();
  toggleFiltersStep();
  showElement('#filters-container');
  checkFiltersFromUrl();
  checkFilters();
  checkPositions();
  createFiltersInfo();
}

// Проверка фильтров в адресной строке:

// Пример последовательного фильтра: ...&manuf=brand=hidea&manuf=years=2010
// Пример основного фильтра: ...&action_id=is_new&brand=509

function checkFiltersFromUrl() {
  var filters = getFiltersFromUrl();

  if (filters) {
    clearFiltersCatalog();

    var filtertype = filters[0].indexOf('manuf') === 0 ? 'step' : 'catalog',
        type;
    if (filtertype === 'step') {
      type = filters[0].split('=')[0];
      var curFilter = getEl(`#${type}`);
      if (!curFilter) {
        notFound();
        return;
      }
    } else {
      type = filtertype;
    }
    curSelect = type;

    var filterData, curItem, key, value;
    for (var filter of filters) {
      curItem = null;
      filterData = decodeURI(filter).toLowerCase().split('=');

      if (filtertype === 'step') {
        if (filter.indexOf('manuf') === 0) {
          var dropdown = window[`${filterData[0]}${filterData[1]}Dropdown`];
          if (dropdown) {
            var value = filterData[2].replace('_', ' ');
            curFilter.querySelectorAll('.item').forEach(item => {
              if (item.dataset.value.toLowerCase() == value) {
                curItem = item;
              }
            });
            if (curItem) {
              dropdown.setValue(value);
            } else {
              notFound();
              break;
            }
          }
        } else {
          notFound();
          break;
        }
      } else {
        var curGroup = getEl(`#catalog-filters .group[data-key="${filterData[0]}"]`);
        if (curGroup) {
          key = filterData[0];
          curGroup.querySelectorAll('.switch-cont > .items > .item').forEach(item => {
            value = item.dataset.value;
            if (value.toLowerCase() == filterData[1]) {
              curItem = item;
            }
          });
          if (curItem) {
            saveFilter(key, value);
          } else {
            notFound();
            break;
          }
        } else {
          notFound();
          break;
        }
      }
    }

    function notFound() {
      clearCurSelect();
      curSelect = type;
      itemsToLoad = [];
      showCards();
    }
  }
}

// Получение фильтров из адресной строки:

function getFiltersFromUrl() {
  if (!location.search) {
    return;
  }
  var filters = [];
  location.search.slice(1).split('&').forEach(el => {
    if (el && el.indexOf('=') >= 0) {
      filters.push(el);
    }
  });
  if (filters.length) {
    return filters;
  }
}

// Очистка всех фильтров:

function clearFilters(event) {
  if (event.currentTarget.classList.contains('disabled')) {
    return;
  }
  if (curSelect !== 'search') {
    getDocumentScroll();
    clearCurSelect();
    if (window.innerWidth > 1359) {
      getEl('#filters').querySelectorAll('.group').forEach(el => {
        if (el.classList.contains('default-open')) {
          el.classList.remove('close');
        } else {
          el.classList.add('close');
        }
      });
    }
    selectCards();
  }
}

//=====================================================================================================
//  Функции основных фильтров каталога:
//=====================================================================================================

// Инициализация фильтров каталога:

function initFiltersCatalog() {
  createCatalogFiltersData();
  initFilter('#filters', catalogFiltersData, selectFilterCatalog);
  catalogFiltersData = catalogFiltersData.filters;
  getEl('#filters .pop-up-body').id = 'catalog-filters';
}

// Переключение фильтров каталога на актуальные:

function toggleFiltersCatalog() {
  toggleFilterPosition();
  checkFiltersIsNeed();
  addTooltips('color');
}

// Переключение свойства открыт по умолчанию (если меняется от вкладки ко вкладке):

function toggleFilterPosition() {
  var toggleDefaultOpen = {
    // pageUrl вкладки: {ключ фильтра: true - открыт/false - закрыт}
    equip: {brand: true}
  };

  var filterItem, isOpen;
  for (var page in toggleDefaultOpen) {
    for (var key in toggleDefaultOpen[page]) {
      filterItem = getEl(`#catalog-filters .group[data-key="${key}"]`);
      if (filterItem) {
        isOpen = toggleDefaultOpen[page][key];
        if (isOpen) {
          if (page === pageUrl) {
            filterItem.classList.add('default-open');
          } else {
            filterItem.classList.remove('default-open');
          }
        } else {
          if (page === pageUrl) {
            filterItem.classList.remove('default-open');
          } else {
            filterItem.classList.add('default-open');
          }
        }
      }
    }
  }

  document.querySelectorAll(`#catalog-filters .switch.save[data-key]`).forEach(el => {
    if (el.classList.contains('default-open')) {
      el.classList.remove('close');
    } else {
      el.classList.add('close');
    }
  });
}

// Проверка необходимости пунктов фильтров на странице и обновление их содержимого:

function checkFiltersIsNeed() {
  var filters = JSON.parse(JSON.stringify(catalogFiltersData));
  var toggleDisplay = {
    // pageUrl: список ключей для скрытия
    'equip': ['cat', 'sizeREU', 'size_1252', 'size_39', 'size_38', 'size_1256', 'size_1260', 'size_60', 'size_1273', 'size_1274', 'size_1295', 'size1260', 'size60', 'size1273', 'size1274', 'size1295', 'size1313', 'length'], // Вся экипировка
    'equip/odegda': ['length'], // Одежда
    'equip/obuv': ['length'], // Обувь
    'equip/shlem': ['length'], // Шлемы
    'equip/optic': ['length'], // Оптика
    'equip/zashita': ['length'], // Защита
    'equip/sumruk': ['length'], // Сумки и рюкзаки
    'equip/merch': ['length'], // Мерчандайзинг
    'boats': ['material', 'power', 'step', 'fit', 'type'], // Лодки и моторы
    'boats/zip': ['material', 'power', 'step', 'fit', 'type'], // Запчасти
    'boats/acc': ['material', 'power', 'step', 'fit', 'type'], // Аксессуары
    'boats/propeller': ['cat'] // Винты гребные
  };

  var isExsist = false,
      filter, data;
  for (var k in filters) {
    filter = filters[k];
    if (filter.section) {
      for (var kk in filter.section) {
        data = filter.section[kk];
        check(kk);
      }
    } else {
      data = filter;
      check(k);
    }
  }
  fillFilter('#filters', filters);

  function check(key) {
    if (toggleDisplay[pageUrl] && toggleDisplay[pageUrl].indexOf(key) >= 0) {
      data.items = [];
    } else {
      data.items = data.items.filter(item => {
        isExsist = curItems.find(card => card[key] == item.value || card[item.value] == 1);
        if (isExsist) {
          if (item.items) {
            item.items = item.items.filter(subItem => {
              isExsist = curItems.find(card => card[key] == item.value && card.subcat == subItem.value);
              if (isExsist) {
                return true;
              }
            });
          }
          item.isBtn = item.items && item.items.length ? '' : 'hidden';
          return true;
        }
      });
    }
  }
}

// Добавление всплывающих подсказок к фильтрам каталога:

function addTooltips(key) {
  var elements = document.querySelectorAll(`.group[data-key=${key}] .switch-cont > .items > .item`);
  elements.forEach(el => {
    getEl('.text', el).dataset.tooltip = el.textContent.trim();
  });
}

// Выбор значения фильтра каталога:

function selectFilterCatalog(group, curEl) {
  var key = group.dataset.key,
      subkey = curEl.closest('.items').dataset.key,
      value = curEl.dataset.value;

  if (curEl.classList.contains('checked')) {
    var parentItem = curEl.closest('.items').closest('.item');
    if (parentItem) {
      addInFiltersInfo(key, parentItem.dataset.value, parentItem);
    }
    saveFilter(key, value, subkey);
    if (!subkey) {
      addInFiltersInfo(key, value, curEl);
    }
  } else {
    removeFilter(key, value, subkey);
    if (!subkey) {
      deleteFromFiltersInfo(key, value);
    }
  }
  var filters = getInfo('filters')[pageUrl];
  if (!filters || isEmptyObj(filters)) {
    selectCards('catalog');
    toggleToActualFilters();
  } else {
    selectCards('catalog', true);
  }
  createFiltersInfo();
}

// Добавление данных в хранилище о выбранных фильтрах:

function saveFilter(key, value, subkey) {
  var filters = getInfo('filters');
  if (!filters[pageUrl]) {
    filters[pageUrl] = {};
  }
  if (!filters[pageUrl][key]) {
    filters[pageUrl][key] = {};
  }
  if (subkey) {
    if (!filters[pageUrl][key][subkey]) {
      filters[pageUrl][key][subkey] = {};
    }
    if (!filters[pageUrl][key][subkey][value]) {
      filters[pageUrl][key][subkey][value] = {};
    }
  } else {
    if (!filters[pageUrl][key][value]) {
      filters[pageUrl][key][value] = {};
    }
  }
  saveInfo('filters', filters);
}

// Удаление данных из хранилища о выбранных фильтрах:

function removeFilter(key, value, subkey) {
  var filters = getInfo('filters');
  if (!subkey) {
    delete filters[pageUrl][key][value];
    if (isEmptyObj(filters[pageUrl][key])) {
      delete filters[pageUrl][key];
    }
  } else {
    delete filters[pageUrl][key][subkey][value];
    if (filters[pageUrl][key][subkey] && isEmptyObj(filters[pageUrl][key][subkey])) {
      filters[pageUrl][key][subkey] = {};
    }
  }
  saveInfo('filters', filters);
}

// Удаление данных из хранилища обо всех фильтрах:

function removeAllFilters() {
  var filters = getInfo('filters');
  delete filters[pageUrl];
  saveInfo(`filters`, filters);
}

// Блокировка неактуальных пунктов фильтра:

function toggleToActualFilters(filterKey, filterLength) {
  if (!filterKey) {
    document.querySelectorAll('#catalog-filters .item').forEach(item => item.classList.remove('disabled'));
    return;
  }
  if (filterLength === 1) {
    document.querySelectorAll(`#catalog-filters .group[data-key="${filterKey}"] .item`).forEach(item => item.classList.remove('disabled'));
  }
  var groups = document.querySelectorAll(`#catalog-filters .group:not([data-key="${filterKey}"])`),
      key, value, isItem, isSubitem;
  groups.forEach(group => {
    key = group.dataset.key;
    group.querySelectorAll('.content > .items > .item').forEach(item => {
      isItem = false;
      value = item.dataset.value;
      isItem = itemsToLoad.find(card => card[key] == value || card[value] == 1);
      if (isItem) {
        item.classList.remove('disabled');
        item.querySelectorAll('.subitem').forEach(subitem => {
          isSubitem = false;
          isSubitem = itemsToLoad.find(card => card.cat == value && card.subcat == subitem.dataset.value);
          if (isSubitem) {
            subitem.classList.remove('disabled');
          } else {
            subitem.classList.add('disabled');
          }
        });
      } else {
        item.classList.add('disabled');
        item.classList.add('close');
        if (item.classList.contains('checked')) {
          item.classList.remove('checked');
          item.querySelectorAll('.subitem').forEach(subitem => subitem.classList.remove('checked'));
          removeFilter(key, value);
          deleteFromFiltersInfo(key, value);
        }
      }
    });
  });
}

// Очистка фильтров каталога:

function clearFiltersCatalog(isClearStorage = true) {
  getEl('#catalog-filters').querySelectorAll('.item').forEach(el => {
    el.classList.remove('checked', 'disabled');
    el.classList.add('close');
  });
  getEl('#catalog-filters').querySelectorAll('.switch-cont > .items').forEach(el => {
    el.classList.remove('full');
  });
  clearFiltersInfo();
  if (isClearStorage) {
    removeAllFilters();
    removePositions();
  }
}

// Проверка сохраненных фильтров (выбор актуальаных и удаление неактуальных/ошибочных):

function checkFilters() {
  var filters = getInfo('filters'),
      pageFilters = filters[pageUrl];
  delete filters[pageUrl];
  saveInfo(`filters`, filters);
  if (!pageFilters || isEmptyObj(pageFilters)) {
    return;
  }
  var curItem;
  for (var k in pageFilters) {
    if (!k) {
      continue;
    }
    for (var kk in pageFilters[k]) {
      if (!kk) {
        continue;
      }
      curItem = getCurFilterItem(k, kk);
      if (curItem) {
        curItem.dispatchEvent(new CustomEvent('click', {'bubbles': true}));
        for (var kkk in pageFilters[k][kk]) {
          if (!kkk) {
            continue;
          }
          curItem = getCurFilterItem(k, kkk, kk);
          if (curItem) {
            curItem.dispatchEvent(new CustomEvent('click', {'bubbles': true}));
          }
        }
      }
    }
  }
}

// Поиск пункта фильтра на странице:

function getCurFilterItem(key, value, subkey) {
  var curItem;
  if (subkey) {
    curItem = getEl(`#catalog-filters [data-key="${key}"] [data-key="${subkey}"] [data-value="${value}"]`);
  } else {
    curItem = getEl(`#catalog-filters [data-key="${key}"] [data-value="${value}"]`);
  }
  return curItem;
}

//=====================================================================================================
//  Функции для работы с "пилюлями" основных фильтров каталога:
//=====================================================================================================

// Добавление данных в информацию о выбранных фильтрах:

function addInFiltersInfo(key, value, el) {
  var title = getEl('.text', el);
  if (title && !filterItems.find(item => item.key === key && item.value === value)) {
    filterItems.push({
      key: key,
      value: value,
      title: title.textContent
    });
  }
}

// Удаление фильтра из информации о выбранных фильтрах:

function deleteFromFiltersInfo(key, value) {
  var index = filterItems.findIndex(item => item.key === key && item.value === value);
  filterItems.splice(index, 1);
}

// Созание списка выбранных фильтров:

function createFiltersInfo() {
  fillTemplate({
    area: '#filters-info',
    items: filterItems
  });
  showElement('#filters-info', 'flex');
}

// Очистка информации о выбранных фильтрах:

function clearFiltersInfo() {
  filterItems = [];
  createFiltersInfo();
  hideElement('#filters-info');
}

// Снятие выбранного фильтра:

function changeFilterCatalog(event) {
  if (!event.target.classList.contains('pill')) {
    return;
  }
  var curItem = getCurFilterItem(event.target.dataset.key, event.target.dataset.value);
  if (curItem) {
    curItem.dispatchEvent(new CustomEvent('click', {'bubbles': true}));
  }
}

//=====================================================================================================
// Функции последовательных фильтров (подбора запчастей и адаптера):
//=====================================================================================================

// Инициализация последовательных фильтров:

function initFiltersStep () {
  if (cardsType !== 'zip') {
    return;
  }
  initStepFilter('manuf2', 'begin');
  if (pageId === 'snowbike') {
    initStepFilter('manuf1', 'begin');
  }
}

// Инициализация последовательного фильтра:

function initStepFilter(type, target) {
  if (!type) {
    return;
  }
  var filters = getEl('#filters .pop-up'),
      newFilter = document.createElement('div');
  newFilter.classList.add('pop-up-body', 'step');
  newFilter.dataset.html = `../modules/filters_${type}.html`;
  if (target === 'begin') {
    filters.insertBefore(newFilter, filters.firstElementChild.nextSibling);
  } else if (target === 'end') {
    filters.insertBefore(newFilter, filters.lastElementChild);
  }
  includeHTML();
  var selects = getEl(`#${type}-selects`);
  fillTemplate({
    area: selects,
    items: window[`${type}FiltersData`]
  });
  selects.querySelectorAll('.activate').forEach(el => {
    window[`${type}${el.dataset.key}Dropdown`] = initDropDown(el, selectFilterStep);
  });
}

// Заполнение последовательных фильтров актуальными данными:

function toggleFiltersStep() {
  if (cardsType !== 'zip') {
    return;
  }
  if (pageId === 'snowbike') {
    if (pageUrl === 'snowbike?kit') {
      hideElement('#manuf2');
    } else {
      showElement('#manuf2');
      fillFilterStep(getEl(`#manuf2-selects`).firstElementChild);
    }
    fillFilterStep(getEl(`#manuf1-selects`).firstElementChild);
  } else {
    fillFilterStep(getEl('#oem'));
    fillFilterStep(getEl(`#manuf2-selects`).firstElementChild);
  }
}

// Заполнение последовательного фильтра данными:

function fillFilterStep(filter) {
  if (!filter) {
    return;
  }
  var group = filter.closest('.group') || filter,
      selects = filter.closest('.selects'),
      isFirst = !selects || selects.firstElementChild === filter ? true : false,
      type = group.id,
      data = getFilterStepData(type, filter.dataset.key, isFirst);
  if (isFirst && !data.length) {
    hideElement(group);
  } else {
    fillTemplate({
      area: getEl('.items', filter),
      items: data,
      sign: '@@'
    });
    toggleFilterStep(type, filter, data.length);
    showElement(group);
  }
}

// Получение данных для заполнения выпадающих списков последовательного фильтра:

function getFilterStepData(type, dataKey, isFirst) {
  var data = [];
  type = type === 'oem' ? 'manuf2' : type;
  if (isFirst) {
    itemsToLoad = curItems;
  }
  var filters = getFilterStepItems(type);
  itemsToLoad.forEach(item => {
    if (item[type]) {
      item[type].forEach(el => {
        var isFound = checkManufEl(filters, el);
        if (isFirst || isFound) {
          getUniqManufValue(data, el[dataKey]);
        }
      });
    }
  });
  data.sort();
  return data;
}

// Блокировка/разблокировка пункта последовательного фильтра:

function toggleFilterStep(type, filter, dataLength) {
  var selects = filter.closest('.selects');
  if (!selects) {
    return;
  }
  if (dataLength) {
    unlockFilterStep(filter);
  } else {
    lockFilterStep(type, filter);
    if (selects.firstElementChild !== filter) {
      fillFilterStep(filter.nextElementSibling);
    }
  }
}

// Переключение блокировки пунктов фильтра, следующих за заполняемым:

function lockNextFilterStep(type, filter) {
  var nextFilter = filter.nextElementSibling;
  while (nextFilter) {
    lockFilterStep(type, nextFilter);
    nextFilter = nextFilter.nextElementSibling;
  }
}

// Разблокировка пункта последовательного фильтра:

function unlockFilterStep(filter) {
  filter.removeAttribute('disabled');
  setTimeout(() => getEl('.drop-down', filter).scrollTop = 0, 100);
}

// Блокировка пункта последовательного фильтра:

function lockFilterStep(type, filter) {
  window[`${type}${filter.dataset.key}Dropdown`].clear();
  filter.setAttribute('disabled', 'disabled');
}

// Выбор значения в дополнительном фильтре:

function selectFilterStep(event) {
  var type = event.currentTarget.closest('.group').id,
      filter = event.currentTarget;
  lockNextFilterStep(type, filter);
  selectCards(type, true);
  fillFilterStep(filter.nextElementSibling);
  changeStepFiltersInfo(type);
}

// Получение значений выбранных пунктов последовательного фильтра:

function getFilterStepItems(type) {
  var selects = getEl(`#${type}-selects`),
      filters = {};
  if (selects) {
    selects.querySelectorAll('.activate').forEach(el => {
      if (el.value) {
        filters[el.dataset.key] = el.value;
      }
    });
  }
  return filters;
}

// Очистка последовательных фильтров:

function clearFiltersStep(type) {
  if (!type) {
    return;
  }
  var filter = getEl(`#${type}-selects`);
  if (filter) {
    var firstSelect = filter.firstElementChild;
    window[`${type}${firstSelect.dataset.key}Dropdown`].clear();
    lockNextFilterStep(type, firstSelect);
    changeStepFiltersInfo(type);
  }
}

// Изменение данных о выбранных последовательных фильтрах:

function changeStepFiltersInfo(type) {
  var filters = getFilterStepItems(type),
      info = getEl('#step-info'),
      pill = getEl('.pill', info),
      text = '';
  if (isEmptyObj(filters)) {
    pill.textContent = text;
    hideElement(info);
  } else {
    Object.keys(filters).forEach((key, index) => {
      if (filters[key]) {
        if (index === 0) {
          text += filters[key];
        } else {
          text += ' – ' + filters[key];
        }
      }
    });
    pill.textContent = text;
    showElement(info);
  }
}

//=====================================================================================================
// Отбор карточек товаров фильтрами и поиском:
//=====================================================================================================

// Блокировка/разблокировка кнопок фильтра:

function toggleCatalogFilterBtns() {
  var clearBtn = getEl('.clear-filter.btn'),
      clearBtnAdaptive = getEl('#filters .clear-btn'),
      showBtn = getEl('#filters .btn.act'),
      showCount = getEl('span', showBtn),
      count = 0;
  if (curSelect && curSelect !== 'search') {
    count = itemsToLoad.length;
    clearBtn.classList.remove('disabled');
    showElement(clearBtnAdaptive, 'flex')
    showBtn.classList.remove('disabled');
    showCount.textContent = count;
  } else {
    clearBtn.classList.add('disabled');
    hideElement(clearBtnAdaptive);
    showBtn.classList.add('disabled');
    showCount.textContent = 0;
  }
}

// Запуск отбора карточек или очистка отбора:

function selectCards(search, textToFind) {
  var type = typeof search === 'object' ? 'search' : 'filter';
  if (type === 'search') {
    searchText = textToFind;
  }
  if (!search || !textToFind) {
    curSelect = null;
    itemsToLoad = curItems;
  } else {
    type = type === 'search' ? search.id : search;
    clearCurSelect(type);
    curSelect = type;
    startSelect(textToFind);
  }
  showCards();
  return itemsToLoad.length;
}

// Очистка текущего отбора:

function clearCurSelect(type, isClearStorage = true) {
  if (curSelect && type !== curSelect) {
    if (curSelect === 'catalog') {
      clearFiltersCatalog(isClearStorage);
    } else if (curSelect === 'search' || curSelect === 'oem') {
      clearSearch(`#${curSelect}`);
    } else {
      clearFiltersStep(curSelect);
    }
    itemsToLoad = curItems;
    curSelect = null;
    toggleCatalogFilterBtns();
  }
}

// Запуск отбора:

function startSelect() {
  if (!curSelect) {
    return;
  }
  if (curSelect === 'catalog') {
    selectCardsByFilterCatalog();
  } else if (curSelect === 'search') {
    selectCardsBySearchPage(searchText);
  } else if (curSelect === 'oem') {
    selectCardsBySearchOem(searchText);
  } else {
    selectCardsByFilterStep(curSelect);
  }
}

// Отбор карточек фильтром каталога:

function selectCardsByFilterCatalog() {
  var filters = getInfo('filters')[pageUrl];
  itemsToLoad = curItems;
  for (var k in filters) {
    itemsToLoad = itemsToLoad.filter(card => {
      for (var kk in filters[k]) {
        if (filters[k][kk] && !isEmptyObj(filters[k][kk])) {
          for (var kkk in filters[k][kk]) {
            if (card.cat == kk && card.subcat == kkk) {
              return true;
            }
          }
        } else {
          if (card[k] == kk || card[kk] == 1) {
            return true;
          }
        }
      }
    });
    toggleToActualFilters(k, Object.keys(filters).length);
  }
}

// Отбор карточек последовательным фильтром:

function selectCardsByFilterStep(type) {
  var filters = getFilterStepItems(type);
  itemsToLoad = curItems.filter(item => {
    if (item[type]) {
      for (var el of item[type]) {
        if (checkManufEl(filters, el)) {
          return true;
        }
      }
    }
  });
}

// Отбор карточек поиском по странице:

function selectCardsBySearchPage(textToFind) {
  var regExp = getRegExp(textToFind);
  itemsToLoad = curItems.filter(el => findByRegExp(el.search, regExp));
}

// Отбор карточек поиском по OEM:

function selectCardsBySearchOem(textToFind) {
  var oemList;
  itemsToLoad = curItems.filter(item => {
    if (item.oemList) {
      oemList = item.oemList.split(', ');
      if (oemList.find(el => el.trim().toLowerCase() == textToFind.toLowerCase())) {
        return true;
      }
    }
  });
}

//=====================================================================================================
//  Сортировка карточек товаров:
//=====================================================================================================

// Сортировка карточек товаров на странице:

function sortItems(event) {
  var key = event.currentTarget.value;
  if (key === '') {
    curItems = JSON.parse(JSON.stringify(window[`${pageUrl}Items`]));
    itemsToLoad = curItems;
    startSelect();
  } else {
    var type = key.indexOf('price') >= 0 ? 'numb' : 'text';
    curItems.sort(sortBy(key, type));
    itemsToLoad.sort(sortBy(key, type));
  }
  showCards();
}
