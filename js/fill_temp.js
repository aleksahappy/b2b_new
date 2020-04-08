'use strict';

// Получение элемента по id или селектору:

function getEl(el, area = document) {
  if (typeof el === 'string') {
    area = typeof area === 'string' ? getEl(area): area;
    if (el.indexOf('.') === 0 || el.indexOf('[') === 0) {
      el = area.querySelector(el);
    } else if (area === document) {
      el = area.getElementById(el);
    } else {
      el = area.querySelector(el);
    }
  }
  return el;
}

//=====================================================================================================
// Универсальное заполнение данных по шаблону:
//=====================================================================================================

// В каком виде данные нужно передавать в функцию fillTemplate:
//
// * - обязательное поле, остальные можно пропускать
//
// var data = {
//   area *: элемент / id / селектор,                   Откуда будет браться шаблон, можно передать:
//                                                      - переменная, в которой хранится уже найденный в DOM элемент
//                                                      - id, по которому нужно найти элемент в DOM
//                                                      - селектор, по которому нужно найти элемент в DOM
//
//   items *: массив объектов / объект / массив         Данные для заполнения шаблона, они могут быть такие:
//                                                      - массив или объект с ключами 0,1,2.. содержащий массивы и/или объекты
//                                                      - объект (ключ: значение)
//                                                      - массив содержащий строки и/или цифры
//
//    source: 'inner' / 'outer',                       Как получать шаблон из DOM (по умолчанию - 'inner'):
//                                                      - весь тег целиком, т.е. с помощью outerHTML
//                                                      - внутреннюю часть тега, т.е. с помощью innerHTML
//
//    target: id элемента,                             Куда нужно вставить шаблон (по умолчанию - data.area, т.е. туда, откуда взяли):
//                                                     - id области куда будет вставляться результат
//                                                     - селектор области куда будет вставляться результат (поиск по document)
//
//    sign: '#' / '@@' / другой,                       Символ для поиска места замены в html (по умолчанию - '#'):
//                                                     - # (тогда в html прописываем #...#)
//                                                     - @@ (тогда в html прописываем @@...@@)
//                                                     - можно применять и другие символы
//
//    sub: [{                                          Данные о подшаблонах  (по умолчанию подшаблонов нет).
//      area: id / селектор                            Вносить только в виде массива объектов, даже если объект один.
//      items: название ключа из data.items            Каждый объект аналогин объекту data, который мы сейчас учимся заполнять.
//      sub : (если есть подшаблон) [{              Каждый объект содержит (обязательны только area и items):
//        area: id / селектор                          - area * - id или селектор, по которому нужно найти подшаблон в шаблоне
//        items: название ключа из sub.items           - items * - ключ, по которому в данных необходимо взять информацию для заполнения подшаблона
//      }],                                            - sub - если есть подшаблон у этого подшаблона, то здесь указывается такая же структура массива объектов
//      sign: '#' / '@@' / другой,                     - sign - cимвол для поиска места замены, если отличен от того, что в родительском шаблоне
//      iterate: 'temp' / 'data'                       - iterate - как производить перебор при замене, если метод отличен от метода в родительском шаблоне
//    }, {
//      area: id / селектор
//      items: название ключа из data.items
//    }...]
//
//    action: 'replace' / return',                     Действие с данными (по умолчанию - 'replace'):
//                                                     - replace - вставит заполненный шаблон на страницу
//                                                     - return - вернет строку с заполненным шаблоном
//
//    method: 'inner' / 'begin' / 'end'                Метод вставки шаблона на страницу (по умолчанию - 'inner'):
//                                                     - inner - замена содержимого
//                                                     - begin - перед первым дочерним элементом
//                                                     - end - после последнего дочернего элемента
//
//    iterate: 'temp' / 'data'                         Как производить перебор при замене данных в шаблоне (по умолчанию - 'temp'):
// }                                                   - перебором всех мест замены (#...#) в шаблоне:
//                                                       * берем каждое место замены
//                                                       * если в данных есть ключ с таким названием, то производим замену
//                                                       * удобно, если в данных много лишних ключей
//                                                     - перебором всех ключей в данных:
//                                                       * берем каждый ключ
//                                                       * если есть место замены с таким названием, то производим замену
//                                                       * удобно если в данных нет ничего лишнего, а места замены наоборот повторяют содержимое
//
//
// Пример данных:
//
// var data = {
//   area: 'big-card',
//   items: items,
//   source: 'outer',
//   target: 'gallery',
//   sign: '#',
//   sub: [{
//     area: '.carousel-gallery',
//     items: 'images'
//   }, {
//     area: '.card-sizes',
//     items: 'sizes'
//   }, {
//     area: '.card-options',
//     items: 'options'
//   }, {
//     area: '.manuf-row',
//     items: 'manuf_table'
//   }],
//   action: 'replace',
//   method: 'inner'
//   iterate: 'temp'
// }

