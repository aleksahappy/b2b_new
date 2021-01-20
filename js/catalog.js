'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Динамически изменяемые переменные:

var catalogType = pageId === 'equip' ? pageId : 'zip',
    pageUrl = pageId,
    view,
    userView,
    path,
    items = [],
    cartItems = {},
    curItems,
    itemsToLoad,
    filterItems = [],
    curSelect = null,
    searchText = null;

// Шаблоны карточек (сохраняем, потому что данные перезапишутся):

var minCard, bigCard;

// Данные для формирования вторго уровня меню:

var menuContent = {
  equip: {
    title: 'Экипировка',
    id: 'equip',
    cats: [{
      cat: 'odegda',
      cat_title: 'Одежда'
    }, {
      cat: 'obuv',
      cat_title: 'Обувь'
    }, {
      cat: 'shlem',
      cat_title: 'Шлемы'
    }, {
      cat: 'optic',
      cat_title: 'Оптика'
    }, {
      cat: 'snarag',
      cat_title: 'Снаряжение'
    }, {
      cat: 'zashita',
      cat_title: 'Защита'
    }, {
      cat: 'sumruk',
      cat_title: 'Сумки и рюкзаки'
    }, {
      cat: 'merch',
      cat_title: 'Мерчандайзинг'
    }]
  },
  boats: {
    title: 'Лодки и моторы',
    id: 'boats',
    cats: [{
      cat: 'zip',
      cat_title: 'Запчасти'
    }, {
      cat: 'acc',
      cat_title: 'Аксессуары'
    }, {
      cat: 'propeller',
      cat_title: 'Винты гребные'
    }]
  },
  snow: {
    title: 'Снегоходы',
    id: 'snow',
    cats: [{
      cat: 'zip',
      cat_title: 'Запчасти'
    }, {
      cat: 'acc',
      cat_title: 'Аксессуары'
    }]
  },
  snowbike: {
    title: 'Сноубайки',
    id: 'snowbike',
    cats: [{
      cat: 'kit',
      cat_title: 'Комплекты'
    }, {
      cat: 'adapter',
      cat_title: 'Адаптеры'
    }, {
      cat: 'zip',
      cat_title: 'Запчасти'
    }, {
      cat: 'acc',
      cat_title: 'Аксессуары'
    }]
  }
};

// Запускаем рендеринг страницы каталога:

startCatalogPage();

//=====================================================================================================
// При запуске страницы:
//=====================================================================================================

// Запуск страницы каталога:

