'use strict';

// Для корректной работы скрипта необходимо подключение перед ним main.js (не будет работать без объектов DropDown и Search)

//=====================================================================================================
// Работа таблиц:
//=====================================================================================================

// В каком виде нужно передавать данные в функцию initTable:

// var settings = {
//   data: [{...}, {...}]                             Данные для заполнения таблицы - массив объектов, где каждый объект - данные строки (по умолчанию [])
//   control: {                                       Имеет ли таблица панель управления (по умолчанию не имеет). Если да, то в объекте перечислить элементы:
//     area: элемент / селектор элемента                - куда в документе вставлять панель управления (по умолчанию вставится перед таблицей)
//     pagination: true / false                         - наличие пагинации (по умолчанию отсутствует)
//     search: 'Поиск к подсказке' / false              - наличие поиска и его подсказка (по умолчанию отсутствует)
//     toggle: 'key' / false                            - наличие переключателя и ключ в данных, по которому брать данные для работы (по умолчанию отсутствует)
//     pill: 'key' / false                              - наличие чекбоксов-"пилюль" и ключ в данных, по которому брать данные для работы (по умолчанию отсутствует)
//     setting: true / false                            - наличие настроек таблицы (по умолчанию отсутствует)
//   }
//   head: true / false                               Имеет ли таблица шапку (по умолчанию отсутствует)
//   result: true / false                             Имеет ли таблица строку "итого" (по умолчанию отсутствует)
//   sign: '#' / '@@' / другой,                       Символ для поиска мест замены в html (по умолчанию - '#')
//   sub: [{                                          Данные о подшаблонах (по умолчанию подшаблонов нет) - как заполнять смотри fillTemplate
//     area: селектор,
//     items: название ключа в data
//   }],
//   trFunc: 'onclick=functionName(event,#key#)'      Обработчик, навешиваемый на строку таблицы (по умолчанию false)
//   cols:                                            Параметры столбцов таблицы (для таблиц с готовым шаблонов в html данный параметр пропускаем)
//   [{                                                 что вкючает параметр одного столбца:
//     title: 'Заголовок'                               - заголовок столбца
//     class: 'classname'                               - название класса для столбца (чтобы можно было добавить уникальные стили)
//     width: 'x%',                                     - ширина столбца в процентах, если не устраивает ширина по умолчанию (по умолчанию все столбцы одинаковой ширины)
//     align: 'center' / 'right',                       - выравнивание столбца, если не устраивает выравнивание по левому краю
//     key: 'key'                                       - ключ в данных по которому находится информация для данного столбца
//     result: 'kolv' / 'sum'                           - наличие и формат итога по колонке (умолчанию отсутствует)
//     sort: 'text' / 'numb' / 'date'                   - нужна ли сортировка по столбцу и ее формат (по умолчанию отсутствует)
//     search: 'usual' / 'date'                         - нужен ли поиск по столбцу и его формат (по умолчанию отсутствует)
//     filter: 'true' / 'false'                         - нужна ли фильтрация по столбцу (по умолчанию отсутствует)
//     content: #key# / html разметка                   - содержимое ячейки, если отличается от #key#, то вносим html разметку (по умолчанию #key#)
//   }]
// }

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

// Обновление таблицы новыми данными:

function updateTable(el, data) {
  var el = getEl(el),
      table = window[`${el.id}Table`];
  if (table) {
    table.initialData = data;
    table.prepare();
  }
}

// Создание таблицы:

function createTable(area, settings) {
  if (settings.control) {
    var control = createTableControl(settings);
    control.dataset.table = area.id;
    if (settings.control.area) {
      var areaControl = getEl(settings.control.area);
      if (areaControl) {
        areaControl.appendChild(control);
      } else {
        area.appendChild(control);
      }
    } else {
      area.appendChild(control);
    }
  }
  var content = createTableContent(area.id, settings),
      table = getEl('table', area);
  if (table) {
    area.removeChild(table);
    window[`${area.id}-bodyTemp`] = undefined;
  }
  area.appendChild(content);
}

// Создание панели управления для таблицы:

function createTableControl(settings) {
  var options = settings.control,
      pagination = '',
      search = '',
      toggle = '',
      pill = '',
      setting = '';
  if (options.pagination) {
    pagination =
    `<div class="pagination row">
      <div class="arrow blue icon left"></div>
      <div class="title"><span class="cur"></span> из <span class="total"></span></div>
      <div class="arrow blue icon right"></div>
    </div>`;
  }
  if (options.search) {
    search =
    `<form class="search row">
      <input type="text" data-value="" placeholder="${options.search}">
      <input class="search icon" type="submit" value="">
      <div class="close icon"></div>
    </form>`;
  }
  if (options.toggle) {
    toggle =
    ``;
  }
  if (options.pill) {
    pill =
    ``;
  }
  if (options.setting) {
    setting = `<div class="settings icon"></div>`;
  }
  var control = document.createElement('div');
  control.classList.add('control', 'row');
  if (options.pill) {
    control.classList.add('extend');
  }
  control.innerHTML =
  `<div class="left-side row">
    ${pagination}
    ${search}
  </div>
  <div class="right-side row">
    ${toggle}
    ${pill}
    ${setting}
  </div>`;
  return control;
}

// Создание панели управления для таблицы:

function createTableContent(id, settings) {
  var headList = '',
      resultList = '',
      bodyList = '',
      trFunc = settings.trFunc || '';

  settings.cols.forEach((col, index) => {
    if (settings.head) {
      headList += createTableHead(col, index);
      if (settings.result) {
        resultList += createTableResult(col);
      }
    }
    bodyList += createTableBody(col, settings.sign);
    if (col.width) {
      changeCss(`#${id} th:nth-child(${index + 1})`, 'width', col.width);
    }
    if (col.align) {
      changeCss(`#${id} td:nth-child(${index + 1})`, 'text-align', col.align);
    }
  });

  var table = document.createElement('table');
  table.innerHTML =
  `<thead>
    <tr>${headList}</tr>
    <tr class="results">${resultList}</tr>
  </thead>
  <tbody id=${id}-body>
    <tr ${trFunc}>${bodyList}</tr>
  </tbody>`
  return table;
}

// Создание шапки таблицы:

