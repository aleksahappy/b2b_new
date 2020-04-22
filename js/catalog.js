'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Области с шаблонами карточки товара в галерее (сохраняем, потому что эти данные перезапишутся):

var minCard = getEl('.min-card'),
    bigCard = getEl('.big-card');

// Динамически изменяемые переменные:

var view = 'list',
    pageUrl = pageId,
    path,
    cartItems = {},
    curItems,
    selectedItems = '',
    filterItems = [],
    curSearch = null;

// Запускаем рендеринг страницы каталога:

startCatalogPage();

//=====================================================================================================
// При запуске страницы:
//=====================================================================================================

// Запуск страницы каталога:

function startCatalogPage() {
  if (view != 'product') {
    convertItems();
  }
  if (isCart) {
    window.addEventListener('focus', updateCart);
    if (view === 'product') {
      getItems(location.search.replace('?',''))
      .then(
        result => {
          window.items = [result];
          convertItems();
          showPage();
        },
        reject => {
          loader.hide();
          message.show('Данные не загружены.');
        }
      )
    } else {
      showPage();
    }
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initPage();
    });
  }
}

// Запуск инициализации страницы:

function showPage() {
  getCart()
  .then(result => {
    initPage();
    checkFullnessItems();
  })
  .catch(err => {
    console.log(err);
    initPage();
  });
}

// Инициализация страницы при открытии сайта:

function initPage() {
  loader.hide();
  // !!! НЕ ЗНАЮ ОТКУДА БРАТЬ ХЛЕБНЫЕ КРОШКИ НА ОТДЕЛЬНОЙ СТРАНИЦЕ ТОВАРА
  path = location.search.split('?').map(el => {
    if (el == '') {
      return pageId;
    } else {
      return el;
    }
  });
  renderContent();
  initDropDown('gallery-sort', sortItems);
}

//=====================================================================================================
// // Преобразование исходных данных:
//=====================================================================================================

// Фильтрация:
// - входящих данных для страниц ЗИПа

// Добавление:
// - данных для поиска по странице
// - данных о картинке в малой карточке
// - данных о текущей цене
// - общего количества

// Преобразование:
// - данных о картинках в карточке товара из строки в массив;
// - данных для фильтров по производителю
// - данных о годах в укороченный формат

// Создание:
// - объекта в разрезе размеров для корзины

// Преобразование всех данных при загрузке страницы:

function convertItems() {
  if (!window.items) {
    return;
  }
  if (pageId == 'boats') {
    items = items.filter(el => el.lodkimotor == 1);
  }
  if (pageId == 'snow') {
    items = items.filter(el => el.snegohod == 1);
  }
  items.forEach(item => convertItem(item));
  items.sort(dynamicSort(('catId')));  // Сортировка по id категории:
}

// Преобразование данных по одному товару:

function convertItem(item) {
  if (item.manuf) {// Преобразование данных о производителе из JSON в объект:
    var manuf;
    try {
      manuf = JSON.parse(item.manuf);
    } catch(error) {
      item.manuf = 0;
    }
    item.manuf = manuf;
  }
  item.title = item.title.replace(/\s/, ' ').replace(/\u00A0/g, ' ');
  item.isManuf = item.manuf && Object.keys(item.manuf.man).length > 1  ? '' : 'displayNone';
  item.isDesc = item.desc ? '' : 'displayNone';
  addImgInfo(item);
  addActionInfo(item);
  addPriceInfo(item);
  addMarkupInfo(item);
  addSizeInfo(item);
  addOptionsInfo(item);
  addManufInfo(item);
  addSearchInfo(item);
}

// Преобразование и добавление данных о картинках:

function addImgInfo(item) {
  item.images = item.images.toString().split(';');
  item.image = `http://b2b.topsports.ru/c/productpage/${item.images[0]}.jpg`;
}

// Проверка действия акции и добавление данных о ней:

function addActionInfo(item) {
  if (item.action_id > 0) {
    if (window.actions) {
      var action = actions[item.action_id];
      if (action && checkDate(action.begin, action.expire)) {
        item.actiontitle = action.title;
        item.actioncolor = '#' + action.color;
        if (action.descr) {
          item.action_descr = action.descr;
          item.action_tooltip = action.descr.replace(/<br>/gi, '&#10')
        }
      } else {
        item.action_id = '0';
      }
    }
  }
  item.actiontitle = item.actiontitle || '';
  item.isAction = item.actiontitle ? '' : 'hidden';
  item.isActionDescr = item.action_descr ? '' : 'dispayNone';
}

// Добавление данных о текущей цене и отображении/скрытии старой:

