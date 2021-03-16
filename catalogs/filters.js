'use strict';

// Основные фильтры каталога:

var catalogFiltersData = {
  filters: {},
  isSave: true,
  isVisible: true
};

// Фильтр подбора запчастей:

var manuf2FiltersData = [{
  title: 'Производитель',
  key: 'brand',
}, {
  title: 'Год выпуска',
  key: 'years',
}, {
  title: 'Модель',
  key: 'models',
}];

// Фильтр подбора адаптера:

var manuf1FiltersData = [{
  title: 'Год выпуска мотоцикла',
  key: 'years',
}, {
  title: 'Марка мотоцикла',
  key: 'brand',
}, {
  title: 'Модель мотоцикла',
  key: 'modelsonly',
}, {
  title: 'Объем двигателя',
  key: 'engine',
}];

//=====================================================================================================
// Ручные данные для фильтров каталога:
//=====================================================================================================

var state = {
  'free': 'В наличии',
  'arrive': 'Ожидается поступление'
};

var sizeSV = {};

//=====================================================================================================
// Первоначальное заполнение фильтров каталога:
//=====================================================================================================

function fillCatalogFilters() {
  // Костыль по преобразованию данных в sizelist:
  if (catalogId === 'equip' && window.sizelist) {
    for (var key in sizelist['1295']) {
      sizeSV[key.replace('REU', 'SV')] = key.replace('REU', '');
    }
    sizeSV['SVNA'] = 'NA';
  }

  // Настройки фильтров:
  var allFilters = {
    action: {
      title: 'Спецпредложение',
      items: window.actions || [],
    },
    state: {
      title: 'Доступность',
      items: window.state || [],
    },
    cat: {
      title: 'Категория',
      items: window.catsubs || [],
    },
    brand: {
      title: 'Бренд',
      items: window.brands || []
    },
    id_15: { // Модель
      itemsSort: 'text'
    },
    use: {
      title: 'Применяемость',
      items: window.use || [],
    },
    color_27: {}, // Цвет
    sizeREU: {
      title: 'Размер для фильтров (из sizelist)',
      items: window.sizelist ? (window.sizelist['1252'] || []) : [] // Размер для фильтров
    },
    size_1252: {}, // Размер для фильтров
    size_39: {}, // Размер поставщика
    size_38: {}, // Размер для сайта
    size_1256: {}, // Европейский размер
    size: {
      title: 'Размер',
      mode: {EU: 'Европейский размер', US: 'Американский размер', cm: 'Длина стельки, см'},
      section: {
        size_1260: { // Размер взрослый
          title: 'Взрослый',
          mode: 'EU'
        },
        size_60: { // Размер детский
          title: 'Детский',
          mode: 'EU'
        },
        size_1273: { // Размер американский взрослый
          title: 'Взрослый',
          mode: 'US'
        },
        size_1274: { // Размер американский детский
          title: 'Детский',
          mode: 'US'
        },
        size_1295: { // Длина стельки взрослый
          title: 'Взрослый',
          mode: 'cm'
        },
        size_1313: { // Длина стельки детский
          title: 'Детский',
          mode: 'cm'
        }
      }
    },
    id_42: {}, // Возраст
    id_43: {}, // Пол
    id_1253: { // Год коллекции
      itemsSort: 'numb'
    },
    id_1262: { // Емкость
      itemsSort: 'numb'
    },
    id_41: { // Длина, см
      itemsSort: 'text'
    },
    id_7: { // Производитель техники
      title: 'Производитель',
      itemsSort: 'text'
    },
    id_3: { //Материал
      itemsSort: 'text'
    },
    id_5: { //Мощность мотора, лс
      itemsSort: 'text'
    },
    id_4: { //Шаг
      itemsSort: 'text'
    },
    id_6: { // Посадка на вал
      itemsSort: 'text'
    },
    id_8: { // Тип лодочного мотора'
      itemsSort: 'text'
    },
    id_32: { // Год модели техники
      itemsSort: 'text'
    },
    id_33: { // Модель техники
      itemsSort: 'text'
    }
  };

  // Основные фильтры в зависимости от типа каталога:

  var filtersByType = {
    equip: ['action', 'state', 'cat', 'brand', 'id_15', 'use', 'sizeREU', 'size_1252', 'size_39', 'size_38', 'size_1256', 'size', 'id_42', 'id_43', 'id_1253', 'id_1262', 'id_41', 'color_27'],
    zip: ['action', 'state', 'id_7', 'brand', 'cat', 'use', 'color_27']
  };

 // Дополнительные фильтры по каталогам:

  var filtersByPage = {
    boats: ['id_3', 'id_5', 'id_4', 'id_6', 'id_8'],
    snowbike: ['id_32', 'id_33']
  };

  // Фильтры, которые должны быть открыты по умолчанию:

  var defaulOpen = {
    equip: ['action', 'state', 'cat'],
    zip: ['action', 'state', 'id_7', 'brand']
  };

  addInCatalogFiltersData(filtersByType[catalogType]);
  addInCatalogFiltersData(filtersByPage[catalogId]);

  function addInCatalogFiltersData(data) {
    if (!data) {
      return;
    }
    for (var key of data) {
      if (allFilters[key]) {
        var filter = catalogFiltersData.filters[key] = allFilters[key];
        if (filter.section) {
          for (var k in filter.section) {
            addSettings(k, filter.section[k]);
          }
        } else {
          addSettings(key, filter);
        }
      }
    }
  }

  function addSettings(key, obj) {
    var optKey = key.indexOf('_') === -1 ? false : (key.replace(/.*_/gi, ''));
    if (optKey) {
      obj.optKey = optKey;
      obj.items = {};
    }
    var addClass = key.indexOf('color') === 0 ? 'color' : (key.indexOf('size') === 0 ? 'size' : false);
    if (addClass) {
      if (addClass === 'size') {
        obj.itemsSort = 'size';
      }
      obj.search = false;
      obj.isMore = false;
    }
    obj.filter = 'checkbox';
    if (defaulOpen[catalogType] && defaulOpen[catalogType].indexOf(key) >= 0) {
      obj.isOpen = true;
    }
  }

  // if (isPreorder) {
  //   delete catalogFiltersData.filters.brand;
  // }
}

