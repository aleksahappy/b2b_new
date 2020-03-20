'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var pageSearch = document.getElementById('page-search'),
    zipSelect = document.getElementById('zip-select'),
    mainHeader = document.getElementById('main-header'),
    mainInfo = document.getElementById('main-info'),
    content = document.getElementById('content'),
    headerContent = document.getElementById('header-content'),
    filtersContainer = document.getElementById('filters-container'),
    filters = document.getElementById('filters'),
    menuFilters = document.getElementById('menu-filters'),
    filtersInfo = document.getElementById('filters-info'),
    gallery = document.getElementById('gallery'),
    galleryNotice = document.getElementById('gallery-notice'),
    fullCardContainer = document.getElementById('full-card-container'),
    fullImgContainer = document.getElementById('full-img-container');

if (pageSearch) {
  var pageSearchInput = document.getElementById('page-search-input'),
      pageSearchInfo = document.getElementById('search-info'),
      clearPageSearchBtn = pageSearch.querySelector('.close.icon'),
      pageSearchIcon = document.getElementById('page-search-icon');
}
if (zipSelect) {
  var selectMan = document.getElementById('select-man'),
      selectYears = document.getElementById('select-years'),
      selectModel = document.getElementById('select-model'),
      manDropDown = new DropDown(selectMan),
      yearsDropDown = new DropDown(selectYears),
      modelDropDown = new DropDown(selectModel),
      clearZipFilterBtn = zipSelect.querySelector('.zip-filters').querySelector('.close.icon'),
      oemSearch = document.getElementById('oem-search'),
      oemSearchInput = document.getElementById('oem-search-input'),
      oemDropdown =  document.getElementById('oem-dropdown'),
      oemList = document.getElementById('oem-list'),
      oemNotFound = document.getElementById('oem-not-found'),
      clearOemSearchBtn = oemSearch.querySelector('.close.icon');
  // Обработчики событий:
  selectMan.addEventListener('change', selectCardsZipFilter);
  selectYears.addEventListener('change', selectCardsZipFilter);
  selectModel.addEventListener('change', selectCardsZipFilter);
}

// Области с шаблонами карточки товара в галерее:

var minCard = document.querySelector('.min-card'),
    bigCard = document.querySelector('.big-card');

// Получение шаблонов из HTML:

if (zipSelect) {
  var selectManufItemTemplate = selectMan.querySelector('.drop-down').innerHTML,
      oemListTemplate = oemList.innerHTML;
}
if (menuFilters) {
  var filterTemplate = menuFilters.querySelector('.filter').outerHTML,
      filterItemTemplate = menuFilters.querySelector('.filter-item').outerHTML,
      filterSubitemTemplate = menuFilters.querySelector('.filter-item.subitem').outerHTML;
}
if (filtersInfo) {
  var duplicateFilterTemplate = filtersInfo.innerHTML;
}

// Динамические переменные:

var pageUrl = pageId,
    view = 'list',
    cardTemplate,
    items,
    cardItems,
    cartItems = {},
    curItems,
    selectedItems = '',
    zipFilterData = {};

//=====================================================================================================
// При запуске страницы:
//=====================================================================================================

if (view != 'product') {
  convertItems();
}

