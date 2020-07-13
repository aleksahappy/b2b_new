'use strict';
//  Функция для переопределения правильной ширины секции с toggle
//  Это важная функция!!!

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


///////////////////////////////СЕКЦИЯ "ЗАКАЗЫ В РАБОТЕ"/////////////////////////
// Запуск данных таблицы Рабочего стола:

var dashboardTable = document.querySelector('#dashboard-table');
var tbody = dashboardTable.querySelector('tbody');


function startDashboardTable() {
  sendRequest(`../json/dashboardTableData.json`)
  //sendRequest(urlRequest.main, {action: 'dashboardTable'})
  .then(result => {
    dataOrders = JSON.parse(result);
    loader.hide();
    dataOrders = convertData(dataOrders);
    initTable('dashboard-table', {data: dataOrders});
    startOrdersProgress(dataOrders);
    getOrdersInfo();
    tableDataSort();
  })
  .catch(err => {
    console.log(err);
    loader.hide();
    initTable('dashboard-table', {data: dataOrders});
  });
}

//  Круговая диаграмма "Заказы в работе"
//  canvas диаграммы
var ordersChart = document.getElementById('orders-chart').getContext('2d');
//  тогглы
var tableToggle = document.querySelector('#table-toggle');
var tableToggleMob = document.querySelector('#table-toggle-mob');

var orderStatuses = ['.vputi', '.vnali', '.sobrn', '.otgrz'];

var tableBtnsCont = document.querySelector('.table-btns');
var tableBtns = tableBtnsCont.querySelectorAll('.table-btn');

var tableBtnsMobCont = document.querySelector('#table-btns-mob');
var tableBtnsMob = tableBtnsMobCont.querySelectorAll('.table-btn');

tableToggle.addEventListener('click', togglePreorders); // dashboard-тоггл
tableToggleMob.addEventListener('click', togglePreorders);  //  mobile-тоггл

//  резервируем переменные для вывода кол-ва заказов по статусам после
//  запроса в диаграмму
var dataOrders;
var dataPreorders;

// "Ожидается"
var pendingOrders = 0;
var pendingOrdersSum = 0;
// "В наличии"
var stockOrders = 0;
var stockOrdersSum = 0;
// "Собран"
var readyOrders = 0;
var readyOrdersSum = 0;
// "Отгружен"
var doneOrders = 0;
var doneOrdersSum = 0;

var preordersSum = 0;

// кол-во заказов по статусам
var ordersQty = [];
//  суммы состояний заказов
var ordersSum = [];
//  общее кол-во заказов
var totalOrdersQty = 0;
//  общая сумма заказов
var totalOrdersSum = 0;

