'use strict';

// Для корректной работы скрипта необходимо подключение перед ним main.js
// (не будет работать без функционала loadData, fillTemplate, объектов DropDown, Search)

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
//     pill: {                                          - наличие чекбоксов-"пилюль" (по умолчанию отсутствуют)
//       key: 'key1'                                      - ключ в данных, по которому брать данные для работы (если ключ находится во вложенности объектов, то указывать его как 'key1/key1.1')
//       content: html разметка                           - html "пилюли", при отсутствии будет html по умолчанию,
//       items:                                           - данные для заполнения "пилюль" (если данных нет, то пилюли создадутся на основе имеющихся данных в данных для заполнения таблицы):
//        {{                                                1) первый вариант заполенения (когда название отличается от значения):
//           title: 'заголовок'                               - заголовок "пилюли"
//           value: 'значение для поиска'                     - значение, которое будет искаться в данных
//         }, {...}
//         или ['значение1', 'значение2', ...]              2) второй вариант заполнения (когда название и значение одинаковые)
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
//   adaptive: {                                      Настройки заполнения адаптивной таблицы (если необходимы):
//     sub: [{area: селектор, items: ключ в data}]     - по умолчанию только {area: '.table-adaptive', items: data}
//     sign: '#' / '@@' / другой                       - можно дополнить полями sub, sign и т.д. - как заполнять смотри fillTemplate
//     ...
//   },
//   bound: число пикселей (например 768)             Разрешение, на котором должно происходить переключение обычной таблицы на адаптивную (по умолчанию - 1359px)
//   filters: {                                       Сортировки и фильтры таблицы:
//     key1: {                                          - ключ в данных, по которому находится информация
//       title: 'Заголовок'                               - заголовок сортировки
//       sort: 'text' / 'numb' / 'date'                   - формат сортировки (по умолчанию text)
//       search: 'usual' / 'date'                         - нужен ли поиск по ключу и его формат (по умолчанию отсутствует)
//       filter: 'checkbox' / 'select'                    - нужна ли фильтрация по ключу и ее формат (по умолчанию отсутствует)
//       items:                                           - данные для заполнения фильтра (чекбоксов или селектов):
//        [{                                                1) первый вариант заполенения (когда название отличается от значения и/или есть подфильтры):
//           title: 'заголовок'                               - заголовок пункта фильтра
//           value: 'значение для поиска'                     - значение, которое будет искаться в данных
//           (Если есть подфильтры:)
//           key: 'ключ для подфильтров'                      - ключ в данных, по которому находится информация для подфильтров (если нужно, если нет то пропускаем)
//           items: [{                                        - данные для заполнения подфильтра (если нужно, если нет то пропускаем)
//             title: 'Заголовок'
//             value: 'значение для поиска'
//             key: ...
//             items: ...
//           }]
//         }, {...}]
//         или ['значение1', 'значение2', ...]              2) второй вариант заполнения (когда название и значение одинаковые и нет подфильтров)
//       isOpen: true / false                             - открыт ли фильтр по умолчанию (по умолчанию false - закрыт, true - открыт)
//       isMore: true / false / 'количество'              - скрывать ли значения фильтра и больше скольки (по умолчанию false - не срывать, true - скрывать больше 4-х, 'количество' - то скрывать больше этого количества)
//     },
//     key2: {...}
//   },
//   isSave: true / false                             Cохранять ли положение групп фильтров в текущей сессии браузера (открыты/закрыты) (по умолчанию false - не сохраняются)
// }

// Инициализация таблицы:

function initTable(el, settings) {
  var el = getEl(el);
  if (el) {
    if (el.id) {
      return window[`${el.id}Table`] = new Table(el, settings);
    } else {
      return new Table(el, settings);
    }
  }
}

// Обновление таблицы новыми данными:

function updateTable(el, data) {
  var el = getEl(el);
  if (el.id) {
    var table = window[`${el.id}Table`];
    if (table) {
      table.initialData = data;
      table.prepare(true);
    }
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
      `<form class="search row" data-type="fast" action="#">
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
        ${controlSettings.pill.content || '<div class="item pill ctr checked" data-value="#value#">#title#</div>'}
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

  var thead = '';
  if (tableSettings.head) {
    thead =
    `<thead>
      <tr>${headRow}</tr>
      ${resultRow ? `<tr class="results">${resultRow}</tr>` : ''}
    </thead>`;
  }
  table.innerHTML =
  `${thead}
  <tbody id=${area.id}-body>
    <tr ${tableSettings.trFunc || ''}>${bodyRow}</tr>
  </tbody>`;
  area.appendChild(table);
}

// Создание ячейки шапки таблицы:

function createTableHeadCell(col, index, filters) {
  var th = '',
      thClass = col.class ? col.class : '';
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
            <div class="item sort down row" data-value="down">
              <div class="sort icon"></div>
              <div>${getSortText('down', type)}</div>
            </div>
            <div class="item sort up row" data-value="up">
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
              `<form class="search row" data-type="fast" action="#">
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
      `<th id="${index + 1}" class="activate box ${thClass}">
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
    `<th id="${index + 1}" class="${thClass}">
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
  // Константы:
  this.initialData = settings.data;
  this.bound = settings.bound || 1359;
  this.isSync = true;

  // Динамические переменные:
  this.mode;
  this.data = [];
  this.dataToLoad = [];
  this.countItems = 0;
  this.countItemsTo = 0;
  this.incr;
  this.direction;
  this.filters = {};
  if (this.head) {
    this.prevColumn = null;
    this.nextColumn = null;
    this.startCoord;
    this.prevWidth;
    this.nextWidth;
  }

  // Инициализация таблицы:
  this.init = function() {
    this.createTable();
    this.getElements();
    this.initElements();
    this.prepare();
    this.setEventListeners();
    this.show();
  }

  // Создание разметки таблицы:
  this.createTable = function() {
    createTableControl(obj, settings)
    createTable(obj, settings);
  }

  // Получение элементов таблицы для работы:
  this.getElements = function()  {
    this.wrap = obj;
    this.tab = getEl(`.tab[data-area=${obj.id}]`);
    this.control = getEl(`.control[data-area=${obj.id}]`);
    this.desktop = getEl('.table-desktop', obj);
    this.adaptive = getEl('.table-adaptive', obj);
    this.toggleModeBtn = getEl('.relay.icon', this.wrap);

    if (this.control) {
      this.pagination = getEl('.pagination', this.control);
      this.fullSearch = getEl('form.search', this.control);
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
  }

  // Инициализация элементов таблицы для работы:
  this.initElements = function() {
    if (this.fullSearch) {
      this.fullSearch = initSearch(this.fullSearch, this.startFullSearch);
    }
    if (this.dropDowns) {
      this.dropDowns.forEach((el, index) => this[`dropDown${index}`] = initDropDown(el, this.startChangeData));
    }
    if (this.adaptive) {
      this.adaptive.id = obj.id + '-adaptive';
      if (this.toggleModeBtn) {
        this.filterPopUp = initFilter(obj, settings, curEl => curEl ? this.changeData(curEl) : this.clearFilters());
      }
    }
  }

  // Установка обработчиков событий:
  this.setEventListeners = function() {
    if (this.tab) {
      this.tab.addEventListener('click', event => this.open(event));
    }
    window.addEventListener('scroll', throttle(() => this.loadByScroll()));
    // document.addEventListener('keydown', event => {
    //   if (event.metaKey && event.code === 'ArrowDown') {
    //     console.log('вниз');
    //   }
    // });
    // document.addEventListener('keydown', event => {
    //   if (event.metaKey && event.code === 'ArrowUp') {
    //     console.log('вверх');
    //   }
    // });
    if (this.pagination) {
      this.pagination.querySelectorAll('.arrow').forEach(el => el.addEventListener('click', event => this.moveTable(event)))
    }
    if (this.pills) {
      this.pills.addEventListener('click', this.startChangeData);
    }
    if (this.resizeBtns) {
      this.resizeBtns.forEach(el => el.addEventListener('mousedown', event => this.startResize(event)));
    }
    if (this.adaptive) {
      window.addEventListener('resize', throttle(() => this.toggleMode()));
    }
  }

  // Подготовка таблицы для работы:
  this.prepare = function(isUpdate) {
    this.prepareData();
    this.initTab();
    this.toggleMode(isUpdate);
    this.fillPills();
    this.fillItems();
  }

  // Преобразование входящих данных:
  this.prepareData = function() {
    this.initialData = Array.isArray(this.initialData) ? this.initialData.filter(el => el) : [];
    this.initialData.forEach(el => this.addDataForSearch(el));
    this.data = JSON.parse(JSON.stringify(this.initialData));
    this.dataToLoad = this.data;
  }

  // Добавление данных для поиска по таблице:
  this.addDataForSearch = function(el) {
    if (settings.desktop.cols) {
      el.search = '';
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

  // Переключение режима таблицы:
  this.toggleMode = function(isUpdate) {
    if (this.adaptive) {
      if (window.innerWidth > this.bound && this.mode !== 'desktop') {
        this.mode = 'desktop';
        hideElement(this.adaptive);
        hideElement(this.toggleModeBtn);
        showElement(this.desktop, 'table');
      } else if (window.innerWidth <= this.bound && this.mode !== 'adaptive') {
        this.mode = 'adaptive';
        hideElement(this.desktop);
        showElement(this.adaptive);
        showElement(this.toggleModeBtn);
      } else if (!isUpdate) {
        return;
      }
    } else {
      this.mode = 'desktop';
      hideElement(this.toggleModeBtn);
      showElement(this.desktop, 'table');
    }
    if (!this.isSync) {
      this.clear();
    }
    this.fill(isUpdate);
  }

  // Заполнение таблицы данными:
  this.fill = function(isUpdate) {
    if (!isUpdate) {
      setDocumentScroll(0, this.wrap.getBoundingClientRect().top + pageYOffset - 200);
    }
    if (this.mode === 'desktop') {
      this.loadTableData();
      this.fillResults();
      this.fillPagination();
      this.changeResizeBtns();
    } else {
      this.loadAdaptiveData();
    }
  }

  // Заполнение "пилюль" значениями и блокировка неактуальных:
  this.fillPills = function() {
    if (!this.pills) {
      return;
    }
    var setting = settings.control.pill,
        key = setting.key,
        sort = setting.sort,
        data = setting.items ?  setting.items : this.getItems(key);
    if (sort) {
      data.sort(sortBy(sort));
    }
    loadData(this.pills, data);
    if (setting.items) {
      this.pills.querySelectorAll('.pill').forEach(pill => {
        if (!data.find(el => el.value == pill.dataset.value)) {
          pill.classList.add('disabled');
        }
      });
    }
    this.addPillsInFilter();
  }

  // Добавление значений "пилюль" в фильтры и проставление им checked:
  this.addPillsInFilter = function() {
    if (!this.pills) {
      return;
    }
    this.pills.querySelectorAll('.pill:not(.disabled)').forEach(el => {
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
      var types = ['string', 'number'];
      if ((/\S/.test(title)) && (/\S/.test(value)) && (types.indexOf(typeof title) >= 0) && (types.indexOf(typeof value) >= 0)) {
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
  this.fillItems = function() {
    if (!settings.filters) {
      return;
    }
    this.getFilterItems();
    if (this.dropDowns) {
      this.dropDowns.forEach((el, index) => {
        if (getEl('.items', el)) {
          var key = getEl('.group.filter', el).dataset.key;
          if (settings.filters[key].items) {
            this[`dropDown${index}`].fillItems(settings.filters[key].items);
          }
        }
      });
    }
    if (this.filterPopUp) {
      this.filterPopUp.fillItems(settings.filters);
    }
  }

  // Загрузка данных в таблицу:
  this.loadTableData = function(direction) {
    this.stopScroll = true;
    this.incr = 50;
    if (!direction || direction === 'next') {
      if (!direction) {
        this.countItems = 0;
      } else {
        this.countItems = parseInt(this.desktop.lastElementChild.dataset.to, 10);
      }
      this.countItemsTo = this.countItems + this.incr;
      if (this.countItemsTo > this.dataToLoad.length) {
        this.countItemsTo = this.dataToLoad.length;
      }
    } else if (direction == 'prev') {
      this.countItemsTo = parseInt(this.head.nextElementSibling.dataset.from, 10);
      this.countItems = this.countItemsTo - this.incr;
      if (this.countItems < 0) {
        this.countItems =  0;
      }
    }
    if (this.dataToLoad.length && this.countItems === this.countItemsTo) {
      return;
    }

    var data = [];
    for (var i = this.countItems; i < this.countItemsTo; i++) {
      data.push(this.dataToLoad[i]);
    }
    var list = fillTemplate({
      area: this.body,
      items: data,
      sub: settings.desktop.sub,
      sign: settings.desktop.sign,
      action: 'return'
    });
    list = list.replace(/(<td[^>]*>)\s*<\/td>/g, '$1&ndash;<\/td>');

    var newBodyBlock = document.createElement('tbody');
    newBodyBlock.dataset.from = this.countItems;
    newBodyBlock.dataset.to = this.countItemsTo;
    newBodyBlock.innerHTML = list;

    if (!direction || direction === 'next') {
      if (!direction) {
        this.wrap.querySelectorAll('.table-desktop > tbody').forEach(el => el.remove());
      } else if (this.curBodyBlock.previousElementSibling && this.curBodyBlock.previousElementSibling.previousElementSibling && this.curBodyBlock.previousElementSibling.previousElementSibling.tagName.toLowerCase() === 'tbody') {
        this.head.nextElementSibling.remove();
      }
      this.desktop.insertAdjacentElement('beforeend', newBodyBlock);
    } else if (direction === 'prev') {
      if (this.curBodyBlock.nextElementSibling && this.curBodyBlock.nextElementSibling.nextElementSibling) {
        this.desktop.lastElementChild.remove();
      }
      this.head.insertAdjacentElement('afterend', newBodyBlock);
    }
    if (!direction) {
      this.stopScroll = false;
      this.curBodyBlock = newBodyBlock;
      this.scrollPos = window.pageYOffset;
      this.loadTableData('next');
    } else {
      setTimeout(() => {
        this.stopScroll = false;
        this.scrollPos = window.pageYOffset;
      }, 100);
    }
  }

  // Замена данных в таблице:
  this.replaceTableData = function() {
    this.stopScroll = true;
    this.wrap.querySelectorAll('.table-desktop > tbody').forEach(bodyBlock => {
      var data = [],
          from = parseInt(bodyBlock.dataset.from, 10),
          to = parseInt(bodyBlock.dataset.to, 10);
      for (let i = from; i < to; i++) {
        data.push(this.dataToLoad[i]);
      }
      var list = fillTemplate({
        area: this.body,
        items: data,
        sub: settings.desktop.sub,
        sign: settings.desktop.sign,
        action: 'return'
      });
      list = list.replace(/(<td[^>]*>)\s*<\/td>/g, '$1&ndash;<\/td>');
      bodyBlock.innerHTML = list;
    });
    this.stopScroll = false;
    this.scrollPos = window.pageYOffset;
  }

  // Загрузка данных в адаптивную часть:
  this.loadAdaptiveData = function(isScroll) {
    if (!isScroll) {
      this.countItems = 0;
    } else {
      this.countItems = this.countItemsTo;
    }

    if (window.innerWidth > 2000) {
      this.incr = 100;
    } else if (window.innerWidth < 1080) {
      this.incr = 20;
    } else {
      this.incr = 50;
    }

    this.countItemsTo = this.countItems + this.incr;
    if (this.countItemsTo > this.dataToLoad.length) {
      this.countItemsTo = this.dataToLoad.length;
    }
    if (this.dataToLoad.length && this.countItems === this.countItemsTo) {
      return;
    }

    var data = [];
    for (var i = this.countItems; i < this.countItemsTo; i++) {
      data.push(this.dataToLoad[i]);
    }
    var obj = {
      area: '.table-adaptive',
      items: data,
      method: this.countItems === 0 ? 'inner' : 'beforeend'
    };
    if (settings.adaptive) {
      for (var key in settings.adaptive) {
        obj[key] = settings.adaptive[key];
      }
    }
    fillTemplate(obj);
  }

  // Подгрузка при скролле:
  this.loadByScroll = function() {
    if (this.mode === 'desktop') {
      this.scrollTable();
    } else if (this.mode === 'adaptive') {
      this.scrollAdaptive();
    }
  }

  // Подгрузка таблицы при скролле:
  this.scrollTable = function() {
    if (this.stopScroll) {
      return;
    }
    var scrolled = window.pageYOffset;
    if (scrolled > this.scrollPos &&
        this.curBodyBlock.getBoundingClientRect().bottom - window.innerHeight < 0
      ) {
      var next = this.curBodyBlock.nextElementSibling;
      if (next) {
        this.curBodyBlock = next;
        this.fillPagination('next');
        if (this.desktop.lastElementChild.dataset.to < this.dataToLoad.length) {
          this.loadTableData('next');
        }
      }
    } else if (scrolled < this.scrollPos &&
      this.curBodyBlock.getBoundingClientRect().top + window.innerHeight > 0
      ) {
      var prev = this.curBodyBlock.previousElementSibling;
      if (prev && prev.tagName.toLowerCase() === 'tbody') {
        this.curBodyBlock = prev;
        this.fillPagination('prev');
        if (this.head.nextElementSibling.dataset.from > 0) {
          this.loadTableData('prev');
        }
      }
    }
    this.scrollPos = scrolled;
    this.changeResizeBtns();
  }

  // Подгрузка адаптивной части при скролле:
  this.scrollAdaptive = function() {
    if (window.pageYOffset * 2 + window.innerHeight >= document.body.clientHeight) {
      this.loadAdaptiveData(true);
    }
  }

  // Подгрузка таблицы при нажатии на кнопки пагинации:
  this.moveTable = function(event) {
    if (event.target.classList.contains('right') &&  this.curBodyBlock.nextElementSibling) {
      this.curBodyBlock.nextElementSibling.scrollIntoView();
    } else if (event.target.classList.contains('left') &&
      this.curBodyBlock.previousElementSibling &&
      this.curBodyBlock.previousElementSibling.tagName.toLowerCase() === 'tbody')
    {
      this.curBodyBlock.previousElementSibling.scrollIntoView(false);
    }
  }

  // Заполнение пагинации:
  this.fillPagination = function(direction) {
    if (!this.pagination) {
      return;
    }
    if (!direction) {
      getEl('.total', this.pagination).textContent = this.dataToLoad.length;
    }
    if (this.dataToLoad.length) {
      var from = parseInt(this.curBodyBlock.dataset.from, 10) + 1,
          to = this.curBodyBlock.dataset.to;
      getEl('.cur', this.pagination).textContent = `${from} - ${to}`;
    } else {
      getEl('.cur', this.pagination).textContent = `0`;
    }
  }

  // Установка высоты кнопки ресайза (чтобы не выходила за пределы таблицы):
  this.changeResizeBtns = function() {
    if (!this.head) {
      return;
    }
    var tableRect = this.desktop.getBoundingClientRect(),
        headerRect = getEl('th', this.head).getBoundingClientRect(),
        newHeight =  tableRect.bottom - headerRect.bottom + 'px';
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
            total += getNumb(el[result.dataset.key]);
          }
        });
      }
      if (result.dataset.type === 'sum') {
        total = convertPrice(total, 2);
      }
      result.textContent = total;
    });
  }

  // Отображение таблицы:
  this.show = function() {
    if (this.wrap.classList.contains('active')) {
      showElement(this.wrap);
      this.changeResizeBtns();
    }
  }

  // Переход с одной таблицы на другую при клике на вкладку:
  this.open = function(event) {
    if (event.currentTarget.classList.contains('disabled')) {
      return;
    }
    document.querySelectorAll('.tabs .tab').forEach(el => el.classList.remove('checked'));
    event.currentTarget.classList.add('checked');

    var activeTable = getEl('.table.active');
    if (activeTable) {
      hideElement(activeTable);
      activeTable.classList.remove('active');
    }
    this.wrap.classList.add('active');
    this.show();
  }

  // Поиск по всей таблице:
  this.startFullSearch = (search, textToFind) => {
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
  this.startChangeData = event => {
    var curEl = event.target;
    if (curEl.closest('.disabled')) {
      return;
    }
    if (curEl.classList.contains('pill')) {
      curEl.classList.toggle('checked');
      this.changeData(curEl);
    } else if (curEl.classList.contains('item')) {
      this.changeData(curEl);
    } else if (curEl.classList.contains('group')) {
      this.changeData(getEl('input', curEl));
    }
  }

  // Cортировка, поиск и фильтрация по ключу:
  this.changeData = function(curEl) {
    var group = curEl.closest('[data-key]');
    if (group.classList.contains('sort')) {
      this.sortData(group, curEl);
    } else {
      this.filterData(group, curEl);
    }
    this.syncFilters(group, curEl);
    return isEmptyObj(this.filters) ? 0 : this.dataToLoad.length;
  }

  // Сортировка по ключу:
  this.sortData = function(group, curEl) {
    var type = group.dataset.type,
        key = group.dataset.key;
        key = curEl.dataset.value === 'down' ? key : '-' + key;
    this.head.querySelectorAll('.sort.checked').forEach(el => {
      if (!(el.closest('.group').dataset.key === group.dataset.key && el.dataset.value === curEl.dataset.value)) {
        el.classList.remove('checked');
      }
    });
    if (curEl.classList.contains('checked')) {
      this.data.sort(sortBy(key, type));
      this.dataToLoad.sort(sortBy(key, type));
    } else {
      this.data = JSON.parse(JSON.stringify(this.initialData));
      this.selectData();
    }
    this.fill();
  }

  // Поиск и фильтрация по ключу:
  this.filterData = function(group, curEl) {
    this.resetFullSearch();
    var type = curEl.closest('.item') ? 'filter' : 'search',
        key = group.dataset.key,
        value = curEl.dataset.value,
        action;
    if (type === 'search') {
      action = /\S/.test(value) ? 'save' : 'remove';
    } else if (type === 'filter') {
      action = curEl.classList.contains('checked') ? 'save' : 'remove';
    }
    var oldFilters = JSON.stringify(this.filters);
    this.changeFilter(action, type, key, value);
    if (oldFilters !== JSON.stringify(this.filters)) {
      this.selectData();
    }
    this.fill();
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

  // Синхронизация фильтров основного и адаптивного разрешения:
  this.syncFilters = function(group, curEl) {
    if (!this.isSync || !this.dropDowns || !this.filterPopUp) {
      return;
    }
    var type = curEl.classList.contains('item') ? (curEl.classList.contains('sort') ? 'sort' : 'filter') : 'search',
        key = group.dataset.key,
        value = curEl.dataset.value;
    if (this.mode === 'desktop') {
      this.filterPopUp.setValue(type, key, value);
      if (type !== 'sort') {
        var count = isEmptyObj(this.filters) ? 0 : this.dataToLoad.length;
        this.filterPopUp.toggleBtns(count);
      }
    } else if (this.head) {
      var curEl;
      if (type === 'search') {
        curEl = getEl(`[data-key="${key}"] form.search`);
      } else {
        curEl = getEl(`[data-key="${key}"] [data-value="${value}"]`, this.head);
      }
      if (curEl) {
        var index = parseFloat(curEl.closest('th').id, 10) - 1;
        this[`dropDown${index}`].setValue(type, key, value);
      }
    }
  }

  // Очистка поиска по всей таблице:
  this.resetFullSearch = function() {
    if (this.fullSearch) {
      this.fullSearch.clear();
    }
  }

  // Очистка сортировки, поиска и фильтров по ключу:
  this.resetFilters = function() {
    this.filters = {};
    this.addPillsInFilter();
    if (this.dropDowns) {
      this.dropDowns.forEach((el, index) => this[`dropDown${index}`].clear());
    }
    if (this.filterPopUp) {
      this.filterPopUp.clearFilter();
    }
  }

  // Полная очистка сортировки, поиска и фильтрации по ключу:
  this.clearFilters = function() {
    this.resetFilters();
    this.data = JSON.parse(JSON.stringify(this.initialData));
    this.dataToLoad = this.data;
    this.fill();
  }

  // Полная очистка всех фильтров и поисков таблицы:
  this.clear = function() {
    this.resetFullSearch();
    this.resetFilters();
    this.data = JSON.parse(JSON.stringify(this.initialData));
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

  this.init();
}
