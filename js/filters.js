'use strict';

//=====================================================================================================
//  Подготовка данных для фильтров каталога:
//=====================================================================================================

// Данные для фильтров каталога:

var use = {
  'moto': 'Мотоцикл',
  'quadro': 'Квадроцикл',
  'velo': 'Велосипед',
  'skatebord': 'Скейтборд',
  'sneghod': 'Снегоход',
  'snegbike': 'Сноубайк',
  'snegbord': 'Сноуборд',
  'gornie': 'Горные лыжи',
  'fitness': 'Фитнесс'
};

var ages = {
  'adult':'Взрослые',
  'child': 'Дети'
};

var gender = {
  'male':'Муж.',
  'female':'Жен.'
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

var colors = {
  'white': 'Белый',
  'black': 'Черный',
  'grey': 'Серый',
  'brown': 'Коричневый',
  'blue': 'Синий', // нет в массиве
  'cyan': 'Голубой',
  'turquoise': 'Бирюзовый', // нет в массиве
  'bordo': 'Бордовый',
  'red': 'Красный',
  'pink': 'Розовый',
  'fiol': 'Фиолетовый',
  'green': 'Зеленый',
  'fuxy': 'Фуксия',
  'orange': 'Оранжевый',
  'yellow': 'Желтый',
  'camo': 'Камуфляж',
  'haki': 'Хаки',
  'multicolor': 'Мульти',
  'transparent': 'Прозрачный',
  'black/pink': 'Черный/розовый',
  'black/grey': 'Черный/серый',
  'metallic': 'Металик', // нет в массиве
  'graphite': 'Графитовый' // нет в массиве
}


// Получение уникальных данных из options массива items:

function getDataFromOptions(optNumb) {
  var filter = {}, item;
  items.forEach(el => {
    if (el.options && el.options != 0) {
      item = el.options[optNumb];
      if (filter[item] === undefined) {
        filter[item] = 1;
      }
    }
  });
  return filter;
}

// Создание данных для фильтров каталога:

function createFilterData(data, parent) {
  var items = [];
  if (!data) {
    return items;
  }
  if (typeof data === 'object') {
    var title,
        item,
        subItems,
        index = 0;
    for (var key in data) {
      title = getTitle(key, data[key]);
      item = {
        title: title,
        value: key != index ? key : title,
      };
      if (parent) {
        item.subkey = parent;
      }
      if (data[key] && typeof data[key] === 'object' && !data[key].title) {
        subItems = createFilterData(data[key], item.value);
        item.items = subItems;
      }
      items.push(item);
      index ++;
    }
  }
  return items;
}

// Получение для фильтра названия, которое будет отображаться на странице:

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
  }
  return title;
}

// Сортировка подкатегорий по алфавиту:

// for (var k in catsubs) {
//   for(var kk in catsubs[k]) {
//     catsubs[k]['key' + kk] = catsubs[k][kk];
//     delete catsubs[k][kk];
//     catsubs[k] = sortObjByValue(catsubs[k]);
//   }
// }

//=====================================================================================================
// Данные для фильтров каталога:
//=====================================================================================================

if (!window.actions) {
  window.actions = {};
}
actions['is_new'] = {title: 'Новинка'};

var dataFilters = [{
  title: 'Спецпредложение',
  isOpen: true,
  key: 'action_id',
  items: createFilterData(window.actions)
}, {
  title: 'Категория',
  isOpen: true,
  key: 'cat',
  items: createFilterData(window.catsubs)
}, {
  title: 'Бренд',
  isOpen: true,
  key: 'brand',
  items: createFilterData(brands)
}];

if (pageId === 'equip') {
  dataFilters.push({
    title: 'Применяемость',
    key: 'use',
    items: createFilterData(use)
    // items: sortObjByValue(use)
  }, {
    title: 'Возраст',
    key: 'age',
    items: createFilterData(ages)
  }, {
    title: 'Пол',
    key: 'gender',
    items: createFilterData(gender)
  }, {
    title: 'Размер',
    key: 'size',
    items: createFilterData(sizes)
  }, {
    title: 'Цвет',
    key: 'color',
    items: createFilterData(colors)
  }
  // }, {
  //   title: 'Емкость',
  //   key: 'volume',
  //   items: sortObjByKey(createFilterData(getDataFromOptions('1262')), 'number from string')
  // }
  );
}

dataFilters.forEach((filter, index) => {
  if (!filter.items || isEmptyObj(filter.items)) {
    dataFilters.splice(index, 1);
  }
});
