'use strict';

const charts = () => {
  //  Находит сумму элементов массива

  function arraySum(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  }


  // Диаграмма "Заказы в работе"

  const ordersProgress = () => {
    //  тестовые данные
    let data1 = [4, 3, 2, 1]; // кол-во заказов
    let data1Sum = [203600, 50000, 530000, 1000000];  //  суммы состояний заказов
    let test1 = arraySum(data1);
    let test2 = arraySum(data1Sum);

    const ordersInfo = document.querySelector('.orders-info');  //  контейнер с текстом внутри диаграммы
    ordersInfo.textContent = `${test1} активных заказов на общую сумму ${test2.toLocaleString('ru-RU')} руб.`;
    const ordersChart = document.getElementById('orders-chart').getContext('2d');  //  canvas диаграммы

    if (window.innerWidth > 1299) {
      ordersChart.canvas.parentNode.style.width = '100%';
      ordersChart.canvas.parentNode.style.height = '393px';
    } else if (window.innerWidth < 1299 && window.innerWidth > 499) {
      ordersChart.canvas.parentNode.style.width = '50%';
      ordersChart.canvas.parentNode.style.height = '349px';
    } else if (window.innerWidth < 499) {
      ordersChart.canvas.parentNode.style.width = '60%';
      ordersChart.canvas.parentNode.style.height = '256px';
    }


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
                data: data1
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
          responsive: true, // адаптивность
          //  отклюдчаем лишнее свободное пространство вокруг графика
          maintainAspectRatio: false
        }
    });
  };
  ordersProgress();



  //  Диаграмма "Рекламации в работе"

  const speedChart = () => {
    const speedChartDiv = document.querySelector('.speed-chart');
    const gaugeEl = document.querySelector('.gauge'); //  сама диаграмма
    const reclResult = document.querySelector('.recl-result');  //  надпись с результатом под диаграммой
    const speedPointer = document.querySelector('.speed-point');  //  стрелка указатьель в диаграмме

    speedPointer.style.left = speedChartDiv.clientWidth / 2 + 'px';
    speedPointer.style.top = gaugeEl.clientHeight + 'px';

    let test = 2; //  данные для примера, так как источник оригинальных данных для этого значения неизвестен
    //const pointerPositive = 60;

    //  функция для динамического запуска диаграммы с данными
    function setGaugeValue(gauge, value) {  //  gauge - диаграмма, value - данные (в формате от 0.01 (1%) до 1 (100%))
      if (value < 0 || value > 1) {
        return;
      }

      gauge.querySelector('.g-fill').style.transform = `rotate(${value / 2}turn)`;  //  динамическое отображение данных в диаграмме
      reclResult.innerHTML = `Мы обработали ${Math.round(value * 100)}% ваших обращений. В работе ${test} обращения`; //  отображение результата
      //speedPointer.style.transform =`rotate(${Math.round(value * 100) * 0.6}turn)`;
    }

    //  вызов функции с пользовательскими данными
    setGaugeValue(gaugeEl, 0.92);
  }
  speedChart();



  //  График поставок

  const deliveryProgress = () => {
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

      //console.log(chart.data);
  });

  }
  deliveryProgress();



  //  График "Ежегодная динамика товарооборота"

  const productsBarChart = () => {
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

  const procurementPieChart = () => {
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
  const holdSectionWidth = () => {
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
