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

var sizes = {
  '2XS': "1",
  'XS': "1",
  'S': "1",
  'M': "1",
  'L': "1",
  'XL': "1",
  '2XL': "1",
  '3XL': "1",
  '4XL': "1"
};

var sizeSV = {};

var gender = {
  'male': 'Муж.',
  'female': 'Жен.'
};

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

  // Общие фильтры для всех страниц:
  catalogFiltersData.filters.action_id = {
    title: 'Спецпредложение',
    filter: 'checkbox',
    items: window.actions || [],
    isOpen: true
  };
  catalogFiltersData.filters.state = {
    title: 'Доступность',
    filter: 'checkbox',
    items: window.state || [],
    isOpen: true
  };

  // Фильтр для ЗИП:
  if (pageId !== 'equip') {
    catalogFiltersData.filters.manuf = {
      filter: 'checkbox',
      optKey: '7', // Производитель техники
      optSplit: ',',
      itemsSort: 'text',
      items: {},
      isOpen: true,
      isMore: true
    };
  }

  // Общие фильтры для всех страниц:
  catalogFiltersData.filters.cat = {
    title: 'Категория',
    filter: 'checkbox',
    items: window.catsubs || [],
    isOpen: true
  };
  catalogFiltersData.filters.brand = {
    title: 'Бренд',
    search: 'usual',
    filter: 'checkbox',
    items: window.brands || [],
    isMore: true
  };

  // Фильтры экипировки:
  if (pageId === 'equip') {
    catalogFiltersData.filters.model = {
      search: 'usual',
      filter: 'checkbox',
      optKey: '15', // Модель
      itemsSort: 'text',
      items: {},
      isMore: true
    };
  }

  // Общие фильтры для всех страниц:
  catalogFiltersData.filters.use = {
    title: 'Применяемость',
    filter: 'checkbox',
    items: window.use || [],
    isMore: true
  };

  // Фильтры экипировки:
  if (pageId === 'equip') {
    catalogFiltersData.filters.sizeREU = {
      title: 'Размер для фильтров (собран из sizelist)',
      filter: 'checkbox',
      itemsSort: 'size',
      items: window.sizelist['1252'] || [] // Размер для фильтров
    };

    catalogFiltersData.filters.size_1252 = {
      filter: 'checkbox',
      optKey: '1252', // Размер для фильтров
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    };
    catalogFiltersData.filters.size_39 = {
      filter: 'checkbox',
      optKey: '39', // Размер поставщика
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    };
    catalogFiltersData.filters.size_38 = {
      filter: 'checkbox',
      optKey: '38', // Размер для сайта
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    };
    catalogFiltersData.filters.size_1256 = {
      filter: 'checkbox',
      optKey: '1256', // Европейский размер
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    };
    catalogFiltersData.filters.size_1260 = {
      filter: 'checkbox',
      optKey: '1260', // Размер взрослый
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    };
    catalogFiltersData.filters.size_60 = {
      filter: 'checkbox',
      optKey: '60', // Размер детский
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    };
    catalogFiltersData.filters.size_1273 = {
      filter: 'checkbox',
      optKey: '1273', // Размер американский взрослый
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    };
    catalogFiltersData.filters.size_1274 = {
      filter: 'checkbox',
      optKey: '1274', // Размер американский детский
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    };
    catalogFiltersData.filters.size_1295 = {
      filter: 'checkbox',
      optKey: '1295', // Длина стельки взрослый
      optSplit: ',',
      itemsSort: 'size',
      items: {}
    };

    catalogFiltersData.filters.size = {
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
    };
    catalogFiltersData.filters.age = {
      filter: 'checkbox',
      optKey: '42', // Возраст
      items: {}
    };
    catalogFiltersData.filters.gender = {
      filter: 'checkbox',
      optKey: '43', // Пол
      items: {}
    };
    catalogFiltersData.filters.length = {
      filter: 'checkbox',
      optKey: '41', // Длина, см
      itemsSort: 'text',
      items: {},
      isMore: true
    };
  }

  // Общие фильтры для всех страниц:
  catalogFiltersData.filters.color = {
    filter: 'checkbox',
    optKey: '27', // Цвет
    optSplit: ',',
    items: {}
  };

  // Фильтры для лодок и моторов:
  if (pageId === 'boats') {
    catalogFiltersData.filters.material = {
      filter: 'checkbox',
      optKey: '3', //Материал
      itemsSort: 'text',
      items: {},
      isMore: true
    };
    catalogFiltersData.filters.power = {
      filter: 'checkbox',
      optKey: '5', //Мощность мотора, лс
      itemsSort: 'text',
      items: {},
      isMore: true
    };
    catalogFiltersData.filters.step = {
      filter: 'checkbox',
      optKey: '4', //Шаг
      itemsSort: 'text',
      items: {},
      isMore: true
    };
    catalogFiltersData.filters.fit = {
      filter: 'checkbox',
      optKey: '6', // Посадка на вал
      itemsSort: 'text',
      items: {},
      isMore: true
    };
    catalogFiltersData.filters.type = {
      filter: 'checkbox',
      optKey: '8', // Тип лодочного мотора'
      itemsSort: 'text',
      items: {},
      isMore: true
    };
  }

  // Фильтры сноубайков:
  if (pageId === 'snowbike') {
    catalogFiltersData.filters.year = {
      filter: 'checkbox',
      optKey: '32', // Год модели техники
      optSplit: ',',
      itemsSort: 'text',
      items: {}
    };
    catalogFiltersData.filters.model = {
      filter: 'checkbox',
      optKey: '33', // Модель техники
      optSplit: ',',
      itemsSort: 'text',
      items: {}
    };
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
      } else if (el.indexOf('муж') >= 0) {
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
    var clearEl = el.replace(/"|'/g, '');
    if (items[data.optKey + '_' + clearEl] === undefined) {
      items[data.optKey + '_' + clearEl] = el;
    }
    item[data.optKey + '_' + clearEl] = '1';
  }
}

// Получение данных из переменных для пунктов фильтра:

function createFilterItems(data, isOptType) {
  var items = [];
  if (!data) {
    return items;
  }
  if (typeof data === 'object') {
    var title,
        item;
    Object.keys(data).forEach((key, index) => {
      title = getTitle(key, data[key], isOptType);
      item = {
        title: title,
        value: Array.isArray(data) ? title : key
      };
      if (data[key] && typeof data[key] === 'object' && !data[key].title) {
        item.key = item.value;
        item.items = createFilterItems(data[key], isOptType);
      }
      items.push(item);
    });
  }
  return items;
}

// Получение названия для фильтра, которое будет отображаться на странице:

function getTitle(key, value, isOptType) {
  var title;
  if (isOptType) {
    title = value
  } else if (value && typeof value === 'object') {
    title = value.title || key;
  } else if (!value || value == 1) {
    title = key;
  } else {
    title = value;
  }

  if (title == 'SpyOptic') {
    title = 'Spy Optic';
  } else if (title == 'TroyLeeDesigns') {
    title = 'Troy Lee Designs';
  } else if (title == 'KingDolphin') {
    title = 'King Dolphin';
  } else if (title == 'LASleeve') {
    title = 'LA Sleeve';
  }
  return title;
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
    items = createFilterItems(items, data.optKey);
    if (items && data.itemsSort) {
      items.sort(sortBy('title', data.itemsSort));
    }
    data.items = items;
  }
}
