'use strict';

// Для корректной работы скрипта необходимо подключение перед ним main.js (не будет работать без объектов DropDown и Search)

//=====================================================================================================
// Работа таблиц:
//=====================================================================================================

// В каком виде нужно передавать данные в функцию initTable:

// var settings = {
//   data: данные для заполнения таблицы - массив объектов, где каждый объект - данные строки (по умолчанию [])
//   head: true или false (по умолчанию false)
//   result: true или false (по умолчанию false)
//   cols: параметры создания таблицы (для таблиц с готовым шаблонов в html данный параметр пропускаем)
//   [{
//     key: 'key' (ключ в данных по которому находится информация для данного столбца)
//     subkey: 'subkey' (если данные в основном ключе содержат массив объектов, тогда необходимо указать подраздел на основании которого будет идти поиск и фильтрация)
//     title: 'Заголовок' (заголовок столбца)
//     resize: true или false (кнпока перетаскивания столбца - по умолчанию true)
//     result: 'kolv' или 'price' (итог по данной колонке и его формат - 0 или 0,00, по умолчанию false)
//     sort: 'text', 'numb' или 'date' (нужна ли сортировка по стлобцу и ее формат, по умолчанию false),
//     filter: 'full', 'search' или'checkbox' (нужна ли фильтрация по столбцу и ее формат, по умолчанию false)
//     content: #key# или html разметка (данные ячейки тела таблицы, если #key#, то пропускаем, если отличается, то вносим html разметку с маяками, по умолчанию #key#)
//   }]
//   sub: [{area: id / селектор, items: название ключа в data}] (если в строке таблицы есть подшаблоны, то заполняем точно также как для fillTemplate, иначе пропускаем)
// }

// Дополнительное примечание к sub:
// Вносить только в виде массива объектов, даже если объект один.
// Каждый объект содержит (обязательны только area и items):
// - area * - id или селектор, по которому нужно найти подшаблон в шаблоне
// - items * - ключ, по которому в данных необходимо взять информацию для заполнения подшаблона
// - sub - если есть подшаблон у этого подшаблона, то здесь указывается такая же структура массива объектов
// - sign - cимвол для поиска места замены, если отличен от того, что в родительском шаблоне (#)
// - iterate - как производить перебор при замене, если метод отличен от метода в родительском шаблоне ('temp')

// Пример инициализации таблицы, имеющей готовый html-шаблон в разметке:

// var settings = {
//   data: [{...}, {...}, {...}],
//   head: true,
//   result: false
// }
// initTable('tableId', settings);

// // Пример инициализации таблицы, которую необходимо заполнить динамически:

// var settings = {
//   data: [{...}, {...}, {...}],
//   head: true,
//   result: false,
//   cols: [{
//     key: 'access',
//     title: 'Доступ',
//     content: '<div class="toggle #access#" onclick="toggleAccess(event)"><div class="toggle-in"></div></div>'
//   }, {
//     key: 'title',
//     title: 'Название товара',
//     sort: 'text',
//     filter: 'search'
//   }, {
//     key: 'price',
//     title: 'Цена товара',
//     sort: 'numb',
//     filter: 'search'
//   }, {
//     key: 'system',
//     title: 'Система налогообложения',
//     sort: 'text',
//     filter: 'full'
//   }, {
//     key: 'date',
//     title: 'Дата',
//     sort: 'date',
//     filter: 'search'
//   }, {
//     key: 'docs',
//     subkey: 'status',
//     title: 'Документы',
//     content: '<div class="docs row"><div class="mark icon #status#" data-tooltip="#status_info#"></div><a href="url" target="_blank" data-tooltip="#info#" text="left" help>#title#</a></div>',
//     filter: 'filter'
//   }],
//   sub: [{area: '.docs', items: 'docs'}]
// }
// initTable('tableId', settings);

// Инициализация таблицы:

function initTable(el, settings) {
  var el = getEl(el);
  if (el && el.id) {
    if (settings.cols) {
      createTable(el, settings);
    }
    window[`${el.id}Table`] = new Table(el, settings);
  }
}

// Создание таблицы:

function createTable(table, settings) {
  if (settings.head) {
    var fragmentHead = document.createDocumentFragment();
  }
  if (settings.result) {
    var fragmentResult = document.createDocumentFragment();
  }
  var fragmentBody = document.createDocumentFragment();

  settings.cols.forEach((col, index) => {
    if (settings.head) {
      fragmentHead.appendChild(createTableHead(settings.data, col, index));
    }
    if (settings.result) {
      fragmentResult.appendChild(createTableResult(col));
    }
    fragmentBody.appendChild(createTableBody(col));
  });

  if (settings.head) {
    appendToTable(getEl('thead', table), fragmentHead);
  }
  if (settings.result) {
    appendToTable(getEl('thead', table), fragmentResult);
  }
  appendToTable(getEl('tbody', table), fragmentBody);
}

