'use strict';

var dashboardTable = document.querySelector('#dashboard-table');
var tbody = dashboardTable.querySelector('tbody');

//  кнопка dashboard тоггла
var toggleBar1 = getEl('bar-chart-tgl-1');
var toggleBar2 = getEl('bar-chart-tgl-2');
//  canvas диаграмм
const barChart = document.getElementById('bar-chart').getContext('2d');
//  Данные и зарезервированные переменные для работы с ними
var barData = []; //  procurementData
var barDataStor = [];
var barDataToggle = [];
var barLabels = [];
//  данные "ДОЛЯ ЗАКУПОК ПО ПРОИЗВОДИТЕЛЯМ" сохраненная в глобальную
//  область видимости для работы с ними из любого участка кода
var procurementData;
var procurementYears = [];
let totalPrcPerBrand = [];
var procuBrand1 = [];  //  509
var procuBrand2 = [];  //  BCA
var procuBrand3 = [];  //  Jethwear
var procuBrand4 = [];  //  Abom
var procuBrand5 = [];  //  Ogio
var procuBrand6 = [];  //  FXR

charts();
startDashboardTable();
tableDataSort();
startProcurementDonutChart();

//window.onresize = charts;

window.onresize = startProcurementDonutChart;

if (window.innerWidth < 1299) {
  holdSectionWidth();
  window.onresize = holdSectionWidth;
}


// костыль перезагрузки страницы для адаптива

window.addEventListener("resize", pageReload);

function pageReload() {
  window.location.reload(true);
}


//  Находит сумму элементов массива

function arraySum(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}


// Костыль для переопределения правильной ширины секции с toggle

function holdSectionWidth() {
  let toggleHeads = document.querySelectorAll('.switch');
  let toggleBodies = document.querySelectorAll('.switch-cont');

  for (let i = 0; i < toggleHeads.length; i++) {
    for (let j = 0; j < toggleBodies.length; j++) {
      if (toggleBodies[i]) {
        if (toggleBodies[i].offsetWidth > 0) {
          toggleHeads[j].style.width = toggleBodies[i].offsetWidth + 'px';
        }
      }
    }
  }
}


// Запуск данных таблицы Рабочего стола:

function startDashboardTable() {
  sendRequest(`../json/desktopTableData.json`)
  //sendRequest(urlRequest.main, {action: 'desktopTable'})
  .then(result => {
    var data = JSON.parse(result);
    data = convertData(data);
    initTable('dashboard-table', data);
  })
  .catch(err => {
    console.log(err);
    initTable('dashboard-table');
  });
}


//  Работа кнопок фильтрации сумм заказов по состояниям заказов в таблице Рабочего стола