function addPriceInfo(item) {
  var isNewPrice;
  if (cartId.indexOf('preorder') >= 0) {
    isNewPrice = item.preorder_id && item.price_preorder1 > 0 ? true : false;
    item.price_cur = isNewPrice ? item.price_preorder : item.price;
    item.price_cur1 = isNewPrice ? item.price_preorder1 : item.price1;
    if (website === 'skipper') {
      item.isHiddenPrice = isNewPrice ? '' : 'displayNone';
    } else {
      item.isOldPrice = isNewPrice ? '' : 'hidden';
      item.isBorder = isNewPrice ? '' : 'borderNone';
    }
  } else {
    isNewPrice = item.action_id && item.price_action1 > 0 ? true : false;
    item.price_cur = isNewPrice ? item.price_action : item.price;
    item.price_cur1 = isNewPrice ? item.price_action1 : item.price1;
    if (website === 'skipper') {
      item.isHiddenPrice = isNewPrice ? '' : 'displayNone';
    } else {
      item.isOldPrice = isNewPrice ? '' : 'hidden';
      item.isBorder = isNewPrice ? '' : 'borderNone';
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
    size.size = size.size || '';
    size.total_qty = parseInt(size.free_qty, 10) + parseInt(size.arrive_qty, 10);
    size.isClick = cartId === 'equip' ? '' : 'click';
    size.isFree = size.free_qty > 0 ? '' : 'displayNone';
    size.isArrive = size.arrive_qty > 0 ? '' : 'displayNone';
    size.isWarehouse = size.warehouse_qty > 0 ? '' : 'displayNone';

    var sizeObj = cartItems['id_' + size.object_id] = Object.assign({}, size);
    sizeObj.isAvailable = size.total_qty > 0 ? '' : 'not-available';
    sizeObj.image = item.image;
    sizeObj.title = item.title;
    sizeObj.options = size.size ? `(${item.options[40]}, ${size.size})` : '';
    sizeObj.price_cur = item.price_cur;
    sizeObj.price_cur1 = item.price_cur1;
    sizeObj.price_user = item.price_user ;
    sizeObj.price_user1 = item.price_user1;
    sizeObj.action_id = item.action_id;
    sizeObj.action_name = sizeObj.total_qty > 0 ? (item.actiontitle ? item.actiontitle: 'Cклад') : 'Нет в наличии';
    // sizeObj.action_name = item.actiontitle || 'Cклад';
  }
}

// Добавление данных для создания списка характеристик:

function addOptionsInfo(item) {
  if (!item.options || item.options == 0) {
    return;
  }
  var options = [], option;
  for (var key in item.options) {
    option = item.options[key];
    if (key == 32) {
      option = convertYears(item.options[key]);
    } else {
      option = option
      .replace(/\,/gi, ', ')
      .replace(/\//gi, '/ ')
    }
    if ((key == 7 || key == 31 || key == 32 || key == 33) && !item.isManuf) {
      continue;
    } else {
      options.push({
        optitle: optnames[key],
        option: option
      });
    }
  }
  item.options = options;
}

// Преобразование данных о производителе для фильтров и построения таблицы:

function addManufInfo(item) {
  if (!item.manuf) {
    return;
  }
  if (!item.isManuf) {
    var manufTable = [],
        manufTableRow;
  }
  var manuf = [],
      manufRow,
      value;
  for (var man in item.manuf.man) {
    manufRow = {};
    manufRow.man = [man];
    if (!item.isManuf) {
      manufTableRow = {};
      manufTableRow.man = man;
    }

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
        manufRow[k] = value;
        if (!item.isManuf) {
          value = value.join(', ');
          if (value && k === 'years') {
            value = convertYears(value);
          }
          manufTableRow[k] = value || '&ndash;';
        }
      }
    }
    manuf.push(manufRow);
    if (!item.isManuf) {
      manufTable.push(manufTableRow);
    }
  }
  if (!item.isManuf) {
    item.manuf_table = manufTable;
  }
  item.manuf_filter = manuf;
}

// Добавление данных для поиска по странице (использовать после addSizeInfo, addOptionsInfo и addManufInfo):

function addSearchInfo(item) {
  item.search = [item.title, item.brand, item.cat, item.subcat];
  for (let key in item.sizes) {
    item.search.push(item.sizes[key].articul);
  }
  for (let key in item.options) {
    item.search.push(item.options[key].option.replace('"', ''));
  }
  if (item.manuf) {
    for (var k in item.manuf) {
      for (var kk in item.manuf[k]) {
      item.search.push(kk);
      }
    }
  }
  item.search = item.search.join(',').replace(/\s/, ' ').replace(/\u00A0/g, ' '); // Замена любых пробельных символов на пробелы
}

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Настройка каруселей:

var fullCardCarousel = {
  isNav: true,
  durationNav: 400,
  isLoupe: true
};

var fullImgCarousel = {
  durationNav: 400
};

// Установка ширины галереи и малых карточек товаров:

function setContentWidth() {
  var minCardWidth;
  if (website === 'skipper') {
    minCardWidth = 13;
    setGalleryWidth();
    setMinCardWidth(minCardWidth);
  } else {
    minCardWidth = 18;
    setMinCardWidth(minCardWidth);
  }
}

// Установка ширины галереи:

function setGalleryWidth() {
  gallgetEl('gallery').style.width = (getEl('content').clientWidth - getEl('filters').clientWidth - 30) + 'px';
}

// Установка ширины малых карточек товаров:

function setMinCardWidth(width) {
  if (view === 'list') {
    return;
  }
  var gallery = getEl('gallery'),
      standartWidth = (width * parseInt(getComputedStyle(gallery).fontSize, 10)),
      countCards = Math.floor(gallery.clientWidth / standartWidth),
      restGallery = gallery.clientWidth - countCards * standartWidth,
      changeMinCard = restGallery / countCards,
      minCardWidth = 0;
  if (changeMinCard <= 110) {
    minCardWidth = Math.floor(standartWidth + changeMinCard);
  } else {
    countCards = countCards + 1;
    minCardWidth = gallery.clientWidth / countCards;
  }
  var cards = document.querySelectorAll('.min-card');
  cards.forEach(minCard => {
    minCard.style.width = minCardWidth + 'px';
  });
}

// Изменение позиционирования меню фильтров:

function setFiltersPosition() {
  if (window.innerWidth > 767) {
    var gallery = getEl('gallery'),
        filters = getEl('filters'),
        menuFilters = getEl('catalog-filters');
    if (filters.style.position == 'fixed') {
      if (menuFilters.clientHeight >= gallery.clientHeight) {
        filters.style.position = 'static';
        filters.style.top = '0px';
        filters.style.height = 'auto';
      } else {
        setFiltersHeight();
      }
    } else {
      if (menuFilters.clientHeight < gallery.clientHeight) {
        filters.style.position = 'fixed';
        setFiltersHeight();
      }
    }
  }
}