function startCatalogPage() {
  setPaddingToBody();
  addCatalogModules();
  setCatalogEventListeners();
  fillCatalogHeader();
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
    sendRequest(`../json/${document.body.id}.json`)
    .then(
      result => {
        result = JSON.parse(result); //удалить
        for (var key in result) {
          window[key] = result[key];
        }
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

// Добавление обработчиков событий:

function setCatalogEventListeners() {
  window.addEventListener('resize', () => {
    setPaddingToBody();
    adaptMenu();
  });
  window.addEventListener('popstate', (event) => openPage(event));
  if (isCart) {
    window.addEventListener('focus', updateCart);
  }
  // var filters = getEl('#filters');
  // filters.addEventListener('mouseenter', (event) => {
  //   if (event.currentTarget.style.position !== 'static') {
  //     document.body.classList.add('no-scroll');
  //   }
  // });
  // filters.addEventListener('mouseleave', () => document.body.classList.remove('no-scroll'));
}

// Инициализация корзины (если есть):

function initCart() {
  if (isCart) {
    getCart()
    .then(result => {
      fillOrderForm();
      initForm('#order-form', sendOrder);
      return createCartData();
    }, reject => console.log(reject))
    .then(result => {
      initPage();
    })
    .catch(error => {
      console.log(error);
      loader.hide();
      alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
    });
  } else {
    initPage();
  }
}

// Инициализация страницы:

function initPage() {
  loader.hide();
  path = location.href.replace(/https*:\/\/[^\/]+\//g, '').replace(/\/[^\/]+.html/g, '').replace(/\//g, '').split('?').filter(el => el && el.indexOf('=') == -1);
  initDropDown('#gallery-sort', sortItems);
  initSearch('#search', selectCards);
  initSearch('#oem', selectCards);
  initSearch('#cart-search', findInCart);
  renderContent();
}

//=====================================================================================================
// Построение страницы:
//=====================================================================================================

// Построение каталога из модулей:

function addCatalogModules() {
  document.body.classList.add('main', catalogType);

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
  catalogGallery.dataset.html = `../modules/catalog_${catalogType}.html`;
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
  if (isCart) {
    cartSectionTemp = getEl('.cart-section');
    cartRowTemp = getEl('.cart-row');
  }
}

// Динамическое заполнение второго уровня меню:

function fillCatalogHeader() {
  var data = menuContent[document.body.id];
  fillTemplate({
    area: '#header-menu .container',
    items: data,
    sub: [{area: '.submenu-item', items: 'cats'}]
  });
  adaptMenu();
  getEl('#header-menu').style.visibility = 'visible';
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
  // items.sort(sortBy(('catid'))); // Сортировка по id категории:
}

// Преобразование данных по одному товару:

function convertItem(item) {
  addManufNewInfo(item);
  addManufInfo(item);
  addOemInfo(item);
  item.title = item.title.replace(/\s/g, ' ');
  item.isFree = item.free_qty > 0 ? '' : 'displayNone';
  item.isArrive = item.arrive_qty > 0 ? '' : 'displayNone';
  item.isDesc = item.desc ? '' : 'displayNone';
  item.search = [item.title, item.brand, item.cat, item.subcat]; // добавление данных для поиска по странице (далее в функциях будут дополняться)
  if (item.cat === 'Винты гребные') {
    item.propeller = '1';
  }
  addImgInfo(item);
  addActionInfo(item);
  addPriceInfo(item);
  addMarkupInfo(item);
  addSizeInfo(item);
  getDataForFilters(item);
  addOptionsInfo(item, optnames);
  addDescrInfo(item);
  addFiltersInfo(item);
  item.isOemList = item.oemList ? '' : 'displayNone';
  item.isManuf = item.manuf ? '' : 'displayNone';
  item.search = item.search.join(';').replace(/\s/g, ' ');
  return item;
}

// Преобразование данных о производителе для фильтров, построения таблицы и добавление данных об OEM (новый manuf):

function addManufNewInfo(item) {
  // item.oemList = '';
  Object.keys(item).forEach(key => {
    if (key !== 'manuf' && key.indexOf('manuf') == 0 && Array.isArray(item[key])) {
      item[key].forEach(el => {
        for (var key in el) {
          // if (key === 'oem') {
          //   item.oemList += el[key] + ';';
          // }
          if (el[key].indexOf(';') >= 0) {
            el[key] = el[key].split(';');
          }
        }
      });
    }
  });
  // item.oemList.slice(0, -1).replace(/;/g, ' ,');
}

// Преобразование данных о производителе для фильтров и построения таблицы:

function addManufInfo(item) {
  if (!item.manuf) {
    return;
  }
  var manufTable = [],
      manufTableRow,
      value;

  for (var man in item.manuf.man) {;
    manufTableRow = {};
    manufTableRow.man = man;

    for (var k in item.manuf) {
      if (k !== 'man') {
        value = [];
        for (var kk in item.manuf[k]) {
          for (var kkk in item.manuf[k][kk]) {
            if (kkk == man) {
              value.push(kk);
            }
          }
        }
        value = value.join(', ');
        if (value && k === 'years') {
          value = convertYears(value);
        }
        manufTableRow[k] = value || '&ndash;';
      }
    }
    manufTable.push(manufTableRow);
  }
  item.manuf_table = manufTable;
}

// Добавление данных об OEM:

function addOemInfo(item) {
  if (!item.manuf) {
    return;
  }
  item.oemList = [];
  for (var key in item.manuf.oem) {
    item.oemList.push(key);
  }
  item.oemList = item.oemList.join(', ');
}

// Проверка действия акции и добавление данных о ней:

function addActionInfo(item) {
  item.isAction = item.actiontitle ? '' : 'hidden';
  if (actions && item.action_id && item.action_id > 0) {
    var action = actions[item.action_id];
    if (action && (checkDate(action.begin, action.unending > 0 ? undefined : action.expire))) {
      item.actiontitle = action.title;
      item.actioncolor = action.color ? `#${action.color}` : '';
      item.actiondescr = action.descr;
      item.actionexpire = action.unending != 0 ? '' : `до: ${getDateStr(action.expire)}`;
      item.isAction = '';
      return;
    }
  }
  item.action_id = '0';
}

// Добавление данных о текущей цене и отображении/скрытии старой:

function addPriceInfo(item) {
  item.isOldPrice = 'displayNone',
  item.price_cur = item.price,
  item.price_cur1 = item.price1;
  if (item.price_user1 !== item.price_action1) {
    if (cartId.indexOf('preorder') >= 0 && item.preorder_id && item.price_preorder1 > 0) {
      item.isOldPrice = '';
      item.price_cur = item.price_preorder;
      item.price_cur1 = item.price_preorder1;
    } else if (item.action_id && item.price_action1 > 0) {
      item.isOldPrice = '';
      item.price_cur = item.price_action;
      item.price_cur1 = item.price_action1;
    }
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
      arrive_date: item.arrive_date
    };
  }
  var size;
  for (var key in item.sizes) {
    size = item.sizes[key];
    size.size = typeof size.size === 'string' ? size.size : 'OS';
    size.total_qty = parseInt(size.free_qty || 0, 10) + parseInt(size.arrive_qty || 0, 10);
    size.isFree = size.free_qty > 0 ? '' : 'displayNone';
    size.isArrive = size.arrive_qty > 0 ? '' : 'displayNone';

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
  if (item.desc) {
    item.desc = item.desc.replace(/\\n/g, '');
    item.describe.push({title: 'Описание товара', info: item.desc,});
  }
  if (item.actiondescr) {
    item.actiondescr = item.actiondescr.replace(/\\n/g, '');
    item.describe.push({title: 'Условия акции', info: item.actiondescr, isClose: 'close'});
  }
  if (item.defect_desc) {
    item.defect_desc = item.defect_desc.replace(/\\n/g, '');
    item.describe.push({title: 'Описание дефекта', info: item.defect_desc, isClose: 'close'});
  }
  delete item.actiondescr;
  delete item.defect_desc;
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
  if (window.innerWidth > 1280) {
    var container = getEl('#header-menu .container'),
        searchWidth = location.search === '?cart' ? 0 : 5,
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
  if (window.innerWidth > 1280) {
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

// Изменение URL без перезагрузки страницы:

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
    path = event.currentTarget.href.replace(/https*:\/\/[^\/]+\//g, '').replace(/\/[^\/]+.html/g, '').replace(/\//g, '').split('?').filter(el => el && el.indexOf('=') == -1);
    if (path.length === oldPath.length && JSON.stringify(oldPath) === JSON.stringify(path)) {
      return;
    }
    window.history.pushState({'path': path},'', event.currentTarget.href);
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
  if (location.search === '?cart' || view === 'product') {
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
  var filters = getFiltersFromUrl();
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
  setValueDropDown('#gallery-sort', '-price_cur1');
  clearCurSearch();
  showElement('#search', 'flex');
  showElement('#header-catalog');
  showElement('#content', 'flex');
  toggleEventListeners('on');
  toggleFilters(filters);
  toggleView(window.innerWidth > 499 && view ? view : 'blocks');
  showCards();
}

// Получение фильтров из адресной строки:

function getFiltersFromUrl() {
  if (!location.search) {
    pageUrl = pageId;
    return;
  }
  var filters = [];
  location.search.split('?').forEach(el => {
    if (el) {
      if (el.indexOf('=') >= 0) {
        filters.push(el);
      } else {
        pageUrl = pageId + '?' + el;
      }
    }
  });
  return filters;
}

// Очистка текущего поиска:

function clearCurSearch() {
  if (!curSelect) {
    return;
  }
  if (curSelect === 'search' || curSelect === 'oem') {
    clearSearch(`#${curSelect}`);
  }
  curSelect = null;
  itemsToLoad = curItems;
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
    loadCards(itemsToLoad)
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
    document.querySelectorAll('.big-card').forEach(card => {
      renderCarousel(getEl('.carousel', card));
      checkCart(card);
      addActionTooltip(card);
    });
  }
  if (view === 'blocks') {
    document.querySelectorAll('.min-card').forEach(card => {
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
    pill.dataset.tooltip = actions[id].descr ? actions[id].descr : '';
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
  var data = findItemData(id, 'catalog');
  if (!data) {
    loader.hide();
    return;
  }

  addDetailsInfo(data)
  .then(result => {
    var fullCardContainer;
    if (data.kit == 1) {
      fullCardContainer = getEl('.full-card-kit');
    } else {
      fullCardContainer = getEl('.full-card-container');
    }

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
        area: '.describe',
        items: 'describe'
      }]
    });

    if (catalogType === 'zip') {
      if (data.details) {
        fillTemplate({
          area: '#details',
          items: data.details,
          sign: '@'
        });
        initSearch('#detail-search', detailsSearch);
      } else {
        getEl('.card-details', fullCardContainer).remove();
      }
    }

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
  });
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
// Применяемость деталей:
//=====================================================================================================

// Добавление информации о применяемости деталей:

function addDetailsInfo(data) {
  return new Promise(resolve => {
    if (catalogType !== 'zip') {
      resolve();
    }
    if (data.details) {
      resolve();
    }
    sendRequest(`../json/details.json`)
    // sendRequest(urlRequest.main, 'item_models', {id: data.object_id})
    .then(result => {
      if (result) {
        result = JSON.parse(result);
        var details = [];
        result.forEach((el, index) => {
          details[index] = '';
          if (el.brand) {
            details[index] += el.brand;
          }
          if (el.year) {
            details[index] += ' — ' + el.year;
          }
          if (el.model) {
            details[index] += ' — ' + el.model;
          }
        });
        data.details = details;
        resolve();
      } else {
        throw new Error('Пустой ответ.');
      }
    })
    .catch(error => {
      // console.log(error);
      resolve();
    })
  });
}

// Поиск по применяемости:

function detailsSearch(search, textToFind) {
  var data = items.find(el => el.object_id == getEl('.full-card').dataset.id);
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

//=====================================================================================================
//  Общие функции для работы с фильтрами:
//=====================================================================================================

// Инициализация всех фильтров галереи:

function initFilters() {
  initFiltersCatalog();
  initFiltersStep();
}

// Переключение фильтров галереи на актуальные:

function toggleFilters(filters) {
  toggleFiltersCatalog();
  toggleFiltersStep();
  showElement('#filters-container');
  setFilterOnPage(filters);
  clearFiltersInfo();
  checkPositions();
  checkFilters();
  createFiltersInfo();
}

// Установка на страницу фильтров из поисковой строки:

function setFilterOnPage(filters) {
  if (!filters || !filters.length) {
    return;
  }
  removeInfo('filters');
  var filterData;
  filters.forEach(filter => {
    filterData = decodeURI(filter).toLowerCase().split('=');
    if (filterData[0].indexOf('manuf') === 0) {
      filterData[1] = filterData[1].replace('_', ' ');
      setValueDropDown(`#${filterData[0].replace('manuf_', '')}`, filterData[1])
    } else {
      var key, value;
      getEl('#catalog-filters').querySelectorAll('.group').forEach(el => {
        key = el.dataset.key;
        if (key.toLowerCase() == filterData[0]) {
          getEl('#catalog-filters').querySelectorAll('.switch-cont > .items > .item', el).forEach(item => {
            value = item.dataset.value;
            if (value.toLowerCase() == filterData[1]) {
              saveFilter(key, value);
            }
          });
        }
      });
    }
  });
}

// Очистка всех фильтров:

function clearFilters(event) {
  if (event.currentTarget.classList.contains('disabled')) {
    return;
  }
  if (curSelect !== 'search') {
    getDocumentScroll();
    clearCurSelect();
    if (window.innerWidth > 1280) {
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
  var addDefaultOpen = {
    // pageUrl вкладки: список ключей где добавить открытие по умолчанию
    'equip': ['brand']
  };

  var filterItem;
  for (var key in addDefaultOpen) {
    addDefaultOpen[key].forEach(el => {
      filterItem = getEl(`#catalog-filters .group[data-key="${el}"]`);
      if (filterItem) {
        if (key === pageUrl) {
          filterItem.classList.add('default-open');
        } else {
          filterItem.classList.remove('default-open');
        }
      }
    });
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
    'equip?odegda': ['length'], // Одежда
    'equip?obuv': ['length'], // Обувь
    'equip?shlem': ['length'], // Шлемы
    'equip?optic': ['length'], // Оптика
    'equip?zashita': ['length'], // Защита
    'equip?sumruk': ['length'], // Сумки и рюкзаки
    'equip?merch': ['length'], // Мерчандайзинг
    'boats': ['material', 'power', 'step', 'fit', 'type'], // Лодки и моторы
    'boats?zip': ['material', 'power', 'step', 'fit', 'type'], // Запчасти
    'boats?acc': ['material', 'power', 'step', 'fit', 'type'], // Аксессуары
    'boats?propeller': ['cat'] // Винты гребные
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

function clearFiltersCatalog() {
  getEl('#catalog-filters').querySelectorAll('.item').forEach(el => {
    el.classList.remove('checked', 'disabled');
    el.classList.add('close');
  });
  getEl('#catalog-filters').querySelectorAll('.switch-cont > .items').forEach(el => {
    el.classList.remove('full');
  });
  removeAllFilters();
  removePositions();
  clearFiltersInfo();
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
  if (catalogType !== 'zip') {
    return;
  }
  initStepFilter('manuf2', 'begin');
  if (pageId === 'snowbike') {
    initStepFilter('manuf1', 'end');
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
  if (catalogType !== 'zip') {
    return;
  }
  fillFilterStep(getEl('#oem'));
  fillFilterStep(getEl(`#manuf2-selects`).firstElementChild);
  if (pageId === 'snowbike') {
    fillFilterStep(getEl(`#manuf1-selects`).firstElementChild);
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

function getFilterStepData(type, key, isFirst) {
  var data = [];
  type = type === 'oem' ? 'manuf2' : type;
  if (isFirst) {
    itemsToLoad = curItems;
  }
  var isFound, value,
      filters = getFilterStepItems(type);
  itemsToLoad.forEach(item => {
    if (item[type]) {
      item[type].forEach(el => {
        for (var k in filters) {
          isFound = false;
          value = el[k];
          if (value) {
            if (Array.isArray(value)) {
              value.forEach(el => {
                if (el.trim().toLowerCase() === filters[k].toLowerCase()) {
                  isFound = true;
                }
              });
            } else if (value.trim().toLowerCase() === filters[k].toLowerCase()) {
              isFound = true;
            }
          }
          if (!isFound) {
            break;
          }
        }
        if (isFirst || isFound) {
          value = el[key];
          if (value) {
            if (Array.isArray(value)) {
              value.forEach(el => {
                addValue(el)
              });
            } else {
              addValue(value);
            }
          }
        }
      });
    }
  });

  function addValue(value) {
    value = value.trim();
    if (value && !data.find(el => el.toLowerCase() === value.toLowerCase())) {
      data.push(value);
    }
  }

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
  var filter = getEl(`#${type}-selects`).firstElementChild;
  window[`${type}${filter.dataset.key}Dropdown`].clear();
  lockNextFilterStep(type, filter);
  changeStepFiltersInfo(type);
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

// Запуск отбора карточек или сброс отбора:

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

function clearCurSelect(type) {
  if (curSelect && type !== curSelect) {
    if (curSelect === 'catalog') {
      clearFiltersCatalog();
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
  var isFound, value,
      filters = getFilterStepItems(type);
  itemsToLoad = curItems.filter(item => {
    if (item[type]) {
      for (var info of item[type]) {
        for (var key in filters) {
          isFound = false;
          value = info[key];
          if (value) {
            if (Array.isArray(value)) {
              value.forEach(el => {
                if (el.trim().toLowerCase() === filters[key].toLowerCase()) {
                  isFound = true;
                }
              });
            } else if (value.trim().toLowerCase() === filters[key].toLowerCase()){
              isFound = true;
            }
          }
          if (!isFound) {
            break;
          }
        }
        if (isFound) {
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
  itemsToLoad = curItems.filter(item => {
    if (item.manuf) {
      for (var k in item.manuf.oem) {
        if (k.toLowerCase().trim() == textToFind.toLowerCase().trim()) {
          return true;
        }
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