function tableDataSort() {
  var orderStatuses = ['.vputi', '.vnali', '.sobrn', '.otgrz'];
  var tableBtnsCont = document.querySelector('.table-btns');
  var tableBtns = tableBtnsCont.querySelectorAll('.table-btn');
  var tableBtnsMobCont = document.querySelector('#table-btns-mob');
  var tableBtnsMob = tableBtnsMobCont.querySelectorAll('.table-btn');

  //  навешиваем события на кнопки таблицы
  var btnInx = 0;
  for (let i = 0; i < tableBtns.length; i++) {
    btnInx++;
    tableBtns[i].addEventListener('click',
      toggleCertainTableStickers.bind(null, btnInx.toString(), orderStatuses[i]));
  }

  //  навешиваем события на кнопки таблицы для tablet
  var btnInx = 0;
  for (let i = 0; i < tableBtnsMob.length; i++) {
    btnInx++;
    tableBtnsMob[i].addEventListener('click',
      toggleCertainTableStickers.bind(null, btnInx.toString(), orderStatuses[i]));
  }

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


// Обертка для графиков и диагарамм для их адаптивности
function charts() {
  //================================Диаграммы=================================//
  // Диаграмма "Заказы в работе"

  function ordersProgress() {
    //  резервируем переменные для вывода кол-ва заказов по статусам после запроса в диаграмму
    var ordersProgressData = 0;
    var pendingOrders = 0;
    var pendingOrdersSum = 0;
    var stockOrders = 0;
    var stockOrdersSum = 0;
    var readyOrders = 0;
    var readyOrdersSum = 0;
    var doneOrders = 0;
    var doneOrdersSum = 0;
    var preordersSum = 0;

    // запрос
    sendRequest(`../json/desktopTableData.json`)
    //sendRequest(urlRequest.main, {action: 'desktopTable'})
    .then(result => {
      var ordersProgressData = JSON.parse(result);
      ordersProgressData = convertData(ordersProgressData);

      for (let i = 0; i < ordersProgressData.length; i++) {

        for (let key in ordersProgressData[i]) {
          if (key === "sum1") {
            pendingOrders++;
            var num1 = ordersProgressData[i][key].replace(/ /g,'');
            pendingOrdersSum += parseInt(num1);
          }
          if (key === "sum2") {
            stockOrders++;
            var num2 = ordersProgressData[i][key].replace(/ /g,'');
            stockOrdersSum += parseInt(num2);
          }
          if (key === "sum3") {
            readyOrders++;
            var num3 = ordersProgressData[i][key].replace(/ /g,'');
            readyOrdersSum += parseInt(num3);
          }
          if (key === "sum4") {
            doneOrders++;
            var num4 = ordersProgressData[i][key].replace(/ /g,'');
            doneOrdersSum += parseInt(num4);
          }
        }

      }
      startOrdersProgress();
    })
    .catch(err => {
      console.log(err);
    });

    function startOrdersProgress() {
      var ordersQty = [pendingOrders, stockOrders, readyOrders, doneOrders]; // кол-во заказов по статусам
      var ordersSum = [pendingOrdersSum, stockOrdersSum, readyOrdersSum, doneOrdersSum];  //  суммы состояний заказов
      var totalOrdersQty = arraySum(ordersQty); //  общее кол-во заказов
      var totalOrdersSum = arraySum(ordersSum); //  общая сумма заказов


      //  Натройка отображения и выравнивания текста внутри диаграммы

      const chart1 = document.querySelector('#chart1');
      const ordersInfo = document.querySelector('.orders-info');  //  контейнер с текстом внутри диаграммы
      ordersInfo.textContent = `${totalOrdersQty}
        ${declOfNum(totalOrdersQty, ['активный', 'активных'])}
        ${declOfNum(totalOrdersQty, ['заказ', 'заказа', 'заказов'])} на общую сумму
        ${totalOrdersSum.toLocaleString('ru-RU')} руб.`;

      const ordersChart = document.getElementById('orders-chart').getContext('2d');  //  canvas диаграммы

      //  Корректировка отображения подписи внутри диаграммы на Mac и на остальных платформах

      if (navigator.appVersion.indexOf("Mac") != -1) {
        if (window.innerWidth > 1337) {
          ordersChart.canvas.parentNode.style.width = '100%';
          ordersChart.canvas.parentNode.style.height = '393px';
          ordersInfo.style.left = chart1.offsetWidth / 3 + 'px';
          ordersInfo.style.top = chart1.offsetHeight / 2.5 + 'px';
        } else if (window.innerWidth < 1337 && window.innerWidth > 499) {
          ordersChart.canvas.parentNode.style.width = '50%';
          ordersChart.canvas.parentNode.style.height = '349px';
          ordersInfo.style.left = chart1.offsetWidth / 2 + 'px';
          ordersInfo.style.top = chart1.offsetHeight / 2 + 'px';
        } else if (window.innerWidth < 499) {
          ordersChart.canvas.parentNode.style.width = '60%';
          ordersChart.canvas.parentNode.style.height = '256px';
        }
      } else {
        if (window.innerWidth > 1337) {
          ordersChart.canvas.parentNode.style.width = '100%';
          ordersChart.canvas.parentNode.style.height = '393px';
          ordersInfo.style.left = chart1.offsetWidth / 3.5 + 'px';
          ordersInfo.style.top = chart1.offsetHeight / 2.5 + 'px';
        } else if (window.innerWidth < 1337 && window.innerWidth > 499) {
          ordersChart.canvas.parentNode.style.width = '50%';
          ordersChart.canvas.parentNode.style.height = '349px';
          ordersInfo.style.left = chart1.offsetWidth / 2 + 'px';
          ordersInfo.style.top = chart1.offsetHeight / 2 + 'px';
        } else if (window.innerWidth < 499) {
          ordersChart.canvas.parentNode.style.width = '60%';
          ordersChart.canvas.parentNode.style.height = '256px';
        }
      }

      //  сам экземпляр класса диаграммы
      const chart = new Chart(ordersChart, {
          type: 'doughnut', // тип графика

          // Отображение данных
          data: {
              //  Название линии
              labels: [`Ожидается заказов`, `Товар отгружен: заказов`, `Собрано заказов`, `В наличии`],
              //  Настройка отображения данных
              datasets: [{
                  //
                  label: false,
                  //  цвета шкал графика
                  backgroundColor: ['#96B6D3', '#9FCB93', '#B5A6BB', '#FBCD80'],
                  //  цвет бордера шкал и графика
                  borderColor: 'transparent',
                  //  данные для отображения
                  data: ordersQty
              }]
          },

          // Настройки отображения графика
          options: {
            // ширина "кольца"
            cutoutPercentage: 70,
            // отключение легенды
            legend: {
              display: false
            },
            //  поворот угла стартового значения
            rotation: 5,
            //  отступы графика
            layout: {
              padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
              }
            },
            // адаптивность
            responsive: true,
            //  отклюдчаем лишнее свободное пространство вокруг графика
            maintainAspectRatio: false
          }
      });


      //  По клику на тоггл диаграммы "Заказы в работе" показывает/скрывает данные помимо предзаказов

      function tableToggleWork() {
        var tableToggle = document.querySelector('#table-toggle');
        var tableToggleMob = document.querySelector('#table-toggle-mob');
        var toggleCount = 0;

        tableToggle.addEventListener('click', sortTableOrders); // desktop-тоггл
        tableToggleMob.addEventListener('click', sortTableOrders);  //  mobile-тоггл

        function sortTableOrders() {
          //  обнуляем значение суммы всех предзаказов перед запускам пересчета
          preordersSum = 0;
          //  Показать только предзаказные позиции в таблице
          let trs = tbody.querySelectorAll('tr');

          for (let i = 0; i < trs.length; i++) {
            let tds = trs[i].querySelectorAll('td');

            for (let j = 0; j < tds.length; j++) {
              var tdsContent = tds[j].innerHTML;

              if (tds[j].innerHTML.slice(0,9) === 'Предзаказ') {
                tds[j].parentElement.classList.add('preorders');
                toggleCount++;
              }
            }
            if (!trs[i].classList.contains('preorders')) {
              trs[i].classList.toggle('displayNone');
            }
            if (trs[i].classList.contains('preorders')) {
              for (let j = 0; j < tds.length; j++) {
                let rows = tds[j].firstElementChild;
                if (rows) {
                  let divs = rows.children;
                  for (let n = 0; n < divs.length; n++) {
                    if (!divs[n].classList.contains('displayNone')) {
                      let preorderSum = divs[n].innerHTML.replace(/ /g,'');
                      preordersSum += parseInt(preorderSum);
                    }
                  }
                }
              }
            }
          }
          //  Показать только предзаказные позиции в диаграмме
          if (tableToggle.classList.contains('on') || tableToggleMob.classList.contains('on')) {
            ordersInfo.textContent = `
              ${toggleCount} ${declOfNum(toggleCount, ['активный', 'активных', 'активных'])}
              ${declOfNum(toggleCount, ['заказ', 'заказа', 'заказов'])} на общую сумму
              ${preordersSum.toLocaleString('ru-RU')} руб.`;

            toggleCount = 0;
          } else {
            ordersInfo.textContent = `
              ${totalOrdersQty} ${declOfNum(totalOrdersQty, ['активный', 'активных'])}
              ${declOfNum(totalOrdersQty, ['заказ', 'заказа', 'заказов'])} на общую сумму
              ${totalOrdersSum.toLocaleString('ru-RU')} руб.`;

            toggleCount = 0;
          }
        }
      }
      tableToggleWork();
    }
  };
  ordersProgress();


  //  Диаграмма "Рекламации в работе"

  // Запуск данных таблицы пользователей:

  // function startSpeedChart() {
  //   sendRequest(`../json/usersData.json`)
  //     //sendRequest(urlRequest.main, {action: 'desktopTable'})
  //     .then((result) => {
  //       var data = JSON.parse(result);
  //       data = convertData(data);
  //
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //
  //     });
  // }
  // startSpeedChart();

  function speedChart() {
    const speedChartDiv = document.querySelector('.speed-chart');
    const gaugeEl = document.querySelector('.gauge'); //  сама диаграмма
    const reclResult = document.querySelector('.recl-result');  //  надпись с результатом под диаграммой
    const speedPointer = document.querySelector('.speed-point');  //  стрелка указатьель в диаграмме

    //  Автовыравнивание стрелки диаграммы
    speedPointer.style.left = speedChartDiv.clientWidth / 2 + 'px';
    speedPointer.style.top = gaugeEl.clientHeight + 'px';

    //  данные для примера, так как источник оригинальных данных для этих значений неизвестен
    let totalRecls = "20";  //  количество поданных всего рекламаций пользователем
    let doneRecls = "15"; //  колличество обработанных рекламаций пользователя
    let reclsInWork = totalRecls - doneRecls; //  рекламации в работе
    let result = doneRecls / totalRecls;  //  коэффицент обработанных рекламаций
    let pointerStep = 0.005 * (result * 100).toFixed(0);
    let pointerDeg = -0.25 + pointerStep;


    //  функция для динамического запуска диаграммы с данными
    function setGaugeValue(gauge, value) {  //  gauge - диаграмма, value - данные (в формате от 0.01 (1%) до 1 (100%))
      if (value < 0 || value > 1) {
        return;
      }

      gauge.querySelector('.g-fill').style.transform = `rotate(${value / 2}turn)`;  //  работа спид-диагараммы согласно переданным данным данными
      speedPointer.style.transform = `rotate(-0.25turn)`; //  поворот стрекли согласно данным шкалы
      setTimeout(() => {
        speedPointer.style.transform = `rotate(${pointerDeg}turn)`; //  поворот стрекли согласно данным шкалы
      }, 500);

      //  отображение результата в надписи

      if (Number(totalRecls) > 0) {
        reclResult.innerHTML = `Мы обработали ${Math.round(value * 100)}% ваших обращений. В работе ${reclsInWork} ${declOfNum(reclsInWork,['обращение','обращения','обращений'])}`;
      } else if (Number(totalRecls) <= 0) {
        reclResult.innerHTML = 'Вы не подавали рекламаций';
      }
    }

    //  вызов функции с пользовательскими данными
    setGaugeValue(gaugeEl, result.toFixed(2));
  }
  speedChart();


  //  График поставок

  function deliveryProgress() {
    //  тестовые данные
    var data1 = [0, 540000, 261000, 510000, 488000, 402987, 499900, 523000, 250000]; // данные для синей линии
    var data2 = [0, 350004, 259000, 300300, 290000, 88000, 441560, 260000, 239400]; // данные для оранжевой линии
    var data3 = [0, 0, 350494, 473200, 501000, 550000, 260100, 240000, 23000]; // данные для зеленой линии
    var deliveryLabels = ["21 нед.",	"22 нед.",	"23 нед.",	"24 нед.",	"25 нед.",	"26 нед.",	"27 нед.", "28 нед."];

    const deliveryСhart = document.getElementById('delivery-chart').getContext('2d'); //  canvas диаграммы
      deliveryСhart.canvas.parentNode.style.width = '100%';
      deliveryСhart.canvas.parentNode.style.height = '258px';

    const chart = new Chart(deliveryСhart, {
      type: 'line',
      // Отображение данных
      data: {
        labels: deliveryLabels,
        //  Настройка отображения данных
        datasets: [{
            label: 'BCA', //  Название линии
            data: data1, // подключение данных
            fill: false,
            borderColor: '#34495E', // цвет линии
            backgroundColor: '#ffffff', // заливка поинта
            borderWidth: 3 // толщина линии
        }, {
            label: '509', //  Название линии
            data: data2, // подключение данных
            fill: false,
            borderColor: '#F69C00', // цвет линии
            backgroundColor: '#ffffff', // заливка поинта
            borderWidth: 3 // толщина линии
        }, {
            label: 'FXR', //  Название линии
            data: data3, // подключение данных
            fill: false,
            borderColor: '#3F9726', // цвет линии
            backgroundColor: '#ffffff', // заливка поинта
            borderWidth: 3 // толщина линии
        }]
      },
      options: {
        //  "выпрямление" линий
        elements: {
          line: {
            tension: 0,
          }
        },
        // отключение легенды
        legend: {
          display: false
        },
        responsive: true, // адаптивность
        maintainAspectRatio: false, // отклюдчаем лишнее свободное пространство вокруг графика
      }
    });

    function addData(chart, label, data) {
      chart.data.labels.push(label);
      chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
      });
      chart.update();
    }

  }
  deliveryProgress();


  //  График "Ежегодная динамика товарооборота"