// Установка высоты меню фильтров:

function setFiltersHeight() {
  var filters = getEl('filters'),
      scrolled = window.pageYOffset || document.documentElement.scrollTop,
      headerHeight = getEl('.header').clientHeight,
      footerHeight = Math.max((window.innerHeight + scrolled - getEl('.footer').offsetTop) + 20, 0),
      filtersHeight = window.innerHeight - headerHeight - footerHeight;
  filters.style.top = headerHeight + 'px';
  filters.style.maxHeight = filtersHeight + 'px';
}

//=====================================================================================================
// Динамическая смена URL и данных на странице:
//=====================================================================================================

// Изменение URL без перезагрузки страницы:

window.addEventListener('popstate', (event) => openPage(event));

function openPage(event) {
  event.preventDefault();
  if (event.type == 'popstate') {
    if (event.state) {
      path = event.state.path;
    } else {
      return;
    }
  } else {
    var oldPath = path,
        newUrl = event.currentTarget.dataset.href.split('?');
    path = Array.from(getEl('.header-menu').querySelectorAll('.active'))
      .filter(el => el.dataset.level < event.currentTarget.dataset.level)
      .map(el => el.dataset.href);
    path = path.concat(newUrl);

    if (path.length === oldPath.length && JSON.stringify(oldPath) === JSON.stringify(path)) {
      return;
    }

    var urlPath = path
      .map(el => {
        if (el == pageId) {
          return location.href.split('?')[0];
        } else {
          return '?' + el;
        }
      })
      .join('');

    window.history.pushState({'path': path},'', urlPath);
  }
  renderContent();
}

// Изменение контента страницы:

function renderContent() {
  if (path[path.length - 1].indexOf('=') >= 0) {
    path.pop();
  }
  changePageTitle();
  toggleMenuItems();
  createDinamicLinks();
  createMainNav();
  if (path[path.length - 1] === 'cart') {
    renderCart();
  } else if (view === 'product') {
    renderProductPage();
  } else {
    renderGallery();
  }
  setPaddingToBody();
  setDocumentScroll(0);
}

// Изменение заголовка страницы:

function changePageTitle() {
  var title = '',
      curTitle = getEl(`.header-menu [data-href="${path[path.length - 1]}"]`);
  if (view === 'product') {
    title += items[0].title;
  } else if (curTitle) {
    title += curTitle.dataset.title;
  }
  document.title = 'ТОП СПОРТС - ' + title;
  var pageTitle = getEl('page-title');
  if (pageTitle) {
    pageTitle.textContent = title;
  }
}

// Изменение активных разделов меню:

function toggleMenuItems() {
  document.querySelectorAll('.header-menu .active').forEach(item => item.classList.remove('active'));
  path.forEach(key => {
    var curTitle = getEl(`.header-menu [data-href="${key}"]`);
    if (curTitle) {
      curTitle.classList.add('active');
    }
  });
}

// Добавление ссылок в разделы меню:

function createDinamicLinks() {
  document.querySelectorAll('.dinamic').forEach(item => {
    var curTitle = getEl(`.header-menu .active[data-level="${item.dataset.level - 1}"]`);
    if (curTitle) {
      item.href = curTitle.href + '?' + item.dataset.href;
    }
  });
}

// Изменение хлебных крошек:

