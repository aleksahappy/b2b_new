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
  if (pageId === 'equip' && window.sizelist) {
    for (var key in sizelist['1295']) {
      sizeSV[key.replace('REU', 'SV')] = key.replace('REU', '');
    }
    sizeSV['SVNA'] = 'NA';
  }

  // Настройки фильтров:
  var filterSettings = {
    action_id: {
      title: 'Спецпредложение',
      filter: 'checkbox',
      items: window.actions || [],
    },
    state: {
      title: 'Доступность',
      filter: 'checkbox',
      items: window.state || [],
    },
    cat: {
      title: 'Категория',
      filter: 'checkbox',
      items: window.catsubs || [],
    },
    brand: {
      title: 'Бренд',
      search: 'usual',
      filter: 'checkbox',
      items: window.brands || [],
      isMore: true
    },
    model: {
      search: 'usual',
      filter: 'checkbox',
      optKey: '15', // Модель
      itemsSort: 'text',
      items: {},
      isMore: true
    },
    use: {
      title: 'Применяемость',
      filter: 'checkbox',
      items: window.use || [],
      isMore: true
    },
    color: {
      filter: 'checkbox',
      optKey: '27', // Цвет
      optSplit: ',',
      items: {}
    },
    sizeREU: {
      title: 'Размер для фильтров (собран из sizelist)',
      filter: 'checkbox',
      itemsSort: 'size',
      items: window.sizelist ? (window.sizelist['1252'] || []) : [] // Размер для фильтров
    },
    size_1252: {
      filter: 'checkbox',
      optKey: '1252', // Размер для фильтров
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    },
    size_39: {
      filter: 'checkbox',
      optKey: '39', // Размер поставщика
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    },
    size_38: {
      filter: 'checkbox',
      optKey: '38', // Размер для сайта
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    },
    size_1256: {
      filter: 'checkbox',
      optKey: '1256', // Европейский размер
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    },
    size_1260: {
      filter: 'checkbox',
      optKey: '1260', // Размер взрослый
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    },
    size_60: {
      filter: 'checkbox',
      optKey: '60', // Размер детский
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    },
    size_1273: {
      filter: 'checkbox',
      optKey: '1273', // Размер американский взрослый
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    },
    size_1274: {
      filter: 'checkbox',
      optKey: '1274', // Размер американский детский
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    },
    size_1295: {
      filter: 'checkbox',
      optKey: '1295', // Длина стельки взрослый
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    },
    size: {
      title: 'Размер',
      mode: {EU: 'Европейский размер', US: 'Американский размер', cm: 'Длина стельки, см'},
      section: {
        size1260: {
          title: 'Взрослый',
          mode: 'EU',
          filter: 'checkbox',
          optKey: '1260', // Размер взрослый
          optSplit: ',',
          itemsSort: 'size',
          items: {}
        },
        size60: {
          title: 'Детский',
          mode: 'EU',
          filter: 'checkbox',
          optKey: '60', // Размер детский
          optSplit: ',',
          itemsSort: 'size',
          items: {}
        },
        size1273: {
          title: 'Взрослый',
          mode: 'US',
          filter: 'checkbox',
          optKey: '1273', // Размер американский взрослый
          optSplit: ',',
          itemsSort: 'size',
          items: {}
        },
        size1274: {
          title: 'Детский',
          mode: 'US',
          filter: 'checkbox',
          optKey: '1274', // Размер американский детский
          optSplit: ',',
          itemsSort: 'size',
          items: {}
        },
        size1295: {
          title: 'Взрослый',
          mode: 'cm',
          filter: 'checkbox',
          optKey: '1295', // Длина стельки взрослый
          optSplit: ',',
          itemsSort: 'size',
          items: {}
        },
        size1313: {
          title: 'Детский',
          mode: 'cm',
          filter: 'checkbox',
          optKey: '1313', // Длина стельки детский
          optSplit: ',',
          itemsSort: 'size',
          items: {}
        }
      }
    },
    age: {
      filter: 'checkbox',
      optKey: '42', // Возраст
      items: {}
    },
    gender: {
      filter: 'checkbox',
      optKey: '43', // Пол
      items: {}
    },
    lengthCМ: {
      filter: 'checkbox',
      optKey: '41', // Длина, см
      itemsSort: 'text',
      items: {},
      isMore: true
    },
    manuf: {
      title: 'Производитель',
      filter: 'checkbox',
      optKey: '7', // Производитель техники
      optSplit: ',',
      itemsSort: 'text',
      items: {},
      isMore: true
    },
    material: {
      filter: 'checkbox',
      optKey: '3', //Материал
      itemsSort: 'text',
      items: {},
      isMore: true
    },
    power: {
      filter: 'checkbox',
      optKey: '5', //Мощность мотора, лс
      itemsSort: 'text',
      items: {},
      isMore: true
    },
    step: {
      filter: 'checkbox',
      optKey: '4', //Шаг
      itemsSort: 'text',
      items: {},
      isMore: true
    },
    fit: {
      filter: 'checkbox',
      optKey: '6', // Посадка на вал
      itemsSort: 'text',
      items: {},
      isMore: true
    },
    type: {
      filter: 'checkbox',
      optKey: '8', // Тип лодочного мотора'
      itemsSort: 'text',
      items: {},
      isMore: true
    },
    year: {
      filter: 'checkbox',
      optKey: '32', // Год модели техники
      optSplit: ',',
      itemsSort: 'text',
      items: {}
    },
    model_technics: {
      filter: 'checkbox',
      optKey: '33', // Модель техники
      optSplit: ',',
      itemsSort: 'text',
      items: {}
    }
  };

  // Основные фильтры в зависимости от типа каталога:
  var basicFilters = {
    equip: {
      action_id: true,
      state: true,
      cat: true,
      brand: false,
      use: false,
      sizeREU: false,
      size_1252: false,
      size_39: false,
      size_38: false,
      size_1256: false,
      size_1260: false,
      size_60: false,
      size_1273: false,
      size_1274: false,
      size_1295: false,
      size: false,
      age: false,
      gender: false,
      length: false,
      color: false
    },
    zip: {
      action_id: true,
      state: true,
      manuf: true,
      brand: true,
      cat: false,
      use: false,
      color: false
    }
  }

  // Дополнительные фильтры по каталогам:
  var addFilters = {
    boats: {
      material: false,
      power: false,
      step: false,
      fit: false,
      type: false
    },
    snowbike: {
      year: false,
      model_technics: false
    }
  };

  addInCatalogFiltersData(basicFilters[catalogType]);
  addInCatalogFiltersData(addFilters[pageId]);

  function addInCatalogFiltersData(data) {
    if (!data) {
      return;
    }
    var isOpen;
    for (var key in data) {
      if (filterSettings[key]) {
        catalogFiltersData.filters[key] = filterSettings[key];
        isOpen = data[key];
        if (isOpen) {
          catalogFiltersData.filters[key].isOpen = isOpen;
        }
      }
    }
  }
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
    option = item.options[(pageId === 'equip' ? 'id_' : '') + data.optKey];
    if (option) {
      if (data.optSplit) {
        option = option.split(data.optSplit);
        option.forEach(k => getData(k.trim()));
      } else {
        getData(option);
      }
    }
  }

  function getData(el) {
    if (data.optKey == '43') {
      if (el.indexOf('муж') >= 0) {
        writeData('Муж.');
      } else if (el.indexOf('жен') >= 0) {
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
