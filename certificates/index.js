'use strict';

// Глобальные переменные:

var items = [],
    itemsToLoad,
    brands = [];

var brandNames = {
  '509': '509, 509 ALTITUDE',
  'Abom': 'ABOM',
  'BCA': 'BCA',
  'EVS': 'EVS',
  'FXR': 'FXR, FXR RACING, FXRMNT',
  'FullT': 'FullT',
  'Helmetex': 'Helmetex',
  'Jethwear': 'JETHWEAR, JW, JWR',
  'Ogio': 'OGIO',
  'Shark': 'SHARK',
  'SIXS': 'SIXS, SIX2',
  'Spy Optic': 'SPY, SPY Optic, SPY Optics',
  'Tobe': 'TOBE, TOBE OUTWEAR',
  'Troy Lee Designs': 'TROY LEE DESIGNS',
  'YETI': 'YETI',
  'Garland': 'Garland',
  'Hord': 'Hord',
  'King Dolphin': 'King Dolphin',
  'LA Sleeve': 'LA Sleeve',
  'SAM-Tech': 'SAM-Tech',
  'SPI': 'SPI',
  'SeaFlo': 'SEAFLO',
  'Skinz': 'SKINZ',
  'Skipper': 'SKIPPER',
  'TMC': 'TMC',
  'Tecnoseal': 'Tecnoseal'
}

// 'FLY RACING'
// 'HMK'
// 'NEAL'
// 'ONEAL'

// Запуск страницы сертификатов:

function startPage() {
  // sendRequest(`../json/certificates.json`)
  sendRequest(urlRequest.main, 'files',  {type: 'cert'})
  .then(result => {
    if (result) {
      items = JSON.parse(result);
    }
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
    }
  });
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  items.forEach(el => {
    var itemBrands = [];
    var findBrands = el.descr.match(/"\w{2,}[^"]*"/gm);
    if (findBrands) {
      findBrands.forEach(brand => {
        brand = brand.replace(/"/g, '').toLowerCase();
        for (var key in brandNames) {
          if (brandNames[key].toLowerCase().indexOf(brand) >= 0) {
            brand = key;
          }
        }
        itemBrands.push(brand);
        if (brands.indexOf(brand) === -1) {
          brands.push(brand);
        }
      });
    };
    el.brands = itemBrands;
    el.search = el.descr + ';' + el.title;
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
  if (textToFind && itemsToLoad.length) {
    highlightText('#cert', textToFind);
  }
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
