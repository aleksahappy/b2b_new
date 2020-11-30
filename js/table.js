'use strict';

// Для корректной работы скрипта необходимо подключение перед ним main.js (не будет работать функционала fillTemplate, объектов DropDown, Search)

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
//     toggle: {                                        - наличие переключателя и его настройки (по умолчанию отсутствует):
//       title: 'Заголовок'                               - заголовок переключателя
//       key: 'key1'                                      - ключ в данных, по которому брать данные для работы
//     }
//     pill: {                                          - наличие чекбоксов-"пилюль" (по умолчанию отсутствуют)
//       key: 'key1'                                      - ключ в данных, по которому брать данные для работы (если ключ находится во вложенности объектов, то указывать его как 'key1/key1.1')
//       content: html разметка                           - html "пилюли", при отсутствии будет html по умолчанию
//       sort: 'title' / 'value'                          - нужна ли сортировка, если нужна то указать по заголовку или значению
//     }
//     setting: true / false                            - наличие настроек таблицы (по умолчанию отсутствует)
//   },
//   desktop: {                                       Настройки основной таблицы (для таблиц с готовым шаблоном в html данный параметр пропускаем):
//     head: true / false                               - имеет ли таблица шапку (по умолчанию отсутствует)
//     result: true / false                             - имеет ли таблица строку "итого" (по умолчанию отсутствует)
//     trFunc: 'onclick=functionName(event,#key#)'      - обработчик, навешиваемый на строку таблицы (по умолчанию false)
//     sign: '#' / '@@' / другой                        - символ для поиска мест замены в html (по умолчанию - '#')
//     sub: [{area: селектор, items: ключ в data}]      - данные о подшаблонах (по умолчанию подшаблонов нет) - как заполнять смотри fillTemplate
//     cols: [{                                         - параметры столбцов таблицы
//       title: 'Заголовок'                               - заголовок столбца
//       class: 'classname'                               - название класса для столбца (чтобы можно было добавить уникальные стили)
//       width: 'x%',                                     - ширина столбца в процентах, если не устраивает ширина по умолчанию (по умолчанию все столбцы одинаковой ширины)
//       align: 'center' / 'right'                        - выравнивание столбца, если не устраивает выравнивание по левому краю
//       keys: ['key1', 'key2', ...]                      - ключи данных по которым находится информация для данного столбца (первый ключ всегда приоритетный, по нему считаются итоги если они нужны)
//                                                          (если ключ находится во вложенности объектов, то указывать его как 'key1/key1.1')
//       result: 'kolv' / 'sum'                           - наличие и формат итога по колонке (умолчанию отсутствует)
//       content: html разметка                           - содержимое ячейки, по умолчанию это: #key1# #key2#..., иначе вносим html разметку
//     }, {...}]
//   },
//   adaptive: {                                      Настройки адаптивной таблицы (если необходимы):
//     sign: '#' / '@@' / другой                        - Символ для поиска мест замены в html (по умолчанию - '#')
//     sub: [{area: селектор, items: ключ в data}]      - данные о подшаблонах (по умолчанию подшаблонов нет) - как заполнять смотри fillTemplate
//   },
//   filters: {                                       Сортировки и фильтры таблицы:
//     key1: {                                          - ключ в данных, по которому будет браться информация
//       title: 'Заголовок'                               - заголовок сортировки
//       sort: 'text' / 'numb' / 'date'                   - формат сортировки (по умолчанию text)
//       search: 'usual' / 'date'                         - нужен ли поиск по ключу и его формат (по умолчанию отсутствует)
//       filter: 'checkbox' / 'select'                    - нужна ли фильтрация по ключу и ее формат (по умолчанию отсутствует)
//       items:                                           - данные для заполнения фильтра (чекбоксов или селектов):
//        {{                                                1) первый вариант заполенения (когда название отличается от значения и/или есть подфильтры):
//           title: 'заголовок'                               - заголовок пункта фильтра
//           value: 'значение для поиска'                     - значение, которое будет искаться в данных
//           items: { - если есть подфильтры:                 - данные для заполнения подфильтра (если нужно, если нет то пропускаем этот ключ)
//             title: 'Заголовок'
//             value: 'значение для поиска'
//             items: ...
//           }
//         }, {...}
//         или ['значение1', 'значение2', ...]              2) второй вариант заполнения (когда название и значение одинаковые и нет подфильтров)
//       isOpen: true / false                             - фильтр открыт или закрыт (true - открыт, по умолчанию false - закрыт)
//     },
//     key2: {...}
//   }
// }

