'use strict';

//=====================================================================================================
// Ручные данные для фильтров каталога:
//=====================================================================================================

var state = {
  'free': 'В наличии',
  'arrive': 'Ожидает поступления'
};

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
  'fuxy': 'Фуксия',
  'green': 'Зеленый',
  'olive': 'Оливковый', // новый
  'yellow': 'Желтый',
  'orange': 'Оранжевый',
  'camo': 'Камуфляж',
  'haki': 'Хаки',
  'multicolor': 'Мульти',
  'transparent': 'Прозрачный',
  'black/pink': 'Черный/розовый',
  'black/grey': 'Черный/серый',
  'metallic': 'Металик', // нет в массиве
  'graphite': 'Графитовый' // нет в массиве
}

//=====================================================================================================
// Получение и преобразование данных для фильтров каталога:
//=====================================================================================================

// Получение данных из options массива items:

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
  var dataNames = {
    state: 'state',
    action_id: 'specialOffer',
    cat: 'catsubs',
    brand: 'brands',
    use: 'use',
    age: 'ages',
    gender: 'gender',
    size: 'sizes',
    color: 'colors'
  };

  var data = {
    filters: {},
    isSave: true,
    isVisible: true
  }

  var commonFilters = {
    state: 'Доступность',
    action_id: 'Спецпредложение',
    cat: 'Категория',
    brand: 'Бренд'
  };

  for (var key in commonFilters) {
    data.filters[key] = {
      title: commonFilters[key],
      filter: 'checkbox',
      items: createFilterItems(window[dataNames[key]]),
      isOpen: true
    };
  }

  if (pageId === 'equip') {
    var equipFilters = {
      use: 'Применяемость',
      age: 'Возраст',
      gender: 'Пол',
      size: 'Размер',
      color: 'Цвет'
    }

    for (var key in equipFilters) {
      data.filters[key] = {
        title: equipFilters[key],
        filter: 'checkbox',
        items: createFilterItems(window[dataNames[key]]),
      };
    }
  }
  return data;
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
