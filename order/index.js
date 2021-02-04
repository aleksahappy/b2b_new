'use strict';

// Статусы заказа:
// 1: "Ожидает подтверждения"
// 2: "Подтвержден"
// 3: "Не оплачен"
// 4: "Оплачен"
// 5: "Завершен"
// 10: "Отменен"
// ??: "Ожидается оплата"

// Глобальные переменные:

var data, fromDisplay, reclData, reclIcon;

// Запуск страницы заказа:

function startPage() {
  var id = document.location.search.replace(/\D/g, '');
  if (!id) {
    location.href = '../404';
  }
  // sendRequest(`../json/order1.json`)
  sendRequest(urlRequest.main, 'order', {order_id: id})
  .then(result => {
    if (!result) {
      location.href = '../404';
    }
    data = JSON.parse(result);
    initPage();
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage() {
  convertData();
  fillTemplate({
    area: '#main',
    items: data
  });
  fillTemplate({
    area: '#shipments tbody',
    items: data.nakls
  });
  fillTemplate({
    area: '#payments',
    items: data.payments,
    sub: [{area: '.scroll.row .info', items: 'items'}]
  });
  createTables();
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  getNaklsData();
  getItemsData();
  getPaymentsData();
  addReclmInfo();
  delete data.orderitems;

  fromDisplay = data.source_id > 0 ? true : false;
  data.isShipments = data.nakls.length ? '' : 'disabled';
  data.isPayments = isEmptyObj(data.payments) ? 'disabled' : '';
  data.order_status = data.order_number ? data.order_status : 'В обработке';
  data.isMoreRow = data.comment || fromDisplay ? '' : 'displayNone';
  data.isComment = data.comment ? '' : 'hidden';
  data.isOrderBnts = fromDisplay ? '' : 'hidden';
  data.isReclms = data.order_type ? ((data.order_type.toLowerCase() == 'распродажа' || data.order_type.toLowerCase() == 'уценка') ? false : true) : true;
  toggleBillLink();
  toggleOrderBtns();
}

// Показ/скрытие ссылки на скачивание счета:

function toggleBillLink() {
  var orderStatus = data.order_status.toLowerCase(),
      billLink = getEl('a.docs');
  if (['в обработке', 'ожидает подтверждения', 'отменен'].indexOf(orderStatus) >= 0) {
    billLink.classList.add('displayNone');
  } else {
    billLink.classList.remove('displayNone');
  }
}

// Блокировка/разблокировка кнопок отмены/подтверждения заказа:

function toggleOrderBtns() {
  var orderStatus = data.order_status.toLowerCase(),
      cancelBtn = getEl('#cancel'),
      confirmBtn = getEl('#confirm');

  if (fromDisplay && data.items.sobrn.length) {
    data.isCancel = false;
    data.isConfirm = false;
  } else if (fromDisplay && orderStatus == 'ожидает подтверждения') {
    data.isCancel = true;
    data.isConfirm = true;
  // } else if (fromDisplay && ['подтвержден', 'не оплачен', 'ожидается оплата', 'оплачен'].indexOf(orderStatus) >= 0) {
  } else if (fromDisplay && ['не оплачен', 'ожидается оплата', 'оплачен'].indexOf(orderStatus) >= 0) {
    data.isCancel = true;
    data.isConfirm = false;
  } else {
    data.isCancel = false;
    data.isConfirm = false;
  }
  if (data.isCancel) {
    cancelBtn.classList.remove('disabled');
  } else {
    cancelBtn.classList.add('disabled');
  }
  if (data.isConfirm) {
    confirmBtn.classList.remove('disabled');
  } else {
    confirmBtn.classList.add('disabled');
  }
}

// Получение данных о накладных из csv-формата:

function getNaklsData() {
  if (!data.orderitems || !data.orderitems.arnaklk || !data.orderitems.arnaklv) {
    data.nakls = [];
    return;
  }
  var keys = data.orderitems.arnaklk.split('@$'),
      values = data.orderitems.arnaklv.split('^@^'),
      result = [];
  for (var i = 0; i < values.length; i++) {
    var value = values[i].split('@$'),
        list = [];
    for (var ii = 0; ii < value.length; ii++) {
      list[keys[ii]] = value[ii];
    }
    list.id = data.id;
    if (list.rtrac.indexOf('<a ') >= 0) {
      list.rtrac = list.rtrac.match(/\<a.+\<\/a>/gm)[0];
    }
    result[i] = list;
  }
  data.nakls = result;
}

// Получение данных о товарах из csv-формата:

function getItemsData() {
  if (!data.orderitems || !data.orderitems.arlistk || !data.orderitems.arlistv) {
    return;
  }

  var tableKeys = {
    nomen: ['artc', 'titl', 'pric', 'kolv', 'summ', 'skid', 'bkma', 'paid', 'dpst'], // Номенклатура
    vputi: ['artc', 'titl', 'dpst', 'pric', 'kolv', 'summ', 'paid', 'kdop'], // Ожидается
    vnali: ['artc', 'titl', 'pric', 'kolv', 'summ', 'paid', 'kdop'],  // В наличии
    sobrn: ['artc', 'titl', 'pric', 'kolv', 'summ', 'paid', 'kdop'], // Собран
    otgrz: ['artc', 'titl', 'pric', 'kolv', 'summ', 'paid', 'kdop', 'cods', 'harid', 'naklid', 'nakl', 'dotg', 'recl_num'], // Отгружен
    nedop: ['artc', 'titl', 'pric', 'kolv', 'summ', 'stat'], // Недопоставка
    reclm: ['reclid', 'recl_num', 'recl_date', 'artc', 'titl', 'pric', 'kolv', 'summ', 'trac'] // Рекламации
    // debzd: ['artc, titl, kolv, pric, summ, dpst, paid, prcd, prcp, kdop, vdlg, recv, nakl, over, lnk, preview, titllnk'] // Дебиторская задолженность
  };

  var keys = data.orderitems.arlistk.split('@$'),
      values = data.orderitems.arlistv.split('^@^'),
      fullInfo = [],
      result = {};
  for (var i = 0; i < values.length; i++) {
    var value = values[i].split('@$'),
        obj = {},
        list = {};
    for (var ii = 0; ii < value.length; ii++) {
      for (var name in tableKeys) {
        if (!list[name]) {
          list[name] = {};
        }
        if (tableKeys[name].indexOf(keys[ii]) != -1) {
          if (value[ii]) {
            value[ii] = value[ii].toString().trim();
          }
          if (keys[ii] === 'skid' && value[ii]) {
            list[name][keys[ii]] = value[ii] + '%'
          } else if (['pric', 'summ', 'paid', 'kdop'].indexOf(keys[ii]) >= 0) {
            list[name][keys[ii]] = value[ii].replace('.', ',');
          } else {
            list[name][keys[ii]] = value[ii];
          }
        }
      }
      obj[keys[ii]] = value[ii];
    }
    for (var name in tableKeys) {
      if (!result[name]) {
        result[name] = [];
      }
      if (checkInclusion(name, obj)) {
        if (name == 'reclm') {
          var status = list[name].trac.toLowerCase();
          if (status == 'зарегистрирована') {
            list[name].status = '1';
          } else if (status == 'обрабатывается') {
            list[name].status = '2';
          } else if (status == 'удовлетворена') {
            list[name].status = '3';
          } else if (status == 'ну удовлетворена') {
            list[name].status = '4';
          } else if (status == 'исполнена') {
            list[name].status = '5';
          }
        }
        result[name].push(list[name]);
      }
    }
    fullInfo.push(obj);
  }
  // console.log(fullInfo);
  data.items = result;
}

// Проверка включения в данные таблицы объекта данных:

function checkInclusion(name, obj) {
  if (name == 'nomen' && obj['bkma'] != 'Собран' && obj['bkma'] != 'Рекламации' ) return 1;
  if (name == 'vputi' && obj['bkma'] == 'ВПути') return 1;
  if (name == 'vnali' && obj['bkma'] == 'ВНаличии') return 1;
  if (name == 'sobrn' && obj['bkma'] == 'Собран') return 1;
  if (name == 'otgrz' && obj['bkma'] == 'Отгрузки') return 1;
  if (name == 'nedop' && obj['bkma'] == 'Недопоставка') return 1;
  if (name == 'reclm' && obj['bkma'] == 'Рекламации') return 1;
  // if ((name == 'debzd' && obj['recv'] > ' ') || (name == 'debzd' && obj['vdlg'] > ' ' && obj['kdop'] > ' ')) return 1;
}

// Получение данных о платежах:

// Логика расчета:
// - Стоимость товара (по всем товарам кроме недопоставки) идет:
//   * в общую колонку "итого"
//   * в колонку "итого" соответствующей даты (как распределяется по датам описано ниже).
// - Оплата или переплата (по всем товарам в том числе и по недопоставке) идет в дату реализации (считаем что оплатил тогда, когда сделал заказ).
// - Неоплата или недоплата (по всем товарам кроме тех что ожидаются) идет в текущую дату (считаем что ждем оплату на текущий момент).
// - Неоплата или недоплата (по товарам, что ожидаются) идет в дату ожидаемой поставки если она есть, иначе тоже в текущую дату (считаем что ждем оплату к моменту поставки).
// - В колонке "итого" получается:
//   * "график платежей" (общая сумма) складывается из стоимости всех товаров, кроме товаров недопоставки
//   * "поступление" складывается из всех поступлений в том числе и по товарам недопоставки
//   * "переплата" высчитывается исходя из общей суммы и общих поступлений

function getPaymentsData() {
  if (!data.items) {
    data.payments = {};
    return;
  }
  var info = data.items.nomen;
  if (!info || !info.length) {
    data.payments = {};
    return;
  }
  var payments = {};
  payments.summ = 0;
  payments.summ_paid = 0;
  payments.summ_to_pay = 0;
  payments.summ_over = 0;
  payments.items = [];

  var date, sumEl, sumPaidEl, diff, sumToPayEl, sumOverEl;
  info.forEach(el => {
    sumEl = el.bkma == 'Недопоставка' ? 0 : getNumb(el.summ);
    sumPaidEl = getNumb(el.paid);
    diff = sumEl - sumPaidEl;
    sumToPayEl = diff > 0 ? diff : 0;
    sumOverEl = diff < 0 ? sumPaidEl - sumEl : 0;

    if (diff <= 0) {
      date = data.order_date;
    } else if (el.bkma == 'ВПути' && el.dpst.trim() != '') {
      date = el.dpst;
    } else {
      date = getDateStr();
    }

    payments.summ += sumEl;
    payments.summ_paid += sumPaidEl;

    if ((el.bkma != 'Недопоставка') || (el.bkma == 'Недопоставка' && sumPaidEl > 0)) {
      if (!payments.items.find(el => el.date === date)) {
        payments.items.push({
          date: date,
          summ: 0,
          summ_paid: 0,
          summ_to_pay: 0,
          summ_over: 0
        });
      }
      date = payments.items.find(el => el.date === date);
      date.summ += sumEl;
      date.summ_paid += sumPaidEl;
      date.summ_to_pay += sumToPayEl;
      date.summ_over += sumOverEl;
    }
  });

  if (payments.summ == 0 && payments.summ_paid == 0) {
    data.payments = {};
    return;
  }

  payments.summ_to_pay = payments.summ > payments.summ_paid  ? payments.summ - payments.summ_paid : 0;
  payments.summ_over = payments.summ_paid > payments.summ ? payments.summ_paid - payments.summ : 0;
  convertSum(payments);

  function convertSum(obj) {
    Object.keys(obj).forEach(key => {
      if (key !== 'date') {
        if (key === 'items') {
          obj[key].forEach(el => convertSum(el));
        } else {
          obj[key] = obj[key] > 0 ? convertPrice(obj[key], 2) : '—';
        }
      }
    });
  }

  payments.items.sort(sortBy('-date', 'date'));
  data.payments = payments;
}

// Добавление в данные информации для мастера создания рекламаций:

function addReclmInfo() {
  if (!data.items) {
    return;
  }
  data.items.makeReclm = [];
  data.items.otgrz.forEach(item => {
    var newItem = Object.assign(item),
        reclm = data.items.reclm.find(el => el.artc == item.artc);
    item.isReclm = reclm ? 'red' : '';
    newItem.order_number = data.order_number;
    newItem.order_date = data.order_date;
    newItem.id = data.id;
    newItem.reclm_kolv = reclm ? reclm.kolv : '0';
    data.items.makeReclm.push(newItem);
  });
}

// Создание таблиц:

function createTables() {
  var items = data.items || [];
  var settings = {
    nomen: {
      data: items.nomen,
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
          title: 'Cтоимость',
          align: 'right',
          keys: ['summ'],
          result: 'sum'
        }, {
          title: 'Скидка',
          align: 'right',
          keys: ['skid']
        }]
      },
      filters: {
        'artc': {title: 'По артикулу', sort: 'text', search: 'usual'},
        'titl': {title: 'По наименованию', sort: 'text', search: 'usual'},
        'pric': {title: 'По цене', sort: 'numb', search: 'usual'},
        'kolv': {title: 'По количеству', sort: 'numb', search: 'usual'},
        'summ': {title: 'По стоимости', sort: 'numb', search: 'usual'},
        'skid': {title: 'По скидке', sort: 'numb', search: 'usual'}
      }
    },
    vputi: {
      data: items.vputi,
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
          title: 'Дата поступления',
          align: 'center',
          keys: ['dpst']
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
          title: 'Cтоимость',
          align: 'right',
          keys: ['summ'],
          result: 'sum'
        }, {
          title: 'Оплачено',
          align: 'right',
          keys: ['paid'],
          result: 'sum'
        }, {
          title: 'К оплате',
          align: 'right',
          keys: ['kdop'],
          result: 'sum'
        }]
      },
      filters: {
        'artc': {title: 'По артикулу', sort: 'text', search: 'usual'},
        'titl': {title: 'По наименованию', sort: 'text', search: 'usual'},
        'dpst': {title: 'По дате поступления', sort: 'date', search: 'date'},
        'pric': {title: 'По цене', sort: 'numb', search: 'usual'},
        'kolv': {title: 'По количеству', sort: 'numb', search: 'usual'},
        'summ': {title: 'По стоимости', sort: 'numb', search: 'usual'},
        'paid': {title: 'По оплаченной сумме', sort: 'numb', search: 'usual'},
        'kdop': {title: 'По сумме к оплате', sort: 'numb', search: 'usual'}
      }
    },
    vnali: {
      data: items.vnali,
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
          title: 'Cтоимость',
          align: 'right',
          keys: ['summ'],
          result: 'sum'
        }, {
          title: 'Оплачено',
          align: 'right',
          keys: ['paid'],
          result: 'sum'
        }, {
          title: 'К оплате',
          align: 'right',
          keys: ['kdop'],
          result: 'sum'
        }]
      },
      filters: {
        'artc': {title: 'По артикулу', sort: 'text', search: 'usual'},
        'titl': {title: 'По наименованию', sort: 'text', search: 'usual'},
        'pric': {title: 'По цене', sort: 'numb', search: 'usual'},
        'kolv': {title: 'По количеству', sort: 'numb', search: 'usual'},
        'summ': {title: 'По стоимости', sort: 'numb', search: 'usual'},
        'paid': {title: 'По оплаченной сумме', sort: 'numb', search: 'usual'},
        'kdop': {title: 'По сумме к оплате', sort: 'numb', search: 'usual'}
      }
    },
    sobrn: {
      data: items.sobrn,
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
          title: 'Cтоимость',
          align: 'right',
          keys: ['summ'],
          result: 'sum'
        }, {
          title: 'Оплачено',
          align: 'right',
          keys: ['paid'],
          result: 'sum'
        }, {
          title: 'К оплате',
          align: 'right',
          keys: ['kdop'],
          result: 'sum'
        }]
      },
      filters: {
        'artc': {title: 'По артикулу', sort: 'text', search: 'usual'},
        'titl': {title: 'По наименованию', sort: 'text', search: 'usual'},
        'pric': {title: 'По цене', sort: 'numb', search: 'usual'},
        'kolv': {title: 'По количеству', sort: 'numb', search: 'usual'},
        'summ': {title: 'По стоимости', sort: 'numb', search: 'usual'},
        'paid': {title: 'По оплаченной сумме', sort: 'numb', search: 'usual'},
        'kdop': {title: 'По сумме к оплате', sort: 'numb', search: 'usual'}
      }
    },
    otgrz: {
      data: items.otgrz,
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
          class: 'qty',
          keys: ['kolv'],
          result: 'kolv',
          content: data.isReclms ? `<div class='row'><div class='attention icon #isReclm#' data-tooltip='Подать рекламацию' data-artc="#artc#" onclick='openReclmPopUp(event)'></div><div>#kolv#</div></div>` : false
        }, {
          title: 'Cтоимость',
          align: 'right',
          keys: ['summ'],
          result: 'sum'
        }, {
          title: 'Оплачено',
          align: 'right',
          keys: ['paid'],
          result: 'sum'
        }, {
          title: 'К оплате',
          align: 'right',
          keys: ['kdop'],
          result: 'sum'
        }]
      },
      filters: {
        'artc': {title: 'По артикулу', sort: 'text', search: 'usual'},
        'titl': {title: 'По наименованию', sort: 'text', search: 'usual'},
        'pric': {title: 'По цене', sort: 'numb', search: 'usual'},
        'kolv': {title: 'По количеству', sort: 'numb', search: 'usual'},
        'paid': {title: 'По оплаченной сумме', sort: 'numb', search: 'usual'},
        'kdop': {title: 'По сумме к оплате', sort: 'numb', search: 'usual'}
      }
    },
    nedop: {
      data: items.nedop,
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
          title: 'Cтоимость',
          align: 'right',
          keys: ['summ'],
          result: 'sum'
        }, {
          title: 'Инициатор отмены',
          keys: ['stat']
        }]
      },
      filters: {
        'artc': {title: 'По артикулу', sort: 'text', search: 'usual'},
        'titl': {title: 'По наименованию', sort: 'text', search: 'usual'},
        'pric': {title: 'По цене', sort: 'numb', search: 'usual'},
        'kolv': {title: 'По количеству', sort: 'numb', search: 'usual'},
        'summ': {title: 'По стоимости', sort: 'numb', search: 'usual'},
        'stat': {title: 'По инициатору отмены', sort: 'text', search: 'usual', filter: 'checkbox'}
      }
    },
    reclm: {
      data: items.reclm,
      desktop: {
        head: true,
        result: true,
        cols: [{
          title: '№ Рекламации',
          keys: ['recl_num'],
          content: `<a href="../reclamation/?#reclid#">#recl_num#</a>`
        }, {
          title: 'Дата',
          align: 'center',
          keys: ['recl_date'],
          sort: 'date',
          search: 'date'
        }, {
          title: 'Артикул',
          keys: ['artc']
        }, {
          title: 'Наименование',
          width: '25%',
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
          title: 'Сумма компенсации',
          align: 'right',
          keys: ['summ'],
          result: 'sum'
        }, {
          title: 'Статус',
          class: 'pills',
          align: 'center',
          keys: ['trac'],
          content: `<div class='recl pill' data-status="#status#">#trac#</div>`
        }]
      },
      filters: {
        'recl_num': {title: 'По номеру рекламации', sort: 'text', search: 'usual'},
        'recl_date': {title: 'По дате рекламации', sort: 'date', search: 'date'},
        'artc': {title: 'По артикулу', sort: 'text', search: 'usual'},
        'titl': {title: 'По наименованию', sort: 'text', search: 'usual'},
        'pric': {title: 'По цене', sort: 'numb', search: 'usual'},
        'kolv': {title: 'По количеству', sort: 'numb', search: 'usual'},
        'summ': {title: 'По сумме компенсации', sort: 'numb', search: 'usual'},
        'trac': {title: 'По статусу рекламации', sort: 'text', search: 'usual', filter: 'checkbox'}
      }
    }
  };
  for (var key in settings) {
    initTable(`#${key}`, settings[key]);
  }
}

