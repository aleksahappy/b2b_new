'use strict';

// Глобальные переменные:

var items = [],
    itemsToLoad,
    brands = [];

// Запускаем рендеринг страницы сертификатов:

startCertPage();

// Запуск страницы сертификатов:

function startCertPage() {
  // sendRequest(`../json/certificates.json`)
  sendRequest(urlRequest.main, {action: 'files', data: {type: 'cert'}})
  .then(result => {
    items = JSON.parse(result);
    initPage();
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage() {
  if (!items || !items.length) {
    return;
  }
  convertData();
  loadData();
  initSearch('#cert-search', findCert);
  initDropDown('#cert-brand', selectBrand, brands, 'Сбросить');
  initFilter('#main', {
    filters: {
      'brands': {
        title: 'По бренду',
        filter: 'select',
        items: brands,
        isOpen: true
      }
    },
    isHide: false
  });
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  items.forEach(el => {
    var curBrands = [];
    var findBrands = el.descr.match(/"\w{2,}\s{0,1}\w*"/gm);
    if (findBrands) {
      findBrands.forEach(brand => {
        brand = brand.replace(/"/g, '');
        curBrands.push(brand);
        if (brands.indexOf(brand) === -1) {
          brands.push(brand);
        }
      });
    };
    el.brands = curBrands;
    for (var key in el) {
      el.search += convertToString(el[key]);
    }
  });
  brands.sort();
  itemsToLoad = items;
}

// Загрузка данных на страницу:

function loadData() {
  var area = getEl('#cert');
  if (itemsToLoad.length) {
    fillTemplate({
      area: area,
      items: itemsToLoad
    });
  } else {
    area.innerHTML = '<div class="notice">По вашему запросу ничего не найдено.</div>';
  }
}

// Поиск по ключевым словам:

function findCert(search, textToFind) {
  clearDropDown('#cert-brand');
  if (textToFind) {
    itemsToLoad = items.filter(el => findByRegExp(el.search, getRegExp(textToFind)));
  } else {
    itemsToLoad = items;
  }
  loadData();
}

// Фильтр по бренду:

function selectBrand(event) {
  var value = event.target.dataset.value;
  clearSearch('#cert-search');
  if (value === 'default') {
    itemsToLoad = items;
  } else {
    itemsToLoad = items.filter(el => el.brands.indexOf(value) >= 0);
  }
  loadData();
}
