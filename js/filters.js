'use strict';

// Переменная для хранения всех фильтров страницы:

var catalogFiltersData = {
  filters: {},
  isSave: true,
  isVisible: true
};

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
    items: actions,
    isOpen: true
  };
  catalogFiltersData.filters.state = {
    title: 'Доступность',
    filter: 'checkbox',
    items: state,
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
    items: catsubs,
    isOpen: true
  };
  catalogFiltersData.filters.brand = {
    title: 'Бренд',
    filter: 'checkbox',
    items: brands,
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
    catalogFiltersData.filters.use = {
      title: 'Применяемость',
      filter: 'checkbox',
      items: use,
      isMore: true
    };
    catalogFiltersData.filters.sizeREU = {
      title: 'Размер',
      filter: 'checkbox',
      itemsSort: 'numb',
      items: sizelist['1252'] // Размер для фильтров
    };
    catalogFiltersData.filters.sizeSV = {
      title: 'Размер стельки',
      filter: 'checkbox',
      itemsSort: 'numb',
      items: sizeSV // Длина стельки взрослый
    };
    catalogFiltersData.filters.size1260 = {
      filter: 'checkbox',
      optKey: '1260', // Размер взрослый
      optSplit: ',',
      optPrefix: 'REUA',
      itemsSort: 'numb',
      items: {}
    };
    catalogFiltersData.filters.size60 = {
      filter: 'checkbox',
      optKey: '60', // Размер детский
      optSplit: ',',
      optPrefix: 'REUC',
      itemsSort: 'numb',
      items: {}
    };
    catalogFiltersData.filters.size1273 = {
      filter: 'checkbox',
      optKey: '1273', // Размер американский взрослый
      optSplit: ',',
      optPrefix: 'RAMA',
      itemsSort: 'numb',
      items: {}
    };
    catalogFiltersData.filters.size1274 = {
      filter: 'checkbox',
      optKey: '1274', // Размер американский детский
      optSplit: ',',
      optPrefix: 'RAMC',
      itemsSort: 'numb',
      items: {}
    };
    catalogFiltersData.filters.size1295 = {
      filter: 'checkbox',
      optKey: '1295', // Длина стельки взрослый
      optSplit: ',',
      optPrefix: 'ILA',
      itemsSort: 'numb',
      items: {}
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
  var data, items, title;
  if (item.options && item.options != 0) {
    for (var key in catalogFiltersData.filters) {
      data = catalogFiltersData.filters[key];
      items = data.items;
      if (data.optKey) {
        title = item.options[(pageId === 'equip' ? 'id_' : '') + data.optKey];
        if (title) {
          if (data.optSplit) {
            title = title.split(data.optSplit);
            title.forEach(k => getData(k.trim()));
          } else {
            getData(title);
          }
        }
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
    if (data.optPrefix) {
      if (items[data.optPrefix + el] === undefined) {
        items[data.optPrefix + el] = el;
      }
      item[data.optPrefix + el] = '1';
    } else {
      if (items[el] === undefined) {
        items[el] = '1';
      }
      item[el] = '1';
    }
  }
}

// Получение данных из переменных для пунктов фильтра:

function createFilterItems(data) {
  var items = [];
  if (!data) {
    return items;
  }
  if (typeof data === 'object') {
    var title,
        item;
    Object.keys(data).forEach((key, index) => {
      title = getTitle(key, data[key]);
      item = {
        title: title,
        value: key != index ? key : title,
      };
      if (data[key] && typeof data[key] === 'object' && !data[key].title) {
        item.key = item.value;
        item.items = createFilterItems(data[key]);
      }
      items.push(item);
    });
  }
  return items;
}

// Получение названия для фильтра, которое будет отображаться на странице:

function getTitle(key, value) {
  var title;
  if (value && typeof value === 'object') {
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
  var filter, items;
  for (var key in catalogFiltersData.filters) {
    filter = catalogFiltersData.filters[key];
    items = filter.items;
    if (!filter.title) {
      if (filter.optKey && optnames) {
        filter.title = optnames[filter.optKey];
      }
      filter.title = filter.title || '';
    }
    items = createFilterItems(items);
    if (items && filter.itemsSort) {
      items.sort(sortBy('title', filter.itemsSort));
    }
    catalogFiltersData.filters[key].items = items;
  }
}

//=====================================================================================================
// Создание данных для фильтров ЗИП:
//=====================================================================================================

function createZipSelectsData() {
  var data = [{
    title: 'Производитель',
    key: 'man',
  }, {
    title: 'Год выпуска',
    key: 'years',
  }, {
    title: 'Модель',
    key: 'model',
  }]
  return data;
}
