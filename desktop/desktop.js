'use strict';

// var data;
var desktopTable = document.querySelector('#desktopTable');
var tbody = desktopTable.querySelector('tbody');


// Запуск данных таблицы Рабочего стола:

function startDesktopTable() {
  sendRequest(`../json/desktopTableData.json`)
  //sendRequest(urlRequest.main, {action: 'desktopTable'})
  .then(result => {
    var data = JSON.parse(result);
    data = convertData(data);
    initTable('desktopTable', data);
  })
  .catch(err => {
    console.log(err);
    initTable('desktopTable');
  });
}
startDesktopTable();


// Преобразование полученных данных:

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
    tableBtns[i].addEventListener('click', toggleCertainTableStickers.bind(null, btnInx.toString(), orderStatuses[i]));
  }

  //  навешиваем события на кнопки таблицы для tablet
  var btnInx = 0;
  for (let i = 0; i < tableBtnsMob.length; i++) {
    btnInx++;
    tableBtnsMob[i].addEventListener('click', toggleCertainTableStickers.bind(null, btnInx.toString(), orderStatuses[i]));
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
tableDataSort();





// Обертка для графиков и диагарамм для их адаптивности
function charts() {

  //  Находит сумму элементов массива

  function arraySum(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  }


  //==============================================Диаграммы======================================================//
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

    // тестовый запрос
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
      ordersInfo.textContent = `${totalOrdersQty} ${declOfNum(totalOrdersQty, ['активный', 'активных'])} ${declOfNum(totalOrdersQty, ['заказ', 'заказа', 'заказов'])} на общую сумму ${totalOrdersSum.toLocaleString('ru-RU')} руб.`;

      const ordersChart = document.getElementById('orders-chart').getContext('2d');  //  canvas диаграммы

      //  Корректировка отображения подписи внутри диаграммы на Mac и на остальных платформах

      if (navigator.appVersion.indexOf("Mac") != -1) {
        if (window.innerWidth > 1299) {
          ordersChart.canvas.parentNode.style.width = '100%';
          ordersChart.canvas.parentNode.style.height = '393px';
          ordersInfo.style.left = chart1.offsetWidth / 3 + 'px';
          ordersInfo.style.top = chart1.offsetHeight / 2.5 + 'px';
        } else if (window.innerWidth < 1299 && window.innerWidth > 499) {
          ordersChart.canvas.parentNode.style.width = '50%';
          ordersChart.canvas.parentNode.style.height = '349px';
          ordersInfo.style.left = chart1.offsetWidth / 2 + 'px';
          ordersInfo.style.top = chart1.offsetHeight / 2 + 'px';
        } else if (window.innerWidth < 499) {
          ordersChart.canvas.parentNode.style.width = '60%';
          ordersChart.canvas.parentNode.style.height = '256px';
        }
      } else {
        if (window.innerWidth > 1299) {
          ordersChart.canvas.parentNode.style.width = '100%';
          ordersChart.canvas.parentNode.style.height = '393px';
          ordersInfo.style.left = chart1.offsetWidth / 3.5 + 'px';
          ordersInfo.style.top = chart1.offsetHeight / 2.5 + 'px';
        } else if (window.innerWidth < 1299 && window.innerWidth > 499) {
          ordersChart.canvas.parentNode.style.width = '50%';
          ordersChart.canvas.parentNode.style.height = '349px';
          ordersInfo.style.left = chart1.offsetWidth / 2 + 'px';
          ordersInfo.style.top = chart1.offsetHeight / 2 + 'px';
        } else if (window.innerWidth < 499) {
          ordersChart.canvas.parentNode.style.width = '60%';
          ordersChart.canvas.parentNode.style.height = '256px';
        }
      }

      //  сам экземпляр объекта диаграммы
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
        var tableToggle = document.querySelector('#tableToggle');
        var tableToggleMob = document.querySelector('#tableToggle-mob');
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
            ordersInfo.textContent = `${toggleCount} ${declOfNum(toggleCount, ['активный', 'активных', 'активных'])}
                                      ${declOfNum(toggleCount, ['заказ', 'заказа', 'заказов'])} на общую сумму
                                      ${preordersSum.toLocaleString('ru-RU')} руб.`;
            toggleCount = 0;
          } else {
            ordersInfo.textContent = `${totalOrdersQty} ${declOfNum(totalOrdersQty, ['активный', 'активных'])}
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
    let data1 = [0, 540000, 261000, 510000, 488000, 402987, 499900, 523000, 250000]; // данные для синей линии
    let data2 = [0, 350004, 259000, 300300, 290000, 88000, 441560, 260000, 239400]; // данные для оранжевой линии
    let data3 = [0, 0, 350494, 473200, 501000, 550000, 260100, 240000, 23000]; // данные для зеленой линии

    //let test1 = arraySum(data1);
    //let test2 = arraySum(data1Sum);

    const deliveryСhart = document.getElementById('deliveryChart').getContext('2d'); //  canvas диаграммы
      deliveryСhart.canvas.parentNode.style.width = '100%';
      deliveryСhart.canvas.parentNode.style.height = '258px';

    const chart = new Chart(deliveryСhart, {
      type: 'line',
      // Отображение данных
      data: {
        labels: ["21 нед.",	"22 нед.",	"23 нед.",	"24 нед.",	"25 нед.",	"26 нед.",	"27 нед.", "28 нед."],
        //  Настройка отображения данных
        datasets: [{
            label: 'BCA', //  Название линии
            data: [0, 540000, 261000, 510000, 488000, 402987, 499900, 523000, 250000], // подключение данных
            fill: false,
            borderColor: '#34495E', // цвет линии
            backgroundColor: '#ffffff', // заливка поинта
            borderWidth: 3 // толщина линии
        }, {
            label: '509', //  Название линии
            data: [0, 350004, 259000, 300300, 290000, 88000, 441560, 260000, 239400], // подключение данных
            fill: false,
            borderColor: '#F69C00', // цвет линии
            backgroundColor: '#ffffff', // заливка поинта
            borderWidth: 3 // толщина линии
        }, {
            label: 'FXR', //  Название линии
            data: [0, 0, 350494, 473200, 501000, 550000, 260100, 240000, 23000], // подключение данных
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
  }
  deliveryProgress();



  //  График "Ежегодная динамика товарооборота"

  function productsBarChart() {
    //  тестовые данные
    let data = [1400000, 7980548, 4100675, 15880000, 10245014];
    const barChart = document.getElementById('barChart').getContext('2d'); //  canvas диаграмм

    if (window.innerWidth > 1299) {
      barChart.canvas.parentNode.style.width = '100%';
      barChart.canvas.parentNode.style.height = '258px';
    } else if (window.innerWidth < 1299) {
      barChart.canvas.parentNode.style.width = '100%';
      barChart.canvas.parentNode.style.height = '226px';
    }

    const cart = new Chart(barChart, {
      type: 'bar',  // тип графика
      // Отображение данных
      data: {
        labels: ['2017','2018', '2019', '2020', '2021'],
        //  Настройка отображения данных
        datasets: [{
          label: 'test',  //  название диаграммы
          barPercentage: 0.5,
          barThickness: 6,
          maxBarThickness: 8,
          minBarLength: 1,
          data: [1400000, 7980548, 4100675, 15880000, 10245014],
          backgroundColor: ['#9FCB93', '#F7AC93', '#96B6D3', '#B5A6BB', '#FBCD80']
        }]
      },
      options: {
        legend: false,  // отображение/скрытие названия диаграммы
        scales: {
          xAxes: [{
            gridLines: {
              offsetGridLines: true,
              drawOnChartArea: false  //  убрать/показать сетку
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true //  начало всегда с нуля
            },
            gridLines: {
              offsetGridLines: true,
              drawOnChartArea: false  //  убрать/показать сетку
            }
          }]
        },
        responsive: true, // адаптивность
        maintainAspectRatio: false, // отклюдчаем лишнее свободное пространство вокруг графика
      }
    });
  }
  productsBarChart();


  //  Диаграмма "Доля закупок по производителям"

  function procurementPieChart() {
    //  тестовые данные
    let data1 = [5000000, 2400333, 5600450, 3500400,4005600,5000000]; // кол-во заказов
    let data1Sum = [203600, 50000, 530000, 1000000, 10000, 200000];  //  суммы состояний заказов
    let test1 = arraySum(data1);
    let test2 = arraySum(data1Sum);

    const procurementChart = document.getElementById('procurementChart').getContext('2d');  //  canvas диаграммы
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
                data: [data1[0], data1[1], data1[2], data1[3], data1[4], data1[5]]
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
  };
  procurementPieChart();

  // Костыль для переопределения правильной ширины секции с toggle
  function holdSectionWidth() {
    let toggleHeads = document.querySelectorAll('.toggle');
    let toggleBodies = document.querySelectorAll('.toggle-cont');

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


  if (window.innerWidth < 1299) {
    holdSectionWidth();
    window.onresize = holdSectionWidth;
  }
}
charts();
window.onresize = charts;
