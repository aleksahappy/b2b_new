'use strict';

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Константы:

var ordtabs = ['nomen', 'vputi', 'vnali', 'sobrn', 'otgrz', 'nedop', 'reclm'];

// Список ключей для их включения в таблицы:

var TF = [];
TF['nomen'] = ['artc', 'titl', 'skid', 'pric', 'kolv', 'summ']; //Номенклатура
TF['vputi'] = ['artc', 'titl', 'kolv', 'dpst', 'kdop', 'paid', 'summ']; //Ожидается
TF['vnali'] = ['artc', 'titl', 'kolv', 'dpst', 'kdop', 'paid', 'summ'];  //В наличии
TF['sobrn'] = ['artc', 'titl', 'kolv', 'dpst', 'kdop', 'paid', 'summ']; // Собран
TF['otgrz'] = ['artc', 'titl', 'kolv', 'dotg', 'nakl', 'summ', 'paid', 'kdop', 'preview', 'cods', 'harid', 'naklid']; // Отгружен
TF['nedop'] = ['artc', 'titl', 'kolv', 'summ', 'stat']; //Недопоставка
TF['reclm'] = ['recl_num', 'recl_date', 'artc', 'titl', 'kolv', 'trac']; //Рекламации
// TF['debzd'] = 'artc,titl,kolv,pric,summ,dpst,paid,prcd,prcp,kdop,vdlg,recv,nakl,over,lnk,preview,titllnk'; //Долг

// Динамическе переменные:

var items = {};

// Запускаем рендеринг страницы заказа:

startPage();

//=====================================================================================================
// Получение и отображение информации о заказе:
//=====================================================================================================

// Запуск страницы заказа:

function startPage() {
  sendRequest(urlRequest.main, {action: 'order', data: {order_id: document.location.search.replace('?', '')}})
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
      if (data.orderitems) {
        restoreArray(data.orderitems.arlistk, data.orderitems.arlistv);
      }
      initTables();
    } else {
      location.href = '/err404.html';
    }
  })
  .catch(err => {
    console.log(err);
    location.href = '/err404.html';
  });
}

//=====================================================================================================
// Преобразование получаемых данных:
//=====================================================================================================

// Преобразование данных из csv-формата:

function restoreArray(k, v) {
  var d = "@$",
      dd = "^@^",
      kk = k.split(d),
      vv = v.split(dd),
      result = [];
  for (var ti = 0; ti < ordtabs.length; ti++) {
    window[ordtabs[ti] + "Data"] = [];
  }
  for (var i = 0; i < vv.length; i++) {
    var vvv = vv[i].split(d),
        obj = {};
    for (var ti = 0; ti < ordtabs.length; ti++) {
      window[ordtabs[ti] + "outin"] = {};
    }
    for (var ii = 0; ii < vvv.length; ii++) {
      for (var ti = 0; ti < ordtabs.length; ti++) {
        if (TF[ordtabs[ti]].indexOf(kk[ii]) != -1) {
          window[ordtabs[ti] + "outin"][kk[ii]] = vvv[ii];
        }
      }
      obj[kk[ii]] = vvv[ii];
    }
    // console.log(fullObj);
    for (var ti = 0; ti < ordtabs.length; ti++) {
      if (checkInclusion(ordtabs[ti], obj)) {
        window[ordtabs[ti] + "Data"][i] = window[ordtabs[ti] + "outin"];
        var current = window[ordtabs[ti] + "Data"][i];
        if (ordtabs[ti] == "otgrz") {
          // добавляем в данные стиль для степпера:
          if (current.kolv > 1) {
            current.qtyStyle = 'added';
          } else {
            current.qtyStyle = 'disabled';
          }
          // добавляем в данные id товара:
          current.object_id = parseInt(current.preview.match(/\d+/));
        }
      }
    }
    result.push(obj);
  }
  // console.log(result);
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
  var data = otgrzData.find(el => el.object_id == id);
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