// Отмена/подтверждение заказа:

function changeOrderStatus(event) {
  if (fromDisplay) {
    return;
  }
  var action = event.currentTarget.id;
  if (event.currentTarget.classList.contains('disabled')) {
    if (action === 'cancel' && data.order_status.toLowerCase() !== 'завершен') {
      alerts.show('Для отмены заказа свяжитесь с вашим менеджером.');
    }
    return;
  }
  if ((action === 'cancel' && data.isCancel) || (action === 'confirm' && data.isConfirm)) {
    sendRequest(urlRequest.main, 'order', {order_id: data.id, mode: action})
    .then(result => {
      console.log(result);
      result = JSON.parse(result);
      if (result.ok) {
        data.order_status = result.status;
        getEl('#order-status').textContent = data.order_status;
        toggleBillLink();
        toggleOrderBtns();
      } else {
        throw new Error('Ошибка');
      }
    })
    .catch(error => {
      console.log(error);
      alerts.show('Произошла ошибка, попробуйте позже.');
    });
  }
}

// Открытие мастера создания рекламации:

function openReclmPopUp(event) {
  if (!data.isReclms) {
    return;
  }
  reclData = data.items.makeReclm.find(el => el.artc == event.currentTarget.dataset.artc);
  if (reclData.reclm_kolv < reclData.kolv) {
    loader.show();
    reclData.max_kolv = (+reclData.kolv) - (+reclData.reclm_kolv);
    reclIcon = event.currentTarget;
    if (!reclData.image) {
      getItem(reclData.artc)
      .then(result => {
        if (result.items && result.items[0].images) {
          reclData.images = result.items[0].images;
          addImgInfo(reclData);
        }
        showReclPopUp();
      }, reject => showReclPopUp())
    } else {
      showReclPopUp();
    }
  } else {
    alerts.show('Рекламации уже поданы на все товары.');
  }
}