function startBarChart() {

  // запрос
  sendRequest(`../json/procurementData.json`)
  //sendRequest(urlRequest.main, {action: 'desktopTable'})
  .then(result => {
    var bar = JSON.parse(result);
    barData = bar;
    getBarLabels();
    fillBarDataStor();
    fillBarDataStorToggle();
    runBarChart();
  })
  .catch(err => {
    console.log(err);
  });
}
startBarChart();


function getBarLabels() {
  for (let i = 0; i < barData.length; i++) {
    for (let key in barData[i]) {
      //  Лейблы шкал с годами
      barLabels.push(key);
    }
  }
}


//  Общая сумма в шкалах

function getFullSumByYear(year) {
  var iterSum = [];
  for (let i = 0; i < barData.length; i++) {
    for (let key in barData[i]) {

      if (key === year) {
        for (let k in barData[i][key]) {
          if (k !== 'preorder_sum') {
            var iter = parseInt(barData[i][key][k]);
            iterSum.push(iter);
          }
        }
      }
    }
  }
  return arraySum(iterSum);
}


function fillBarDataStor() {
  for (let i = 0; i < barLabels.length; i++) {
    barDataStor.push(getFullSumByYear(barLabels[i]));
  }
  return barDataStor;
}


function getOnlyPreorderSumByYear(year) {
  var iterPreorder = [];
  for (let i = 0; i < barData.length; i++) {
    for (let key in barData[i]) {
      if (key === year) {
        for (let k in barData[i][key]) {
          if (k === 'preorder_sum') {
            var iter = parseInt(barData[i][key][k]);
            iterPreorder.push(iter);
          }
        }
      }
    }
  }
  return arraySum(iterPreorder);
}


