'use strict';

// Запускаем рендеринг страницы заказов:

startPage();

//=====================================================================================================
// Получение и отображение информации о заказах:
//=====================================================================================================

// Запуск страницы заказа:

function startPage() {
  sendRequest(`../json/desktopTableData.json`)
  //sendRequest(urlRequest.main, {action: 'desktopTable'})
  .then(result => {
    var data = JSON.parse(result);
    console.log(data);
    data = convertData(data);
    initTable('desktopTable', data);
    correctTable1Width();
  })
  .catch(err => {
    console.log(err);
    initTable('desktopTable');
  });
}

//=====================================================================================================
// Преобразование полученных данных:
//=====================================================================================================

function convertData(data) {
  if (!data) {
    return [];
  }
  data.forEach(el => {
    el.order_sum = convertPrice(el.order_sum);
    var sum;
    for (var i = 1; i <= 5; i++) {
      sum = el[`sum${i}`];
      if (sum && sum != 0) {
        el[`sum${i}`] = convertPrice(sum);
        el[`display${i}`] = '';
      } else {
        el[`display${i}`] = 'displayNone';
      }
    }
  });
  return data;
}


//  поправляет ширину таблицы, если а одном ряду с ней в блоке info-graphic есть еще блоке

function correctTable1Width() {
  var tableOrdersInWork = document.querySelector('#desktopTable');
  var infoGraphicBlock = document.querySelector('.info-graphic');
  var chart1 = document.querySelector('#chart1');

  if (window.innerWidth > 1299) {
    tableOrdersInWork.style.width = infoGraphicBlock.clientWidth - (chart1.clientWidth + 30) + 'px';
  }
}


//  Работа обновленных кнопок-тогглов на Рабочем Восстановление

function toggleOnOff(event) {
  if (event.currentTarget.closest('.new-toggle')) {
    var toggleBtn = event.currentTarget.closest('.new-toggle');
    toggleBtn.classList.toggle('on');
    toggleBtn.firstElementChild.classList.toggle('on');
  }
}


//  Работа кнопок филтрации сумм заказов по состояниям заказов

function tableDataSort() {
  var tableBtns = document.querySelector('table-btns');

}


//  Тестовая работа тоггла диаграммы "Заказы в работе"

function tableToggleWork() {
  var desktopTable = document.querySelector('#desktopTable');
  var tableToggle = document.querySelector('#tableToggle');
  let tbody = desktopTable.querySelector('tbody');


  tableToggle.addEventListener('click', () => {
    let trs = tbody.querySelectorAll('tr');

    for (let i = 0; i < trs.length; i++) {
      let tds = trs[i].querySelectorAll('td');

      for (let j = 0; j < tds.length; j++) {
        //console.log(tds[j].innerHTML);
        var tdsContent = tds[j].innerHTML;

        if (tds[j].innerHTML.slice(0,9) === 'Предзаказ') {
          console.log(tds[j].parentElement);
          tds[j].parentElement.classList.toggle('preorders');
        }
      }

      if (!trs[i].classList.contains('preorders')) {
        trs[i].classList.toggle('displayNone');
      }
    }
  });
}
tableToggleWork();