// Добавление строк в таблицу:

function appendToTable(el, fragment) {
  var tr = document.createElement('tr');
  tr.appendChild(fragment);
  el.appendChild(tr);
}

// Создание шапки таблицы:

function createTableHead (data, col, index) {
  var th = document.createElement('th');
  th.id = index + 1;
  if (!col.sort && !col.filter) {
    th.innerHTML = `<div>${col.title}</div>`;
  } else {
    var sort = '',
        filter = '';
    th.classList.add('activate', 'box');
    th.dataset.key = col.key;
    if (col.subkey) {
      th.dataset.subkey = col.subkey;
    }
    if (col.sort) {
      th.dataset.sort = col.sort;
      var sortDown = col.sort === 'numb' ? 'По возрастанию' : (col.sort === 'date' ? 'Сначала новые' : 'От А до Я');
      var sortUp = col.sort === 'numb' ? 'По убыванию' : (col.sort === 'date' ? 'Сначала старые' : 'От Я до А');
      sort =
      `<div class="sort-box">
        <div class="title">Сортировка</div>
        <div class="sort down row">
          <div class="sort down icon"></div>
          <div>${sortDown}</div>
        </div>
        <div class="sort up row">
          <div class="sort up icon"></div>
          <div>${sortUp}</div>
        </div>
      </div>`;
    }
    if (col.filter) {
      var search = '',
          items = '';
      if (col.filter !== 'checkbox') {
        search =
        `<form class="search row">
          <input type="text" data-value="" autocomplete="off" placeholder="Поиск...">
          <input class="search icon" type="submit" value="">
          <div class="close icon"></div>
        </form>`;
      }
      if (col.filter !== 'search') {
        items = '<div class="items"></div>';
      }
      var filter =
      `<div class="filter-box">
        <div class="title">Фильтр</div>
        ${search}
        ${items}
      </div>`;
    }
    th.innerHTML =
    `<div class="head row">
      <div class="title">${col.title}</div>
      <div class="icons row">
        <div class="triangle icon"></div>
        <div class="filter icon"></div>
      </div>
    </div>
    <div class="drop-down">
      ${sort}
      ${filter}
    </div>`;
  }
  if (!col.resize || col.resize) {
    var resize = document.createElement('div');
    resize.classList.add('resize-btn');
    th.appendChild(resize);
  }
  return th;
}

// Создание результатов таблицы:

function createTableResult(col) {
  var th = document.createElement('th');
  if (col.result) {
    th.innerHTML =
    `<div class="row">
      <div class="sum icon"></div>
      <div data-key="${col.key}" data-type="${col.result}"></div>
    </div>`;
  }
  return th;
}

// Создание тела таблицы:

function createTableBody(col) {
  var td = document.createElement('td');
  if (col.content) {
    td.innerHTML = col.content;
  } else {
    td.textContent = `#${col.key}#`;
  }
  return td;
}

// Объект таблицы:

function Table(obj, settings) {
  // Константы:
  this.initialData = Array.isArray(settings.data) ? settings.data.filter(el => el) : [];

  // Элементы для работы:
  this.table = obj;
  this.tab = getEl(`.tab.${obj.id}`);
  this.head = getEl('thead', obj);
  this.results = getEl('.results', this.head);
  this.body = getEl('tbody', obj);
  if (this.head) {
    this.resizeBtns = this.head.querySelectorAll('.resize-btn');
    this.dropDowns = obj.querySelectorAll('.activate');
  }

  // Динамические переменные:
  this.filters = {};
  this.data = JSON.parse(JSON.stringify(this.initialData));
  this.dataToLoad;
  this.countItems = 0;
  this.countItemsTo = 0;
  this.incr = 60;
  this.curColumn = null;
  this.startOffset = 0;

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.tab) {
      this.tab.addEventListener('click', (event) => this.open(event));
    }
    this.table.addEventListener('scroll', () => this.scrollTable());
    if (this.head) {
      if (this.resizeBtns) {
        this.resizeBtns.forEach(el => el.addEventListener('mousedown', (event) => this.startResize(event)));
      }
      this.dropDowns.forEach(el => {
        el.addEventListener('change', event => this.changeData(event));
      });
    }
  }
  this.setEventListeners();

  // Включение/отключение вкладки таблицы в зависимости от наличия данных:
  this.initTab = function() {
    if (this.tab) {
      if (this.data.length) {
        this.tab.classList.remove('disabled');
      } else {
        this.tab.classList.add('disabled');
      }
      showElement(this.tab, 'flex');
    }
  }

  // Преобразование входящих данных:
  this.convertData = function() {
    this.data.forEach(el => {
      for (var key in el) {
        if (!el[key] && el[key] != 0) {
          el[key] = '&ndash;';
        }
      }
    });
  }

  // Заполнение итогов таблицы:
  this.fillResults = function() {
    if (!this.results) {
      return;
    }
    this.results.querySelectorAll('[data-key]').forEach(result => {
      var total = 0;
      if (this.dataToLoad && this.dataToLoad.length) {
        this.dataToLoad.forEach(el => {
          if (el[result.dataset.key]) {
            total += parseFloat(el[result.dataset.key].toString().replace(" ", ''), 10);
          }
        });
      }
      if (result.dataset.type === 'price') {
        total = convertPrice(total);
      }
      result.textContent = total;
    });
  }

  // Заполнение чекбоксов таблицы:
  this.fillCheckboxes = function() {
    if (!this.dropDowns) {
      return;
    }
    var items;
    this.dropDowns.forEach(el => {
      items = getEl('.items', el);
      if (items) {
        var key = el.dataset.key,
            subkey = el.dataset.subkey,
            unique = [],
            list = '',
            value;
        this.dataToLoad.forEach(el => {
          if (subkey) {
            el[key].forEach(subEl => getValue(subEl[subkey]));
          } else {
            getValue(el[key]);
          }
        });
        function getValue(el) {
          value = (typeof el === 'string' || typeof el === 'number') ? el : null;
          if (value && unique.indexOf(value) === -1) {
            unique.push(value);
          }
        }
        unique.forEach(el => {
          list +=
          `<div class="item row" data-value="${el}">
            <div class="checkbox icon"></div>
            <div>${el}</div>
          </div>`;
        });
        items.innerHTML = list;
      }
    });
  }

  // Загрузка данных в таблицу:
  this.loadData = function(data) {
    if (data && data.length === 0) {
      this.body.innerHTML = '';
      return;
    }
    if (data) {
      this.countItems = 0;
      this.dataToLoad = data;
    } else {
      this.countItems = this.countItemsTo;
    }
    this.countItemsTo = this.countItems + this.incr;
    if (this.countItemsTo > this.dataToLoad.length) {
      this.countItemsTo = this.dataToLoad.length;
    }
    if (this.countItems === this.countItemsTo) {
      return;
    }

    var tableItems = [];
    for (let i = this.countItems; i < this.countItemsTo; i++) {
      tableItems.push(this.dataToLoad[i]);
    }
    var list = fillTemplate({
      area: this.body,
      items: tableItems,
      action: 'return',
      sub: settings.sub
    });

    if (this.countItems === 0) {
      this.body.innerHTML = list;
    } else {
      this.body.insertAdjacentHTML('beforeend', list);
    };
    this.setResizeHeight();
  }

  // Подгрузка таблицы при скролле:
  this.scrollTable = function() {
    if (this.table.scrollTop * 2 + this.table.clientHeight >= this.table.scrollHeight) {
      this.loadData();
    }
  }

  // Выравнивание столбцов таблицы:
  this.align = function() {
    if (!this.head) {
      return;
    }
    var bodyCells = this.body.querySelectorAll('tr:first-child > td');
    if (bodyCells) {
      bodyCells.forEach((el, index) => {
        var newWidth = el.offsetWidth  + 'px';
        changeCss(`#${this.table.id} th:nth-child(${index + 1})`, ['width', 'minWidth', 'maxWidth'], newWidth);
        changeCss(`#${this.table.id} td:nth-child(${index + 1})`, ['width', 'minWidth', 'maxWidth'], newWidth);
      });
    }
  }

  // Установка высоты подсветки кнопки ресайза (чтобы была видна, но не увеличивала скролл):
  this.setResizeHeight = function() {
    if (!this.head) {
      return;
    }
    changeCss('thead .resize-btn:hover::after', 'height', this.body.offsetHeight - 5 + 'px');
  }

  // Открытие таблицы при клике на вкладку:
  this.open = function(event) {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    loader.show();
    var activeTable = getEl('.table-wrap.active');
    if (activeTable) {
      hideElement(activeTable);
      activeTable.classList.remove('active');
    }
    this.show();
  }

  // Работа с данными таблицы:
  this.changeData = function(event) {
    var dropDown = event.currentTarget,
        target = event.target,
        key = dropDown.dataset.key,
        subkey = dropDown.dataset.subkey;
    if (target.classList.contains('sort')) {
      this.sortData(dropDown, target, key);
    } else {
      var type = target.classList.contains('search') ? 'search' : 'filter',
          action = dropDown.value ? 'save' : 'remove',
          value = type === 'search' ? dropDown.value : target.dataset.value;
      this.changeFilter(action, type, value, key, subkey);
      this.filterData();
      console.log(action, type, value, key, subkey);
      console.log(this.filters);
    }
    this.loadData(this.dataToLoad);
  }

  // Сортировка данных:
  this.sortData = function(dropDown, target, key) {
    var type = dropDown.dataset.sort,
        key = target.classList.contains('down') ? key : '-' + key;
    this.head.querySelectorAll('.sort.checked').forEach(el => {
      var th = el.closest('.activate');
      if (th.id !== dropDown.id) {
        el.classList.remove('checked');
      }
    });
    var curSort = getEl('.sort.checked', this.head);
    if (curSort) {
      this.dataToLoad.sort(sortBy(key, type));
    } else {
      this.data = JSON.parse(JSON.stringify(this.initialData));
      this.filterData();
    }
    dropDown.classList.remove('open');
  }

  // Сохранение/удаление фильтра:
  this.changeFilter = function(action, type, value, key, subkey) {
    if (action === 'save') {
      if (!this.filters[key] || this.filters[key].type !== type) {
        this.filters[key] = {
          subkey: subkey,
          type: type,
          values: [value]
        };
      } else {
        if (this.filters[key].values.indexOf(value) === -1) {
          this.filters[key].values.push(value);
        }
      }
    } else {
      if (this.filters[key] && this.filters[key].type === type) {
        if (type === 'search') {
          delete this.filters[key];
        } else {
          var index = this.filters[key].values.indexOf(value);
          if (index !== -1) {
            if (this.filters[key].values.length === 1) {
              delete this.filters[key];
            } else {
              this.filters[key].values.splice(index, 1)
            }
          }
        }
      }
    }
  }

  // Фильтрация данных:
  this.filterData = function() {
    if (!isEmptyObj(this.filters)) {
      var isFound, filter;
      this.dataToLoad = this.data.filter(item => {
        for (var key in this.filters) {
          filter = this.filters[key];
          isFound = false;
          if (filter.subkey) {
            for (var subitem of item[key]) {
              if (checkValue(filter.type, filter.values, subitem[filter.subkey])) {
                isFound = true;
              }
            }
          } else {
            if (checkValue(filter.type, filter.values, item[key])) {
              isFound = true;
            }
          }
          if (!isFound) {
            return false;
          }
        }
        return true;
      });
    } else {
      this.dataToLoad = this.data;
    }
  }

  // Проверка совпадения со значениями фильтра:
  function checkValue(type, filterValues, itemValue) {
    var isFound = false;
    for (var value of filterValues) {
      if (type === 'search') {
        var regEx = RegExp(value, 'gi');
        if (itemValue.search(regEx) >= 0) {
          isFound = true;
        }
      } else {
        if (itemValue == value) {
          isFound = true;
        }
      }
    }
    return isFound;
  }

  // Запуск перетаскивания столбца:
  this.startResize = function(event) {
    this.curColumn = event.currentTarget.parentElement;
    this.startOffset = this.curColumn.offsetWidth - event.pageX;
    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.stopResize);
  }

  // Перетаскивание столбца:
  this.resize = throttle((event) => {
    if (this.curColumn) {
      var newWidth = this.startOffset + event.pageX,
          fontSize = parseFloat(getComputedStyle(this.curColumn).fontSize, 10);
      newWidth = (newWidth > fontSize * 4.14) ? (newWidth + 'px') : (Math.floor(fontSize * 4.14) + 'px');
      changeCss(`#${this.table.id} th:nth-child(${this.curColumn.id})`, ['width', 'minWidth', 'maxWidth'], newWidth);
      changeCss(`#${this.table.id} td:nth-child(${this.curColumn.id})`, ['width', 'minWidth', 'maxWidth'], newWidth);
    }
  });

  // Остановка перетаскивания столбца:
  this.stopResize = () => {
    if (this.curColumn) {
      this.curColumn = null;
      document.removeEventListener('mousemove', this.resize);
      document.removeEventListener('mouseup', this.stopResize);
    }
  };

  // Визуальное отображение таблицы:
  this.show = function() {
    showElement(this.table);
    loader.hide();
    this.align();
    this.table.classList.add('active');
  }

  // Инициализация таблицы:
  this.init = function() {
    this.initTab();
    this.convertData();
    this.loadData(this.data);
    if (this.head) {
      this.dropDowns.forEach(el => new DropDownTable(el));
      this.fillCheckboxes();
      this.fillResults();
    }
    if (this.table.classList.contains('active')) {
      this.show();
    }
  }
  this.init();
}