function createTableHead(col, index) {
  var th;
  if (!col.sort && !col.search && !col.filter) {
    th =
    `<th id="${index + 1}">
      <div>${col.title || ''}</div>
      <div class="resize-btn"></div>
    </th>`;
  } else {
    var sortBox = '',
        filterBox = '';
    if (col.sort) {
      var sortDown = col.sort === 'numb' ? 'По возрастанию' : (col.sort === 'date' ? 'Сначала новые' : 'От А до Я');
      var sortUp = col.sort === 'numb' ? 'По убыванию' : (col.sort === 'date' ? 'Сначала старые' : 'От Я до А');
      sortBox =
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
    if (col.search || col.filter) {
      var search = '',
          items = '';
      if (col.search) {
        if (col.search === 'date') {
          search =
          `<form class="search row">
          <input type="text" value="" data-type="date" placeholder="ДД.ММ.ГГГГ" maxlength="10" autocomplete="off" onkeypress="return onlyDateChar(event)">
            <input class="search icon" type="submit" value="">
            <div class="close icon"></div>
          </form>`;
        } else {
          search =
          `<form class="search row">
            <input type="text" data-value="" placeholder="Поиск...">
            <input class="search icon" type="submit" value="">
            <div class="close icon"></div>
          </form>`;
        }
      }
      if (col.filter) {
        if (col.search) {
          items =
          `<div class="not-found">Совпадений не найдено</div>
          <div class="items"></div>`;
        } else {
          items = '<div class="items"></div>';
        }
      }
      filterBox =
      `<div class="filter-box">
        <div class="title">Фильтр</div>
        ${search}
        ${items}
      </div>`;
    }
    th =
    `<th id="${index + 1}" class="activate box" data-key="${col.key || ''}" data-sort="${col.sort || ''}">
      <div class="head row">
        <div class="title">${col.title || ''}</div>
        <div class="icons row">
          <div class="filter icon"></div>
          <div class="triangle icon"></div>
        </div>
        </div>
        <div class="drop-down">
          ${sortBox}
          ${filterBox}
        </div>
      </div>
      <div class="resize-btn"></div>
    </th>`;
  }
  return th;
}

// Создание результатов таблицы:

function createTableResult(col) {
  if (!col.result) {
    return '<th></th>';
  }
  var th =
  `<th>
    <div class="row">
      <div class="sum icon"></div>
      <div data-key="${col.key}" data-type="${col.result}"></div>
    </div>
  </th>`;
  return th;
}

// Создание тела таблицы:

function createTableBody(col, sign = '#') {
  var tdClass = col.class ? `class="${col.class}"` : '';
  if (!col.content) {
    if (!col.key) {
      return `<td ${tdClass}></td>`;
    } else {
      return `<td ${tdClass}>${sign}${col.key}${sign}</td>`;
    }
  }
  return `<td ${tdClass}>${col.content}</td>`;
}

// Объект таблицы:

function Table(obj, settings = {}) {
  // Элементы для работы:
  this.wrap = obj;
  this.tab = getEl(`.tab[data-table=${obj.id}]`);
  this.control = getEl(`.control[data-table=${obj.id}]`);
  if (this.control) {
    this.pagination = getEl('.pagination', this.control);
    this.search = getEl('form.search', this.control);
  }
  this.head = getEl('thead', obj);
  this.results = getEl('.results', this.head);
  this.body = getEl('tbody', obj);
  if (this.head) {
    this.resizeBtns = this.head.querySelectorAll('.resize-btn');
    this.dropDowns = this.head.querySelectorAll('.activate');
  }

  // Константы:
  this.initialData = settings.data;

  // Динамические переменные:
  this.filters = {};
  this.data = [];
  this.dataToLoad = [];
  this.countItems = 0;
  this.countItemsTo = 0;
  this.incr = 60;
  this.prevColumn = null;
  this.nextColumn = null;
  this.startCoord;
  this.prevWidth;
  this.nextWidth;

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.tab) {
      this.tab.addEventListener('click', event => this.open(event));
    }
    window.addEventListener('scroll', throttle(() => {
      this.scrollTable();
    }));
    if (this.pagination) {
      this.pagination.querySelectorAll('.btn').forEach(el => el.addEventListener('click', event => this.moveTable(event)))
    }
    if (this.head) {
      if (this.resizeBtns) {
        this.resizeBtns.forEach(el => el.addEventListener('mousedown', event => this.startResize(event)));
      }
      this.dropDowns.forEach(el => {
        el.addEventListener('change', event => this.changeData(event));
      });
    }
  }

  // Подготовка таблицы для работы:
  this.prepare = function() {
    this.prepareData();
    this.initTab();
    this.fill();
    this.fillItems();
  }

  // Преобразование входящих данных:
  this.prepareData = function() {
    this.initialData = Array.isArray(this.initialData) ? this.initialData.filter(el => el) : [];
    if (this.initialData) {
      this.data = JSON.parse(JSON.stringify(this.initialData));
      this.data.forEach(el => {
        el.search = [];
        for (var key in el) {
          if (!el[key] && el[key] != 0) {
            el[key] = '&ndash;';
          } else {
            el.search.push(el[key]);
          }
        }
        el.search = el.search.join(',').replace(/\s/g, ' ').replace(/\u00A0/g, ' '); // Замена любых пробельных символов на пробелы
      });
      this.dataToLoad = this.data;
    }
  }

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

  // Заполнение таблицы данными:
  this.fill = function(dropDown) {
    this.loadData(this.dataToLoad);
    if (this.head) {
      this.fillResults();
    }
  }

  // Загрузка данных в таблицу:
  this.loadData = function(data) {
    if (data && data.length === 0) {
      this.body.innerHTML = '';
      return;
    }
    if (data) {
      this.countItems = 0;
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
      sub: settings.sub,
      sign: settings.sign,
      action: 'return'
    });

    if (this.countItems === 0) {
      this.body.innerHTML = list;
    } else {
      this.body.insertAdjacentHTML('beforeend', list);
    };
    this.setResizeHeight();
    this.fillPagination();
  }

  // Заполнение пагинации:
  this.fillPagination = function() {
    if (!this.pagination) {
      return;
    }
    getEl('.cur', this.pagination).textContent = `${this.countItems + 1} - ${this.countItemsTo}`;
    getEl('.total', this.pagination).textContent = this.dataToLoad.length;
  }

  // Подгрузка таблицы при скролле:
  this.scrollTable = function() {
    if ((this.wrap.getBoundingClientRect().top + this.wrap.scrollHeight - window.innerHeight) < 200) {
      this.loadData();
    }
  }

  // Подгрузка таблицы при пагинации:
  this.moveTable = function() {
    
  }

  // Установка высоты подсветки кнопки ресайза (чтобы не выходила за пределы таблицы):
  this.setResizeHeight = function() {
    if (!this.head) {
      return;
    }
    var headerRect = getEl('th', this.head).getBoundingClientRect(),
        bodyRect = this.body.getBoundingClientRect(),
        newHeight =  bodyRect.bottom - headerRect.bottom + 'px';
    changeCss(`#${this.wrap.id} thead .resize-btn:hover::after`, 'height', newHeight);
  }

  // Заполнение фильтров таблицы значениями:
  this.fillItems = function(curDropDown) {
    if (!this.dropDowns) {
      return;
    }
    var items;
    this.dropDowns.forEach(el => {
      if (el === curDropDown) {
        return;
      }
      items = getEl('.items', el);
      if (items) {
        var key = el.dataset.key,
            unique = [],
            list = '',
            value;
        this.dataToLoad.forEach(el => getValue(el[key]));
        function getValue(el) {
          value = (typeof el === 'string' || typeof el === 'number') ? el : undefined;
          if (value !== undefined && unique.indexOf(value) === -1) {
            unique.push(value);
          }
        }
        unique.sort();
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
    this.checkItems(curDropDown ? curDropDown.dataset.key : '');
  }

  // Расстановка чекеров на значения после перерендеринга значений:
  this.checkItems = function(curKey) {
    var curItem;
    for (var key in this.filters) {
      if (key !== curKey) {
        this.filters[key].values.forEach(value => {
          curItem = getEl(`.activate[data-key="${key}"] [data-value="${value}"]`);
          if (curItem) {
            curItem.classList.add('checked');
          }
        });
      }
    }
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
      if (result.dataset.type === 'sum') {
        total = convertPrice(total);
      }
      result.textContent = total;
    });
  }

  // Визуальное отображение таблицы:
  this.show = function() {
    showElement(this.wrap);
    this.setResizeHeight();
    this.wrap.classList.add('active');
  }

  // Переход с одной таблицы на другую при клике на вкладку:
  this.open = function(event) {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    var activeTable = getEl('.table-desktop.active');
    if (activeTable) {
      hideElement(activeTable);
      activeTable.classList.remove('active');
    }
    document.querySelectorAll('.tabs .tab').forEach(el => el.classList.remove('checked'));
    event.currentTarget.classList.add('checked');
    this.show();
  }

  // Поиск по всей таблице:
  this.fullSearch = (search, textToFind) => {
    this.resetFilters();
    if (textToFind) {
      var regEx = RegExp(textToFind, 'gi');
      this.dataToLoad = this.data.filter(item => item.search.search(regEx) >= 0);
    } else {
      this.dataToLoad = this.data;
    }
    this.fill();
  }

  // Запуск сортировки, поиска и фильтрации по столбцу:
  this.changeData = function(event) {
    var dropDown = event.currentTarget,
        target = event.target,
        key = dropDown.dataset.key;
    if (event.target.classList.contains('sort')) {
      this.sortData(dropDown, target, key);
    } else {
      this.findData(dropDown, target, key);
    }
  }

  // Сортировка по столбцу:
  this.sortData = function(dropDown, target, key) {
    var type = dropDown.dataset.sort,
        key = target.classList.contains('down') ? key : '-' + key;
    this.head.querySelectorAll('.sort.checked').forEach(el => {
      if (el.closest('.activate').id !== dropDown.id) {
        el.classList.remove('checked');
      }
    });
    var curSort = getEl('.sort.checked', this.head);
    if (curSort) {
      this.data.sort(sortBy(key, type));
      this.dataToLoad.sort(sortBy(key, type));
    } else {
      this.data = JSON.parse(JSON.stringify(this.initialData));
      this.filterData();
    }
    this.loadData(this.dataToLoad);
  }

  // Поиск и фильтрация по столбцу:
  this.findData = function(dropDown, target, key) {
    if (this.control) {
      this.resetControl();
    }
    var type = target.classList.contains('item') ? 'filter' : 'search',
        value = type === 'search' ? dropDown.value : target.dataset.value,
        action;
    if (type === 'search') {
      action = value ? 'save' : 'remove';
    } else if (type === 'filter') {
      action = target.classList.contains('checked') ? 'save' : 'remove';
    }
    var oldFilters = JSON.stringify(this.filters);
    this.changeFilter(action, type, key, value);
    if (oldFilters !== JSON.stringify(this.filters)) {
      this.filterData();
    }
    this.fill();
    // this.fill(action === 'save' ? dropDown : '');
  }

  // Сохранение/удаление фильтра:
  this.changeFilter = function(action, type, key, value) {
    if (action === 'save') {
      if (!this.filters[key] || this.filters[key].type !== type) {
        this.filters[key] = {
          type: type,
          values: [value]
        };
      } else {
        if (type === 'search') {
          this.filters[key].values = [value];
        } else if (this.filters[key].values.indexOf(value) === -1) {
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
          if (checkValue(filter.type, filter.values, item[key])) {
            isFound = true;
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

  // Очистка панели управления:
  this.resetControl = function() {
    if (!this.control) {
      return;
    }
    if (this.search) {
      this.search.clear();
    }
  }

  // Очистка поиска и фильтров столбцов таблицы:
  this.resetFilters = function() {
    if (!this.head) {
      return;
    }
    this.filters = {};
    this.dropDowns.forEach((el, index) => {
      this[`dropDown${index}`].clear();
    });
  }

  // Полная очистка поиска и фильтрации:
  this.reset = function() {
    this.resetControl();
    this.resetFilters();
    this.dataToLoad = this.data;
    this.fill();
  }

  // Запуск перетаскивания столбца:
  this.startResize = function(event) {
    this.prevColumn = event.currentTarget.parentElement;
    this.nextColumn = this.prevColumn.nextElementSibling;
    this.startCoord = event.pageX;
    this.prevWidth = this.prevColumn.offsetWidth;
    this.nextWidth = this.nextColumn.offsetWidth;
    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.stopResize);
  }

  // Перетаскивание столбца:
  this.resize = throttle((event) => {
    if (this.prevColumn && this.nextColumn) {
      var tableWidth = this.wrap.offsetWidth,
          offset = event.pageX - this.startCoord,
          newPrevWidth = (this.prevWidth + offset),
          newNextWidth = (this.nextWidth - offset);
      if (newPrevWidth > 65 && newNextWidth > 65) {
        newPrevWidth = (newPrevWidth * 100 / tableWidth) + '%';
        newNextWidth = (newNextWidth * 100 / tableWidth) + '%';
        this.prevColumn.style.width = newPrevWidth;
        this.nextColumn.style.width = newNextWidth;
      }
    }
  });

  // Остановка перетаскивания столбца:
  this.stopResize = () => {
    if (this.prevColumn && this.nextColumn) {
      this.prevColumn = null;
      this.nextColumn = null;
      document.removeEventListener('mousemove', this.resize);
      document.removeEventListener('mouseup', this.stopResize);
    }
  };

  // Инициализация таблицы:
  this.init = function() {
    this.prepare();
    this.setEventListeners();
    if (this.search) {
      this.search = new Search(this.search, this.fullSearch);
    }
    if (this.dropDowns) {
      this.dropDowns.forEach((el, index) => {
        this[`dropDown${index}`] = new DropDown(el);
      });
    }
    if (this.wrap.classList.contains('active')) {
      this.show();
    }
  }
  this.init();
}