// Универсальная функция заполнения данных по шаблону:

function fillTemplate(data) {
  if (!data.area || !data.items) {
    return;
  }

  if (typeof data.area === 'string') {
    data.areaName = (data.parentAreaName || '') + data.area;
    data.area = getEl(data.area, data.parentArea);
  } else {
    data.areaName = data.area.id || data.area.classList[0];
  }

  if (!data.area) {
    if (data.temp) {
      return data.temp;
    }
    return;
  }

  var temp = window[`${data.areaName}Temp`]; // шаблон
  if (!temp) {
    if (data.source && data.source === 'outer') {
      temp = window[`${data.areaName}Temp`] = data.area.outerHTML;
    } else {
      temp = window[`${data.areaName}Temp`] = data.area.innerHTML;
    }
  }

  var txt = fillTemp(data, data.items, temp);
  if (data.temp) {
    return data.temp.replace(temp, txt);
  } else {
    if (data.action && data.action === 'return') {
      return txt;
    } else {
      var targetEl = data.area;
      if (data.target) {
        var target = getEl(data.target);
        if (target) {
          targetEl = target;
        }
      }
      insertText(targetEl, txt, data.method);
    }
  }
}

// Определение функции для замены данных:

function fillTemp(data, items, temp) {
  var txt = '';
  if (typeof items === 'object') { // данные - это всегда массив или объект
    if (items[0] && typeof items[0] === 'object') { //данные - массив или объект с ключами 0,1,2.. содержащий массивы и/или объекты
      txt = fillList(data, items, temp);
    } else if (Array.isArray(items)) { //данные - массив (строк или чисел)
      txt = fillList(data, items, temp);
    } else if (!Array.isArray(items)) { //данные - объект (ключ: значение)
      txt = fillEl(data, items, temp);
    }
  }
  return txt;
}

// Создание нескольких элементов на основе данных:

function fillList(data, items, temp) {
  var result = '',
      newEl;
  for (var arrKey in items) {
    newEl = fillEl(data, items[arrKey], temp);
    result += newEl;
  }
  return result;
}

// Создание одного элемента на основе данных:

function fillEl(data, items, temp) {
  if (data.sub) { // Если есть подшаблоны
    temp = fillSubTemp(data, items, temp);
  }

  if (typeof items === 'string' || typeof items === 'number') { //Данные - строка
    temp = replaceInTemp(null, items, temp, data.sign);
  } else if (data.iterate && data.iterate === 'data') {
    for (var key in items) {
      if (!data.sub || subNames.indexOf(key) === -1) {
        temp = replaceInTemp(key, items, temp, data.sign);
      }
    }
  } else {
    var props = temp.match(/#[^#]+#/gi);
    props = props ? props.map(prop => prop = prop.replace(/#/g, '')) : [];
    props.forEach(key => {
      temp = replaceInTemp(key, items, temp, data.sign);
    });
  }
  return temp;
}

// Заполнение подшаблонов:

function fillSubTemp(data, items, temp) {
  var subData;
  for (var sub of data.sub) {
    subData = {
      area: sub.area,
      items: items[sub.items] ? Object.assign(items[sub.items]) : [],
      sub: sub.sub,
      parentArea: data.area,
      parentAreaName: data.areaName,
      temp: temp,
      source: sub.source || 'outer',
      sign: sub.sign || data.sign,
      iterate: sub.iterate || data.iterate,
    };
    temp = fillTemplate(subData);
  }
  return temp;
}

// Подстановка данных в шаблон:

function replaceInTemp(key, items, temp, sign) {
  var sign = sign || '#',
      value = key ? items[key] : items;
  if (typeof value === 'string' || typeof value === 'number') {
    var regex = new RegExp(sign + (key || 'item') + sign, 'gi');
    temp = temp.replace(regex, value);
  }
  return temp;
}

// Вставка заполненного шаблона в документ:

function insertText(el, txt, method = 'inner') {
  el.classList.remove('template');
  txt = txt.replace('template', '');
  if (el.childNodes.length === 1 && el.firstChild.classList.contains('template')) {
    el.innerHTML = txt;
  } else if (method === 'end') {
    el.insertAdjacentHTML('beforeend', txt);
  } else if (method === 'begin') {
    el.insertAdjacentHTML('afterbegin', txt);
  } else {
    el.innerHTML = txt;
  }
}
