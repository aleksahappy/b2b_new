'use strict';

// Глобальные переменные:

var items = [],
    brands = [], // ['509', 'Abom', 'BCA', 'EVS', 'FXR', 'FullT', 'Helmetex', 'Jethwear', 'Ogio', 'PowerTools', 'SIXS', 'Shark', 'Spy Optic', 'Tobe'];
    selectedItems = '';

// Запускаем рендеринг страницы сертификатов:

startCertPage();

// Запуск страницы сертификатов:

function startCertPage() {
  sendRequest(`../json/certificates.json`)
  // sendRequest(urlRequest.main, {action: 'files', data: {type: 'cert'}})
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
  initFilter('#cert', {
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
    var findBrands = el.descr.match(/"\w{3,}"/gm);
    if (findBrands) {
      findBrands.forEach(brand => {
        brand = brand.replace(/"/g, '');
        if (brands.indexOf(brand) === -1) {
          curBrands.push(brand);
          brands.push(brand);
        }
      });
    };
    el.brands = curBrands;
    el.search = [];
    for (var key in el) {
      if (el[key] == 0 || el[key]) {
        el.search.push(el[key]);
      }
    }
    el.search = el.search.join(',').replace(/\s/g, ' ');
  });
  brands.sort();
}

// Загрузка данных на страницу:

function loadData(data) {
  if (data) {
    if (data.length) {
      hideElement('.notice');
      fillTemplate({
        area: '.cert-data',
        items: selectedItems
      });
      showElement('.cert-data');
    } else {
      hideElement('.cert-data');
      showElement('.notice');
    }
  } else {
    fillTemplate({
      area: '.cert-data',
      items: items
    });
    hideElement('.notice');
    showElement('.cert-data');
  }
}

// Поиск по ключевым словам:

function findCert(search, textToFind) {
  if (textToFind) {
    clearDropDown('#cert-brand');
    var regEx = new RegExp(textToFind, 'gi');
    selectedItems = items.filter(el => el.search.search(regEx) >= 0);
    loadData(selectedItems);
  } else {
    loadData();
  }
}

// Фильтр по бренду:

function selectBrand(event) {
  var value = event.target.dataset.value;
  if (value === 'default') {
    loadData();
  } else {
    clearSearch('#cert-search');
    selectedItems = items.filter(el => el.brands.indexOf(value) >= 0);
    loadData(selectedItems);
  }
}
