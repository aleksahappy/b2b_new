'use strict';
(function () {

  //  Работа кнопок филтрации сумм заказов по состояниям заказов

  function tableDataSort() {
    var tableBtns = document.querySelector('table-btns');

  }


  //  Тестовая работа тоггла диаграммы "Заказы в работе"

  function tableToggleWork() {
    var desktopTable = document.querySelector('#desktop-table2');
    var tableToggle = document.querySelector('#tableToggle');
    let tbody = desktopTable.querySelector('tbody');

    tableToggle.addEventListener('click', () => {
      let trs = tbody.querySelectorAll('tr');

      for (let i = 0; i < trs.length; i++) {
        let tds = trs[i].querySelectorAll('td');

        for (let j = 0; j < tds.length; j++) {
          if (tds[j].innerHTML.indexOf(0) === 'Предзаказ') {
            console.log('testttttttt');
          }
        }
      }

    });
  }
  tableToggleWork();
})();
