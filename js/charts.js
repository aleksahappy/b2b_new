'use strict';
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


// График "Заказы в работе"
const ordersProgress = () => {
  const ordersInfo = document.querySelector('.orders-info');
  ordersInfo.textContent = `${test1} активных заказов на общую сумму ${test2} руб.`;
  const ctx = document.getElementById('myChart').getContext('2d');
  ctx.canvas.parentNode.style.height = '393px';
  ctx.canvas.parentNode.style.width = '393px';

  const chart = new Chart(ctx, {
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

  //display payment chart info
  const donutSum = document.querySelector('.donut-sum');
  const freeProduct = document.querySelector('.free-product');
  const deptSum = document.querySelector('.dept-sum');

  // freeProduct.innerHTML = inValue[0] + ' р.';
  // deptSum.innerHTML = inValue[1] + ' р.';
  // let sum = inValue[0] + inValue[1];
  // donutSum.innerHTML = sum + ' р.';

};
ordersProgress();
