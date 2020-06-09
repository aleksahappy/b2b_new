// 'use strict';
// // var data;
// var desktopTable = document.querySelector('#desktopTable');
// var tbody = desktopTable.querySelector('tbody');
//
// // Запускаем рендеринг страницы заказов:
//
// startPage();
//
// //=====================================================================================================
// // Получение и отображение информации о заказах:
// //=====================================================================================================
//
// // Запуск страницы заказа:
//
// function startPage() {
//   sendRequest(`../json/desktopTableData.json`)
//   //sendRequest(urlRequest.main, {action: 'desktopTable'})
//   .then(result => {
//     var data = JSON.parse(result);
//     data = convertData(data);
//     initTable('desktopTable', data);
//     correctTable1Width();
//     tableToggleWork();
//   })
//   .catch(err => {
//     console.log(err);
//     initTable('desktopTable');
//   });
// }
//
//
// // Преобразование полученных данных:
//
// function convertData(data) {
//   if (!data) {
//     return [];
//   }
//   data.forEach(el => {
//     el.order_sum = convertPrice(el.order_sum);
//     var sum;
//     for (var i = 1; i <= 5; i++) {
//       sum = el[`sum${i}`];
//       if (sum && sum != 0) {
//         el[`sum${i}`] = convertPrice(sum);
//         el[`display${i}`] = '';
//       } else {
//         el[`display${i}`] = 'displayNone';
//       }
//     }
//   });
//   return data;
// }
//
// //=====================================================================================================
// //  поправляет ширину таблицы, если а одном ряду с ней в блоке info-graphic есть еще блоке
//
// function correctTable1Width() {
//   var tableOrdersInWork = document.querySelector('#desktopTable');
//   var infoGraphicBlock = document.querySelector('.info-graphic');
//   var chart1 = document.querySelector('#chart1');
//
//   if (window.innerWidth > 1299) {
//     tableOrdersInWork.style.width = infoGraphicBlock.clientWidth - (chart1.clientWidth + 30) + 'px';
//   }
// }
//
//
// //  Работа обновленных кнопок-тогглов на Рабочем Восстановление
//
// function toggleOnOff(event) {
//   if (event.currentTarget.closest('.new-toggle')) {
//     var toggleBtn = event.currentTarget.closest('.new-toggle');
//     toggleBtn.classList.toggle('on');
//     toggleBtn.firstElementChild.classList.toggle('on');
//   }
// }
//
//
// //  Работа кнопок филтрации сумм заказов по состояниям заказов
//
// function tableDataSort() {
//   var tableBtns = document.querySelector('.table-btns');
//   var status1 = tableBtns.querySelector('#status1');
//   var status2 = tableBtns.querySelector('#status2');
//   var status3 = tableBtns.querySelector('#status3');
//   var status4 = tableBtns.querySelector('#status4');
//
//   var tableBtnsMob = document.querySelector('#table-btns-mob');
//   var status1Mob = tableBtnsMob.querySelector('#status1-mob');
//   var status2Mob = tableBtnsMob.querySelector('#status2-mob');
//   var status3Mob = tableBtnsMob.querySelector('#status3-mob');
//   var status4Mob = tableBtnsMob.querySelector('#status4-mob');
//
//   status1.addEventListener('click', toggleCertainTableStickers.bind(null, '1','.vputi'));
//   status2.addEventListener('click', toggleCertainTableStickers.bind(null, '2','.vnali'));
//   status3.addEventListener('click', toggleCertainTableStickers.bind(null, '3','.sobrn'));
//   status4.addEventListener('click', toggleCertainTableStickers.bind(null, '4','.otgrz'));
//
//   status1Mob.addEventListener('click', toggleCertainTableStickers.bind(null, '1','.vputi'));
//   status2Mob.addEventListener('click', toggleCertainTableStickers.bind(null, '2','.vnali'));
//   status3Mob.addEventListener('click', toggleCertainTableStickers.bind(null, '3','.sobrn'));
//   status4Mob.addEventListener('click', toggleCertainTableStickers.bind(null, '4','.otgrz'));
//
//   // Вспомогательная функция для каждой определенной тоглл-кнопки таблицы
//
//   function toggleCertainTableStickers(numStatus, strStatus, event) {
//
//     let targetClass = event.target;
//     if (targetClass.classList.contains(`status${numStatus}`)) {
//       targetClass.classList.remove(`status${numStatus}`);
//     } else {
//       targetClass.classList.add(`status${numStatus}`);
//     }
//
//
//     let rows = tbody.querySelectorAll('.row');
//
//     for (let i = 0; i < rows.length; i++) {
//       let targetBtns = tbody.querySelectorAll(strStatus);
//       for (let j = 0; j < targetBtns.length; j++) {
//         targetBtns[j].classList.toggle('toggleTableBtns');
//       }
//     }
//   }
//
//
// }
// tableDataSort();
//
//
// //  По клику на тоггл диаграммы "Заказы в работе" показывает/скрывает данные помимо предзаказов
//
// function tableToggleWork() {
//   var tableToggle = document.querySelector('#tableToggle');
//   var tableToggleMob = document.querySelector('#tableToggle-mob');
//
//   tableToggle.addEventListener('click', sortTableOrders);
//   tableToggleMob.addEventListener('click', sortTableOrders);
//
//   function sortTableOrders() {
//     let trs = tbody.querySelectorAll('tr');
//
//     for (let i = 0; i < trs.length; i++) {
//       let tds = trs[i].querySelectorAll('td');
//
//       for (let j = 0; j < tds.length; j++) {
//         var tdsContent = tds[j].innerHTML;
//
//         if (tds[j].innerHTML.slice(0,9) === 'Предзаказ') {
//           tds[j].parentElement.classList.add('preorders');
//         }
//       }
//
//       if (!trs[i].classList.contains('preorders')) {
//         trs[i].classList.toggle('displayNone');
//       }
//     }
//   }
// }
//
//
// //  Находит сумму элементов массива
//
// function arraySum(arr) {
//   let sum = 0;
//   for (let i = 0; i < arr.length; i++) {
//     sum += arr[i];
//   }
//   return sum;
// }
//
// // var data;
// var desktopTable = document.querySelector('#desktopTable');
// var tbody = desktopTable.querySelector('tbody');
//
// // Запускаем рендеринг страницы заказов:
//
// startPage();
//
// //=====================================================================================================
// // Получение и отображение информации о заказах:
// //=====================================================================================================
//
// // Запуск страницы заказа:
//
// function startPage() {
//   sendRequest(`../json/desktopTableData.json`)
//   //sendRequest(urlRequest.main, {action: 'desktopTable'})
//   .then(result => {
//     var data = JSON.parse(result);
//     data = convertData(data);
//     initTable('desktopTable', data);
//     correctTable1Width();
//     tableToggleWork();
//   })
//   .catch(err => {
//     console.log(err);
//     initTable('desktopTable');
//   });
// }
//
//
// // Преобразование полученных данных:
//
// function convertData(data) {
//   if (!data) {
//     return [];
//   }
//   data.forEach(el => {
//     el.order_sum = convertPrice(el.order_sum);
//     var sum;
//     for (var i = 1; i <= 5; i++) {
//       sum = el[`sum${i}`];
//       if (sum && sum != 0) {
//         el[`sum${i}`] = convertPrice(sum);
//         el[`display${i}`] = '';
//       } else {
//         el[`display${i}`] = 'displayNone';
//       }
//     }
//   });
//   return data;
// }
//
// //=====================================================================================================
// //  поправляет ширину таблицы, если а одном ряду с ней в блоке info-graphic есть еще блоке
//
// function correctTable1Width() {
//   var tableOrdersInWork = document.querySelector('#desktopTable');
//   var infoGraphicBlock = document.querySelector('.info-graphic');
//   var chart1 = document.querySelector('#chart1');
//
//   if (window.innerWidth > 1299) {
//     tableOrdersInWork.style.width = infoGraphicBlock.clientWidth - (chart1.clientWidth + 30) + 'px';
//   }
// }
//
//
// //  Работа обновленных кнопок-тогглов на Рабочем Восстановление
//
// function toggleOnOff(event) {
//   if (event.currentTarget.closest('.new-toggle')) {
//     var toggleBtn = event.currentTarget.closest('.new-toggle');
//     toggleBtn.classList.toggle('on');
//     toggleBtn.firstElementChild.classList.toggle('on');
//   }
// }
//
//
// //  Работа кнопок филтрации сумм заказов по состояниям заказов
//
// function tableDataSort() {
//   var tableBtns = document.querySelector('.table-btns');
//   var status1 = tableBtns.querySelector('#status1');
//   var status2 = tableBtns.querySelector('#status2');
//   var status3 = tableBtns.querySelector('#status3');
//   var status4 = tableBtns.querySelector('#status4');
//
//   var tableBtnsMob = document.querySelector('#table-btns-mob');
//   var status1Mob = tableBtnsMob.querySelector('#status1-mob');
//   var status2Mob = tableBtnsMob.querySelector('#status2-mob');
//   var status3Mob = tableBtnsMob.querySelector('#status3-mob');
//   var status4Mob = tableBtnsMob.querySelector('#status4-mob');
//
//   status1.addEventListener('click', toggleCertainTableStickers.bind(null, '1','.vputi'));
//   status2.addEventListener('click', toggleCertainTableStickers.bind(null, '2','.vnali'));
//   status3.addEventListener('click', toggleCertainTableStickers.bind(null, '3','.sobrn'));
//   status4.addEventListener('click', toggleCertainTableStickers.bind(null, '4','.otgrz'));
//
//   status1Mob.addEventListener('click', toggleCertainTableStickers.bind(null, '1','.vputi'));
//   status2Mob.addEventListener('click', toggleCertainTableStickers.bind(null, '2','.vnali'));
//   status3Mob.addEventListener('click', toggleCertainTableStickers.bind(null, '3','.sobrn'));
//   status4Mob.addEventListener('click', toggleCertainTableStickers.bind(null, '4','.otgrz'));
//
//   // Вспомогательная функция для каждой определенной тоглл-кнопки таблицы
//
//   function toggleCertainTableStickers(numStatus, strStatus, event) {
//
//     let targetClass = event.target;
//     if (targetClass.classList.contains(`status${numStatus}`)) {
//       targetClass.classList.remove(`status${numStatus}`);
//     } else {
//       targetClass.classList.add(`status${numStatus}`);
//     }
//
//
//     let rows = tbody.querySelectorAll('.row');
//
//     for (let i = 0; i < rows.length; i++) {
//       let targetBtns = tbody.querySelectorAll(strStatus);
//       for (let j = 0; j < targetBtns.length; j++) {
//         targetBtns[j].classList.toggle('toggleTableBtns');
//       }
//     }
//   }
//
//
// }
// tableDataSort();
//
//
// //  По клику на тоггл диаграммы "Заказы в работе" показывает/скрывает данные помимо предзаказов
//
// function tableToggleWork() {
//   var tableToggle = document.querySelector('#tableToggle');
//   var tableToggleMob = document.querySelector('#tableToggle-mob');
//
//   tableToggle.addEventListener('click', sortTableOrders);
//   tableToggleMob.addEventListener('click', sortTableOrders);
//
//   function sortTableOrders() {
//     let trs = tbody.querySelectorAll('tr');
//
//     for (let i = 0; i < trs.length; i++) {
//       let tds = trs[i].querySelectorAll('td');
//
//       for (let j = 0; j < tds.length; j++) {
//         var tdsContent = tds[j].innerHTML;
//
//         if (tds[j].innerHTML.slice(0,9) === 'Предзаказ') {
//           tds[j].parentElement.classList.add('preorders');
//         }
//       }
//
//       if (!trs[i].classList.contains('preorders')) {
//         trs[i].classList.toggle('displayNone');
//       }
//     }
//   }
// }
//
//
//
//
// //  Диаграмма "Рекламации в работе"
//
// function speedChart() {
//   const speedChartDiv = document.querySelector('.speed-chart');
//   const gaugeEl = document.querySelector('.gauge'); //  сама диаграмма
//   const reclResult = document.querySelector('.recl-result');  //  надпись с результатом под диаграммой
//   const speedPointer = document.querySelector('.speed-point');  //  стрелка указатьель в диаграмме
//
//   //  Автовыравнивание стрелки диаграммы
//   speedPointer.style.left = speedChartDiv.clientWidth / 2 + 'px';
//   speedPointer.style.top = gaugeEl.clientHeight + 'px';
//
//
//   //  данные для примера, так как источник оригинальных данных для этого значения неизвестен
//   let totalRecls = "20";  //  количество поданных всего рекламаций пользователем
//   let doneRecls = "15"; //  колличество обработанных рекламаций пользователя
//   let reclsInWork = totalRecls - doneRecls; //  рекламации в работе
//   let result = doneRecls / totalRecls;  //  коэффицент обработанных рекламаций
//   let pointerStep = 0.005 * (result * 100).toFixed(0);
//   let pointerDeg = -0.25 + pointerStep;
//
//
//   //  функция для динамического запуска диаграммы с данными
//   function setGaugeValue(gauge, value) {  //  gauge - диаграмма, value - данные (в формате от 0.01 (1%) до 1 (100%))
//     if (value < 0 || value > 1) {
//       return;
//     }
//
//     gauge.querySelector('.g-fill').style.transform = `rotate(${value / 2}turn)`;  //  работа спид-диагараммы согласно переданным данным данными
//     speedPointer.style.transform = `rotate(-0.25turn)`; //  поворот стрекли согласно данным шкалы
//     setTimeout(() => {
//       speedPointer.style.transform = `rotate(${pointerDeg}turn)`; //  поворот стрекли согласно данным шкалы
//     }, 500);
//
//     //  отображение результата в надписи
//
//     if (Number(totalRecls) > 0) {
//       reclResult.innerHTML = `Мы обработали ${Math.round(value * 100)}% ваших обращений. В работе ${reclsInWork} ${declOfNum(reclsInWork,['обращение','обращения','обращений'])}`;
//     } else if (Number(totalRecls) <= 0) {
//       reclResult.innerHTML = 'Вы не подавали рекламаций';
//     }
//   }
//
//   //  вызов функции с пользовательскими данными
//   setGaugeValue(gaugeEl, result.toFixed(2));
// }
// speedChart();
//
//
//
// //  График поставок
//
// function deliveryProgress() {
//   //  тестовые данные
//   let data1 = [0, 540000, 261000, 510000, 488000, 402987, 499900, 523000, 250000]; // данные для синей линии
//   let data2 = [0, 350004, 259000, 300300, 290000, 88000, 441560, 260000, 239400]; // данные для оранжевой линии
//   let data3 = [0, 0, 350494, 473200, 501000, 550000, 260100, 240000, 23000]; // данные для зеленой линии
//
//   //let test1 = arraySum(data1);
//   //let test2 = arraySum(data1Sum);
//
//   const deliveryСhart = document.getElementById('deliveryChart').getContext('2d'); //  canvas диаграммы
//     deliveryСhart.canvas.parentNode.style.width = '100%';
//     deliveryСhart.canvas.parentNode.style.height = '258px';
//
//   const chart = new Chart(deliveryСhart, {
//     type: 'line',
//     // Отображение данных
//     data: {
//       labels: ["21 нед.",	"22 нед.",	"23 нед.",	"24 нед.",	"25 нед.",	"26 нед.",	"27 нед.", "28 нед."],
//       //  Настройка отображения данных
//       datasets: [{
//           label: 'BCA', //  Название линии
//           data: [0, 540000, 261000, 510000, 488000, 402987, 499900, 523000, 250000], // подключение данных
//           fill: false,
//           borderColor: '#34495E', // цвет линии
//           backgroundColor: '#ffffff', // заливка поинта
//           borderWidth: 3 // толщина линии
//       }, {
//           label: '509', //  Название линии
//           data: [0, 350004, 259000, 300300, 290000, 88000, 441560, 260000, 239400], // подключение данных
//           fill: false,
//           borderColor: '#F69C00', // цвет линии
//           backgroundColor: '#ffffff', // заливка поинта
//           borderWidth: 3 // толщина линии
//       }, {
//           label: 'FXR', //  Название линии
//           data: [0, 0, 350494, 473200, 501000, 550000, 260100, 240000, 23000], // подключение данных
//           fill: false,
//           borderColor: '#3F9726', // цвет линии
//           backgroundColor: '#ffffff', // заливка поинта
//           borderWidth: 3 // толщина линии
//       }]
//     },
//     options: {
//       //  "выпрямление" линий
//       elements: {
//         line: {
//           tension: 0,
//         }
//       },
//       // отключение легенды
//       legend: {
//         display: false
//       },
//       responsive: true, // адаптивность
//       maintainAspectRatio: false, // отклюдчаем лишнее свободное пространство вокруг графика
//     }
//
//     //console.log(chart.data);
// });
//
// }
// deliveryProgress();
//
//
//
// //  График "Ежегодная динамика товарооборота"
//
// function productsBarChart() {
//   //  тестовые данные
//   let data = [1400000, 7980548, 4100675, 15880000, 10245014];
//   const barChart = document.getElementById('barChart').getContext('2d'); //  canvas диаграмм
//
//   if (window.innerWidth > 1299) {
//     barChart.canvas.parentNode.style.width = '100%';
//     barChart.canvas.parentNode.style.height = '258px';
//   } else if (window.innerWidth < 1299) {
//     barChart.canvas.parentNode.style.width = '100%';
//     barChart.canvas.parentNode.style.height = '226px';
//   }
//
//   const cart = new Chart(barChart, {
//     type: 'bar',  // тип графика
//     // Отображение данных
//     data: {
//       labels: ['2017','2018', '2019', '2020', '2021'],
//       //  Настройка отображения данных
//       datasets: [{
//         label: 'test',  //  название диаграммы
//         barPercentage: 0.5,
//         barThickness: 6,
//         maxBarThickness: 8,
//         minBarLength: 1,
//         data: [1400000, 7980548, 4100675, 15880000, 10245014],
//         backgroundColor: ['#9FCB93', '#F7AC93', '#96B6D3', '#B5A6BB', '#FBCD80']
//       }]
//     },
//     options: {
//       legend: false,  // отображение/скрытие названия диаграммы
//       scales: {
//         xAxes: [{
//           gridLines: {
//             offsetGridLines: true,
//             drawOnChartArea: false  //  убрать/показать сетку
//           }
//         }],
//         yAxes: [{
//           ticks: {
//             beginAtZero: true //  начало всегда с нуля
//           },
//           gridLines: {
//             offsetGridLines: true,
//             drawOnChartArea: false  //  убрать/показать сетку
//           }
//         }]
//       },
//       responsive: true, // адаптивность
//       maintainAspectRatio: false, // отклюдчаем лишнее свободное пространство вокруг графика
//     }
//   });
// }
// productsBarChart();
//
//
// //  Диаграмма "Доля закупок по производителям"
//
// function procurementPieChart() {
//   //  тестовые данные
//   let data1 = [5000000, 2400333, 5600450, 3500400,4005600,5000000]; // кол-во заказов
//   let data1Sum = [203600, 50000, 530000, 1000000, 10000, 200000];  //  суммы состояний заказов
//   let test1 = arraySum(data1);
//   let test2 = arraySum(data1Sum);
//
//   const procurementChart = document.getElementById('procurementChart').getContext('2d');  //  canvas диаграммы
//   procurementChart.canvas.parentNode.style.height = '280px';
//   procurementChart.canvas.parentNode.style.width = '280px';
//
//   const chart = new Chart(procurementChart, {
//       type: 'doughnut', // тип графика
//
//       // Отображение данных
//       data: {
//           //  Название линии
//           labels: ['BCA', 'Jethwear', '509', 'FXR', 'Abom', 'Ogio'],
//           //  Настройка отображения данных
//           datasets: [{
//               //
//               label: false,
//               //  цвета шкал графика
//               backgroundColor: ['#96B6D3', '#CDC9CB', '#F8AD94', '#B5A6BB', '#9FCB93', '#FBCD80'],
//               //  цвет бордера шкал и графика
//               borderColor: '#ffffff',
//               borderWidth: 1,
//               //  данные для отображения
//               data: [data1[0], data1[1], data1[2], data1[3], data1[4], data1[5]]
//           }]
//       },
//
//       // Настройки отображения графика
//       options: {
//         // ширина "кольца"
//         cutoutPercentage: 70,
//         // отключение легенды
//         legend: {
//           display: false
//         },
//         //  поворот угла стартового значения
//         rotation: 4,
//         //  отступы графика
//         layout: {
//           padding: {
//             left: 10,
//             right: 10,
//             top: 10,
//             bottom: 10
//           }
//         },
//         //  отклюдчаем лишнее свободное пространство вокруг графика
//         maintainAspectRatio: false
//       }
//   });
// };
// procurementPieChart();
//
// // Костыль для переопределения правильной ширины секции с toggle
// function holdSectionWidth() {
//   let toggleHeads = document.querySelectorAll('.toggle');
//   let toggleBodies = document.querySelectorAll('.toggle-cont');
//
//   for (let i = 0; i < toggleHeads.length; i++) {
//     for (let j = 0; j < toggleBodies.length; j++) {
//       if (toggleBodies[i]) {
//         if (toggleBodies[i].offsetWidth > 0) {
//           toggleHeads[j].style.width = toggleBodies[i].offsetWidth + 'px';
//         }
//       }
//     }
//   }
// }
//
//
// if (window.innerWidth < 1299) {
//   holdSectionWidth();
//   window.onresize = holdSectionWidth;
// }