//  Натройка отображения и выравнивания текста внутри диаграммы
var chart1 = document.querySelector('#chart1');
var ordersInfo = document.querySelector('.orders-info');  //  контейнер с текстом внутри диаграммы
//  сам экземпляр класса диаграммы
var chart = new Chart(ordersChart, {
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
            data: ordersQty,
            //  Цвет бордеров шкал
            borderColor: [
              '#ffffff'
            ],
            //  расстояние между шкалами
            borderWidth: 2
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

//  Получить суммы всех закозов по категориям по переданному массиву данных

function getOrdersChartSums(arr) {
  pendingOrders = 0;
  stockOrders = 0;
  readyOrders = 0;
  doneOrders = 0;
  pendingOrdersSum = 0;
  stockOrdersSum = 0;
  readyOrdersSum = 0;
  doneOrdersSum = 0;

  for (let i = 0; i < arr.length; i++) {

    for (let key in arr[i]) {
      if (key === "sum1") {
        pendingOrders++;
        var num1 = arr[i][key].replace(/ /g,'');
        pendingOrdersSum += parseInt(num1);
      }
      if (key === "sum2") {
        stockOrders++;
        var num2 = arr[i][key].replace(/ /g,'');
        stockOrdersSum += parseInt(num2);
      }
      if (key === "sum3") {
        readyOrders++;
        var num3 = arr[i][key].replace(/ /g,'');
        readyOrdersSum += parseInt(num3);
      }
      if (key === "sum4") {
        doneOrders++;
        var num4 = arr[i][key].replace(/ /g,'');
        doneOrdersSum += parseInt(num4);
      }
    }
  }
}


//  Отбор только предзаказов

function preordersOnly(item) {
  if (item.order_event.slice(0,9) === 'Предзаказ') {
    return true;
  }
  return false;
}


//  По клику на тоггл диаграммы "Только предзаказы" показывает/скрывает данные

function togglePreorders() {
  dataPreorders = dataOrders.filter(preordersOnly);
  restartBtns(tableBtns);
  restartBtns(tableBtnsMob);

  if (tableToggle.classList.contains('checked')
  || tableToggleMob.classList.contains('checked')) {
    initTable('dashboard-table', {data: dataPreorders});
    startOrdersProgress(dataPreorders);
    getOrdersInfo();
  } else {
    initTable('dashboard-table', {data: dataOrders});
    startOrdersProgress(dataOrders);
    getOrdersInfo();
  }
}


//  Сбросить тоггл-кнопки статусов таблицы в начальное состояние

function restartBtns(btns) {
  var inx = 0;
  for (let i = 0; i < btns.length; i++) {
    inx++
    btns[i].classList.remove(orderStatuses[i].slice(1));
    btns[i].classList.add(`status${inx}`);
  }
}




function startOrdersProgress(arr) {

  getOrdersChartSums(arr);
  // кол-во заказов по статусам
  ordersQty = [pendingOrders, doneOrders, readyOrders, stockOrders];
  //  суммы состояний заказов
  ordersSum = [pendingOrdersSum, doneOrdersSum, readyOrdersSum, stockOrdersSum];
  //  общее кол-во заказов
  totalOrdersQty = arraySum(ordersQty);
  //  общая сумма заказов
  totalOrdersSum = arraySum(ordersSum);

  chart.data.datasets.forEach((dataset) => {
    dataset.data = [];
    dataset.data = ordersQty;
  });
  chart.update();
}


//  Получить текст с информацией о заказах внутри кольцевой диаграммы "Заказы в
//  работе"

function getOrdersInfo() {
  var totalOrders = 0;
  var trs = tbody.querySelectorAll('tr');

  for (let i = 0; i < trs.length; i++) {
    totalOrders++;
  }

  ordersInfo.textContent = `${totalOrders}
    ${declOfNum(totalOrders, ['активный', 'активных', 'активных'])}
    ${declOfNum(totalOrders, ['заказ', 'заказа', 'заказов'])} на общую сумму
    ${totalOrdersSum.toLocaleString('ru-RU')} руб.`;
}


//  Работа кнопок фильтрации сумм заказов по состояниям заказов в таблице Рабочего стола

function tableDataSort() {
  //  Очитстить строки, где везде "display:none"
  function hideEmptyTR(strStatus) {
    let rows = tbody.querySelectorAll('.row');
    let btnInx = 0;

    for (let i = 0; i < rows.length; i++) {
      let targetBtnsArr = Array.prototype.slice.call(rows[i].querySelectorAll('div'));
      let result = targetBtnsArr.every(function(div) {
        let targetSt = getComputedStyle(div);
        return targetSt.display === 'none';
      });

      if (result) {
        rows[i].closest('tr').classList.add('displayNone');
      } else {
        rows[i].closest('tr').classList.remove('displayNone');
      }
    }
  }

  // Вспомогательная функция для каждой определенной тоглл-кнопки таблицы
  function toggleCertainTableStickers(numStatus, strStatus, event) {
    let targetClass = event.target;
    let correctClassName = strStatus.slice(1);

    if (targetClass.classList.contains(`status${numStatus}`)) {
      targetClass.classList.remove(`status${numStatus}`);
      targetClass.classList.add(correctClassName);
    } else {
      targetClass.classList.add(`status${numStatus}`);
      targetClass.classList.remove(correctClassName);
    }
    let rows = tbody.querySelectorAll('.row');


    if (targetClass.classList.contains(correctClassName)) {
      for (let i = 0; i < rows.length; i++) {
        let targetBtns = tbody.querySelectorAll(strStatus);
        for (let j = 0; j < targetBtns.length; j++) {
          targetBtns[j].classList.add('toggleTableBtns');
        }
      }
    } else {
      for (let i = 0; i < rows.length; i++) {
        let targetBtns = tbody.querySelectorAll(strStatus);
        for (let j = 0; j < targetBtns.length; j++) {
          targetBtns[j].classList.remove('toggleTableBtns');
        }
      }
    }

    //  показать/скрыть стикеры с кликнутым статусом
    // for (let i = 0; i < rows.length; i++) {
    //   let targetBtns = tbody.querySelectorAll(strStatus);
    //   if (targetBtns) {
    //     console.log('add')
    //     for (let j = 0; j < targetBtns.length; j++) {
    //       targetBtns[j].classList.toggle('toggleTableBtns');
    //     }
    //   } else {
    //     console.log('remove')
    //   }
    //
    // }
    hideEmptyTR(strStatus);
  }

  function addEvent(btns) {
    var btnInx = 0;
    for (let i = 0; i < btns.length; i++) {
      btnInx++;
      btns[i].addEventListener('click',
        toggleCertainTableStickers.bind(null, btnInx.toString(), orderStatuses[i]));
    }
  }

  //  навешиваем события на кнопки таблицы
  addEvent(tableBtns);
  //  навешиваем события на кнопки таблицы для tablet
  addEvent(tableBtnsMob);
}



/////////////////////////ДИАГРАММА "РЕКЛАМАЦИИ В РАБОТЕ"////////////////////////

function speedChart() {
  var speedChartDiv = document.querySelector('.speed-chart');
  var gaugeEl = document.querySelector('.gauge'); //  сама диаграмма
  var reclResult = document.querySelector('.recl-result');  //  надпись с результатом под диаграммой
  var speedPointer = document.querySelector('.speed-point');  //  стрелка указатьель в диаграмме

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



////////////////////////////////ГРАФИК ПОСТАВОК/////////////////////////////////

function deliveryProgress() {
  //  тестовые данные
  // данные для первой линии
  var data1 = [0, 540000, 261000, 510000, 488000, 402987, 499900, 523000, 250000];
  // данные для второй линии
  var data2 = [0, 350004, 259000, 300300, 290000, 88000, 441560, 260000, 239400];
  // данные для третьей линии
  var data3 = [0, 0, 350494, 473200, 501000, 550000, 260100, 240000, 23000];
  var deliveryLabels = [
    "21 нед.",
    "22 нед.",
    "23 нед.",
    "24 нед.",
    "25 нед.",
    "26 нед.",
    "27 нед.",
    "28 нед."
  ];

  //  canvas диаграммы
  var deliveryСhart = document.getElementById('delivery-chart').getContext('2d');
    deliveryСhart.canvas.parentNode.style.width = '100%';
    deliveryСhart.canvas.parentNode.style.height = '258px';

  var chart = new Chart(deliveryСhart, {
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
      // отклюдчаем лишнее свободное пространство вокруг графика
      maintainAspectRatio: false,
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



/////////////////ДИАГРАММА "ЕЖЕГОДНАЯ ДИНАМИКА ТОВАРООБОРОТА"///////////////////
//  кнопка dashboard тоггла
var toggleBar1 = getEl('bar-chart-tgl-1');
var toggleBar2 = getEl('bar-chart-tgl-2');
//  canvas диаграмм
var barChart = document.getElementById('bar-chart').getContext('2d');
//  Данные и зарезервированные переменные для работы с ними
var barData = [];
var barDataStor = [];
var barDataToggle = [];
var barLabels = [];

function startBarChart() {

  // запрос
  sendRequest(`../json/procurementData.json`)
  //sendRequest(urlRequest.main, {action: 'dashboardTable'})
  .then(result => {
    barData = JSON.parse(result);
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
  // console.log(barDataStor);
  // console.log(barDataToggle);

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

  var barChartObj = new Chart(barChart, {
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



/////////////////ДИАГРАММА "ДОЛЯ ЗАКУПОК ПО ПРОИЗВЛДИТЕЛЯМ"/////////////////////

function startProcurementDonutChart() {
  //  входжящие спарсенные данные
  var inputData;
  //  исходящие данные для диаграммы
  var outputData = [];
  //  данные для options селекта
  var selectOptionsData = [];
  //  данные для лэйблов диаграммы
  var labelsValues = new Set();

  startDonutChart();

  function startDonutChart() {
    // запрос
    sendRequest(`../json/procurementData.json`)
    //sendRequest(urlRequest.main, {action: 'dashboardTable'})
    .then(result => {
      inputData = JSON.parse(result);
      getSelectOptions();
      getLabelsValues();
      getBrandsSumArr();
      runDonutChart();
      addTotalDataOption();
    })
    .catch(err => {
      console.log(err);
    });
  }


  //  Добавить options для выбора данных за все периоды

  function addTotalDataOption() {
    var select = document.querySelector('#donut-select');
    var item = document.createElement('div');
    var firstItem = select.firstChild;
    item.classList.add('item');
    item.textContent = 'За все время';
    select.insertBefore(item, firstItem);
  }


  //  Добавляем в селект options по годам из данных

  function getSelectOptions() {
    for (let i = 0; i < inputData.length; i++) {
      for (let year in inputData[i]) {
        var obj = new Object();
        obj.year = year;
        selectOptionsData.push(obj);
      }
    }
    var years = {
      area: 'donut-select',
      items: selectOptionsData
    };
    fillTemplate(years);
  }


  //  Получаем уникальную коллекцию (множество) брендов

  function getLabelsValues() {
    for (let i = 0; i < inputData.length; i++) {
      for (let year in inputData[i]) {
        for (let brand in inputData[i][year]) {
          if (brand !== 'preorder_sum') {
            labelsValues.add(brand);
          }
        }
      }
    }
  }


  // Получаем сумму одного бренда за все года

  function getTotalSumPerEachBrand(arrBrand) {
    var brandSum = [];

    for (let i = 0; i < inputData.length; i++) {
      for (let year in inputData[i]) {
        for (let brand in inputData[i][year]) {
          if (brand === arrBrand) {
            brandSum.push(parseInt(inputData[i][year][brand]));
          }
        }
      }
    }
    return arraySum(brandSum);
  }


  // Получаем массив сумм по брендам за все года

  function getBrandsSumArr() {
    var brandsArr = Array.from(labelsValues);

    for (let i = 0; i < brandsArr.length; i++) {
      var sum = getTotalSumPerEachBrand(brandsArr[i]);
      outputData.push(sum);
    }
  }


  //  Сумма бренда за определеный год

  function filterPerYear(year) {
    var brandsArr = Array.from(labelsValues);
    var selectedData = [];

    for (let i = 0; i < brandsArr.length; i++) {
      var sum = getSumPerEachYear(year, brandsArr[i]);
      selectedData.push(sum);
    }
    return selectedData;
  }


  // Получаем сумма по бренду за определденный год

  function getSumPerEachYear(curYear, curBrand) {
    var brandNum = 0;

    for (let i = 0; i < inputData.length; i++) {
        // обходим основной массив с входящими данными
      for (let year in inputData[i]) {
        // перебираем года
        if (year === curYear) {
          // перебираем ключи(бренды) в объекте каждого года
          for (let brand in inputData[i][year]) {
            // находим значение определенного ключа
            if (brand === curBrand) {
              brandNum = parseInt(inputData[i][year][brand]);
            }
          }
        }
      }
    }
    return brandNum;
  }

  //  создание самой диагараммы

  function runDonutChart() {
    var donutChartElem = getEl('procurement-chart');
    var labels = Array.from(labelsValues);
    var select = document.querySelector('#donut-select');
    var selectOptions = select.querySelectorAll('.item');

    //  Изменяет данные по клику на options

    function updateData() {
      select.addEventListener('click', (event) => {
        if (event.target.matches('.item')) {

          if (event.target.innerHTML === 'За все время') {
            outputData = [];
            getBrandsSumArr();
            chart4.data.datasets.forEach((dataset) => {
              dataset.data = [];
              dataset.data = outputData;
            });
            chart4.update();
          } else {
            var curData = filterPerYear(event.target.innerHTML);
            chart4.data.datasets.forEach((dataset) => {
              dataset.data = [];
              dataset.data = curData;
            });
            chart4.update();
          }
        }
      });
    }
    updateData();

    //  Принудительные размеры
    // donutChartElem.canvas.parentNode.style.width = '300px';
    // donutChartElem.canvas.parentNode.style.height = '300px';

    var chart4 = new Chart(donutChartElem, {
      // тип графика
      type: 'doughnut',
      // Отображение данных
        data: {
          //  Подписи частей
          labels: labels,
          //  Настройка отображения данных
          datasets: [{
            //  Название диаграммы
            label: '# of Votes',
            //  Массив с данными
            data: outputData,
            //  Цвет шкал
            backgroundColor: [
              '#F7AC93',
              '#96B6D3',
              '#9FCB93',
              '#B5A6BB',
              '#FBCD80',
              '#CCC8CA'

            ],
            //  Цвет бордеров шкал
            borderColor: [
              '#ffffff'
            ],
            borderWidth: 5
          }]
        },
        options: {
          //  Отображение/скрытие названия диаграммы
          legend: false,
          // адаптивность
          responsive: true,
          //  Отклюдчаем лишнее свободное пространство вокруг графика
          //  и загоняем график строго внутрь родительского контейнера
          maintainAspectRatio: false,
          rotation: 40
        }
    });
  }

};



//////////////////Инициализация графиков и таблици на странице//////////////////

startDashboardTable();
// tableDataSort();
startProcurementDonutChart();

window.onresize = startProcurementDonutChart;

if (window.innerWidth < 1299) {
  holdSectionWidth();
  window.onresize = holdSectionWidth;
}

// костыль перезагрузки страницы при ресайзе для адаптива
window.addEventListener("resize", pageReload);

function pageReload() {
  window.location.reload(true);
}