// Заполение данными и отображение мастера создания рекламации:

function showReclPopUp() {
  fillTemplate({
    area: '#make-reclm',
    items: reclData
  })
  checkMedia('#make-reclm img');
  initForm('#reclm-form', sendReclm);
  openPopUp('#make-reclm');
  loader.hide();
}

// Подача рекламации:

function sendReclm(formData) {
  var qty;
  formData.forEach((value, key) => {
    if (key === 'amount') {
      qty = value;
    }
  });
  formData.append('order_id', data.id);
  sendRequest(urlRequest.main, 'reclsend', formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    if (result.ok) {
      reclIcon.classList.add('red');
      reclData.reclm_kolv = (+reclData.reclm_kolv) + (+qty);
      updateReclmTable(result);
      closePopUp(null, '#make-reclm');
      alerts.show(`Создана рекламация <a href="/reclamation/?${result.recl_id}">№ ${result.number}</a>`);
    } else {
      if (result.error) {
        alerts.show(result.error);
      } else {
        throw new Error('Ошибка');
      }
    }
    hideElement('#make-reclm .loader');
  })
  .catch(error => {
    console.log(error);
    alerts.show('Произошла ошибка, попробуйте позже.');
    hideElement('#make-reclm .loader');
  })
}

// Обновление данных о рекламациях:

function updateReclmTable(result) {
  var summ = parseFloat(reclData.pric.replace(',', '.').replace(/\s/g, '')) * reclData.reclm_kolv;
  data.items.reclm.push({
    artc: reclData.artc,
    kolv: reclData.reclm_kolv,
    pric: reclData.pric,
    recl_date: getDateStr(),
    recl_num: result.number,
    reclid: result.recl_id,
    status: "1",
    summ: convertPrice(summ, 2),
    titl: reclData.titl,
    trac: "Загеристрирована"
  });
  updateTable('#reclm', data.items.reclm);
}
