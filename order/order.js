'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Константы:

var tableNames = ['nomen', 'vputi', 'vnali', 'sobrn', 'otgrz', 'nedop', 'reclm'],
    tableKeys = {}, // Список ключей для их включения в таблицы
    reclmData;
tableKeys['nomen'] = ['artc', 'titl', 'skid', 'pric', 'kolv', 'summ']; //Номенклатура
tableKeys['vputi'] = ['artc', 'titl', 'kolv', 'dpst', 'kdop', 'paid', 'summ']; //Ожидается
tableKeys['vnali'] = ['artc', 'titl', 'kolv', 'dpst', 'kdop', 'paid', 'summ'];  //В наличии
tableKeys['sobrn'] = ['artc', 'titl', 'kolv', 'dpst', 'kdop', 'paid', 'summ']; // Собран
tableKeys['otgrz'] = ['artc', 'titl', 'kolv', 'dotg', 'nakl', 'summ', 'paid', 'kdop', 'preview', 'cods', 'harid', 'naklid']; // Отгружен
tableKeys['nedop'] = ['artc', 'titl', 'kolv', 'summ', 'stat']; //Недопоставка
tableKeys['reclm'] = ['recl_num', 'recl_date', 'artc', 'titl', 'kolv', 'trac']; //Рекламации
// tableKeys['debzd'] = 'artc,titl,kolv,pric,summ,dpst,paid,prcd,prcp,kdop,vdlg,recv,nakl,over,lnk,preview,titllnk'; //Долг

// Динамическе переменные:

var items = {};

// Запускаем рендеринг страницы заказа:

startPage();

//=====================================================================================================
// Получение и отображение информации о заказе:
//=====================================================================================================

// Запуск страницы заказа:

function startPage() {
  sendRequest(`/data_ord.json`)
  // sendRequest(urlRequest.main, {action: 'order', data: {order_id: document.location.search.replace('?', '')}})
  .then(result => {
    var data = JSON.parse(result);
    console.log(data);
    if (data.id) {
      if (!data.comment) {
        data.isHiddenComment = 'hidden';
      }
      fillTemplate({
        area: 'order-info',
        items: data
      });
      fillTemplate({
        area: getEl('.pop-up-body', 'reclm-container'),
        items: data
      })
      var result = {};
      if (data.orderitems) {
        result = restoreArray(data.orderitems.arlistk, data.orderitems.arlistv);
      }
      tableNames.forEach(el => initTable(el, result[el]));
    } else {
      // location.href = '/err404.html';
    }
  })
  .catch(err => {
    console.log(err);
    // location.href = '/err404.html';
  });
}

//=====================================================================================================
// Преобразование полученных данных:
//=====================================================================================================

// Преобразование данных из csv-формата:

function restoreArray(k, v) {
  var d = "@$",
      dd = "^@^",
      kk = k.split(d),
      vv = v.split(dd),
      fullInfo = [],
      result = {}
  tableNames.forEach(el => result[el] = []);
  for (var i = 0; i < vv.length; i++) {
    var vvv = vv[i].split(d),
        obj = {},
        list = {};
    tableNames.forEach(el => {
      list[el] = {};
    });
    for (var ii = 0; ii < vvv.length; ii++) {
      tableNames.forEach(el => {
        if (tableKeys[el].indexOf(kk[ii]) != -1) {
          if (vvv[ii]) {
            vvv[ii] = vvv[ii].toString().trim();
            if (kk[ii] === 'skid' && vvv[ii]) {
              vvv[ii] = vvv[ii] + '%';
            }
          }
          list[el][kk[ii]] = vvv[ii];
        }
      });
      obj[kk[ii]] = vvv[ii];
    }
    tableNames.forEach(el => {
      if (checkInclusion(el, obj)) {
        var currentObj = list[el];
        if (el == 'otgrz') {
          // добавляем в данные стиль для степпера:
          if (currentObj.kolv > 1) {
            currentObj.qtyStyle = 'added';
          } else {
            currentObj.qtyStyle = 'disabled';
          }
          // добавляем в данные id товара:
          currentObj.object_id = parseInt(currentObj.preview.match(/\d+/));
        }
        result[el].push(list[el]);
      }
    });
    fullInfo.push(obj);
  }
  // console.log(fullInfo);
  reclmData = result.otgrz;
  return result;
}

// Проверка включения в данные таблицы объекта данных:

function checkInclusion(name, obj) {
  if (name == "nomen" && obj["bkma"] != "Рекламации" && obj["bkma"] != "Собран") return 1;
  if (name == "otgrz" && obj["bkma"] == "Отгрузки") return 1;
  if (name == "nedop" && obj["bkma"] == "Недопоставка") return 1;
  if (name == "vputi" && obj["bkma"] == "ВПути") return 1;
  if (name == "sobrn" && obj["bkma"] == "Собран") return 1;
  if (name == "vnali" && obj["bkma"] == "ВНаличии") return 1;
  if (name == "reclm" && obj["bkma"] == "Рекламации") return 1;
  if ((name == "debzd" && a["recv"] > " ") || (name == "debzd" && obj['vdlg'] > " " && obj['kdop'] > " ")) return 1;
}

//=====================================================================================================
// Работа с рекламациями:
//=====================================================================================================

// Открытие мастера создания рекламации:

function openReclmPopUp(id) {
  loader.show();
  var data = reclmData.find(el => el.object_id == id);
  showReclPopUp(data);
  // if (!data.image) {
  //   getItems(data.object_id)
  //   .then(result => {
  //     if (result.items && result.items.length) {
  //       items[data.object_id] = result.items[0];
  //       var images = result.items[0].images.toString().split(';');
  //       data.image = `https://b2b.topsports.ru/c/productpage/${images[0]}.jpg`;
  //     }
  //     showReclPopUp(data);
  //   }, reject => showReclPopUp(data))
  // } else {
  //   showReclPopUp(data);
  // }
}

// Заполение данными и отображение мастера создания рекламации:

function showReclPopUp(data) {
  console.log(data);
  fillTemplate({
    area: 'reclm-container',
    items: data
  })
  checkImg('reclm-container');
  openPopUp('reclm-container');
  loader.hide();
}

// Подача рекламации:

function makeReclm(event) {
  event.preventDefault();
  var formData = new FormData(event.currentTarget.closest('form')),
      data = {},
      err = false;
  formData.forEach((value, key) => {
    data[key] = value;
  });
  if (data['recl[group_type]'] === undefined) {
    showElement('[data-err="group_type"]');
    err = true;
  } else {
    hideElement('[data-err="group_type"]');
  }
  if (!data['recl[comment]']) {
    showElement('[data-err="comment"]');
    err = true;
  } else {
    hideElement('[data-err="comment"]');
  }
  if (!err) {
    showElement('reclm-loader', 'flex');
    console.log('отправляем форму для создания рекламации');
    // sendRequest(`${urlRequest}???`, formData, 'multipart/form-data')
    // .then(result => {
    //   console.log(result);
    //   hideElement('reclm-loader');
    // })
    // .catch(error => {
    //   console.log(error);
    //   hideElement('reclm-loader');
    // })
  }
}
