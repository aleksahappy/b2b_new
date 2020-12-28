'use strict';

//=====================================================================================================
// Ручные данные для фильтров каталога:
//=====================================================================================================

var state = {
  'free': 'В наличии',
  'arrive': 'Ожидает поступления'
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

var gender = {
  'male': 'Муж.',
  'female': 'Жен.'
};

var catalogFiltersData = {
  filters: {
    action_id: {
      title: 'Спецпредложение',
      filter: 'checkbox',
      items: 'actions',
      isOpen: true
    },
    state: {
      title: 'Доступность',
      filter: 'checkbox',
      items: 'state',
      isOpen: true
    },
    cat: {
      title: 'Категория',
      filter: 'checkbox',
      items: 'catsubs',
      isOpen: true
    },
    brand: {
      title: 'Бренд',
      optKey: '12',
      filter: 'checkbox',
      items: {},
      isOpen: true
    }
  },
  isSave: true,
  isVisible: true
};

if (pageId === 'equip') {
  catalogFiltersData.filters.use = {
    title: 'Применяемость',
    optKey: '1254',
    filter: 'checkbox',
    items: {}
  };
  catalogFiltersData.filters.size = {
    title: 'Размер',
    filter: 'checkbox',
    items: 'sizes'
  };
  catalogFiltersData.filters.age = {
    title: 'Возраст',
    optKey: '42',
    filter: 'checkbox',
    items: {}
  };
  catalogFiltersData.filters.gender = {
    title: 'Пол',
    filter: 'checkbox',
    items: 'gender'
  };
  catalogFiltersData.filters.length = {
    title: 'Длина, см',
    optKey: '41',
    filter: 'checkbox',
    items: {}
  };
  catalogFiltersData.filters.color = {
    title: 'Цвет',
    optKey: '27',
    filter: 'checkbox',
    items: {}
  };
}

//=====================================================================================================
// Получение и преобразование данных для фильтров каталога:
//=====================================================================================================

// Получение данных из options массива items:

function getDataForFilters(item) {
  var needSplit = ['1254', '27'],
      data, items, title;
  if (item.options && item.options != 0) {
    for (var key in catalogFiltersData.filters) {
      data = catalogFiltersData.filters[key];
      items = data.items;
      if (data.optKey) {
        title = item.options['id_' + data.optKey];
        if (title) {
          if (needSplit.indexOf(data.optKey) >= 0) {
            title = title.split(',');
            title.forEach(k => getData(k.trim()));
          } else {
            getData(title);
          }
        }
      }
    }
  }

  function getData(el) {
    if (items[el] === undefined) {
      items[el] = '1';
    }
    item[el] = '1';
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
  var needSort = ['12', '1254', '41'],
      sortType = {
        '41': 'number'
      },
      data, items;
  for (var key in catalogFiltersData.filters) {
    data = catalogFiltersData.filters[key];
    items = data.items;
    if (typeof items === 'string') {
      items = window[items];
    }
    if (items && needSort.indexOf(data.optKey) >= 0) {
      items = sortObjByKey(items, sortType[data.optKey]);
    }
    catalogFiltersData.filters[key].items = createFilterItems(items);
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