// Инициализация таблицы:

function initTable(el, settings) {
  var el = getEl(el);
  if (el) {
    createTableControl(el, settings)
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
  var controlSettings = settings.control;
  if (!controlSettings) {
    return;
  }
  var main = '',
      options = '',
      btns = '';
  if (controlSettings.pagination || controlSettings.search) {
    var pagination = '', search = '';
    if (controlSettings.pagination) {
      pagination =
      `<div class="pagination row">
        <div class="arrow blue icon left"></div>
        <div class="title"><span class="cur"></span> из <span class="total"></span></div>
        <div class="arrow blue icon right"></div>
      </div>`;
    }
    if (controlSettings.search) {
      search =
      `<form class="search row" action="#">
        <input type="text" data-value="" placeholder="${controlSettings.search}">
        <input class="search icon" type="submit" value="">
        <div class="close icon"></div>
      </form>`;
    }
    main =
    `<div class="main row">
      ${pagination}
      ${search}
    </div>`
  }
  if (controlSettings.toggle || controlSettings.pill) {
    var toggle = '', pill = '';
    if (controlSettings.toggle) {
      toggle =
      `<div class="tog row">
        <div class="text">${title}</div>
        <div class="toggle">
          <div class="toggle-in"></div>
        </div>
      </div>`;
    }
    if (controlSettings.pill) {
      pill =
      `<div class="pills" data-key="${controlSettings.pill.key}/value">
        ${controlSettings.pill.content || '<div class="pill ctr checked" data-value="#value#">#title#</div>'}
      </div>`;
    }
    options =
    `<div class="options row">
      ${toggle}
      ${pill}
    </div>`
  }
  if (controlSettings.setting || settings.filters) {
    var setting = '', relay = '';
    if (controlSettings.setting) {
      setting = `<div class="settings icon"></div>`;
    }
    if (settings.filters) {
      relay = `<div class="relay icon"></div>`;
    }
    btns =
    `<div class="btns row">
      ${setting}
      ${relay}
    </div>`
  }
  var controlHtml =
  `<div class="wrap row">
    ${main}
    ${options}
  </div>
  ${btns}`;

  var control = document.createElement('div');
  control.classList.add('control', 'row');
  control.dataset.area = area.id;
  control.innerHTML = controlHtml;
  if (controlSettings.area) {
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
      headRow += createTableHeadCell(col, index, settings.filters);
      if (tableSettings.result) {
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

function createTableHeadCell(col, index, filters) {
  var th = '';
  if (col.keys && filters) {
    var sortConternt = '',
        filterContent = '';
    col.keys.forEach(key => {
      var data = filters[key];
      if (data) {
        if (data.sort) {
          var type = data.sort;
          sortConternt =
          `<div class="group sort" data-key="${key}" data-type="${type}">
            <div class="title">Сортировка</div>
            <div class="item sort down row">
              <div class="sort icon"></div>
              <div>${getSortText('down', type)}</div>
            </div>
            <div class="item sort up row">
              <div class="sort icon"></div>
              <div>${getSortText('up', type)}</div>
            </div>
          </div>`;
        }
        if (data.search || data.filter) {
          var content = '',
              search = data.search,
              filter = data.filter;
          if (search) {
            if (search === 'date') {
              search =
              `<div class="calendar-wrap">
                <input type="text" value="" data-type="date" placeholder="ДД.ММ.ГГГГ" maxlength="10" autocomplete="off" oninput="onlyDateChar(event)">
              </div>`;
            } else {
              search =
              `<form class="search row" action="#">
                <input type="text" data-value="" placeholder="Поиск...">
                <input class="search icon" type="submit" value="">
                <div class="close icon"></div>
              </form>`;
            }
            content = search;
          }
          if (filter && search !== 'date') {
            if (filter === 'select') {
              filter =
              `<div class="items">
                <div class="item" data-value="#value#">#title#</div>
              </div>`;
            } else {
              filter =
              `<div class="items">
                <div class="item row" data-value="#value#">
                  <div class="checkbox icon"></div>
                  <div>#title#</div>
                </div>
              </div>`;
            }
            if (search) {
              filter = '<div class="not-found">Совпадений не найдено</div>' + filter;
            }
            content += filter;
          }
          filterContent =
          `<div class="group filter" data-key="${key}">
            <div class="title">Фильтр</div>
            ${content}
          </div>`;
        }
      }
    });
    if (sortConternt || filterContent) {
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
            ${sortConternt}
            ${filterContent}
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
    this.pills = getEl('.pills', this.control);
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
    if (getEl('.relay.icon', this.wrap)) {
      this.filterPopUp = initFilter(obj, {sorts: settings.sorts, filters: settings.filters});
    }
  }

  // Константы:
  this.initialData = settings.data;

  // Динамические переменные:
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
  this.filters = {};
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
    if (this.pills) {
      this.pills.addEventListener('click', event => {
        if (event.target.classList.contains('pill')) {
          event.target.classList.toggle('checked');
          this.filterData(event, 'filter');
        }
      });
    }
    if (this.resizeBtns) {
      this.resizeBtns.forEach(el => el.addEventListener('mousedown', event => this.startResize(event)));
    }
  }

  // Подготовка таблицы для работы:
  this.prepare = function() {
    this.prepareData();
    this.initTab();
    this.fill('init');
    this.fillPills();
    this.fillItems();
  }

  // Преобразование входящих данных:
  this.prepareData = function() {
    this.initialData = Array.isArray(this.initialData) ? this.initialData.filter(el => el) : [];
    if (this.initialData) {
      this.data = JSON.parse(JSON.stringify(this.initialData));
      this.data.forEach(el => this.addDataForSearch(el));
      this.dataToLoad = this.data;
    }
  }

  // Добавление данных для поиска по всей таблице:
  this.addDataForSearch = function(el) {
    if (settings.desktop.cols) {
      settings.desktop.cols.forEach(col => {
        if (col.keys) {
          col.keys.forEach(key => {
            key = key.split('/')[0];
            el.search += convertToString(el[key]);
          });
        }
      });
      el.search = el.search.replace(/\s/g, ' ');
    } else {
      el.search = convertToString(el).replace(/\s/g, ' ');
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
    // if (!isInit) {
    //   this.wrap.scrollIntoView();
    // }
  }

  // Заполнение "пилюль" значениями:
  this.fillPills = function() {
    if (!this.pills) {
      return;
    }
    var key = settings.control.pill.key,
        sort = settings.control.pill.sort,
        data = this.getItems(key);
    if (sort === 'title' || sort === 'value') {
      data.sort(sortBy(sort));
    }
    fillTemplate({
      area: this.pills,
      items: data
    });
    this.addPillsInFilter();
  }

  // Добавление значений "пилюль" в фильтры и проставление им checked:
  this.addPillsInFilter = function() {
    if (!this.pills) {
      return;
    }
    this.pills.querySelectorAll('.pill').forEach(el => {
      el.classList.add('checked');
      this.changeFilter('save', 'filter', this.pills.dataset.key, el.dataset.value);
    });
  }

  // Получение данных для заполнения выпадающих списков таблицы значениями:
  this.getFilterItems = function() {
    for (var key in settings.filters) {
      if (settings.filters[key].filter) {
        settings.filters[key].items = this.getItems(key);
      }
    }
  }

  // Получение всех вариантов значений из имеющихся данных по ключу:
  this.getItems = function(key) {
    var data = [];
    this.dataToLoad.forEach(item => {
      if (key.indexOf('/') > 0) {
        var keys = key.split('/');
        if (Array.isArray(item[keys[0]])) {
          item[keys[0]].forEach(item => getValue(item[keys[1]]));
        }
      } else {
        getValue(item[key]);
      }
    });

    function getValue(item) {
      var title, value;
      if (Array.isArray(item)) {
        item.forEach(el => getValue(el));
      }
      if (typeof item === 'object') {
        title = item.title;
        value = item.value;
      } else {
        title = value = item;
      }
      if ((typeof title === 'string' || typeof title === 'number') && (typeof value === 'string' || typeof value === 'number')) {
        item = {
          title: title,
          value: value
        };
        if (!data.find(el => el.title === item.title)) {
          data.push(item);
        }
      }
    }

    return data;
  }

  // Заполнение фильтров значениями:
  this.fillItems = function(curDropDown) {
    if (!settings.filters) {
      return;
    }
    this.getFilterItems();
    if (this.dropDowns) {
      this.dropDowns.forEach((el, index) => {
        if (el !== curDropDown) {
          if (getEl('.items', el)) {
            var key = getEl('.group.filter', el).dataset.key;
            if (settings.filters[key].items) {
              this[`dropDown${index}`].fillItems(settings.filters[key].items);
            }
          }
        }
      });
      if (curDropDown) {
        // this.checkItems(curDropDown ? curDropDown.dataset.key : '');
      }
    }
    if (this.filterPopUp && !curDropDown) {
      this.filterPopUp.fillItems(settings.filters);
    }
  }

  // Загрузка данных в таблицу:
  this.loadData = function(direction) {
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
    if (this.dataToLoad.length && this.countItems === this.countItemsTo) {
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
    list = list.replace(/<td>\s*<\/td>/g, '<td>&ndash;<\/td>');

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
    list = list.replace(/<td>\s*<\/td>/g, '<td>&ndash;<\/td>');
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
    if (!this.pagination || (this.dataToLoad.length && (this.countItems === this.countItemsTo))) {
      return;
    }
    var from = this.dataToLoad.length ? this.countItems + 1 : 0,
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
    var activeTable = getEl('.table.active');
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
      var regExp = getRegExp(textToFind);
      this.dataToLoad = this.data.filter(item => findByRegExp(item.search, regExp));
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
    var group = getEl('.group.sort', event.currentTarget),
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

  // Поиск и фильтрация по ключу:
  this.filterData = function(event, type) {
    if (this.search) {
      this.search.clear();
    }
    var key = event.target.closest('[data-key]').dataset.key,
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
          if (key.indexOf('/') > 0) {
            var keys = key.split('/');
            if (Array.isArray(item[keys[0]])) {
              item[keys[0]].forEach(item => {
                if (checkValue(filter.type, filter.values, item[keys[1]])) {
                  isFound = true;
                }
              });
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
        var regExp = getRegExp(value);
        if (/^\d+[\d\s]*(\.{0,1}|\,{0,1}){0,1}[\d\s]*$/.test(itemValue)) {
          itemValue = itemValue.replace(/\s/g, '').replace('.', ',');
        }
        if (findByRegExp(itemValue, regExp)) {
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

  // Очистка поиска и фильтров по ключу:
  this.resetFilters = function() {
    this.filters = {};
    this.addPillsInFilter();
    if (this.dropDowns) {
      this.dropDowns.forEach((el, index) => this[`dropDown${index}`].clear());
    }
  }

  // Полная очистка поиска и фильтрации:
  this.reset = function() {
    if (this.search) {
      this.search.clear();
    }
    this.resetFilters();
    this.dataToLoad = this.data;
    this.fill();
  }

  // Запуск перетаскивания столбца:
  this.startResize = function(event) {
    if (event.button != 0) {
      return;
    }
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
      this.changeResizeBtns();
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
    if (this.search) {
      this.search = initSearch(this.search, this.fullSearch);
    }
    if (this.dropDowns) {
      this.dropDowns.forEach((el, index) => this[`dropDown${index}`] = initDropDown(el, this.changeData));
    }
    this.prepare();
    this.setEventListeners();
    if (this.wrap.classList.contains('active')) {
      this.show();
    }
  }
  this.init();
}
