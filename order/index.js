'use strict';

// Статусы заказа:
// 1: "Ожидает подтверждения"
// 2: "Подтвержден"
// 3: "Не оплачен"
// 4: "Оплачен"
// 5: "Завершен"
// 10: "Отменен"

// Глобальные переменные:

var data, reclData, reclIcon;

// Запуск страницы заказа:

startOrderPage();

function startOrderPage() {
  var id = document.location.search.replace(/\D/g, '');
  if (!id) {
    location.href = '/err404.html';
  }
  // sendRequest(`../json/order.json`)
  sendRequest(urlRequest.main, 'order', {order_id: id})
  .then(result => {
    if (!result) {
      location.href = '/err404.html';
    }
    data = JSON.parse(result);
    // sendRequest(`../json/order_payment.json`)
    sendRequest(urlRequest.main, 'get_orderpayments', {order_id: id})
    .then(result => {
      try {
        data.payment = JSON.parse(result);
      } catch(error) {
        data.payment = {};
      }
      initPage();
    })
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
  toggleOrderBtns();
  fillTemplate({
    area: '#main',
    items: data
  });
  fillTemplate({
    area: '#shipment tbody',
    items: data.nakls
  });
  fillTemplate({
    area: '#payment',
    items: data.payment,
    sub: [{area: '.scroll.row .info', items: 'items'}]
  });
  createTables();
  loader.hide();
}

// Преобразование полученных данных:

function convertData() {
  getNaklsData();
  getItemsData();
  addReclmInfo();
  delete data.orderitems;
  data.isShipment = data.nakls.length ? '' : 'disabled';
  data.isPayment = isEmptyObj(data.payment) ? 'disabled' : '';
  data.isMoreRow = data.comment || data.source_id > 0 ? '' : 'displayNone';
  data.isComment = data.comment ? '' : 'hidden';
  data.isOrderBnts = data.source_id > 0 ? '' : 'hidden';
  data.isReclms = data.order_type ? ((data.order_type.toLowerCase() == 'распродажа' || data.order_type.toLowerCase() == 'уценка') ? false : true) : true;
  toggleOrderBtns();
  console.log(data);
}

// Блокировка/разблокировка кнопок отмены/подтверждения заказа:

function toggleOrderBtns() {
  var orderStatus = data.order_status.toLowerCase(),
      cancelBtn = getEl('#cancel'),
      confirmBtn = getEl('#confirm');
  if (data.source_id > 0 && orderStatus == 'ожидает подтверждения') {
    data.isCancel = true;
    data.isConfirm = true;
  } else if (data.source_id > 0 && (orderStatus == 'подтвержден' || orderStatus == 'не оплачен')) {
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
  if (!data.orderitems) {
    return;
  }
  if (!data.orderitems.arlistk || !data.orderitems.arlistv) {
    return;
  }
  var tableKeys = {
    'nomen': ['artc', 'titl', 'pric', 'kolv', 'summ', 'skid'], //Номенклатура
    'vputi': ['artc', 'titl', 'dpst', 'kolv', 'summ', 'paid', 'kdop'], //Ожидается
    'vnali': ['artc', 'titl', 'pric', 'kolv', 'summ', 'skid'],  //В наличии
    'sobrn': ['artc', 'titl', 'pric', 'kolv', 'summ', 'skid'], // Собран
    'otgrz': ['artc', 'titl', 'pric', 'kolv', 'summ', 'skid', 'cods', 'harid', 'naklid', 'nakl', 'dotg', 'recl_num'], // Отгружен
    'nedop': ['artc', 'titl', 'pric', 'kolv', 'summ', 'stat'], //Недопоставка
    'reclm': ['reclid', 'recl_num', 'recl_date', 'artc', 'titl', 'pric', 'kolv', 'summ', 'trac'] //Рекламации
    // 'debzd': ['artc, titl, kolv, pric, summ, dpst, paid, prcd, prcp, kdop, vdlg, recv, nakl, over, lnk, preview, titllnk'] // Дебиторская задолженность
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
  if (name == 'nomen' && obj['bkma'] != 'Рекламации' && obj['bkma'] != 'Собран') return 1;
  if (name == 'vputi' && obj['bkma'] == 'ВПути') return 1;
  if (name == 'vnali' && obj['bkma'] == 'ВНаличии') return 1;
  if (name == 'sobrn' && obj['bkma'] == 'Собран') return 1;
  if (name == 'otgrz' && obj['bkma'] == 'Отгрузки') return 1;
  if (name == 'nedop' && obj['bkma'] == 'Недопоставка') return 1;
  if (name == 'reclm' && obj['bkma'] == 'Рекламации') return 1;
  // if ((name == 'debzd' && obj['recv'] > ' ') || (name == 'debzd' && obj['vdlg'] > ' ' && obj['kdop'] > ' ')) return 1;
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
  var action = event.currentTarget.id;
  if ((action === 'cancel' && data.isCancel) || (action === 'confirm' && data.isConfirm)) {
    sendRequest(urlRequest.main, 'order', {order_id: data.id, mode: action})
    .then(result => {
      console.log(result);
      result = JSON.parse(result);
      if (result.ok) {
        data.order_status = result.status;
        getEl('#order-status').textContent = data.order_status;
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
    console.log(result);
    if (result.ok && result.data) {
      result = result.data;
      reclIcon.classList.add('red');
      reclData.reclm_kolv = (+reclData.reclm_kolv) + (+qty);
      updateReclmTable(result);
      closePopUp(null, '#make-reclm');
      alerts.show(`Создана рекламация <a href="/reclamation/?${result.recl_id}">№ ${result.number}</a>`);
    } else {
      if (result.error) {
        alerts.show(result.error);
      } else {
        alerts.show('Ошибка в отправляемых данных. Перепроверьте и попробуйте еще раз.');
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