function fillBarDataStorToggle() {
  for (let i = 0; i < barLabels.length; i++) {
    barDataToggle.push(getOnlyPreorderSumByYear(barLabels[i]));
  }
  return barDataToggle;
}

  function runBarChart() {

    console.log(barDataStor);
    console.log(barDataToggle);

    function displayToggleDate() {
      toggleBar1.addEventListener('click', () => {
        if (toggleBar1.classList.contains('checked')) {
          barChartObj.data.datasets.forEach((dataset) => {
            dataset.data = [];
            dataset.data = barDataToggle;
          });
          barChartObj.update();
        } else {
          barChartObj.data.datasets.forEach((dataset) => {
            dataset.data = [];
            dataset.data = barDataStor;
          });
          barChartObj.update();
        }
      });
      toggleBar2.addEventListener('click', () => {
        if (toggleBar2.classList.contains('checked')) {
          barChartObj.data.datasets.forEach((dataset) => {
            dataset.data = [];
            dataset.data = barDataToggle;
          });
          barChartObj.update();
        } else {
          barChartObj.data.datasets.forEach((dataset) => {
            dataset.data = [];
            dataset.data = barDataStor;
          });
          barChartObj.update();
        }
      });
    }
    displayToggleDate();

    if (window.innerWidth > 1299) {
      barChart.canvas.parentNode.style.width = '100%';
      barChart.canvas.parentNode.style.height = '258px';
    } else if (window.innerWidth < 1299) {
      barChart.canvas.parentNode.style.width = '100%';
      barChart.canvas.parentNode.style.height = '226px';
    }

    const barChartObj = new Chart(barChart, {
      type: 'bar',  // тип графика
      // Отображение данных
      data: {
        labels: barLabels,
        //  Настройка отображения данных
        datasets: [{
          label: 'test',  //  название диаграммы
          barPercentage: 0.5,
          barThickness: 6,
          maxBarThickness: 8,
          minBarLength: 1,
          data: barDataStor,
          backgroundColor: ['#9FCB93', '#F7AC93', '#96B6D3', '#B5A6BB', '#FBCD80']
        }]
      },
      options: {
        legend: false,  // отображение/скрытие названия диаграммы
        scales: {
          xAxes: [{
            gridLines: {
              offsetGridLines: true,
              //  Убрать/показать сетку
              drawOnChartArea: true
            }
          }],
          yAxes: [{
            ticks: {
              //  Начало всегда с нуля
              beginAtZero: true
            },
            gridLines: {
              offsetGridLines: true,
              //  Убрать/показать сетку
              drawOnChartArea: false
            }
          }]
        },
        // адаптивность
        responsive: true,
        maintainAspectRatio: false, // отклюдчаем лишнее свободное пространство вокруг графика
      }
    });
  }
}





















