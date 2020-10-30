'use strict';

// Для корректной работы скрипта необходимо подключение перед ним main.js (не будет работать без объектов DropDown и Search)

//=====================================================================================================
// Работа таблиц:
//=====================================================================================================

// В каком виде нужно передавать данные в функцию initTable:

// var settings = {
//   data: [{...}, {...}],                            Данные для заполнения таблицы - массив объектов, где каждый объект - данные строки (по умолчанию [])
//   control: {                                       Панель управления (по умолчанию ее нет). Если необходима, то в объекте указать настройки:
//     area: элемент / селектор элемента                - место вставки панели управления если нужно расположить не в контейнере таблицы (по умолчанию вставится перед таблицей)
//     pagination: true / false                         - наличие пагинации (по умолчанию отсутствует)
//     search: 'Поиск к подсказке' / false              - наличие поиска и его подсказка (по умолчанию отсутствует)
//     toggle: 'key' / false                            - наличие переключателя и ключ в данных, по которому брать данные для работы (по умолчанию отсутствует)
//     pill: 'key' / false                              - наличие чекбоксов-"пилюль" и ключ в данных, по которому брать данные для работы (по умолчанию отсутствует)
//     setting: true / false                            - наличие настроек таблицы (по умолчанию отсутствует)
//   },
//   desktop: {                                       Настройки основной таблицы:
//     head: true / false                               - имеет ли таблица шапку (по умолчанию отсутствует)
//     result: true / false                             - имеет ли таблица строку "итого" (по умолчанию отсутствует)
//     trFunc: 'onclick=functionName(event,#key#)'      - обработчик, навешиваемый на строку таблицы (по умолчанию false)
//     sign: '#' / '@@' / другой                        - символ для поиска мест замены в html (по умолчанию - '#')
//     sub: [{area: селектор, items: ключ в data}]      - данные о подшаблонах (по умолчанию подшаблонов нет) - как заполнять смотри fillTemplate
//     cols: [{                                         - параметры столбцов таблицы (для таблиц с готовым шаблоном в html данный параметр пропускаем)
//       title: 'Заголовок'                               - заголовок столбца
//       class: 'classname'                               - название класса для столбца (чтобы можно было добавить уникальные стили)
//       width: 'x%',                                     - ширина столбца в процентах, если не устраивает ширина по умолчанию (по умолчанию все столбцы одинаковой ширины)
//       align: 'center' / 'right'                        - выравнивание столбца, если не устраивает выравнивание по левому краю
//       keys: ['key1', 'key2', ...]                      - ключи данных по которым находится информация для данного столбца (первый ключ всегда приоритетный, по нему считаются итоги если они нужны)
//       result: 'kolv' / 'sum'                           - наличие и формат итога по колонке (умолчанию отсутствует)
//       content: html разметка                           - содержимое ячейки, по умолчанию это: #key1# #key2#..., иначе вносим html разметку
//     }, {...}]
//   },
//   adaptive: {                                      Настройки адаптивной таблицы (если необходимы):
//     sign: '#' / '@@' / другой                        - Символ для поиска мест замены в html (по умолчанию - '#')
//     sub: [{area: селектор, items: ключ в data}]      - данные о подшаблонах (по умолчанию подшаблонов нет) - как заполнять смотри fillTemplate
//   },
//   sorts: {                                         Сортировки таблицы:
//     key1: {                                          - ключ в данных, по которому будет браться информация
//       title: 'Заголовок'                               - заголовок сортировки
//       type: 'text' / 'numb' / 'date'                   - формат сортировки (по умолчанию text)
//       isOpen: true / false                           - сортировка открыта или закрыта (true - открыта, по умолчанию false - закрыта)
//     }
//     {key2: {...}
//   },
//   filters: {                                       Фильтры таблицы:
//     key1: {                                          - ключ в данных, по которому будет браться информация
//       title: 'Заголовок'                               - заголовок фильтра
//       search: 'usual' / 'date'                         - нужен ли поиск по ключу и его формат (по умолчанию отсутствует)
//       filter: 'checkbox' / 'select'                    - нужна ли фильтрация по ключу и ее формат (по умолчанию отсутствует)
//       items: data                                      - данные для заполнения фильтра (чекбоксов или селектов)
//       isOpen: true / false                           - фильтр открыт или закрыт (true - открыт, по умолчанию false - закрыт)
//     }
//     {key2: {...}
//   },
// }

