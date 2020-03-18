'use strict';

var orderId = document.location.search.replace('?order_id=', ''),
    ordtabs = ["nomen", "vnali", "vputi", "nedop", "otgrz", "debzd", "reclm"],
    TFF = {},
    TFD = {},
    TF = [];
var arnaklk, arnaklv, arlistk, arlistv;
TF["nomen"] = "artc,titl,kolv,pric,summ,sned,skid";
TF["vnali"] = "artc,titl,dpst,kolv,pric,summ,paid,prcd,treb,kdop";
TF["vputi"] = "artc,titl,dpst,kolv,pric,summ,paid,prcd,treb,kdop";
TF["nedop"] = "artc,titl,kolv,summ,stat";
TF["otgrz"] = "artc,titl,dpst,kolv,pric,summ,paid,prcp,kdop,nakl,cods,naklid,dotg,harid";
TF["debzd"] = "artc,titl,dpst,kolv,pric,summ,paid,prcd,prcp,kdop,vdlg,recv,nakl,over";
TF["reclm"] = "artc,titl,pric,summ,trac,kolv,nakl,recl_id,recl_num,recl_date";
for (var i = 0; i < ordtabs.length; i++) {
  var tmp = TF[ordtabs[i]].split(",");
  window[ordtabs[i]] = [];
  for (var ii = 0; ii < tmp.length; ii++) {
    var a = {};
    window[ordtabs[i]].push(tmp[ii]);
  }
  TFF[ordtabs[i]] = window[ordtabs[i]];
}

// sendRequest(`${urlRequest}/order.txt`)
sendRequest(`${urlRequest}/order.php?order_id=` + orderId)
.then(result => {
  var data = JSON.parse(result);
  if (data.id) {
    if (!data.comment) {
      data.isHiddenComment = 'hidden'
    }
    var orderInfo = {
      area: 'order-info',
      items: data,
    };
    console.log(data);
    fillTemplate(orderInfo);
    var orderitems = data.orderitems;
    arlistk = orderitems.arlistk;
    arlistv = orderitems.arlistv;
    restorearray();
    initTables();
  }
})
.catch(err => {
  console.log(err);
  initTables();
});

var restorearray = function() {
  var k = arlistk;
  var v = arlistv;
  var d = "@$";
  var dd = "^@^";
  var dx = ",";
  var out = [];
  for (var ti = 0; ti < ordtabs.length; ti++) {
    window[ordtabs[ti] + "out"] = [];
    window["summ" + ordtabs[ti]] = 0;
    window["kolv" + ordtabs[ti]] = 0;
    window["paid" + ordtabs[ti]] = 0;
    window["kdop" + ordtabs[ti]] = 0;
  }
  var tmp = "";
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
      // if(ordtabs[ti] != 'reclm') {
      if (checkinc(ordtabs[ti], outin)) {
        window[ordtabs[ti] + "out"][i] = window[ordtabs[ti] + "outin"];

        window["summ" + ordtabs[ti]] = Math.max(0, fNb(window["summ" + ordtabs[ti]])) + Math.max(0, fNb(window[ordtabs[ti] + "outin"]['summ']));
        if (window[ordtabs[ti] + "outin"]['paid']) {
          window["paid" + ordtabs[ti]] = Math.max(0, fNb(window["paid" + ordtabs[ti]])) + Math.max(0, fNb(window[ordtabs[ti] + "outin"]['paid']));
        }
        if (window[ordtabs[ti] + "outin"]['kdop']) {
          window["kdop" + ordtabs[ti]] = Math.max(0, fNb(window["kdop" + ordtabs[ti]])) + Math.max(0, fNb(window[ordtabs[ti] + "outin"]['kdop']));
        }
        window["kolv" + ordtabs[ti]] = Math.max(0, window["kolv" + ordtabs[ti]]) + Math.max(0, window[ordtabs[ti] + "outin"]['kolv']);
      }
      // } else {
      // 	window[ordtabs[ti] + "out"][i] = window[ordtabs[ti] + "outin"];
    }
    // }
    out[i] = outin;
  }
  if (window.nomenout) {
    window.nomenout.forEach(el => {
      el.skid = el.skid.replace(' ', '');
      if (el.skid) {
        el.skid = el.skid + '%';
      }
    });
  }
}

function checkinc(t, a) {
  if (t == "nomen" && a["bkma"] != "Рекламации" && a["bkma"] != "Собран") return 1;
  if (t == "otgrz" && a["bkma"] == "Отгрузки") return 1;
  if (t == "nedop" && a["bkma"] == "Недопоставка") return 1;
  if (t == "vputi" && a["bkma"] == "ВПути") return 1;
  if (t == "sobrn" && a["bkma"] == "Собран") return 1;
  if (t == "vnali" && a["bkma"] == "ВНаличии") return 1;
  if (t == "reclm" && a["bkma"] == "Рекламации") {
    // xshow("reclmbutton");
    // xshow("kol_reclm");
    return 1;
  }
  if ((t == "debzd" && a["recv"] > " ") || (t == "debzd" && a['vdlg'] > " " && a['kdop'] > " ")) return 1;
}

//number back from format
function fNb(num) {
  num = num.toString().replace(" ", '');
  num = num.toString().replace(" ", '');
  return parseFloat(num.toString().replace(" ", ''));
}