//  Диаграмма "Доля закупок по производителям"

function startProcurementDonutChart() {
  // запрос
  sendRequest(`../json/procurementData.json`)
  //sendRequest(urlRequest.main, {action: 'desktopTable'})
  .then(result => {
    var procurements = JSON.parse(result);
    procurementData = procurements;
    createProcYears();
    getProcuBrandSum();
    procurementDonutChart();
  })
  .catch(err => {
    console.log(err);
  });

  //  Найти сумму заказов по бреду за все время
  //  (Запускается при загрузке страницы)
  function getProcuBrandSum() {
    console.log(procuBrand1.length);
    if (procuBrand1.length > 0 ) {
      console.log('Данные в глобальной области обновились')
    } else {
      for (let i = 0; i < procurementData.length; i++) {
        for (let key in procurementData[i]) {
          var obj = new Object();
          obj.year = key;
          procurementYears.push(obj);
          for (let k in procurementData[i][key]) {
            //  k - все ключи брендов
            //  procurementData[i][key][k] - все суммы брендов
            if (k === '509') {
              procuBrand1.push(parseInt(procurementData[i][key][k]));
            }
            if (k === 'BCA') {
              procuBrand2.push(parseInt(procurementData[i][key][k]));
            }
            if (k === 'Jethwear') {
              procuBrand3.push(parseInt(procurementData[i][key][k]));
            }
            if (k === 'Abom') {
              procuBrand4.push(parseInt(procurementData[i][key][k]));
            }
            if (k === 'Ogio') {
              procuBrand5.push(parseInt(procurementData[i][key][k]));
            }
            if (k === 'FXR') {
              procuBrand6.push(parseInt(procurementData[i][key][k]));
            }
          }
        }
      }
    }
  }

  function createProcYears() {
    var procurementSelect = getEl('procurement-select');
    var test = getEl('test');
    console.log(procurementYears);
    var yearsForProc = {
      area: "test",
      items: procurementYears,
      action: 'replace'
    }
    fillTemplate(yearsForProc);

    console.log(yearsForProc);
    console.log('done');
  }

  function procurementDonutChart() {
    // суммы заказов по брендам
    totalPrcPerBrand = [
      arraySum(procuBrand1), //  509
      arraySum(procuBrand2), //  BCA
      arraySum(procuBrand3), //  Jethwear
      arraySum(procuBrand4), //  Abom
      arraySum(procuBrand5), //  Ogio
      arraySum(procuBrand6)  //  FXR
    ];

    console.log('brands array from chart:');
    console.log(procuBrand1);
    console.log(procuBrand2);
    console.log(procuBrand3);
    console.log(procuBrand4);
    console.log(procuBrand5);
    console.log(procuBrand6);
    // console.log(totalPrcPerBrand);
    console.log('----------------------------');

    const procurementChart = document.getElementById('procurement-chart').getContext('2d');  //  canvas диаграммы
    procurementChart.canvas.parentNode.style.height = '280px';
    procurementChart.canvas.parentNode.style.width = '280px';

    const chart = new Chart(procurementChart, {
        type: 'doughnut', // тип графика

        // Отображение данных
        data: {
            //  Название линии
            labels: ['BCA', 'Jethwear', '509', 'FXR', 'Abom', 'Ogio'],
            //  Настройка отображения данных
            datasets: [{
                //
                label: false,
                //  цвета шкал графика
                backgroundColor: ['#96B6D3', '#CDC9CB', '#F8AD94', '#B5A6BB', '#9FCB93', '#FBCD80'],
                //  цвет бордера шкал и графика
                borderColor: '#ffffff',
                borderWidth: 1,
                //  данные для отображения
                data: [totalPrcPerBrand[1], totalPrcPerBrand[2], totalPrcPerBrand[0], totalPrcPerBrand[5], totalPrcPerBrand[3], totalPrcPerBrand[4]]
            }]
        },

        // Настройки отображения графика
        options: {
          // ширина "кольца"
          cutoutPercentage: 65,
          // отключение легенды
          legend: {
            display: false
          },
          //  поворот угла стартового значения
          rotation: 4,
          //  отступы графика
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 10,
              bottom: 10
            }
          },
          //  отклюдчаем лишнее свободное пространство вокруг графика
          maintainAspectRatio: false
        }
    });
  }
};


