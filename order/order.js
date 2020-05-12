'use strict';

//=====================================================================================================
// Преобразование исходных данных:
//=====================================================================================================

var orderId = document.location.search.replace('?order_id=', ''),
    ordtabs = ["nomen", "vputi", "vnali", "sobrn", "otgrz", "nedop", "reclm", "debzd"],
    TFF = {},
    TF = [];
var arnaklk,
    arnaklv,
    arlistk,
    arlistv;
TF["nomen"] = "artc,titl,kolv,pric,summ,sned,skid,lnk,preview,titllnk"; //Номенклатура
TF["vputi"] = "artc,titl,kolv,pric,summ,dpst,paid,prcd,treb,kdop,lnk,preview,titllnk"; //Ожидается
TF["vnali"] = "artc,titl,kolv,pric,summ,dpst,paid,prcd,treb,kdop,lnk,preview,titllnk";  //В наличии
TF["sobrn"] = "artc,titl,kolv,pric,summ,dpst,paid,prcd,treb,kdop,lnk,preview,titllnk"; // Собран
TF["otgrz"] = "artc,titl,kolv,pric,summ,dpst,paid,prcp,kdop,nakl,cods,naklid,dotg,harid,lnk,preview,titllnk"; // Отгружен
TF["nedop"] = "artc,titl,kolv,summ,stat,lnk,preview,titllnk"; //Недопоставка
TF["reclm"] = "artc,titl,kolv,pric,summ,trac,nakl,recl_id,recl_num,recl_date,lnk,preview,titllnk"; //Рекламации
TF["debzd"] = "artc,titl,kolv,pric,summ,dpst,paid,prcd,prcp,kdop,vdlg,recv,nakl,over,lnk,preview,titllnk"; //Долг

for (var i = 0; i < ordtabs.length; i++) {
  var tmp = TF[ordtabs[i]].split(",");
  window[ordtabs[i]] = [];
  for (var ii = 0; ii < tmp.length; ii++) {
    var a = {};
    window[ordtabs[i]].push(tmp[ii]);
  }
  TFF[ordtabs[i]] = window[ordtabs[i]];
}

function restorearray() {
  var k = arlistk;
  var v = arlistv;
  var d = "@$";
  var dd = "^@^";
  var out = [];
  for (var ti = 0; ti < ordtabs.length; ti++) {
    window[ordtabs[ti] + "Data"] = [];
    window["summ" + ordtabs[ti]] = 0;
    window["kolv" + ordtabs[ti]] = 0;
    window["paid" + ordtabs[ti]] = 0;
    window["kdop" + ordtabs[ti]] = 0;
  }
  var kk = k.split(d);
  var vv = v.split(dd);
  for (var i = 0; i < vv.length; i++) {
    var vvv = vv[i].split(d);
    var outin = [];
    for (var ti = 0; ti < ordtabs.length; ti++) {
      window[ordtabs[ti] + "outin"] = [];
    }
    for (var ii = 0; ii < vvv.length; ii++) {
      for (var ti = 0; ti < ordtabs.length; ti++) {
        if (TF[ordtabs[ti]].indexOf(kk[ii]) != -1) {
          window[ordtabs[ti] + "outin"][kk[ii]] = vvv[ii];
        }
      }
      outin[kk[ii]] = vvv[ii];
    }
    for (var ti = 0; ti < ordtabs.length; ti++) {
      if (checkinc(ordtabs[ti], outin)) {
        window[ordtabs[ti] + "Data"][i] = window[ordtabs[ti] + "outin"];

        window["summ" + ordtabs[ti]] = Math.max(0, fNb(window["summ" + ordtabs[ti]])) + Math.max(0, fNb(window[ordtabs[ti] + "outin"]['summ']));
        if (window[ordtabs[ti] + "outin"]['paid']) {
          window["paid" + ordtabs[ti]] = Math.max(0, fNb(window["paid" + ordtabs[ti]])) + Math.max(0, fNb(window[ordtabs[ti] + "outin"]['paid']));
        }
        if (window[ordtabs[ti] + "outin"]['kdop']) {
          window["kdop" + ordtabs[ti]] = Math.max(0, fNb(window["kdop" + ordtabs[ti]])) + Math.max(0, fNb(window[ordtabs[ti] + "outin"]['kdop']));
        }
        window["kolv" + ordtabs[ti]] = Math.max(0, window["kolv" + ordtabs[ti]]) + Math.max(0, window[ordtabs[ti] + "outin"]['kolv']);
      }
    }
    out[i] = outin;
  }
}

function checkinc(t, a) {
  if (t == "nomen" && a["bkma"] != "Рекламации" && a["bkma"] != "Собран") return 1;
  if (t == "otgrz" && a["bkma"] == "Отгрузки") return 1;
  if (t == "nedop" && a["bkma"] == "Недопоставка") return 1;
  if (t == "vputi" && a["bkma"] == "ВПути") return 1;
  if (t == "sobrn" && a["bkma"] == "Собран") return 1;
  if (t == "vnali" && a["bkma"] == "ВНаличии") return 1;
  if (t == "reclm" && a["bkma"] == "Рекламации") return 1;
  if ((t == "debzd" && a["recv"] > " ") || (t == "debzd" && a['vdlg'] > " " && a['kdop'] > " ")) return 1;
}

//number back from format
function fNb(num) {
  num = num.toString().replace(" ", '');
  num = num.toString().replace(" ", '');
  return parseFloat(num.toString().replace(" ", ''));
}

//=====================================================================================================
// Получение и отображение информации о заказе:
//=====================================================================================================

// Получение информации о заказе, ее преобразование и запуск инициализации таблицы:

sendRequest(`${urlRequest.new}api/order.php?order_id=` + orderId)
.then(result => {
  var data = JSON.parse(result);
  console.log(data);
  if (data.id) {
    if (!data.comment) {
      data.isHiddenComment = 'hidden';
    }
    fillTemplate({
      area: 'order-info',
      items: data,
    });
    var orderitems = data.orderitems;
    arlistk = orderitems.arlistk;
    arlistv = orderitems.arlistv;
    restorearray();
    initTables();
  } else {
    location.href = '/orders';
  }
})
.catch(err => {
  console.log(err);
  initTables();
});

//=====================================================================================================
// Работа с рекламациями:
//=====================================================================================================

// Открытие мастера создания рекламации:

function openReclmPopUp(el) {
  openPopUp('reclm-container');
}

// Подача рекламации:

function makeReclm() {

}
