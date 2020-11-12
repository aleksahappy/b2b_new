'use strict';

// Добавление всплывающей html-подсказки:

getEl('#tooltip').dataset.tooltip = `<table style="width:100% !important;border-spacing: 2px;border-collapse: separate;font-size:12px;text-align:center;"><thead><tr><th>Сумма заказа в РРЦ</th><th>Размер  скидки</th></tr></thead><tbody><tr><td>до 35 000</td><td>30%</td></tr><tr><td>от 35 000 до 70 000</td><td>35%</td></tr><tr><td>от 70 000 до 100 000</td><td>45%</td></tr><tr><td>от 100 000</td><td>65%</td></tr></tbody></table>`;

// Инициализация поиска, выпадающих списков и форм:

initSearch('#search');
initDropDown('#select');
initDropDown('#checkbox');
initDropDown('#box-select');
initDropDown('#box-checkbox');
initDropDown('#box-date-search');
initDropDown('#search-select');
initDropDown('#search-checkbox');
initCalendar('#calendar1');
initCalendar('#calendar2');
initCalendar('#calendar3');
initForm('#form1');

// Добавление функционала в блок фильтров для демонстрации работы:

document.querySelectorAll('.filters').forEach(el => {
  el.querySelectorAll('.item').forEach (el => el.addEventListener('click', event => {
    event.stopPropagation();
    if (event.target.closest('.open.icon')) {
      return;
    }
    toggle(event);
  }));
})

//=====================================================================================================
// Работа с таблицами:
//=====================================================================================================

// Созание примера данных для таблицы:
var data = [];
for (var i = 0; i < 80; i++) {
  data.push({
    index: (i + 1) * 2 - 1,
    access: 'checked',
    inn: '9731002289',
    kpp: '/637584',
    contr: 'ООО, Пилот',
    system: 'Упрощенная',
    date: '29.10.2016',
    address: '119331, г. Москва, просп. Вернадского, д. 29, этаж 12, пом. I, ком. 4',
    user: 'Семенов И.О.',
    docs: [{
      title: 'Договор с ООО «ТОП СПОРТС» от 31.10.2016',
      status: 'full',
      date_start: '29.10.2016',
      date_end: '04.12.2019',
      contr: 'ООО «ТОП СПОРТС»',
      url: 'bla-bla',
      status_info: 'действует',
      info: 'Договор от 31.10.2016<br>Дата завершения 04.12.2019<br>Заключен с ООО «ТОП СПОРТС»'
    },{
      title: 'Договор с ООО «ТОП СПОРТС-1» от 31.10.2017',
      status: 'off',
      date_start: '31.10.2017',
      contr: 'ООО «ТОП СПОРТС-1»',
      url: 'bla-bla',
      status_info: 'не действует',
      info: 'Договор от 31.10.2017<br>Заключен с ООО «ТОП СПОРТС»'
    }]
  });
  data.push({
    index: (i + 1) * 2,
    access: '',
    inn: '97320002134',
    kpp: '/637554',
    contr: 'ООО, Магнолия',
    system: 'Основная',
    date: '01.10.2018',
    address: '443035, г. Самара, просп. Ленина, д. 3, офис 59',
    user: 'Петров Б.Е.',
    docs: [{
      title: 'Договор с ООО «ТОП СПОРТС» от 15.05.2018',
      status: 'off',
      date_start: '31.10.2016',
      date_end: '04.12.2019',
      contr: 'ООО «ТОП СПОРТС»',
      url: 'bla-bla',
      status_info: 'не действует',
      info: 'Договор от 15.05.2018<br>Заключен с ООО «ТОП СПОРТС»'
    }]
  });
}

// Настройки таблицы:
var settings = {
  data: data,
  control: {
    pagination: true,
    search: 'Поиск...',
    setting: true
  },
  desktop: {
    head: true,
    result: false,
    sub: [{area: '.docs', items: 'docs'}],
    cols: [{
      title: 'Порядковый номер',
      keys: ['index']
    },{
      title: 'Доступ',
      width: '6%',
      keys: ['access'],
      content: '<div class="toggle #access#" onclick="toggle(event)"><div class="toggle-in"></div></div>'
    }, {
      title: 'ИНН/КПП',
      keys: ['inn', 'kpp']
    }, {
      title: 'Контрагент',
      keys: ['contr']
    }, {
      title: 'Система налогообложения',
      width: '15%',
      keys: ['system']
    }, {
      title: 'Дата заведения',
      align: 'center',
      keys: ['date']
    }, {
      title: 'Юридический адрес',
      width: '20%',
      keys: ['address']
    }, {
      title: 'Пользователь',
      keys: ['user']
    }, {
      title: 'Документы',
      width: '20%',
      keys: ['docs/title'],
      content: `<div class="docs row #status#">
                  <div class="mark icon" data-tooltip="#status_info#"></div>
                  <a href="url" data-tooltip="#info#" help>#title#</a>
                </div>`
    }]
  },
  adaptive: {
    sub: [{area: '.docs', items: 'docs'}]
  },
  sorts: {
    'inn': {title: 'По ИНН', type: 'numb'},
    'contr': {title: 'По контрагенту', type: 'text'},
    'system': {title: 'По системе налогообложения', type: 'text'},
    'date': {title: 'По дате заведения', type: 'date'},
    'user': {title: 'По пользователю', type: 'text'}
  },
  filters: {
    'inn': {title: 'По ИНН', search: 'usual'},
    'contr': {title: 'По контрагенту', search: 'usual', filter: 'checkbox'},
    'system': {title: 'По системе налогообложения', search: 'usual', filter: 'checkbox'},
    'date': {title: 'По дате заведения', search: 'date'},
    'address': {title: 'По юридическому адресу', search: 'usual'},
    'user': {title: 'По пользователю', search: 'usual', filter: 'checkbox'},
    'docs/title': {title: 'По документу', search: 'usual', filter: 'checkbox'},
  }
}

// Инициализация таблицы:
initTable('#table', settings);

// Заполнение адаптивной версии таблицы:
fillTemplate({
  area: ".table-adaptive",
  items: data,
  sub: [{area: '.docs', items: 'docs'}]
});

loader.hide();