function createMainNav() {
  var data = {items: []},
      curTitle;
  path.forEach(el => {
    curTitle = getEl(`.header-menu [data-href="${el}"]`);
    if (curTitle) {
      var item = {
        href: view === 'product' ? '#': curTitle.href,
        dataHref: el,
        level: curTitle.dataset.level,
        title: view === 'product' ? items[0].title: curTitle.dataset.title
      };
      data.items.push(item);
    }
  });
  fillTemplate({
    area: 'main-nav',
    items: data,
    sub: [{
      area: '.item',
      items: 'items'
    }]
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
  changeContent('product');
}

// Создание контента галереи:

function renderGallery() {
  var local = location.search,
      filter;
  if (location.search && location.search.indexOf('=') >= 0) {
    local = location.search.split('?');
    filter = local.pop();
    local = local.join('?');
  }
  pageUrl = local ? pageId + local : pageId;
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
  changeContent('gallery');
  if (!curItems.length) {
    hideElement('header-content');
    hideElement('content');
    return;
  }
  clearCurSearch();
  clearDropDown('gallery-sort');
  initFilters(filter);
  showCards();
  setContentWidth();
}

// Скрытие неактуальных частей страницы:

function changeContent(page) {
  if (page === 'cart') {
    hideElement('header-content');
    hideElement('page-search-icon');
    showElement('main-header');
    hideElement('main-info');
    hideElement('content');
    hideElement('filters-container');
    hideElement('gallery');
    hideElement('gallery-notice');
    toggleEventListeners(page);
  } else if (page === 'product') {
    showElement('main-header');
    showElement('content', 'flex');
  } else if (page === 'gallery') {
    hideElement('cart');
    showElement('header-content');
    showElement('page-search-icon');
    if (website === 'skipper') {
      showElement('main-header', 'table');
    } else {
      hideElement('main-header');
    }
    showElement('main-info', 'flex');
    showElement('content', 'flex');
    toggleEventListeners(page);
  }
}

// Добавление/удаление обработчиков событий на странице:

function toggleEventListeners(page) {
  if (page === 'cart') {
    window.removeEventListener('scroll', scrollGallery);
    window.removeEventListener('resize', scrollGallery);
    window.removeEventListener('resize', setContentWidth);
    window.removeEventListener('scroll', setFiltersPosition);
    window.removeEventListener('resize', setFiltersPosition);
  } else if (page === 'gallery') {
    window.addEventListener('scroll', scrollGallery);
    window.addEventListener('resize', scrollGallery);
    window.addEventListener('resize', setContentWidth);
    window.addEventListener('scroll', setFiltersPosition);
    window.addEventListener('resize', setFiltersPosition);
  }
}

// Инициализация фильтров всех фильтров галереи:

function initFilters(filter) {
  initFiltersCatalog();
  initFiltersZip();
  setFilterOnPage(filter);
  clearFiltersInfo();
  checkFiltersPosition();
  checkFilters();
  createFiltersInfo();
}

// Добавление фильтра из поисковой строки:

function setFilterOnPage(filter) {
  if (!filter) {
    return;
  }
  var key, value;
  removeInfo('filters');
  var filterData = decodeURI(filter).toLowerCase().split('=');
  if (filterData[0].indexOf('manuf') === 0) {
    filterData[1] = filterData[1].replace('_', ' ');
    setValueDropDown(filterData[0].replace('manuf_', ''), filterData[1])
  } else {
    getEl('catalog-filters').querySelectorAll('.filter-item').forEach(el => {
      key = el.dataset.key;
      value = el.dataset.value;
      if (key.toLowerCase() == filterData[0] && value.toLowerCase() == filterData[1]) {
        saveFilter(key, value);
      }
    });
  }
}

// Очистка результатов текущего поиска:

function clearSearchResult() {
  selectedItems = '';
  clearCurSearch();
  selectCardsByFilterCatalog();
  showCards();
}

// Очистка текущего поиска:

function clearCurSearch(search) {
  if (search !== curSearch) {
    selectedItems = '';
    if (curSearch === 'page') {
      clearSearchPage();
    } else if (curSearch === 'zip') {
      clearFiltersZip();
    } else if (curSearch === 'oem') {
      clearSearchOem();
    }
    curSearch = null;
  }
}

// Повторение текущего поиска:

function repeatCurSearch() {
  if (curSearch === 'page') {
    selectCardsBySearchPage();
  } else if (curSearch === 'zip') {
    selectCardsByFilterZip();
  } else if (curSearch === 'oem') {
    selectCardsBySearchOem();
  } else {
    selectCardsByFilterCatalog();
  }
  showCards();
}

//=====================================================================================================
//  Функции для создания фильтров каталога:
//=====================================================================================================

// Инициализация фильтров каталога:

function initFiltersCatalog() {
  hideElement('filters-container');
  var data = checkFiltersIsNeed();
  fillTemplate({
    area: 'catalog-filters',
    items: data,
    sub: [{
      area: '.filter-item.item',
      items: 'items',
      sub: [{
        area: '.filter-item.subitem',
        items: 'items',
      }]
    }]
  });
  showElement('filters-container');
  addTooltips('color');
}

// Проверка необходимости фильтров на странице и добавление необходимых данных:

function checkFiltersIsNeed() {
  var data = JSON.parse(JSON.stringify(catalogFiltersData)),
      isExsist = false;
  data = data.filter(filter => {
    if (filter.items) {
      filter.items = filter.items.filter(item => {
        isExsist = curItems.find(card => card[filter.key] == item.value || card[item.value] == 1);
        if (isExsist) {
          if (item.items) {
            item.items = item.items.filter(subItem => {
              isExsist = curItems.find(card => card[filter.key] == item.value && card.subcat == subItem.value);
              if (isExsist) {
                return true;
              }
            });
          }
          if (item.items && !isEmptyObj(item.items)) {
            item.isBtn = '';
          } else {
            item.isBtn = 'hidden';
          }
          return true;
        }
      });
    }
    if (filter.items && !isEmptyObj(filter.items)) {
      if (filter.key === 'cat' && pageId === 'equip' && !location.search) {
        return;
      }
      if (filter.key === 'brand' && pageId === 'equip' && location.search) {
        filter.isOpen = false;
      }
      filter.isOpen = filter.isOpen && window.innerWidth >= 767 ? 'default-open' : 'close';
      return true;
    }
  });
  return data;
}

//=====================================================================================================
//  Функции для работы с фильтрами каталога:
//=====================================================================================================

// Свернуть/развернуть фильтр:

function toggleFilter(event) {
  var curFilter;
  if (event.target.closest('.filter-title')) {
    curFilter = event.currentTarget;
    if (curFilter.classList.contains('close')) {
      curFilter.classList.remove('close');
      saveFilterPosition(curFilter.id, 'open');
    } else {
      curFilter.classList.add('close');
      saveFilterPosition(curFilter.id, 'close');
    }
  }
}

// Свернуть/развернуть подфильтр:

function toggleFilterItem(event) {
  var filterItem = event.currentTarget.closest('.filter-item');
  if (filterItem.classList.contains('disabled')) {
    return;
  }
  filterItem.classList.toggle('close');
}

// Выбор значения фильтра каталога:

function selectFilterCatalog(event) {
  event.stopPropagation();
  var curEl;
  if (event.currentTarget.classList.contains('result')) {
    if (!event.target.classList.contains('close')) {
      return;
    }
    curEl = getEl(`[data-key="${event.currentTarget.dataset.key}"][data-value="${event.currentTarget.dataset.value}"]`, 'catalog-filters');
  } else {
    if (!event.target.closest('.filter-item-title') || event.currentTarget.classList.contains('disabled')) {
      return;
    }
    curEl = event.currentTarget;
  }
  getDocumentScroll();
  clearCurSearch();
  var key = curEl.dataset.key,
      value = curEl.dataset.value,
      subkey = curEl.dataset.subkey;

  if (curEl.classList.contains('checked')) {
    curEl.classList.remove('checked');
    curEl.classList.add('close');
    curEl.querySelectorAll('.filter-item.checked').forEach(subItem => subItem.classList.remove('checked'));
    removeFilter(key, value, subkey);
    if (!subkey) {
      deleteFromFiltersInfo(key, value);
    }
  } else {
    curEl.classList.add('checked');
    curEl.classList.remove('close');
    var filterItem = curEl.closest('.filter-item.item');
    if (filterItem && !filterItem.classList.contains('checked')) {
      filterItem.classList.add('checked');
      addInFiltersInfo(filterItem.dataset.key, filterItem.dataset.value, filterItem);
    }
    saveFilter(key, value, subkey);
    if (!subkey) {
      addInFiltersInfo(key, value, curEl);
    }
  }
  var filters = getInfo('filters')[pageUrl];
  if (!filters || isEmptyObj(filters)) {
    selectedItems = '';
  } else {
    selectCardsByFilterCatalog(filters);
  }
  showCards();
  toggleToActualFilters(event.currentTarget);
  createFiltersInfo();

  if (window.innerWidth >= 767) {
    if (getEl('filters').style.position === 'static') {
      setDocumentScroll();
    }
  } else {
    setDocumentScroll();
  }
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
  filters[pageUrl] = {};
  saveInfo(`filters`, filters);
}

// Сохранение данных в хранилище о состоянии фильтров (открыт/закрыт):

function saveFilterPosition(key, value) {
  var positions = getInfo('positions', 'sessionStorage');
  if (!positions[pageUrl]) {
    positions[pageUrl] = {};
  }
  if (value) {
    positions[pageUrl][key] = value;
  }
  saveInfo('positions', positions, 'sessionStorage');
}

// Удаление данных из хранилища обо всех состояниях фильтров (открыт/закрыт):

function removeAllFilterPosition() {
  var positions = getInfo('positions', 'sessionStorage');
  positions[pageUrl] = {};
  saveInfo(`positions`, positions, 'sessionStorage');
}

// Отбор карточек фильтром каталога:

function selectCardsByFilterCatalog(filters) {
  filters = filters || getInfo('filters')[pageUrl];
  var isFound;
  selectedItems = curItems.filter(card => {
    for (let k in filters) {
      isFound = false;
      for (let kk in filters[k]) {
        if (filters[k][kk] && !isEmptyObj(filters[k][kk])) {
          for (let kkk in filters[k][kk]) {
            if (card.cat == kk && card.subcat == kkk) {
              isFound = true;
            }
          }
        } else {
          if (card[k] == kk || card[kk] == 1) {
            isFound = true;
          }
        }
      }
      if (!isFound) {
        return false;
      }
    }
    return true;
  });
}

// Блокировка неактуальных фильтров:

function toggleToActualFilters(filter) {
  var curArray = selectedItems === '' ? curItems : selectedItems,
      menuFilters = getEl('catalog-filters'),
      curFilters = menuFilters.querySelectorAll(`.filter-item.item.checked[data-key="${filter.dataset.key}"]`),
      checked = menuFilters.querySelectorAll(`.filter-item.item.checked`),
      filterItems;

  if (checked.length == 0) {
    menuFilters.querySelectorAll(`.filter-item.item`).forEach(item => {
      item.classList.remove('disabled');
      item.querySelectorAll('.subitem').forEach(subitem => {
        subitem.classList.remove('disabled');
      });
    });
    return;
  }

  if (curFilters.length > 0) {
    filterItems = menuFilters.querySelectorAll(`.filter-item.item:not([data-key="${filter.dataset.key}"])`);
  } else {
    filterItems = menuFilters.querySelectorAll(`.filter-item.item`);
  }

  var key, value, isExsist, isFound;
  filterItems.forEach(item => {
    isExsist = false;
    key = item.dataset.key;
    value = item.dataset.value;

    if (checked.length == 1 && key == checked[0].dataset.key) {
      item.classList.remove('disabled');
      item.querySelectorAll('.subitem').forEach(subitem => {
        subitem.classList.remove('disabled');
      });
    } else {
      isExsist = curArray.find(card => {
        if (card[key] == value || card[value] == 1) {
          item.classList.remove('disabled');
          return true;
        }
      });
      if (!isExsist) {
        item.classList.add('disabled');
        item.classList.add('close');
        if (item.classList.contains('checked')) {
          item.classList.remove('checked');
          item.querySelectorAll('.subitem').forEach(subitem => {
            subitem.classList.remove('checked');
          });
          removeFilter(key, value);
          deleteFromFiltersInfo(key, value);
        }
      }
      item.querySelectorAll('.subitem').forEach(subitem => {
        isFound = false;
        isFound = curArray.find(card => {
          if (card.cat == value && card.subcat == subitem.dataset.value) {
            subitem.classList.remove('disabled');
            return true;
          }
        });
        if (!isFound) {
          subitem.classList.add('disabled');
        }
      });
    }
  });
}

// Очистка фильтров каталога:

function clearFilters() {
  var menuFilters = getEl('catalog-filters');
  if (!getEl('.checked', menuFilters)) {
    return;
  }
  getDocumentScroll();
  removeAllFilters();
  removeAllFilterPosition();
  clearFiltersInfo();

  menuFilters.querySelectorAll('.filter-item').forEach(el => {
    el.classList.remove('checked', 'disabled');
    if (el.classList.contains('default-open')) {
      el.classList.remove('close');
    } else {
      el.classList.add('close');
    }
  });

  if (curSearch) {
    return;
  }
  selectedItems = '';
  showCards();
  setDocumentScroll();
}

// Проверка сохраненных положений фильтров:

function checkFiltersPosition() {
  var positions = getInfo('positions', 'sessionStorage')[pageUrl],
      curEl;
  if (positions) {
    for (let key in positions) {
      curEl = getEl(key);
      if (curEl) {
        if (positions[key] == 'close') {
          curEl.classList.add('close');
        } else {
          curEl.classList.remove('close');
        }
      }
    }
  }
}

// Выбор сохраненных фильтров на странице или их удаление если их больше нет на странице:

function checkFilters() {
  var info = getInfo('filters'),
      filters = info[pageUrl];
  if (!filters || isEmptyObj(filters)) {
    return;
  }
  var curFilters = {},
      curFilter,
      curItem;
  for (var k in filters) {
    curFilters[k] = {};
    for (var kk in filters[k]) {
      curFilters[k][kk] = {};
      curItem = getCurFilterItem(k, kk);
      if (curItem) {
        selectCardsByFilterCatalog(curFilters);
        changeFilterClass(curItem);
        for (var kkk in filters[k][kk]) {
          curFilters[k][kk][kkk] = {};
          curItem = getCurFilterItem(k, kkk, kk);
          if (curItem) {
            selectCardsByFilterCatalog(curFilters);
            changeFilterClass(curItem);
          } else {
            delete info[pageUrl][k][kk][kkk];
          }
        }
        if (isEmptyObj(info[pageUrl][k][kk])) {
          info[pageUrl][k][kk] = {};
        }
      } else {
        delete info[pageUrl][k][kk];
      }
    }
    if (isEmptyObj(info[pageUrl][k])) {
      delete filters[pageUrl][k];
    } else {
      curFilter = getEl(`filter-${k}`);
      if (curFilter) {
        curFilter.classList.remove('close');
      }
    }
  }
  saveInfo('filters', info);
}

// Поиск фильтра на странице:

function getCurFilterItem(key, value, subkey) {
  var curItem;
  if (subkey) {
    curItem = getEl(`[data-subkey="${subkey}"][data-value="${value}"]`, 'catalog-filters');
  } else {
    curItem = getEl(`[data-key="${key}"][data-value="${value}"]`, 'catalog-filters');
    addInFiltersInfo(key, value, curItem);
  }
  return curItem;
}

// Визуальное отображение сохраненных фильтров:

function changeFilterClass(curItem) {
  if (curItem) {
    curItem.classList.add('checked');
    var filterItem = curItem.closest('.filter-item');
    if (filterItem) {
      filterItem.classList.remove('close');
    }
    toggleToActualFilters(curItem);
  }
}

//=====================================================================================================
//  Функции для работы с данными о выбранных фильтрах:
//=====================================================================================================

// Добавление фильтра в информацию о выбранных фильтрах:

function addInFiltersInfo(key, value, el) {
  filterItems.push({
    key: key,
    value: value,
    title: getEl('.item-title', el).textContent
  });
}

// Удаление фильтра из информации о выбранных фильтрах:

function deleteFromFiltersInfo(key, value) {
  var index = filterItems.findIndex(item => item.key === key && item.value === value);
  filterItems.splice(index, 1);
}

// Созание списка выбранных фильтров:

function createFiltersInfo() {
  fillTemplate({
    area: 'filters-info',
    items: filterItems
  });
  setPaddingToBody();
}

// Очистка информации о выбранных фильтрах:

function clearFiltersInfo() {
  filterItems = [];
  createFiltersInfo();
}

//=====================================================================================================
//  Функции для создания и заполнения данными фильтров запчастей:
//=====================================================================================================

// Создание и инициализация работы фильтров запчастей:

function initFiltersZip() {
  var zipFilters = getEl('zip-filters');
  if (!zipFilters) {
    return;
  }
  if (website !== 'skipper' && path[path.length - 1] !== 'zip') {
    hideElement(zipFilters);
    return;
  }
  fillTemplate({
    area: getEl('.zip-selects', zipFilters),
    items: zipFiltersData,
    sub: [{area: '.activate', items: 'selects'}]
  });
  showElement(zipFilters);
  zipFilters.querySelectorAll('.activate').forEach(el => initDropDown(el, selectFilterZip))
  fillFilterZip('man');
  fillFilterZip('oem');
}

// Заполнение выпадающего списка вариантов фильтра/поиска:

function fillFilterZip(key) {
  var data = getFilterZipData(key);
  if (data.length) {
    fillTemplate({
      area: `${key}-list`,
      items: data
    });
    unlockFilterZip(key);
  } else {
    lockFilterZip(key);
    if (key === 'years') {
      fillFilterZip('model');
    }
  }
}

// Разблокировка фильтра:

function unlockFilterZip(key) {
  var filter = getEl(key);
  if (filter) {
    filter.removeAttribute('disabled');
  }
}

// Блокировка фильтра:

function lockFilterZip(key) {
  var filter = getEl(key);
  if (filter) {
    clearDropDown(key);
    filter.setAttribute('disabled', 'disabled');
  }
}

// Подготовка данных для создания списка вариантов фильтра/поиска:

function getFilterZipData(key) {
  var curArray = curItems;
  if (website === 'skipper') {
    curArray = items;
  }
  if (key !== 'man' && key !== 'oem') {
    curArray = selectedItems;
  }
  var data = [];
  curArray.forEach(item => {
    if (item.manuf) {
      for (let k in item.manuf[key]) {
        if (key === 'man' || key === 'oem') {
          if (data.indexOf(k.trim()) === -1) {
            data.push(k);
          }
        } else {
          for (let kk in item.manuf[key][k]) {
            if (kk === getEl('man').value && data.indexOf(k.trim()) === -1) {
              data.push(k);
            }
          }
        }
      }
    }
  });
  data.sort();
  return data;
}

//=====================================================================================================
//  Функции для работы с фильтрами запчастей и поиском по запчастям:
//=====================================================================================================

// Выбор значения фильтра запчастей:

function selectFilterZip(event) {
  clearCurSearch('zip');
  selectCardsByFilterZip();
  curSearch = 'zip';
  showCards();
  var filter = event.currentTarget.id;
  if (filter === 'man') {
    getEl('zip-filters-clear').classList.add('active');
    fillFilterZip('years');
    lockFilterZip('model');
  } else if (filter === 'years') {
    fillFilterZip('model');
  }
}

// Отбор карточек фильтром запчастей:

function selectCardsByFilterZip() {
  var curArray = curItems;
  if (website === 'skipper') {
    curArray = items;
  }
  var filters = getFiltersZip(),
      isFound;
  selectedItems = curArray.filter(card => {
    if (card.manuf_filter) {
      for (var row of card.manuf_filter) {
        for (var key in filters) {
          isFound = false;
          if (row[key] && row[key].indexOf(filters[key]) >= 0) {
            isFound = true;
          }
        }
        if (isFound) {
          return true;
        }
      }
    }
  });
}

// Получение значений выбранных фильтров:

function getFiltersZip() {
  var filters = {};
  getEl('zip-filters').querySelectorAll('.activate').forEach(el => {
    if (el.value) {
      filters[el.id] = el.value;
    }
  });
  return filters;
}

// Очистка фильтров запчастей:

function clearFiltersZip() {
  getEl('zip-filters-clear').classList.remove('active');
  clearDropDown('man')
  lockFilterZip('years');
  lockFilterZip('model');
}

// Отображение текущего списка OEM:

function showOemList() {
  var oemToFind = getEl('oem-search-input').value.trim();
  if (oemToFind === '') {
    closeOemHints();
    return;
  }
  showElement('oem-dropdown');

  var regEx = RegExp(oemToFind, 'gi'),
      allOem = Array.from(document.querySelectorAll('#oem-list .item'));

  allOem.forEach(el => hideElement(el));
  var curOemList = allOem.filter(el => el.dataset.value.search(regEx) >= 0);

  if (curOemList.length > 0) {
    showElement('oem-list');
    hideElement('oem-not-found');
    curOemList.forEach(el => showElement(el));
  } else {
    hideElement('oem-list');
    showElement('oem-not-found');
  }
}

// Выбор OEM из списка:

function selectOem(event) {
  getEl('oem-search-input').value = event.currentTarget.dataset.value;
  findOem(event);
}

// Поиск по OEM:

function findOem(event) {
  event.preventDefault();
  clearCurSearch('oem');
  selectCardsBySearchOem();
  showCards();
  curSearch = 'oem';
  showElement('oem-search-clear');
}

// Отбор карточек поиском по OEM:

function selectCardsBySearchOem() {
  var input = getEl('oem-search-input'),
      oem = input.value.trim();
  input.dataset.value = input.value;
  selectedItems = curItems.filter(item => {
    if (item.manuf) {
      for (var k in item.manuf.oem) {
        if (k == oem) {
          return true;
        }
      }
    }
  });
}

// Очистка поиска по OEM:

function clearSearchOem() {
  var input = getEl('oem-search-input');
  input.value = input.dataset.value = '';
  hideElement('oem-search-clear');
  closeOemHints();
}

// Удаление значения из поиска OEM при его фокусе и скрытие подсказок:

function onFocusOemInput(input) {
  onFocusInput(input);
  closeOemHints();
}

// Восстановление последнего найденного значения в поиске OEM при потере им фокуса и скрытие подсказок:

function onBlurOemInput(input) {
  setTimeout(() => {
    onBlurInput(input);
    closeOemHints();
  }, 100);
}

// Скрытие подсказок в поиске OEM:

function closeOemHints() {
  hideElement('oem-dropdown');
  hideElement('oem-list');
  hideElement('oem-not-found');
}

//=====================================================================================================
//  Функции для создания галереи:
//=====================================================================================================

// Создание карточек товаров из массива:

var countItems = 0,
    countItemsTo = 0,
    itemsToLoad,
    incr;

function loadCards(cards) {
	if (cards) {
    countItems = 0;
    itemsToLoad = cards;
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
  var list = fillTemplate({
    area: view === 'list' ? bigCard : minCard,
    source: 'outer',
    items: data,
    sub: view === 'list'
        ? [{
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
        : undefined,
    action: 'return'
  });

  var gallery = getEl('gallery');
  if (countItems === 0) {
    gallery.innerHTML = list;
  } else {
    gallery.insertAdjacentHTML('beforeend', list);
  }
  setFiltersPosition();
  setContentWidth();

  if (view === 'list') {
    document.querySelectorAll('.big-card').forEach(card => {
      renderCarousel(getEl('.carousel', card));
      checkCart(card);
    });
  }
  if (view === 'blocks') {
    document.querySelectorAll('.min-card').forEach(card => {
      checkImg(card);
      checkCart(card);
    });
  }
}

// Проверка загружено ли изображение и вставка заглушки при отсутствии изображения:

function checkImg(element) {
  getEl('img', element).addEventListener('error', (event) => {
    event.currentTarget.src = '../img/no_img.jpg';
  });
}

// Проверка загруженности всех изображений карусели и отображение карусели:

function renderCarousel(carousel, curImg = 0) {
  return new Promise((resolve, reject) => {
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
      if (carousel.querySelectorAll('img').length === 0) {
        getEl('.carousel-gallery', carousel).insertAdjacentHTML('beforeend', '<div class="carousel-item"><img src="../img/no_img.jpg"></div>');
        startCarouselInit(carousel, curImg);
      }
      startCarouselInit(carousel, curImg);
      resolve('карусель готова');
    }
  });
}

//=====================================================================================================
//  Функции для работы с карточками товаров:
//=====================================================================================================

// Отображение карточек на странице:

function showCards() {
  if (curItems.length && selectedItems === '') {
    loadCards(curItems);
    showElement('gallery', 'flex');
    hideElement('gallery-notice');
  } else {
    if (selectedItems.length === 0) {
      showElement('gallery-notice', 'flex');
      hideElement('gallery');
      setFiltersPosition();
    } else {
      loadCards(selectedItems)
      showElement('gallery', 'flex');
      hideElement('gallery-notice');
    }
  }
  setDocumentScroll(0);
}

// Добавление новых карточек при скролле страницы:

function scrollGallery() {
  var scrolled = window.pageYOffset || document.documentElement.scrollTop;
  if (scrolled * 2 + window.innerHeight >= document.body.clientHeight) {
    loadCards();
  }
}

// Переключение вида отображения карточек на странице:

function toggleView(event, newView) {
  if (view != newView) {
    getEl(`.view-${view}`).classList.remove('active');
    event.currentTarget.classList.add('active');
    view = newView;
    var gallery = getEl('gallery');
    gallery.style.opacity = '0';
    showCards();
    gallery.style.opacity = '1';
  }
}

// Раскрытие в полный размер большой карточки:

function openBigCard(event) {
  var curCard = event.currentTarget.closest('.big-card');
  curCard.classList.toggle('open');
  if (curCard.classList.contains('open')) {
    event.currentTarget.setAttribute('tooltip', 'Свернуть');
  } else {
    event.currentTarget.setAttribute('tooltip', 'Раскрыть');
  }
  setFiltersPosition();
}

// Сворачивание большой карточки:

function closeBigCard(event) {
  var curCard = event.currentTarget.closest('.big-card');
  if (window.innerWidth < 767) {
    if (!(event.target.classList.contains('toggle-btn') || event.target.closest('.carousel') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
      curCard.classList.remove('open');
      getEl('.toggle-btn', curCard).setAttribute('tooltip', 'Раскрыть');
      setFiltersPosition();
    }
  }
}

// Отображение полной карточки товара:

function showFullCard(id) {
  event.preventDefault();
  loader.show();
  var fullCardContainer = getEl('full-card-container');
  openPopUp(fullCardContainer);
  fullCardContainer.style.opacity = 0;
  fillTemplate({
    area: fullCardContainer,
    items: curItems.find(item => item.object_id == id),
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
  loader.hide();
  fullCardContainer.style.opacity = 1;
}

// Отображение картинки полного размера на экране:

function showFullImg(event, id) {
  if (event.target.classList.contains('control')) {
    return;
  }
  var fullCardContainer = getEl('full-card-container'),
      fullImgContainer = getEl('full-img-container');
  if (fullCardContainer && (!fullCardContainer.style.display || fullCardContainer.style.display === 'none')) {
    getDocumentScroll();
  }
  showElement(fullImgContainer);
  fullImgContainer.style.opacity = 0;
  loader.show();

  fillTemplate({
    area: fullImgContainer,
    items: curItems.find(item => item.object_id == id),
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
      loader.hide();
      fullImgContainer.style.opacity = 1;
    }
  );
  document.body.classList.add('no-scroll');
}

// Скрытие картинки полного размера:

function closeFullImg(event) {
  if (event.target.classList.contains('control')) {
    return;
  }
  loader.hide();
  hideElement('full-img-container');
  var fullCardContainer = getEl('full-card-container');
  if (!fullCardContainer.style.display || fullCardContainer.style.display === 'none') {
    document.body.classList.remove('no-scroll');
    setDocumentScroll();
  }
}

//=====================================================================================================
//  Сортировка карточек товаров:
//=====================================================================================================

// Сортировка карточек товаров на странице:

function sortItems(event) {
  var prop = event.currentTarget.value;
  if (prop === 'default') {
    curItems = JSON.parse(JSON.stringify(window[`${pageUrl}Items`]));
    if (selectedItems !== '') {
      repeatCurSearch();
    }
    clearDropDown('gallery-sort');
  } else {
    curItems.sort(dynamicSort(prop));
    if (selectedItems !== '') {
      selectedItems.sort(dynamicSort(prop));
    }
    showCards();
  }
}

//=====================================================================================================
// Поиск на странице:
//=====================================================================================================

// Поиск по странице:

function findOnPage(event) {
  event.preventDefault();
  clearCurSearch('page');
  selectCardsBySearch();
  showCards();
  curSearch = 'page';
  hideElement('filters-info');
  showElement('search-info', 'flex');
  showElement('page-search-clear');
}

// Отбор карточек поиском по странице:

function selectCardsBySearch() {
  var textToFind = getEl('page-search-input').value.trim();
  var regExpSearch = new RegExp(textToFind, 'gi');
  selectedItems = curItems.filter(el => el.search.search(regExpSearch) >= 0);
  getEl('search-text').textContent = textToFind;
  getEl('search-count').textContent = selectedItems.length;
}

// Очистка поиска по странице:

function clearSearchPage() {
  getEl('page-search').classList.remove('open');
  hideElement('page-search-clear');
  hideElement('search-info');
  showElement('filters-info', 'flex');
  getEl('page-search-input').value = '';
}

// Разворачивание поля поиска в шапке сайта:

function openPageSearch() {
  getEl('page-search').classList.add('open');
  var input = getEl('page-search-input');
  onFocusInput(input);
  input.focus();
}
