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

// Создание данных для фильтров каталога:

function createFilterData(data, optNumb) {
  var filter = {};
  if (window.actions && data === actions) {
    filter = createFilterFromActions();
  } else if (window.items && optNumb) {
    filter = createFilterFromOptions(optNumb);
  } else if (window.catsubs && data === catsubs) {
    filter = createFilterFromCatsubs();
  } else {
    filter = createFilterFromObj(data);
  }
  return filter;
}

// Создание данных для фильтра из объекта actions:

function createFilterFromActions() {
  var filter = {},
      i = 0;
  for (var key in actions) {
    filter[i] = {
      title: actions[key].title,
      value: key
    }
    i++;
  }
  return filter;
}

// Создание данных для фильтра из данных options в массиве items:

function createFilterFromOptions(optNumb) {
  var filter = {}, item;
  items.forEach(el => {
    if (el.options && el.options != 0) {
      item = el.options[optNumb];
      if (filter[item] === undefined) {
        filter[item] = 1;
      }
    }
  });
  return createFilterFromObj(filter);
}

// Создание данных для фильтра из данных catsubs:

function createFilterFromCatsubs() {
  var filter = {},
      subItems,
      i = 0,
      ii;
  for (var k in catsubs) {
    subItems = {};
    ii = 0;
    for (var kk in catsubs[k]) {
      subItems[ii] = {
        title: catsubs[k][kk],
        value: catsubs[k][kk],
        subkey: k
      };
      ii++;
    }
    filter[i] = {
      title: k,
      value: k,
      items: subItems
    };
    i++;
  }
  return filter;
}

function createFilterFromObj(data) {
  var filter = {},
      title,
      i = 0;
  for (var key in data) {
    title = data[key] == 1 ? key : data[key];
    if (title == 'SpyOptic') {
      title = 'Spy Optic';
    } else if (title == 'TroyLeeDesigns') {
      title = 'Troy Lee Designs';
    } else if (title == 'KingDolphin') {
      title = 'King Dolphin';
    }
    filter[i] = {
      title: title,
      value: key
    };
    i++;
  }
  return filter;
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
    items: createFilterData(use,)
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
  //   items: sortObjByKey(createFilterData(items, '1262'), 'number from string')
  // }
  );
}

dataFilters.forEach((filter, index) => {
  if (!filter.items || isEmptyObj(filter.items)) {
    dataFilters.splice(index, 1);
  }
});
