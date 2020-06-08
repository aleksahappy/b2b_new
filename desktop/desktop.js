'use strict';

var desktopTable = document.querySelector('#desktopTable');
var tbody = desktopTable.querySelector('tbody');


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
    data = convertData(data);
    initTable('desktopTable', data);
    correctTable1Width();
    tableToggleWork();
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
  var tableBtns = document.querySelector('.table-btns');
  var status1 = tableBtns.querySelector('#status1');
  var status2 = tableBtns.querySelector('#status2');
  var status3 = tableBtns.querySelector('#status3');
  var status4 = tableBtns.querySelector('#status4');

  status1.addEventListener('click', toggleCertainTableStickers.bind(null, '1','.vputi'));
  status2.addEventListener('click', toggleCertainTableStickers.bind(null, '2','.vnali'));
  status3.addEventListener('click', toggleCertainTableStickers.bind(null, '3','.sobrn'));
  status4.addEventListener('click', toggleCertainTableStickers.bind(null, '4','.otgrz'));

  // Вспомогательная функция для каждой определенной тоглл-кнопки таблицы

  function toggleCertainTableStickers(numStatus, strStatus, event) {

    let targetClass = event.target;
    if (targetClass.classList.contains(`status${numStatus}`)) {
      targetClass.classList.remove(`status${numStatus}`);
    } else {
      targetClass.classList.add(`status${numStatus}`);
    }


    let rows = tbody.querySelectorAll('.row');

    for (let i = 0; i < rows.length; i++) {
      let targetBtns = tbody.querySelectorAll(strStatus);
      for (let j = 0; j < targetBtns.length; j++) {
        targetBtns[j].classList.toggle('toggleTableBtns');
      }
    }
  }


}
tableDataSort();


//  По клику на тоггл диаграммы "Заказы в работе" показывает/скрывает данные помимо предзаказов

function tableToggleWork() {
  var tableToggle = document.querySelector('#tableToggle');

  tableToggle.addEventListener('click', () => {
    let trs = tbody.querySelectorAll('tr');

    for (let i = 0; i < trs.length; i++) {
      let tds = trs[i].querySelectorAll('td');

      for (let j = 0; j < tds.length; j++) {
        var tdsContent = tds[j].innerHTML;

        if (tds[j].innerHTML.slice(0,9) === 'Предзаказ') {
          tds[j].parentElement.classList.add('preorders');
        }
      }

      if (!trs[i].classList.contains('preorders')) {
        trs[i].classList.toggle('displayNone');
      }
    }
  });
}