// Инициализация таблицы:

function initTable(el, settings) {
  var el = getEl(el);
  if (el) {
    createTableControl(el, settings.control)
    createTable(el, settings);
    if (el.id) {
      return window[`${el.id}Table`] = new Table(el, settings);
    } else {
      return new Table(el, settings);
    }
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

// Создание панели управления для таблицы:

function createTableControl(area, settings) {
  if (!settings) {
    return;
  }
  var controlHtml = '';
  if (settings.pagination) {
    controlHtml +=
    `<div class="pagination row">
      <div class="arrow blue icon left"></div>
      <div class="title"><span class="cur"></span> из <span class="total"></span></div>
      <div class="arrow blue icon right"></div>
    </div>`;
  }
  if (settings.search) {
    controlHtml +=
    `<form class="search row">
      <input type="text" data-value="" placeholder="${settings.search}">
      <input class="search icon" type="submit" value="">
      <div class="close icon"></div>
    </form>`;
  }
  if (settings.toggle) {
    controlHtml +=
    ``;
  }
  if (settings.pill) {
    controlHtml +=
    ``;
  }
  if (settings.setting) {
    controlHtml += `<div class="settings icon"></div>`;
  }
  controlHtml += `<div class="relay icon"></div>`;
  var control = document.createElement('div');
  control.classList.add('control', 'row');
  control.dataset.area = area.id;
  control.innerHTML = controlHtml;
  if (settings.area) {
    var areaControl = getEl(settings.area);
    if (areaControl) {
      areaControl.appendChild(control);
      return;
    }
  }
  area.insertAdjacentElement('afterbegin', control);
}

// Создание таблицы для основного разрешения:

function createTable(area, settings) {
  if (!settings.desktop) {
    return;
  }
  var headRow = '',
      resultRow = '',
      bodyRow = '',
      tableSettings = settings.desktop;

  tableSettings.cols.forEach((col, index) => {
    if (tableSettings.head) {
      headRow += createTableHeadCell(col, index, settings);
      if (settings.result) {
        resultRow += createTableResultCell(col);
      }
    }
    bodyRow += createTableBodyCell(col, tableSettings.sign);
    if (col.width) {
      changeCss(`#${area.id} > table > thead > tr > th:nth-child(${index + 1})`, 'width', col.width);
    }
    if (col.align) {
      changeCss(`#${area.id} > table > tbody > tr > td:nth-child(${index + 1})`, 'text-align', col.align);
    }
  });

  var table = getEl('.table-desktop', area);
  if (table) {
    area.removeChild(table);
    window[`${area.id}-bodyTemp`] = undefined;
  }
  table = document.createElement('table');
  table.classList.add('table-desktop');
  table.innerHTML =
  `<thead>
    <tr>${headRow}</tr>
    <tr class="results">${resultRow}</tr>
  </thead>
  <tbody id=${area.id}-body>
    <tr ${tableSettings.trFunc || ''}>${bodyRow}</tr>
  </tbody>`;
  area.appendChild(table);
}

// Создание ячейки шапки таблицы:

function createTableHeadCell(col, index, settings) {
  var th = '';
  if (col.keys) {
    var content = '',
        sorts = settings.sorts,
        filters = settings.filters;
    col.keys.forEach(key => {
      if (sorts && sorts[key]) {
        var sort = sorts[key];
        sort =
        `<div class="group sort" data-key="${key}" data-type="${sort.type}">
          <div class="title">Сортировка</div>
          <div class="item sort down row">
            <div class="sort icon"></div>
            <div>${getSortText('down', sort.type)}</div>
          </div>
          <div class="item sort up row">
            <div class="sort icon"></div>
            <div>${getSortText('up', sort.type)}</div>
          </div>
        </div>`;
        content += sort;
      }
      if (filters && filters[key]) {
        var filter = filters[key],
            filterContent = '',
            search = filter.search,
            items = filter.filter;
        if (search) {
          if (search === 'date') {
            search =
            `<div class="calendar-wrap">
              <input type="text" value="" data-type="date" placeholder="ДД.ММ.ГГГГ" maxlength="10" autocomplete="off" oninput="onlyDateChar(event)">
            </div>`;
          } else {
            search =
            `<form class="search row">
              <input type="text" data-value="" placeholder="Поиск...">
              <input class="search icon" type="submit" value="">
              <div class="close icon"></div>
            </form>`;
          }
          filterContent += search;
        }
        if (items && filter.search !== 'date') {
          if (items === 'select') {
            items =
            `<div class="items">
              <div class="item" data-value="#item#">#item#</div>
            </div>`;
          } else {
            items =
            `<div class="items">
              <div class="item row" data-value="#item#">
                <div class="checkbox icon"></div>
                <div>#item#</div>
              </div>
            </div>`;
          }
          if (search) {
            items = '<div class="not-found">Совпадений не найдено</div>' + items;
          }
          filterContent += items;
        }
        filter =
        `<div class="group filter" data-key="${key}">
          <div class="title">Фильтр</div>
          ${filterContent}
        </div>`;
        content += filter;
      }
    });
    if (content) {
      th =
      `<th id="${index + 1}" class="activate box">
        <div class="head row">
          <div class="title">${col.title || ''}</div>
          <div class="icons row">
            <div class="triangle icon"></div>
            <div class="filter icon"></div>
          </div>
          </div>
          <div class="drop-down">
            ${content}
          </div>
        </div>
        <div class="resize-btn"></div>
      </th>`;
    }
  }
  if (!th) {
    th =
    `<th id="${index + 1}">
      <div>${col.title || ''}</div>
      <div class="resize-btn"></div>
    </th>`;
  }
  return th;
}

// Создание ячейки результатов таблицы:

function createTableResultCell(col) {
  if (!col.result) {
    return '<th></th>';
  }
  var th =
  `<th>
    <div class="row">
      <div class="sum icon"></div>
      <div data-key="${col.keys[0]}" data-type="${col.result}"></div>
    </div>
  </th>`;
  return th;
}

// Создание ячейки тела таблицы:

function createTableBodyCell(col, sign = '#') {
  var tdClass = col.class ? `class="${col.class}"` : '';
  if (!col.content) {
    if (!col.keys || !col.keys.length) {
      return `<td ${tdClass}></td>`;
    } else {
      var content = '';
      col.keys.forEach(key => content += `${sign}${key}${sign}`);
      return `<td ${tdClass}>${content}</td>`;
    }
  }
  return `<td ${tdClass}>${col.content}</td>`;
}

// Объект таблицы:

function Table(obj, settings = {}) {
  // Элементы для работы:
  this.wrap = obj;
  this.tab = getEl(`.tab[data-area=${obj.id}]`);
  this.control = getEl(`.control[data-area=${obj.id}]`);
  this.desktop = getEl('.table-desktop', obj);
  this.adaptive = getEl('.table-adaptive', obj);
  if (this.control) {
    this.pagination = getEl('.pagination', this.control);
    this.search = getEl('form.search', this.control);
  }
  if (this.desktop) {
    this.head = getEl('thead', obj);
    this.body = getEl('tbody', obj);
    if (this.head) {
      this.results = getEl('.results', this.head);
      this.resizeBtns = this.head.querySelectorAll('.resize-btn');
      this.dropDowns = this.head.querySelectorAll('.activate');
    }
  }
  if (this.adaptive) {
    this.adaptive.id = obj.id + '-adaptive';
    this.filterPopUp = initFilter(obj, {sorts: settings.sorts, filters: settings.filters});
  }

  // Константы:
  this.initialData = settings.data;

  // Динамические переменные:
  this.filters = {};
  this.data = [];
  this.dataToLoad = [];
  this.countItems = 0;
  this.countItemsTo = 0;
  this.incr = 50;
  this.direction;
  this.scrollPos = window.pageYOffset;
  if (this.pagination) {
    this.paginationSwitch = null;
  }
  if (this.head) {
    this.prevColumn = null;
    this.nextColumn = null;
    this.startCoord;
    this.prevWidth;
    this.nextWidth;
  }

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.tab) {
      this.tab.addEventListener('click', event => this.open(event));
    }
    window.addEventListener('scroll', throttle(() => this.scrollTable()));
    // document.addEventListener('keydown', event => {
    //   if (event.metaKey && event.code === 'ArrowDown') {
    //     console.log('вниз');
    //   }
    // });
    if (this.pagination) {
      this.pagination.querySelectorAll('.arrow').forEach(el => el.addEventListener('click', event => this.moveTable(event)))
    }
    if (this.head) {
      if (this.resizeBtns) {
        this.resizeBtns.forEach(el => el.addEventListener('mousedown', event => this.startResize(event)));
      }
    }
  }

  // Подготовка таблицы для работы:
  this.prepare = function() {
    this.prepareData();
    this.initTab();
    this.fill('init');
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
        el.search = el.search.join(',').replace(/\s/g, ' ');
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
  this.fill = function(isInit) {
    this.loadData();
    this.fillResults();
    this.fillPagination();
    if (!isInit) {
      this.wrap.scrollIntoView();
    }
  }

  // Заполнение фильтров значениями:
  this.fillItems = function(curDropDown) {
    if (!settings.filters) {
      return;
    }
    this.getFilterItems();
    this.dropDowns.forEach((el, index) => {
      if (el !== curDropDown) {
        if (getEl('.items', el)) {
          var key = getEl('.group.filter', el).dataset.key;
          if (settings.filters[key]) {
            this[`dropDown${index}`].fillItems(settings.filters[key].items);
          }
        }
      }
    });
    if (curDropDown) {
    // this.checkItems(curDropDown ? curDropDown.dataset.key : '');
    } else if (this.filterPopUp) {
      this.filterPopUp.fillItems(settings.filters);
    }
  }

  // Получение данных для заполнения выпадающих списков таблицы значениями:
  this.getFilterItems = function() {
    for (var key in settings.filters) {
      if (settings.filters[key].filter) {
        var data = [], value;
        this.dataToLoad.forEach(el => {
          value = el[key];
          value = typeof value === 'string' || typeof value === 'number' ? value : undefined;
          if (value && data.indexOf(value) === -1) {
            data.push(value);
          }
        });
        // settings.filters[key].items = data.sort();
        settings.filters[key].items = data;
      }
    }
  }

  // Загрузка данных в таблицу:
  this.loadData = function(direction) {
    // console.log(direction);
    if (!this.dataToLoad.length) {
      this.body.innerHTML = '';
      return;
    }
    if (!direction || direction === 'next') {
      if (!direction) {
        this.countItems = 0;
      } else {
        if (this.direction !== direction) {
          this.countItems = this.countItems + this.body.querySelectorAll('tr').length;
          this.direction = direction;
        } else {
          this.countItems = this.countItemsTo;
        }
      }
      this.countItemsTo = this.countItems + this.incr;
      if (this.countItemsTo > this.dataToLoad.length) {
        this.countItemsTo = this.dataToLoad.length;
      }
    } else if (direction === 'prev') {
      if (this.direction !== direction) {
        this.countItemsTo = this.countItemsTo - this.body.querySelectorAll('tr').length;
        this.direction = direction;
      } else {
        this.countItemsTo = this.countItems;
      }
      this.countItems = this.countItemsTo - this.incr;
      if (this.countItems < 0) {
        this.countItems =  0;
      }
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
      sub: settings.desktop.sub,
      sign: settings.desktop.sign,
      action: 'return'
    });

    if (!direction) {
      this.body.innerHTML = list;
      this.paginationSwitch = this.body.lastElementChild;
    } else if (direction === 'next') {
      this.body.insertAdjacentHTML('beforeend', list);
      if (this.countItems - this.incr * 2 >= 0) {
        for (let i = 0; i < this.incr; i++) {
          this.body.removeChild(this.body.firstElementChild);
        }
      }
    } else if (direction === 'prev') {
      this.body.insertAdjacentHTML('afterbegin', list);
      if (this.countItemsTo + this.incr * 2 <= this.dataToLoad.length) {
        for (let i = 0; i < this.incr; i++) {
          this.body.removeChild(this.body.lastElementChild);
        }
      }
    }
    // this.fillPagination();
  }

  // Замена данных в таблице:
  this.replaceData = function() {
    var tableItems = [],
        from = this.countItems,
        to = this.countItemsTo;
    if (this.direction === 'next') {
      from = this.countItemsTo - this.body.querySelectorAll('tr').length;
    }
    if (this.direction === 'prev') {
      to = this.countItems + this.body.querySelectorAll('tr').length;
    }
    for (let i = from; i < to; i++) {
      tableItems.push(this.dataToLoad[i]);
    }
    var list = fillTemplate({
      area: this.body,
      items: tableItems,
      sub: settings.desktop.sub,
      sign: settings.desktop.sign,
      action: 'return'
    });
    this.body.innerHTML = list;
  }

  // Подгрузка таблицы при скролле:
  this.scrollTable = function() {
    var scrolled = window.pageYOffset,
        direction;
    if (scrolled > this.scrollPos) {
      direction = 'next';
      if (this.wrap.getBoundingClientRect().bottom - window.innerHeight < 200) {
        this.loadData('next');
      }
    } else if (scrolled < this.scrollPos) {
      direction = 'prev';
      if (this.wrap.getBoundingClientRect().top + window.innerHeight > 200) {
        this.loadData('prev');
      }
    }
    this.scrollPos = scrolled;
    this.changeResizeBtns();
    this.fillPagination('direction');
  }

  // Подгрузка таблицы при нажатии на кнопки пагинации:
  this.moveTable = function(event) {
    if (event.target.classList.contains('right')) {
      this.wrap.scrollIntoView(false);
    } else if (event.target.classList.contains('left')) {
      this.wrap.scrollIntoView();
    }
  }

  // Заполнение пагинации:
  this.fillPagination = function(direction) {
    if (!this.pagination || this.countItems === this.countItemsTo) {
      return;
    }
    var from = this.countItems + 1,
        to = this.countItemsTo;
    if (direction) {
      // console.log(this.direction);
      // console.log(this.countItems);
      console.log(this.countItemsTo);
      // console.log(getEl('td:nth-child(3)', this.paginationSwitch).textContent);
      var paginationPos = this.pagination.getBoundingClientRect().bottom + parseInt(window.getComputedStyle(this.pagination).fontSize, 10);
      if (this.direction === 'next') {
        if (paginationPos >= this.paginationSwitch.getBoundingClientRect().top) {
          getEl('.cur', this.pagination).textContent = `${from} - ${to}`;
          if (this.countItemsTo !== this.dataToLoad.length) {
            this.paginationSwitch = this.body.lastElementChild;
            // console.log('next');
            // console.log(getEl('td:nth-child(3)', this.paginationSwitch).textContent);
          }
        }
      }
      if (this.direction === 'prev') {
        //  console.log(paginationPos);
        //  console.log(this.paginationSwitch.getBoundingClientRect().top);
        if (paginationPos >= this.paginationSwitch.getBoundingClientRect().top) {
          // console.log('toggle');
          getEl('.cur', this.pagination).textContent = `${from} - ${to}`;
          if (this.countItems !== 0) {
            this.paginationSwitch = this.body.firstElementChild;
            // console.log('prev');
            // console.log(getEl('td:nth-child(3)', this.paginationSwitch).textContent);
          }
        }
      }
    } else {
      getEl('.cur', this.pagination).textContent = `${from} - ${to}`;
      getEl('.total', this.pagination).textContent = this.dataToLoad.length;
    }
  }

  // console.log(getEl('td:nth-child(3)', this.paginationSwitch).textContent);


  // if (this.direction !== direction) {
  //   this.countItems = this.countItems + this.body.querySelectorAll('tr').length;
  //   this.direction = direction;
  // } else {
  //   this.countItems = this.countItemsTo;
  // }

  // Установка высоты кнопки ресайза (чтобы не выходила за пределы таблицы):
  this.changeResizeBtns = function() {
    if (!this.head) {
      return;
    }
    var headerRect = getEl('th', this.head).getBoundingClientRect(),
        bodyRect = this.body.getBoundingClientRect(),
        newHeight =  bodyRect.bottom - headerRect.bottom + 'px';
    changeCss(`#${this.wrap.id} > table > thead > tr > th .resize-btn:hover::after`, 'height', newHeight);
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
        total = convertPrice(total, 2);
      }
      result.textContent = total;
    });
  }

  // Визуальное отображение таблицы:
  this.show = function() {
    showElement(this.wrap);
    this.changeResizeBtns();
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
  this.changeData = event => {
    var type = event.detail;
    if (type === 'sort') {
      this.sortData(event);
    } else {
      this.filterData(event, type);
    }
  }

  // Сортировка по столбцу:
  this.sortData = function(event) {
    var group = event.target.closest('.group'),
        type = group.dataset.type,
        key = group.dataset.key;
        key = event.target.classList.contains('down') ? key : '-' + key;
    this.head.querySelectorAll('.sort.checked').forEach(el => {
      if (el !== event.target) {
        el.classList.remove('checked');
      }
    });
    if (event.target.classList.contains('checked')) {
      this.data.sort(sortBy(key, type));
      this.dataToLoad.sort(sortBy(key, type));
    } else {
      this.data = JSON.parse(JSON.stringify(this.initialData));
      this.selectData();
    }
    this.replaceData();
  }

  // Поиск и фильтрация по столбцу:
  this.filterData = function(event, type) {
    if (this.control) {
      this.resetControl();
    }
    var key = event.target.closest('.group').dataset.key,
        value,
        action;
    if (type === 'search') {
      value = event.target.closest('.activate').value,
      action = value ? 'save' : 'remove';
    } else if (type === 'filter') {
      value = event.target.dataset.value,
      action = event.target.classList.contains('checked') ? 'save' : 'remove';
    }
    var oldFilters = JSON.stringify(this.filters);
    this.changeFilter(action, type, key, value);
    if (oldFilters !== JSON.stringify(this.filters)) {
      this.selectData();
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

  // Отбор данных:
  this.selectData = function() {
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
        if (('' + itemValue).search(regEx) >= 0) {
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
    this.dropDowns.forEach((el, index) => this[`dropDown${index}`].clear());
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
  this.resize = throttle(event => {
    if (this.prevColumn && this.nextColumn) {
      var tableWidth = this.wrap.offsetWidth,
          offset = event.pageX - this.startCoord,
          newPrevWidth = (this.prevWidth + offset),
          newNextWidth = (this.nextWidth - offset),
          minWidth = (parseInt(window.getComputedStyle(this.prevColumn).fontSize, 10) * 4.65).toFixed(0);
      if (newPrevWidth > minWidth && newNextWidth > minWidth) {
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
    this.setEventListeners();
    if (this.search) {
      this.search = initSearch(this.search, this.fullSearch);
    }
    if (this.dropDowns) {
      this.dropDowns.forEach((el, index) => this[`dropDown${index}`] = initDropDown(el, this.changeData));
    }
    this.prepare();
    if (this.wrap.classList.contains('active')) {
      this.show();
    }
  }
  this.init();
}
