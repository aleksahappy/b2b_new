'use strict';

// Запрос файлов:

// get
// action=order&order_id=123&file=filemode&type=filetype
// filemodes: bill,report,bar,nakl
// filetypes: pdf,xls
// addintion for nakl & bar:
// name=rencname
// id=rdocid

// отчет об оплатах - всегда xls
// штрихкоды - всегда xls

// Глобальные переменные:

var data, reclData, reclIcon;

// Запускаем рендеринг страницы заказа:

startOrderPage();

// Запуск страницы заказа:

function startOrderPage() {
  var id = document.location.search.replace('?', '');
  sendRequest(`../json/order1.json`)
  // sendRequest(urlRequest.main, {action: 'order', data: {order_id: id}})
  .then(result => {
    data = JSON.parse(result);
    sendRequest(`../json/order_payment.json`)
    // sendRequest(urlRequest.main, {action: '???', data: {order_id: id})
    .then(result => {
      data.payment = JSON.parse(result);
      initPage();
    })
    .catch(error => {
      console.log(error);
      initPage();
    });
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    location.href = '/err404.html';
  });
}

// Инициализация страницы:

function initPage() {
  if (data.id) {
    convertData();
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
  } else {
    location.href = '/err404.html';
  }
}

// Преобразование полученных данных:

function convertData() {
  if (data.orderitems) {
    getNaklsData();
    getItemsData();
    addReclmInfo();
    delete data.orderitems;
  }
  data.isShipment = (!data.nakls || !data.nakls.length) ? 'disabled' : '';
  data.isPayment = data.payment ? '' : 'disabled';
  data.isDownRow = data.comment || data.special ? '' : 'displayNone';
  data.isComment = data.comment ? '' : 'hidden';
  data.isOrderBnts = data.special ? '' : 'hidden';
  data.isReclms = (data.order_type.toLowerCase() == 'распродажа' || data.order_type.toLowerCase() == 'уценка') ? false : true;
  console.log(data);
}

// Получение данных о накладных из csv-формата:

function getNaklsData() {
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
  var tableKeys = {
    'nomen': ['artc', 'titl', 'pric', 'kolv', 'summ', 'skid'], //Номенклатура
    'vputi': ['artc', 'titl', 'dpst', 'kolv', 'paid', 'kdop'], //Ожидается
    'vnali': ['artc', 'titl', 'pric', 'kolv', 'summ', 'skid'],  //В наличии
    'sobrn': ['artc', 'titl', 'pric', 'kolv', 'summ', 'skid'], // Собран
    'otgrz': ['artc', 'titl', 'pric', 'kolv', 'summ', 'skid', 'cods', 'harid', 'naklid', 'nakl', 'dotg', 'recl_num'], // Отгружен
    'nedop': ['artc', 'titl', 'pric', 'kolv', 'summ', 'stat'], //Недопоставка
    'reclm': ['recl_num', 'recl_date', 'artc', 'titl', 'pric', 'kolv', 'comp_summ', 'trac'] //Рекламации
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
  var items = data.items;
  var nomenSettings = {
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
        keys: ['titl']
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
    sorts: {
      'artc': {title: 'По артикулу', type: 'text'},
      'titl': {title: 'По контрагенту', type: 'text'},
      'pric': {title: 'По цене', type: 'numb'},
      'kolv': {title: 'По количеству', type: 'numb'},
      'summ': {title: 'По сумме', type: 'numb'},
      'skid': {title: 'По скидке', type: 'numb'},
    },
    filters: {
      'artc': {title: 'По артикулу', search: 'usual'},
      'titl': {title: 'По контрагенту', search: 'usual'},
      'pric': {title: 'По цене', search: 'usual'},
      'kolv': {title: 'По количеству', search: 'usual'},
      'summ': {title: 'По сумме', search: 'usual'},
      'skid': {title: 'По скидке', search: 'usual'}
    }
  }
  initTable('#nomen', nomenSettings);

  var vputiSettings = {
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
        keys: ['titl']
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
    sorts: {
      'artc': {title: 'По артикулу', type: 'text'},
      'titl': {title: 'По наименованию', type: 'text'},
      'dpst': {title: 'По дате поступления', type: 'date'},
      'kolv': {title: 'По количеству', type: 'numb'},
      'paid': {title: 'По оплаченной сумме', type: 'numb'},
      'kdop': {title: 'По сумме к оплате', type: 'numb'}
    },
    filters: {
      'artc': {title: 'По артикулу', search: 'usual'},
      'titl': {title: 'По наименованию', search: 'usual'},
      'dpst': {title: 'По дате поступления', search: 'date'},
      'kolv': {title: 'По количеству', search: 'usual'},
      'paid': {title: 'По оплаченной сумме', search: 'usual'},
      'kdop': {title: 'По сумме к оплате', search: 'usual'}
    }
  }
  initTable('#vputi', vputiSettings);

  var vnaliSettings = {
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
        keys: ['titl']
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
    sorts: {
      'artc': {title: 'По артикулу', type: 'text'},
      'titl': {title: 'По контрагенту', type: 'text'},
      'pric': {title: 'По цене', type: 'numb'},
      'kolv': {title: 'По количеству', type: 'numb'},
      'summ': {title: 'По сумме', type: 'numb'},
      'skid': {title: 'По скидке', type: 'numb'},
    },
    filters: {
      'artc': {title: 'По артикулу', search: 'usual'},
      'titl': {title: 'По контрагенту', search: 'usual'},
      'pric': {title: 'По цене', search: 'usual'},
      'kolv': {title: 'По количеству', search: 'usual'},
      'summ': {title: 'По сумме', search: 'usual'},
      'skid': {title: 'По скидке', search: 'usual'}
    }
  }
  initTable('#vnali', vnaliSettings);

  var sobrnSettings = {
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
        keys: ['titl']
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
    sorts: {
      'artc': {title: 'По артикулу', type: 'text'},
      'titl': {title: 'По контрагенту', type: 'text'},
      'pric': {title: 'По цене', type: 'numb'},
      'kolv': {title: 'По количеству', type: 'numb'},
      'summ': {title: 'По сумме', type: 'numb'},
      'skid': {title: 'По скидке', type: 'numb'},
    },
    filters: {
      'artc': {title: 'По артикулу', search: 'usual'},
      'titl': {title: 'По контрагенту', search: 'usual'},
      'pric': {title: 'По цене', search: 'usual'},
      'kolv': {title: 'По количеству', search: 'usual'},
      'summ': {title: 'По сумме', search: 'usual'},
      'skid': {title: 'По скидке', search: 'usual'}
    }
  }
  initTable('#sobrn', sobrnSettings);

  var otgrzSettings = {
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
        keys: ['titl']
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
    sorts: {
      'artc': {title: 'По артикулу', type: 'text'},
      'titl': {title: 'По контрагенту', type: 'text'},
      'pric': {title: 'По цене', type: 'numb'},
      'kolv': {title: 'По количеству', type: 'numb'},
      'summ': {title: 'По сумме', type: 'numb'},
      'skid': {title: 'По скидке', type: 'numb'},
    },
    filters: {
      'artc': {title: 'По артикулу', search: 'usual'},
      'titl': {title: 'По контрагенту', search: 'usual'},
      'pric': {title: 'По цене', search: 'usual'},
      'kolv': {title: 'По количеству', search: 'usual'},
      'summ': {title: 'По сумме', search: 'usual'},
      'skid': {title: 'По скидке', search: 'usual'}
    }
  }
  initTable('#otgrz', otgrzSettings);

  var nedopSettings = {
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
        keys: ['titl']
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
    sorts: {
      'artc': {title: 'По артикулу', type: 'text'},
      'titl': {title: 'По контрагенту', type: 'text'},
      'pric': {title: 'По цене', type: 'numb'},
      'kolv': {title: 'По количеству', type: 'numb'},
      'summ': {title: 'По сумме', type: 'numb'},
      'stat': {title: 'По инициатору отмены', type: 'text'},
    },
    filters: {
      'artc': {title: 'По артикулу', search: 'usual'},
      'titl': {title: 'По контрагенту', search: 'usual'},
      'pric': {title: 'По цене', search: 'usual'},
      'kolv': {title: 'По количеству', search: 'usual'},
      'summ': {title: 'По сумме', search: 'usual'},
      'stat': {title: 'По инициатору отмены', search: 'usual', filter: 'checkbox'}
    }
  }
  initTable('#nedop', nedopSettings);

  var reclmSettings = {
    data: items.reclm,
    desktop: {
      head: true,
      result: true,
      cols: [{
        title: '№ Рекламации',
        keys: ['recl_num']
      }, {
        title: 'Дата',
        align: 'center',
        key: 'recl_date',
        sort: 'date',
        search: 'date'
      }, {
        title: 'Артикул',
        keys: ['artc']
      }, {
        title: 'Наименование',
        width: '20%',
        keys: ['titl']
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
        keys: ['comp_summ'],
        result: 'sum'
      }, {
        title: 'Статус',
        class: 'pills',
        align: 'center',
        keys: ['trac'],
        content: `<div class='#status# recl pill'>#trac#</div>`
      }]
    },
    sorts: {
      'recl_num': {title: 'По номеру рекламации', type: 'numb'},
      'recl_date': {title: 'По дате рекламации', type: 'date'},
      'artc': {title: 'По артикулу', type: 'text'},
      'titl': {title: 'По наименованию', type: 'text'},
      'pric': {title: 'По цене', type: 'numb'},
      'kolv': {title: 'По количеству', type: 'numb'},
      'comp_summ': {title: 'По сумме компенсации', type: 'numb'},
      'trac': {title: 'По статусу рекламации', type: 'text'}
    },
    filters: {
      'recl_num': {title: 'По номеру рекламации', search: 'usual'},
      'recl_date': {title: 'По дате рекламации', search: 'date'},
      'artc': {title: 'По артикулу', search: 'usual'},
      'titl': {title: 'По наименованию', search: 'usual'},
      'pric': {title: 'По цене', search: 'usual'},
      'kolv': {title: 'По количеству', search: 'usual'},
      'comp_summ': {title: 'По сумме компенсации', search: 'usual'},
      'trac': {title: 'По статусу рекламации', search: 'usual', filter: 'checkbox'}
    }
  }
  initTable('#reclm', reclmSettings);
}

// Отмена заказа:

function cancelOrder(id) {
  if (data.special) {
    sendRequest(urlRequest.main, {action: '???', data: {order_id: id}})
    .then(result => {
      console.log(result);
    })
    .catch(error => {
      console.log(error);
    });
  }
}

// Подтверждение заказа:

function confirmOrder(id) {
  if (data.special) {
    sendRequest(urlRequest.main, {action: '???', data: {id: id}})
    .then(result => {
      console.log(result);
    })
    .catch(error => {
      console.log(error);
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
        if (result.item && result.item.images) {
          reclData.images = result.item.images;
          addImgInfo(reclData);
        }
        showReclPopUp();
      }, reject => showReclPopUp())
    } else {
      showReclPopUp();
    }
  } else {
    alerts.show('Рекламации уже поданы на все товары.')
  }
}

// Заполение данными и отображение мастера создания рекламации:

function showReclPopUp() {
  console.log(reclData);
  fillTemplate({
    area: '#make-reclm',
    items: reclData
  })
  checkImg('#make-reclm');
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
  formData.set('action', '???');
  sendRequest(urlRequest.main, formData, 'multipart/form-data')
  .then(result => {
    result = JSON.parse(result);
    console.log(result);
    if (result.ok) {
      reclIcon.classList.add('red');
      reclData.reclm_kolv = (+reclData.reclm_kolv) + (+qty);
      closePopUp(null, '#make-reclm');
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
    alerts.show('Ошибка сервера. Попробуйте позже.');
    hideElement('#make-reclm .loader');
  })
}
