'use strict';
// Диаграмма "Заказы в работе"
const ordersProgress = () => {
  //  тестовые данные
  // кол-во заказов
  let data1 = [4, 3, 2, 1];
  //  суммы состояний заказов
  let data1Sum = [203600, 50000, 530000, 1000000];
  let test1 = arraySum(data1);
  let test2 = arraySum(data1Sum);

  //  Находит сумму элементов массива
  function arraySum(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  }
  //  контейнер с текстом внутри диаграммы
  const ordersInfo = document.querySelector('.orders-info');
  ordersInfo.textContent = `${test1} активных заказов на общую сумму ${test2} руб.`;
  const ordersChart = document.getElementById('myChart').getContext('2d');  //  canvas диаграммы
  ordersChart.canvas.parentNode.style.height = '393px';
  ordersChart.canvas.parentNode.style.width = '393px';

  const chart = new Chart(ordersChart, {
      // тип графика
      type: 'doughnut',

      // Отображение данных
      data: {
          //  В тултипах при наведение на шкалы графика
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
              data: [data1[0], data1[1], data1[2], data1[3]]
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
        //  отклюдчаем лишнее свободное пространство вокруг графика
        maintainAspectRatio: false
      }
  });
};
ordersProgress();


//  Диаграмма "Рекламации в работе"

const speedChart = () => {
  const gaugeEl = document.querySelector('.gauge'); //  сама диаграмма
  const reclResult = document.querySelector('.recl-result');  //  надпись с результатом под диаграммой
  const speedPointer = document.querySelector('.speed-point');  //  стрелка указатьель в диаграмме
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
  // кол-во заказов
  let data1 = [4, 3, 2, 1];
  //  суммы состояний заказов
  let data1Sum = [203600, 50000, 530000, 1000000];
  let test1 = arraySum(data1);
  let test2 = arraySum(data1Sum);

  //  Находит сумму элементов массива
  function arraySum(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  }

  const deliveryСhart = document.getElementById('deliveryChart').getContext('2d'); //  canvas диаграммы

  const lineChart = new Chart(deliveryСhart, {
    type: 'line',
    data: {
        //  В тултипах при наведение на шкалы графика
        labels: [`Ожидается заказов`, `Товар отгружен: заказов`, `Собрано заказов`, `В наличии`],
        //  Настройка отображения данных
        datasets: [{
            //
            label: true,
            //  цвета шкал графика
            backgroundColor: ['#96B6D3', '#9FCB93', '#B5A6BB', '#FBCD80'],
            //  цвет бордера шкал и графика
            borderColor: 'transparent',
            //  данные для отображения
            data: [{
              x: 10,
              y: 20
            }, {
              x: 15,
              y: 30
            }, {
              x: 5,
              y: 10
            }]
        }]
    },
    options: {
      // ширина "кольца"
      cutoutPercentage: 70,
      // отключение легенды
      legend: {
        display: false
      },
      //  отступы графика
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }
      },
      //  отклюдчаем лишнее свободное пространство вокруг графика
      maintainAspectRatio: false
    }
  });
}
deliveryProgress();
