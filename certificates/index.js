'use strict';

// Глобальные переменные:

var items,
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

// getPageData('../json/certificates.json')
getPageData(urlRequest.main, 'files',  {type: 'cert'})
.then(result => {
  items = result || [];
  initPage();
  loader.hide();
});

// Инициализация страницы:

function initPage() {
  var filterSettings = {
    filters: {
      'brands': {
        title: 'По бренду',
        filter: 'select',
        items: brands,
        isOpen: true
      }
    }
  };
  convertData();
  loadData('#cert', itemsToLoad);
  initSearch('#cert-search', findCert);
  initDropDown('#cert-brand', event => selectBrand(event.target, 'desktop'), brands, 'Сбросить');
  initFilter('#main', filterSettings, curEl => selectBrand(curEl, 'adaptive'));
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

// Поиск по ключевым словам:

function findCert(search, textToFind) {
  clearDropDown('#cert-brand');
  clearFilter('#main');
  if (textToFind) {
    itemsToLoad = items.filter(el => findByRegExp(el.search, getRegExp(textToFind)));
  } else {
    itemsToLoad = items;
  }
  loadSearchData('#cert', itemsToLoad);
  if (textToFind && itemsToLoad.length) {
    highlightText('#cert', textToFind);
  }
}

// Фильтр по бренду:

function selectBrand(curEl, mode) {
  var value;
  if (!curEl || !curEl.classList.contains('checked')) {
    value = 'default';
  } else {
    value = curEl.dataset.value;
  }
  clearSearch('#cert-search');
  if (value === 'default') {
    itemsToLoad = items;
  } else {
    itemsToLoad = items.filter(el => el.brands.indexOf(value) >= 0);
  }
  loadSearchData('#cert', itemsToLoad);
  syncFilters(mode, value);
  return itemsToLoad.length;
}

// Синхронизация основных и адаптивных фильтров:

function syncFilters(mode, value) {
  if (mode === 'desktop') {
    value === 'default' ? clearFilter('#main') : setValueFilter('#main', 'filter', 'brands', value);
    toggleFilterBtns('#main', value === 'default' ? 0 : itemsToLoad.length);
  } else {
    value === 'default' ? clearDropDown('#cert-brand') : setValueDropDown('#cert-brand', 'filter', null, value);
  }
}