function sortProcurement(event) {
  // procuBrand1 = [];  //  509
  // procuBrand2 = [];  //  BCA
  // procuBrand3 = [];  //  Jethwear
  // procuBrand4 = [];  //  Abom
  // procuBrand5 = [];  //  Ogio
  // procuBrand6 = [];  //  FXR


  function selecProcYear(selectedKey) {
    for (let i = 0; i < procurementData.length; i++) {
      for (let key in procurementData[i]) {
        for (let k in procurementData[i][selectedKey]) {
          //  k - все ключи брендов
          //  procurementData[i][key][k] - все суммы брендов
          if (k === '509') {
            procuBrand1 = []; // удаляет предыдущее значение для обновления данных
            procuBrand1.push(parseInt(procurementData[i][selectedKey][k]));
          }
          if (k === 'BCA') {
            procuBrand2 = []; // удаляет предыдущее значение для обновления данных
            procuBrand2.push(parseInt(procurementData[i][selectedKey][k]));
          }
          if (k === 'Jethwear') {
            procuBrand3 = []; // удаляет предыдущее значение для обновления данных
            procuBrand3.push(parseInt(procurementData[i][selectedKey][k]));
          }
          if (k === 'Abom') {
            procuBrand4 = []; // удаляет предыдущее значение для обновления данных
            procuBrand4.push(parseInt(procurementData[i][selectedKey][k]));
          }
          if (k === 'Ogio') {
            procuBrand5 = []; // удаляет предыдущее значение для обновления данных
            procuBrand5.push(parseInt(procurementData[i][selectedKey][k]));
          }
          if (k === 'FXR') {
            procuBrand6 = []; // удаляет предыдущее значение для обновления данных
            procuBrand6.push(parseInt(procurementData[i][selectedKey][k]));
          }
        }
      }
    }
    // console.log(procuBrand1);
    // console.log(procuBrand2);
    // console.log(procuBrand3);
    // console.log(procuBrand4);
    // console.log(procuBrand5);
    // console.log(procuBrand6);
    // console.log('-----------------------------------');
  }

  //  Выбор данных за год в селекте
  var prop = parseInt(event.currentTarget.value);
  switch (prop) {
    case -1:
      console.log('ничего');
      break;
    case 0:
      console.log('ноль');
      break;
    case 1:
      console.log('выбрано за все время');
      startProcurementDonutChart();
      //  удаляем повторяющиеся значения в массивах брендов
      procuBrand1 = [];  //  509
      procuBrand2 = [];  //  BCA
      procuBrand3 = [];  //  Jethwear
      procuBrand4 = [];  //  Abom
      procuBrand5 = [];  //  Ogio
      procuBrand6 = [];  //  FXR
      break;
    case 2:
      console.log('выбран 2020');
      startProcurementDonutChart();
      selecProcYear('2020');
      testGlobalBrandsArr()
      break;
    case 3:
      console.log('выбран 2019');
      startProcurementDonutChart();
      selecProcYear('2019');
      testGlobalBrandsArr()
      break;
    case 4:
      console.log('выбран 2018');
      startProcurementDonutChart();
      selecProcYear('2018');
      testGlobalBrandsArr()
      break;
    case 5:
      console.log('выбран 2017');
      startProcurementDonutChart();
      selecProcYear('2017');
      testGlobalBrandsArr()
      break;
    case 6:
      console.log('выбран 2016');
      startProcurementDonutChart();
      selecProcYear('2016');
      testGlobalBrandsArr()
      break;
    default:
      console.log('Выберите год');
  }
}

function testGlobalBrandsArr() {
  setTimeout(() => {
    console.log('Brands arrays from global scope:')
    console.log(procuBrand1);
    console.log(procuBrand2);
    console.log(procuBrand3);
    console.log(procuBrand4);
    console.log(procuBrand5);
    console.log(procuBrand6);
    console.log('-----------------------------------');
  }, 3000)
}
testGlobalBrandsArr();