if (isCart) {
  window.addEventListener('focus', updateCart);

  if (view === 'product') {
    getProduct(location.search.replace('?',''))
    .then(
      result => {
        items = [result];
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

// Запуск инициализации страницы:

function showPage() {
  getCart()
  .then(result => {
    initPage();
  })
  .catch(err => {
    console.log(err);
    initPage();
  });
}

//=====================================================================================================
// Запросы на сервер:
//=====================================================================================================

// Получение данных о конкретном товаре:

function getProduct(id) {
  return new Promise((resolve, reject) => {
    sendRequest('urlRequest' + 'product' + id)
    .then(
      result => {
        var product = JSON.parse(result);
        resolve(product);
      }
    )
    .catch(error => {
      reject();
    })
  });
}

//=====================================================================================================
// // Преобразование исходных данных:
//=====================================================================================================
// Добавление:
// - данных для поиска по странице
// - данных о картинке в малой карточке
// - данных о текущей цене
// - общего количества

// Преобразование:
// - данных о картинках в карточке товара из строки в массив;
// - данных о годах в укороченный формат

// Создание:
// - объекта в разрезе размеров для корзины

function convertItems() {
  // Фильтрация входящих данных для страниц ЗИПа:
  if (pageId == '_boats') {
    items = items.filter(el => el.lodkimotor == 1);
  }
  if (pageId == '_snow') {
    items = items.filter(el => el.snegohod == 1);
  }

  cardItems = JSON.parse(JSON.stringify(items));

  var itemSearch, size, id, options, option, manuf, isManuf, manufRow, value;
  cardItems.forEach(item => {

    // Добавление данных для поиска по странице:
    itemSearch = JSON.parse(JSON.stringify(item));
    delete itemSearch.desc;
    item.search = convertToString(itemSearch);

    // Преобразование и добавление данных о картинках:
    item.images = item.images.toString().split(';');
    item.image = `http://b2b.topsports.ru/c/productpage/${item.images[0]}.jpg`;

    // Добавление данных о текущей цене и отображение/скрытие старой:
    if (cartId.indexOf('preorder') >= 0) {
      item.price_cur = item.price_preorder1 > 0 ? item.price_preorder : item.price;
      item.price_cur1 = item.price_preorder1 > 0 ? item.price_preorder1 : item.price1;
      if (website === 'skipper') {
        item.isHiddenPrice = item.price_preorder1 > 0 ? '' : 'displayNone';
      } else {
        item.isOldPrice = item.price_preorder1 > 0 ? '' : 'hidden';
        item.isBorder = item.price_preorder1 > 0 ? '' : 'borderNone';
      }
    } else {
      item.price_cur = item.price_action1 > 0 ? item.price_action : item.price;
      item.price_cur1 = item.price_action1 > 0 ? item.price_action1 : item.price1;
      if (website === 'skipper') {
        item.isHiddenPrice = item.price_action1 > 0 ? '' : 'displayNone';
      } else {
        item.isOldPrice = item.price_action1 > 0 ? '' : 'hidden';
        item.isBorder = item.price_action1 > 0 ? '' : 'borderNone';
      }
    }

    // Добавление данных о торговой наценке:
    item.markup = ((item.price_user1 - item.price_cur1) / item.price_cur1 * 100).toFixed(0);

    // Добавление данных для создания размеров и общего количества:
    if (!item.sizes || item.sizes == 0) {
      item.sizes = {};
      item.sizes[0] = {
        articul: item.articul,
        object_id: item.object_id,
        free_qty: item.free_qty,
        arrive_qty: item.arrive_qty,
        arrive_date: item.arrive_date,
      };
    }
    for (let key in item.sizes) {
      size = item.sizes[key];
      size.total_qty = parseInt(size.free_qty, 10) + parseInt(size.arrive_qty, 10);
      size.isClick = size.size ? '' : 'click';
      size.isFree = size.free_qty > 0 ? '' : 'displayNone';
      size.isArrive = size.arrive_qty > 0 ? '' : 'displayNone';
      size.isWarehouse = size.warehouse_qty > 0 ? '' : 'displayNone';

      //Создание объекта в разрезе размеров для корзины:
      id = item.sizes[key].object_id;
      cartItems['id_' + id] = Object.assign({}, size);
      cartItems['id_' + id].id = id;
      for (let key in item) {
        if (key === 'object_id' || key !== 'sizes' && !cartItems['id_' + id][key]) {
          cartItems['id_' + id][key] = item[key];
        }
      }
    }

    // Преобразование данных о производителе из JSON в объект:
    if (item.manuf) {
      try {
        manuf = JSON.parse(item.manuf);
      } catch(error) {
        item.manuf = 0;
      }
      item.manuf = manuf;
    }

    // Нужно ли заполнять таблицу о производителе:
    isManuf = item.manuf && Object.keys(item.manuf.man).length > 1 ? true : false;

    // Добавление данных для создания списка характеристик:
    if (item.options && item.options != 0) {
      options = [];
      for (let key in item.options) {
        option = item.options[key];
        if (key == 32) {
          option = convertYears(item.options[key]);
        } else {
          option = option
          .replace(/\,/gi, ', ')
          .replace(/\//gi, '/ ')
        }
        if ((key == 7 || key == 31 || key == 32 || key == 33) && isManuf) {
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

    // Преобразование данных о производителе:

    if (isManuf) {
      manuf = [];
      for (let man in item.manuf.man) {
        manufRow = {};
        manufRow.man = man;
        manufRow.oem = manufRow.model = manufRow.years = '&ndash;';
        for (let k in item.manuf) {
          if (k !== 'man') {
            value = [];
            for (let kk in item.manuf[k]) {
              for (let kkk in item.manuf[k][kk]) {
                if (kkk == man) {
                  value.push(kk);
                }
              }
            }
            value = value.join(', ');
            if (k === 'years') {
              value = convertYears(value);
            }
            manufRow[k] = value;
          }
        }
        manuf.push(manufRow);
      }
      item.manuf_table = manuf;
    }

    // Отображение/скрытие информации при ее наличии/отсутствии:
    item.isAction = item.actiontitle || item.action_id > 0 ? '' : 'hidden';
    item.isManuf = isManuf ? '' : 'displayNone';
    item.isDesc = item.desc ? '' : 'displayNone';
  });

  // Сортировка полученных данных по id категории:
  cardItems.sort(dynamicSort(('catid')));
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
  gallery.style.width = (content.clientWidth - filters.clientWidth - 30) + 'px';
}

// Установка ширины малых карточек товаров:

function setMinCardWidth(width) {
  if (!content.classList.contains('blocks')) {
    return;
  }
  var standartWidth = (width * parseInt(getComputedStyle(gallery).fontSize, 10)),
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
  var scrolled = window.pageYOffset || document.documentElement.scrollTop,
      headerHeight = document.querySelector('.header').clientHeight,
      footerHeight = Math.max((window.innerHeight + scrolled - document.querySelector('.footer').offsetTop) + 20, 0),
      filtersHeight = window.innerHeight - headerHeight - footerHeight;
  filters.style.top = headerHeight + 'px';
  filters.style.maxHeight = filtersHeight + 'px';
}

//=====================================================================================================
// Динамическая смена URL и данных на странице:
//=====================================================================================================

var path;

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
}

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
    path = Array.from(document.querySelector('.header-menu').querySelectorAll('.active'))
      .filter(element => element.dataset.level < event.currentTarget.dataset.level)
      .map(element => element.dataset.href);
    path = path.concat(newUrl);

    if (path.length === oldPath.length && JSON.stringify(oldPath) === JSON.stringify(path)) {
      return;
    }

    var urlPath = path
      .map(element => {
        if (element == pageId) {
          return location.href.split('?')[0];
        } else {
          return '?' + element;
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
  curItems = cardItems;
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

// Скрытие неактуальных частей страницы:

function changeContent(block) {
  window.removeEventListener('scroll', scrollGallery);
  window.removeEventListener('resize', scrollGallery);
  window.removeEventListener('resize', setContentWidth);
  window.removeEventListener('scroll', setFiltersPosition);
  window.removeEventListener('resize', setFiltersPosition);

  if (block === 'cart') {
    hideElement(headerContent);
    hideElement(pageSearchIcon);
    showElement(mainHeader);
    hideElement(mainInfo);
    hideElement(content);
    hideElement(filtersContainer);
    hideElement(gallery);
    hideElement(galleryNotice);
  } else {
    showElement(content, 'flex');
    if (block === 'product') {
      showElement(mainHeader);
    }
    if (block === 'gallery') {
      window.addEventListener('scroll', scrollGallery);
      window.addEventListener('resize', scrollGallery);
      window.addEventListener('resize', setContentWidth);
      window.addEventListener('scroll', setFiltersPosition);
      window.addEventListener('resize', setFiltersPosition);
      showElement(headerContent);
      showElement(pageSearchIcon);
      if (website === 'skipper') {
        showElement(mainHeader, 'table');
      } else {
        hideElement(mainHeader);
      }
      showElement(mainInfo, 'flex');
      if (isCart) {
        hideElement(cartContent);
      }
      if (zipSelect) {
        showElement(zipSelect);
        if (website !== 'skipper') {
          if (path[path.length - 1] == 'zip') {
            showElement(zipSelect);
          } else {
            hideElement(zipSelect);
          }
        }
      }
    }
  }
}

// Изменение заголовка страницы:

function changePageTitle() {
  var title = '',
      curTitle = document.querySelector(`[data-href="${path[path.length - 1]}"]`);
  if (view === 'product') {
    title += cardItems[0].title;
  } else if (curTitle) {
    title += curTitle.dataset.title;
  }
  document.title = 'ТОП СПОРТС - ' + title;
  var pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = title;
  }
}

// Изменение активных разделов меню:

function toggleMenuItems() {
  document.querySelectorAll('.header-menu .active').forEach(item => item.classList.remove('active'));
  path.forEach(key => {
    var curTitle = document.querySelector(`.header-menu [data-href="${key}"]`);
    if (curTitle) {
      curTitle.classList.add('active');
    }
  });
}

// Добавление ссылок в разделы меню:

function createDinamicLinks() {
  document.querySelectorAll('.dinamic').forEach(item => {
    var curTitle = document.querySelector(`.header-menu .active[data-level="${item.dataset.level - 1}"]`);
    if (curTitle) {
      item.href = curTitle.href + '?' + item.dataset.href;
    }
  });
}

// Изменение хлебных крошек:

function createMainNav() {
  var navData = {items: {}},
      curTitle;
  path.forEach((el, index) => {
    curTitle = document.querySelector(`[data-href="${el}"]`);
    var item = {
      href: view === 'product' ? '#': curTitle.href,
      dataHref: el,
      level: curTitle.dataset.level,
      title: view === 'product' ? items[0].title: curTitle.dataset.title
    };
    navData.items[index] = item;
  });
  var data = {
    area: 'main-nav',
    items: navData,
    sub: {'items': '.item'},
  };
  fillTemplate(data);
}

// Создание контента страницы товара:

function renderProductPage() {
  var data = {
    area: productCard,
    items: cardItems[0],
    sub: {'images': '.carousel-item', 'sizes': '.card-size', 'options': '.card-option', 'manuf_table': '.manuf-row'},
    action: 'return'
  };
  gallery.innerHTML = fillTemplate(data);
  var card = document.querySelector('.product-card');
  renderCarousel(card.querySelector('.carousel'))
  .then(
    result => {
      card.style.opacity = '1';
    }
  )
}

// Создание контента галереи:

function renderGallery() {
  var local = location.search,
      pageFilter;
  if (location.search && location.search.indexOf('=') >= 0) {
    local = location.search.split('?');
    pageFilter = local.pop();
    local = local.join('?');
  }
  pageUrl = local ? pageId + local : pageId;
  changeContent('gallery');

  path.forEach(key => {
    if (key != pageId) {
      curItems = curItems.filter(item => item[key] == 1);
    }
  });
  clearAllSearch();

  if (zipSelect) {
    initZipFilter('man');
    initOemSearch();
  }
  initFilters(dataFilters);
  if (pageFilter) {
    setFilterOnPage(pageFilter);
  }
  checkFiltersPosition();
  clearFiltersInfo();
  checkFilters();
  setContentWidth();
  showElement(gallery, 'flex');
}

// Добавление фильтра из поисковой строки:

function setFilterOnPage(filter) {
  var key, value;
  removeInfo('filters');
  removeAllFilters();
  var filterData = decodeURI(filter).toLowerCase().split('=');
  if (filterData[0] === 'manuf_man') {
    filterData[1] = filterData[1].replace('_', ' ');
    manDropDown.setValue(filterData[1]);
  } else {
    menuFilters.querySelectorAll('.filter-item').forEach(el => {
      key = el.dataset.key;
      value = el.dataset.value;
      if (key.toLowerCase() == filterData[0] && value.toLowerCase() == filterData[1]) {
        saveFilter(key, value);
      }
    });
  }
}

// Сброс данных поиска :

function clearSearchResult() {
  selectedItems = '';
  checkFilters();
}

// Очистка всех видов поиска:

function clearAllSearch() {
  selectedItems = '';
  clearPageSearch();
  clearZipFilters();
  clearOemSearch();
}

//=====================================================================================================
// Работа с данными корзины:
//=====================================================================================================

// Обновление корзины при возвращении на страницу:

function updateCart() {
  getCart()
  .then(
    result => {
      if (location.search === '?cart') {
        renderCart();
      } else {
        var cards;
        if (view === 'list') {
          cards = document.querySelectorAll('.big-card');
        }
        if (view === 'blocks') {
          cards = document.querySelectorAll('.min-card');
        }
        cards.forEach(card => checkCart(card));
      }
    },
    reject => {
      console.log(reject);
    }
  );
}

//=====================================================================================================
//  Функции для создания фильтров каталога:
//=====================================================================================================

// Отображение фильтров на странице:

function initFilters(dataFilters) {
  var data = JSON.parse(JSON.stringify(dataFilters)),
      isExsist = false;

  for (let item of data) {
    for (let k in item.items) {
      isExsist = curItems.find(card => {
        if (card[item.key] == k || card[k] == 1) {
          return true;
        }
      });
      if (!isExsist) {
        delete item.items[k];
      }
      if (typeof item.items[k] == 'object') {
        for (let kk in item.items[k]) {
          isExsist = curItems.find(card => {
            if (card[item.key] == k && card.subcat == item.items[k][kk]) {
              return true;
            }
          });
          if (!isExsist) {
            delete item.items[k][kk];
          }
        }
      }
    }
  }
  menuFilters.innerHTML = createFilters(data);
  showElement(filtersContainer);
  addTooltips('color');
}

// Создание меню фильтров:

function createFilters(data) {
  return data.map(el => {
    if (document.body.id === '_equip' && !location.search) {
      if (el.key == 'cat') {
        return;
      }
      if (el.key == 'brand') {
        el.isOpen = 'true';
      }
    }
    if (el.items && !isEmptyObj(el.items)) {
      return createFilter(el);
    }
  }).join('');
}

// Создание одного фильтра:

function createFilter(data) {
  var curTitle,
      isHidden,
      newItem = filterTemplate,
      newSubItem,
      list = '',
      subList;

  for (let k in data.items) {
    subList = '';
    isHidden = 'hidden';

    if (typeof data.items[k] === 'object') {
      for (let kk in data.items[k]) {
        if (data.items[k][kk] !== '') {
          isHidden = '';
          newSubItem = filterSubitemTemplate
          .replace('#key#', data.key)
          .replace('#subkey#', k)
          .replace('#value#', data.items[k][kk])
          .replace('#title#', data.items[k][kk])
          subList += newSubItem;
        }
      }
    }

    if ((data.items[k] == 1) || (data.key == 'cat')) {
      curTitle = k;
    } else {
      curTitle = data.items[k];
    }

    if (curTitle == 'SpyOptic') {
      curTitle = 'Spy Optic';
    }
    if (curTitle == 'TroyLeeDesigns') {
      curTitle = 'Troy Lee Designs';
    }
    if (curTitle == 'KingDolphin') {
      curTitle = 'King Dolphin';
    }

    newSubItem = filterItemTemplate
      .replace(filterSubitemTemplate, subList)
      .replace('#key#', data.key)
      .replace('#value#', k)
      .replace('#title#', curTitle)
      .replace('#isHidden#', isHidden);
    list += newSubItem;
  }

  newItem = newItem
    .replace(filterItemTemplate, list)
    .replace('#key#', data.key)
    .replace('#isOpen#', data.isOpen && window.innerWidth >= 767 ? 'default-open' : 'close')
    .replace('#title#', data.title);
  return newItem;
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

// Выбор значения фильтра:

function selectFilterValue(event) {
  event.stopPropagation();
  var curEl;
  if (event.currentTarget.classList.contains('result')) {
    if (!event.target.classList.contains('close')) {
      return;
    }
    curEl = menuFilters.querySelector(`[data-key="${event.currentTarget.dataset.key}"][data-value="${event.currentTarget.dataset.value}"]`);
  } else {
    if (!event.target.closest('.filter-item-title') || event.currentTarget.classList.contains('disabled')) {
      return;
    }
    curEl = event.currentTarget;
  }
  getDocumentScroll();
  clearAllSearch();
  var key = curEl.dataset.key,
      value = curEl.dataset.value,
      subkey = curEl.dataset.subkey;

  if (curEl.classList.contains('checked')) {
    curEl.classList.remove('checked');
    curEl.classList.add('close');
    curEl.querySelectorAll('.filter-item.checked').forEach(subItem => subItem.classList.remove('checked'));
    removeFilter(key, value, subkey);
    if (!subkey) {
      deleteDuplicate(key, value);
    }
  } else {
    curEl.classList.add('checked');
    curEl.classList.remove('close');
    var filterItem = curEl.closest('.filter-item.item');
    if (filterItem) {
      filterItem.classList.add('checked');
    }
    saveFilter(key, value, subkey);
    if (!subkey) {
      createDuplicate(key, value, curEl.querySelector('.item-title').textContent);
    }
  }
  var info = getInfo('filters')[pageUrl];
  if (info && isEmptyObj(info)) {
    selectedItems = '';
  } else {
    selectCards(info);
  }
  showCards();
  toggleToActualFilters(event.currentTarget);

  if (window.innerWidth >= 767) {
    if (filters.style.position === 'static') {
      setDocumentScroll();
    }
  } else {
    setDocumentScroll();
  }
}

// Добавление фильтра в информацию о выбранных фильтрах:

function createDuplicate(key, value, title) {
  if (!filtersInfo) {
    return;
  }
  var newEl = duplicateFilterTemplate;
  newEl = newEl
    .replace('#key#', key)
    .replace('#value#', value)
    .replace('#title#', title);
  filtersInfo.insertAdjacentHTML('beforeend', newEl);
  setPaddingToBody();
}

// Удаление фильтра из информации о выбранных фильтрах:

function deleteDuplicate(key, value) {
  if (!filtersInfo) {
    return;
  }
  filtersInfo.querySelector(`[data-key="${key}"][data-value="${value}"]`).remove();
  setPaddingToBody();
}

// Добавление данных в хранилище о выбранных фильтрах:

function saveFilter(key, value, subkey) {
  var info = getInfo('filters');
  if (!info[pageUrl]) {
    info[pageUrl] = {};
  }
  if (!info[pageUrl][key]) {
    info[pageUrl][key] = {};
  }
  if (subkey) {
    if (!info[pageUrl][key][subkey]) {
      info[pageUrl][key][subkey] = {};
    }
    if (!info[pageUrl][key][subkey][value]) {
      info[pageUrl][key][subkey][value] = {};
    }
  } else {
    if (!info[pageUrl][key][value]) {
      info[pageUrl][key][value] = {};
    }
  }
  saveInfo('filters', info);
}

// Удаление данных из хранилища о выбранных фильтрах:

function removeFilter(key, value, subkey) {
  var info = getInfo('filters');
  if (!subkey) {
    delete info[pageUrl][key][value];
    if (isEmptyObj(info[pageUrl][key])) {
      delete info[pageUrl][key];
    }
  } else {
    delete info[pageUrl][key][subkey][value];
    if (info[pageUrl][key][subkey] && isEmptyObj(info[pageUrl][key][subkey])) {
      info[pageUrl][key][subkey] = {};
    }
  }
  saveInfo('filters', info);
}

// Удаление данных из хранилища обо всех фильтрах:

function removeAllFilters() {
  var info = getInfo('filters');
  info[pageUrl] = {};
  saveInfo(`filters`, info);
}

// Сохранение данных в хранилище о состоянии фильтров (открыт/закрыт):

function saveFilterPosition(key, value) {
  var info = getInfo('positions', 'sessionStorage');
  if (!info[pageUrl]) {
    info[pageUrl] = {};
  }
  if (value) {
    info[pageUrl][key] = value;
  }
  saveInfo('positions', info, 'sessionStorage');
}

// Удаление данных из хранилища обо всех состояниях фильтров (открыт/закрыт):

function removeAllFilterPosition() {
  var info = getInfo('positions', 'sessionStorage');
  info[pageUrl] = {};
  saveInfo(`positions`, info, 'sessionStorage');
}

// Отбор карточек фильтром каталога:

function selectCards(info) {
  if (!info) {
    return;
  }
  var isFound;

  selectedItems = curItems.filter(card => {
    for (let k in info) {
      isFound = false;
      for (let kk in info[k]) {
        if (info[k][kk] && !isEmptyObj(info[k][kk])) {
          for (let kkk in info[k][kk]) {
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
  var curItemsArray = curItems;
  if (selectedItems !== '') {
    curItemsArray = selectedItems;
  }
  var curFilters = menuFilters.querySelectorAll(`.filter-item.item.checked[data-key="${filter.dataset.key}"]`),
      checked = menuFilters.querySelectorAll(`.filter-item.item.checked`),
      filterItems;

  if (checked.length == 0) {
    menuFilters.querySelectorAll(`.filter-item.item`).forEach(item => {
      item.classList.remove('disabled');
    });
    return;
  }

  if (curFilters.length != 0) {
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
    } else {
      isExsist = curItemsArray.find(card => {
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
          deleteDuplicate(item.dataset.key, item.dataset.value);
          item.querySelectorAll('.subitem').forEach(subitem => {
            subitem.classList.remove('checked');
          });
          removeFilter(item.dataset.key, item.dataset.value);
        }
      }
      item.querySelectorAll('.subitem').forEach(subitem => {
        isFound = false;
        isFound = curItemsArray.find(card => {
          if (card.cat == value && card.subcat == subitem.dataset.value) {
            return true;
          }
        });
        if (!isFound) {
          subitem.classList.add('disabled');
        } else {
          subitem.classList.remove('disabled');
        }
      });
    }
  });
}

// Очистка фильтров каталога:

function clearFilters() {
  if (!menuFilters.querySelector('.checked')) {
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

  if (isSearch) {
    return;
  }
  selectedItems = '';
  showCards();
  setDocumentScroll();
}

// Очистка информации о выбранных фильтрах:

function clearFiltersInfo() {
  if (filtersInfo) {
    filtersInfo.innerHTML = '';
  }
}

// Проверка сохраненных положений фильтров:

function checkFiltersPosition() {
  var info = getInfo('positions', 'sessionStorage')[pageUrl],
      curEl;
  if (info) {
    for (let key in info) {
      curEl = document.getElementById(key);
      if (curEl) {
        if (info[key] == 'close') {
          curEl.classList.add('close');
        } else {
          curEl.classList.remove('close');
        }
      }
    }
  }
}

// Проверка сохраненных значений фильтров:

function checkFilters() {
  var info = getInfo('filters')[pageUrl];
  if (info && !isEmptyObj(info)){
    checkFilterExist(info);
    selectFilters(info);
  }
  showCards();
}

// Удаление сохраненных фильтров, если их больше нет на странице:

function checkFilterExist(info) {
  var curEl;
  for (let k in info) {
    for (let kk in info[k]) {
      curEl = menuFilters.querySelector(`[data-key="${k}"][data-value="${kk}"]`);
      if (!curEl) {
        delete info[k][kk];
      }
      for (let kkk in info[k][kk]) {
        curEl = menuFilters.querySelector(`[data-subkey="${kk}"][data-value="${kkk}"]`);
        if (!curEl) {
          delete info[k][kk][kkk];
        }
        if (isEmptyObj(info[k][kk])) {
          delete info[k][kk];
        }
      }
      if (isEmptyObj(info[k])) {
        delete info[k];
      }
    }
  }
}

// Визуальное отображение сохраненных фильтров:

function selectFilters(info) {
  var filters = {},
      filterItem;
  for (let k in info) {
    filters[k] = {};
    filterItem = document.getElementById(`filter-${k}`);
    if (filterItem) {
      filterItem.classList.remove('close');
    }
    for (let kk in info[k]) {
      filters[k][kk] = {};
      selectCards(filters);
      changeFilterClass(k, kk);
      for (let kkk in info[k][kk]) {
        filters[k][kk][kkk] = {};
        selectCards(filters);
        changeFilterClass(k, kkk, kk);
      }
    }
  }
}

// Изменение классов сохраненных фильтров:

function changeFilterClass(key, value, subkey) {
  var curEl;
  if (subkey) {
    curEl = menuFilters.querySelector(`[data-subkey="${subkey}"][data-value="${value}"]`);
  } else {
    curEl = menuFilters.querySelector(`[data-key="${key}"][data-value="${value}"]`);
    createDuplicate(key, value, curEl.querySelector('.item-title').textContent);
  }
  if (curEl) {
    curEl.classList.add('checked');
    var filterItem = curEl.closest('.filter-item');
    if (filterItem) {
      filterItem.classList.remove('close');
    }
    toggleToActualFilters(curEl);
  }
}

//=====================================================================================================
//  Функции для создания фильтров запчастей и поиска по запчастям:
//=====================================================================================================

// Запуск создания фильтров запчастей:

function initZipFilter(filter) {
  createZipFilterData(filter);
  if (zipFilterData[filter].length === 0) {
    if (filter == 'years') {
      initZipFilter('model');
    }
    return;
  }
  createZipFilter(filter);
  unlockZipFilter(filter);
}

// Подготовка данных для фильтров запчастей:

function createZipFilterData(filter) {
  var curItemsArray = curItems;
  if (website === 'skipper') {
    curItemsArray = items;
  }
  if (filter != 'man' && filter != 'oem') {
    curItemsArray = selectedItems;
  }
  zipFilterData[filter] = [];

  curItemsArray.forEach(item => {
    if (item.manuf) {
      for (let k in item.manuf[filter]) {
        if (filter == 'man' || filter == 'oem') {
          if (zipFilterData[filter].indexOf(k.trim()) === -1) {
            zipFilterData[filter].push(k);
          }
        } else {
          for (let kk in item.manuf[filter][k]) {
            if (kk == selectMan.value && zipFilterData[filter].indexOf(k.trim()) === -1) {
              zipFilterData[filter].push(k);
            }
          }
        }
      }
    }
  });
  zipFilterData[filter].sort();
}

// Создание фильтров запчастей:

function createZipFilter(filter) {
  var curSelect = document.getElementById(`select-${filter}`).querySelector('.drop-down');
  fillByTemplate(selectManufItemTemplate, zipFilterData[filter], curSelect);
}

// Создание подсказок в поиске по OEM:

function initOemSearch() {
  createZipFilterData('oem');
  fillByTemplate(oemListTemplate, zipFilterData.oem, oemList);
}

//=====================================================================================================
//  Функции для работы с фильтрами запчастей и поиском по запчастям:
//=====================================================================================================

// Отбор карточек фильтром запчастей:

function selectCardsZipFilter(event) {
  if (isSearch) {
    clearPageSearch();
    clearOemSearch();
  }
  var curItemsArray = curItems;
  if (website === 'skipper') {
    curItemsArray = cardItems;
  }
  var filter = event.currentTarget.dataset.filter,
      isFound;
  selectedItems = curItemsArray.filter(item => {
    if (item.manuf) {
      isFound = false;
      for (let k in item.manuf.man) {
        if (k == selectMan.value) {
          isFound = true;
        }
      }
      if (filter != 'man' && isFound && zipFilterData.years.length != 0) {
        isFound = false;
        for (let k in item.manuf.years) {
          if (k == selectYears.value) {
            for (let kk in item.manuf.years[k]) {
              if (kk == selectMan.value) {
                isFound = true;
              }
            }
          }
        }
      }
      if (filter == 'model' && isFound && zipFilterData.model.length != 0) {
        isFound = false;
        for (let k in item.manuf.model) {
          if (k == selectModel.value) {
            for (let kk in item.manuf.model[k]) {
              if (kk == selectMan.value) {
                isFound = true;
              }
            }
          }
        }
      }
      if (isFound) {
        return true;
      }
    }
  });
  showCards();
  isSearch = true;

  if (filter == 'man') {
    clearZipFilterBtn.classList.add('active');
    lockZipFilter('years');
    lockZipFilter('model');
    initZipFilter('years');
  } else if (filter == 'years') {
    lockZipFilter('model');
    initZipFilter('model');
  }
}

// Блокировка фильтров запчастей:

function lockZipFilter(filter) {
  var curSelect = document.getElementById(`select-${filter}`);
  if (curSelect) {
    window[`${filter}DropDown`].clear();
    curSelect.setAttribute('disabled', 'disabled');
  }
}

// Разблокировка фильтров запчастей:

function unlockZipFilter(filter) {
  var curSelect = document.getElementById(`select-${filter}`);
  if (curSelect) {
    curSelect.removeAttribute('disabled');
  }
}

// Очистка фильтров запчастей:

function startClearZipFilters(btn) {
  if (btn.classList.contains('active')) {
    clearSearchResult();
    clearZipFilters();
  }
}

function clearZipFilters() {
  if (!zipSelect) {
    return;
  }
  isSearch = false;
  clearZipFilterBtn.classList.remove('active');
  manDropDown.clear();
  lockZipFilter('years');
  lockZipFilter('model');
}

// Отображение текущего списка OEM:

function showOemList() {
  var oemToFind = oemSearchInput.value.trim();
  if (oemToFind == '') {
    closeOemHints();
    return;
  }
  showElement(oemDropdown);

  var regExpSearch = RegExp(oemToFind, 'i'),
      allOem = Array.from(document.querySelectorAll('#oem-list .oem'));

  allOem.forEach(el => hideElement(el));
  var curOemList = allOem.filter(el => el.dataset.oem.search(regExpSearch) >= 0);

  if (curOemList.length > 0) {
    showElement(oemList);
    hideElement(oemNotFound);
    curOemList.forEach(el => showElement(el));
  } else {
    hideElement(oemList);
    showElement(oemNotFound);
  }
}

// Выбор OEM из списка:

function selectOem(event) {
  oemSearchInput.value = event.currentTarget.dataset.oem;
  findOem();
}

// Поиск по OEM:

function findOem() {
  event.preventDefault();
  if (isSearch) {
    clearPageSearch();
    clearZipFilters();
  }
  var oemToFind = oemSearchInput.value.trim();
  if (oemToFind == '') {
    return;
  }
  oemSearchInput.dataset.value = oemSearchInput.value;
  selectCardsOemSearch(oemToFind);
  showCards();
  isSearch = true;
  showElement(clearOemSearchBtn);
}

// Отбор карточек по OEM:

function selectCardsOemSearch(oem) {
  selectedItems = curItems.filter(item => {
    if (item.manuf) {
      for (let k in item.manuf.oem) {
        if (k == oem) {
          return true;
        }
      }
    }
  });
}

// Запуск очиски поиска по OEM:

function startClearOemSearch() {
  clearSearchResult();
  clearOemSearch();
}

// Очистка поиска по OEM:

function clearOemSearch() {
  if (!zipSelect) {
    return;
  }
  isSearch = false;
  closeOemHints();
  hideElement(clearOemSearchBtn);
  oemSearchInput.value = '';
  oemSearchInput.dataset.value = '';
}

// Удаление значения из поиска OEM при его фокусе и скрытие подсказок:

function onFocusOemInput(input) {
  onFocusInput(input);
  closeOemHints();
}

// Скрытие подсказок поиска OEM:

function closeOemHints() {
  hideElement(oemDropdown);
  hideElement(oemList);
  hideElement(oemNotFound);
}

function onBlurOemInput(input) {
  setTimeout(() => {
    onBlurInput(input);
    closeOemHints();
  }, 100);
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

  var dataItems = [];
  for (let i = countItems; i < countItemsTo; i++) {
    dataItems.push(itemsToLoad[i]);
  }
  var data = {
    area: view === 'list'? bigCard : minCard,
    source: 'outer',
    items: dataItems,
    sub: view === 'list'? {'images': '.carousel-item', 'sizes': '.card-size', 'options': '.card-option', 'manuf_table': '.manuf-row'} : undefined,
    action: 'return'
  };
  var list = fillTemplate(data);

  if (countItems === 0) {
    gallery.innerHTML = list;
  } else {
    gallery.insertAdjacentHTML('beforeend', list);
  }
  setFiltersPosition();
  setContentWidth();

  if (view === 'list') {
    document.querySelectorAll('.big-card').forEach(card => {
      renderCarousel(card.querySelector('.carousel'));
      completeCard(card)
    });
  }
  if (view === 'blocks') {
    document.querySelectorAll('.min-card').forEach(card => {
      checkImg(card);
      completeCard(card)
    });
  }
}

// Проверка загружено ли изображение и вставка заглушки при отсутствии изображения:

function checkImg(element) {
  element.querySelector('img').addEventListener('error', (event) => {
    event.currentTarget.src = '../img/no_img.jpg';
  });
}

// Дозаполнение карточки информацией об акции и данными корзины:

function completeCard(card) {
  if (isCart) {
    checkAction(card);
    checkCart(card);
  }
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
        carousel.querySelector('.carousel-gallery').insertAdjacentHTML('beforeend', '<div class="carousel-item"><img src="../img/no_img.jpg"></div>');
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
  if (selectedItems === '') {
    showElement(gallery, 'flex');
    hideElement(galleryNotice);
    loadCards(curItems);
  } else {
    if (selectedItems.length == 0) {
      showElement(galleryNotice, 'flex');
      hideElement(gallery);
      setFiltersPosition();
    } else {
      showElement(gallery, 'flex');
      hideElement(galleryNotice);
      loadCards(selectedItems);
    }
  }
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
    document.querySelector(`.view-${view}`).classList.remove('active');
    event.currentTarget.classList.add('active');
    view = newView;
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
      curCard.querySelector('.toggle-btn').setAttribute('tooltip', 'Раскрыть');
      setFiltersPosition();
    }
  }
}

// Отображение полной карточки товара:

function showFullCard(id) {
  event.preventDefault();
  loader.show();
  openPopUp(fullCardContainer);
  fullCardContainer.style.opacity = 0;
  var data = {
    area: fullCardContainer,
    items: cardItems.find(item => item.object_id == id),
    sub: {'images': '.carousel-item', 'sizes': '.card-size', 'options': '.card-option', 'manuf_table': '.manuf-row'}
  };
  fillTemplate(data);
  completeCard(document.querySelector('.full-card'));

  var curCarousel = fullCardContainer.querySelector('.carousel');
  renderCarousel(curCarousel)
  .then(
    result => {
      if (curCarousel.querySelector('img').src.indexOf('/no_img.jpg') === -1) {
        curCarousel.querySelector('.carousel-gallery-wrap').addEventListener('click', (event) => showFullImg(event, id));
        curCarousel.querySelector('.maximize').addEventListener('click', (event) => showFullImg(event, id));
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
  if (fullCardContainer && (!fullCardContainer.style.display || fullCardContainer.style.display === 'none')) {
    getDocumentScroll();
  }
  showElement(fullImgContainer);
  fullImgContainer.style.opacity = 0;
  loader.show();

  var data = {
    area: fullImgContainer,
    items: curItems.find(item => item.object_id == id),
    sub: {'images': '.carousel-item'}
  };
  fillTemplate(data);

  var curCarousel = fullImgContainer.querySelector('.carousel'),
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
  hideElement(fullImgContainer);
  if (!fullCardContainer.style.display || fullCardContainer.style.display === 'none') {
    document.body.classList.remove('no-scroll');
    setDocumentScroll();
  }
}

//=====================================================================================================
//  Сортировка карточек товаров:
//=====================================================================================================

// Сортировка карточек товаров на странице:

var gallerySort = document.getElementById('gallery-sort');
if (gallerySort) {
  new DropDown(gallerySort);
  gallerySort.addEventListener('change', sortItems);
}

function sortItems() {
  var prop = this.value;
  curItems.sort(dynamicSort(prop));
  if (selectedItems !== '') {
    selectedItems.sort(dynamicSort(prop));
  }
  showCards();
}

//=====================================================================================================
// Поиск на странице:
//=====================================================================================================

// Поиск совпадений с введенным текстом:

function findOnPage(event) {
  event.preventDefault();
  if (isSearch) {
    clearZipFilters();
    clearOemSearch();
  }
  var textToFind = pageSearchInput.value.trim();
  if (textToFind == '') {
    return;
  }
  var regExpSearch = new RegExp(textToFind, 'i');
  selectedItems = [];
  curItems
    .filter(el => el.search.search(regExpSearch) >= 0)
    .forEach(el => selectedItems.push(el));
  showCards();
  isSearch = true;
  document.getElementById('search-text').textContent = '"' + textToFind + '"';
  document.getElementById('search-count').textContent = selectedItems.length;
  hideElement(filtersInfo);
  showElement(clearPageSearchBtn);
  showElement(pageSearchInfo, 'flex');
}

// Очистка поиска по странице:

function startClearPageSearch() {
  clearSearchResult();
  clearPageSearch();
}

function clearPageSearch() {
  if (!pageSearch) {
    return;
  }
  isSearch = false;
  pageSearch.classList.remove('open');
  hideElement(clearPageSearchBtn);
  hideElement(pageSearchInfo);
  showElement(filtersInfo, 'flex');
  pageSearchInput.value = '';
}

// Разворачивание поля поиска в шапке сайта:

function openPageSearch() {
  pageSearch.classList.add('open');
}
