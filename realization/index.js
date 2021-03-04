'use strict';

// Глобальные переменные:

var id = document.location.search.replace(/\D/g, ''),
    data;

// Запуск страницы заказа:

if (!id) {
  location.href = '../404';
}
getPageData('../json/realization.json')
// getPageData(urlRequest.main, '???', {???_id: id})
.then(result => {
  if (!result) {
    location.href = '../404';
  }
  data = result;
  initPage();
  loader.hide();
});

// Инициализация страницы:

function initPage() {
  convertData();
  loadData('#main-info', data);
  var settings = {
    data: data.items,
    desktop: {
      head: true,
      result: true,
      cols: [{
        title: 'Артикул',
        keys: ['artc']
      }, {
        title: 'Наименование',
        width: '30%',
        class: 'link',
        keys: ['titl'],
        content: `<div data-artc="#artc#" onclick="showInfoCard(this.dataset.artc)">#titl#</div>`
      }, {
        title: 'Цена',
        align: 'right',
        keys: ['pric']
      }, {
        title: 'Количество',
        align: 'right',
        keys: ['kolv'],
        result: 'kolv'
      }, {
        title: 'Сумма',
        align: 'right',
        keys: ['summ'],
        result: 'sum'
      }, {
        title: 'Оплачено',
        align: 'right',
        keys: ['paid'],
        result: 'sum'
      }, {
        title: 'Скидка',
        align: 'right',
        keys: ['skid']
      }, {
        title: 'Накладная',
        keys: ['nakl']
      }]
    },
    filters: {
      'artc': {title: 'По артикулу', sort: 'text', search: 'usual'},
      'titl': {title: 'По наименованию', sort: 'text', search: 'usual'},
      'pric': {title: 'По цене', sort: 'numb', search: 'usual'},
      'kolv': {title: 'По количеству', sort: 'numb', search: 'usual'},
      'summ': {title: 'По сумме', sort: 'numb', search: 'usual'},
      'paid': {title: 'По оплаченной сумме', sort: 'numb', search: 'usual'},
      'skid': {title: 'По скидке', sort: 'numb', search: 'usual'},
      'nakl': {title: 'По номеру накладной', sort: 'text', search: 'usual'}
    }
  };
  initTable(`#realization`, settings);
  // initSearch('#realization-search', adaptiveSearch);
}

// Преобразование полученных данных:

function convertData() {
  data.realiz_sum = convertPrice(data.realiz_sum, 2);
  data.isComment = data.comment ? '' : 'hidden';
}

// Поиск в списке товаров на адаптиве:

function adaptiveSearch(search, textToFind) {
  var items = data.items.nomen,
      pills = document.querySelectorAll('.table-adaptive .pill');
  if (textToFind) {
    pills.forEach(el => el.classList.add('disabled'));
    items = items.filter(el => findByRegExp(el.search, getRegExp(textToFind)));
  } else {
    pills.forEach(el => el.classList.remove('disabled'));
  }
  loadSearchData('#nomen-list', items);
}