//=====================================================================================================
// Получение и преобразование данных для фильтров каталога:
//=====================================================================================================

// Получение данных из options массива items:

function getDataForFilters(item) {
  var filter, data, items, option;
  if (item.options && item.options != 0) {
    for (var k in catalogFiltersData.filters) {
      filter = catalogFiltersData.filters[k];
      if (filter.section) {
        for (var kk in filter.section) {
          data = filter.section[kk];
          getOpt();
        }
      } else {
        data = filter;
        getOpt();
      }
    }
  }
  function getOpt() {
    if (!data.optKey) {
      return;
    }
    items = data.items;
    option = item.options[(catalogType === 'equip' ? 'id_' : '') + data.optKey];
    if (option) {
      option = option.split(',');
      option.forEach(k => getData(k.trim()));
    }
  }

  function getData(el) {
    if (data.optKey == '43') {
      var elVal = el.toLowerCase();
      if (elVal.indexOf('муж') === 0) {
        writeData('Муж.');
      } else if (elVal.indexOf('жен') === 0) {
        writeData('Жен.');
      } else {
        writeData('Муж.');
        writeData('Жен.');
      }
    } else {
      writeData(el);
    }
  }

  function writeData(el) {
    if (el) {
      var clearEl = el.toLowerCase().replace(/["'\s]/g, '');
      if (items[data.optKey + '_' + clearEl] === undefined) {
        items[data.optKey + '_' + clearEl] = el;
      }
      item[data.optKey + '_' + clearEl] = '1';
    }
  }
}

//=====================================================================================================
// Создание данных для фильтров каталога:
//=====================================================================================================

function createCatalogFiltersData() {
  var filter, data, items;
  for (var k in catalogFiltersData.filters) {
    filter = catalogFiltersData.filters[k];
    if (filter.section) {
      for (var kk in filter.section) {
        data = filter.section[kk];
        create();
      }
    } else {
      data = filter;
      create();
    }
  }

  function create() {
    items = data.items;
    if (!data.title) {
      if (data.optKey && optnames) {
        data.title = optnames[data.optKey];
      }
      data.title = data.title || '';
    }
    items = convertDataForFillTemp(items, data.optKey);
    if (items && data.itemsSort) {
      items.sort(sortBy('title', data.itemsSort));
    }
    data.items = items;
  }
}
