'use strict';

// Статусы товаров в заказе:
// 1: "Ожидается"
// 2: "В наличии"
// 3: "Собран"
// 4: "Отгружен"
// 5: "Непоставка"
// 6: "Рекламации"

// !!! На странице нет статуса "Непоставка", это правильно?

// Глобальные переменные:

var ctx = document.getElementById('ordersChart').getContext('2d');
var barChart = document.getElementById('bar-chart').getContext('2d');

let rows = [];
let hiddenRows = [];
let currentRows = [];

let dataTable = [];
let dataBar = [];
let dataDonat = {};
let preOrderDonat = [];
let currentDonut = [];
let preOrderTable = [];
let preOrderBar = [];

let chartDonut = null;
let chartBar = null;

let toogleTable = document.getElementById("table-toggle");
let toogleBar = document.getElementById("bar-chart-tgl-1");

let sumShip = 0;
let sumBeforeShip = 0;

let titles = ['активный заказ', 'активных заказа', 'активных заказов'];

let events = {
	"Ожидается": {
		"Class": "vputi",
		"Active": true,
		"id": "status1"
	},
	"В наличии": {
		"Class": "vnali",
		"Active": true,
		"id": "status2"
	},
	"Собран": {
		"Class": "sobrn",
		"Active": true,
		"id": "status3"
	},
	"Отгружен": {
		"Class": "otgrz",
		"Active": true,
		"id": "status4"
	}
}

// Настройки диаграммы:

Chart.pluginService.register({
	beforeDraw: function (chart) {
		if (chart.config.options.elements.center) {
			//Get ctx from string
			var ctx = chart.chart.ctx;

			//Get options from the center object in options
      var centerConfig = chart.config.options.elements.center;
      // var fontSize = centerConfig.fontSize || '30';
			var fontStyle = centerConfig.fontStyle || 'Arial';
			var txt = centerConfig.text;
			var color = centerConfig.color || '#000';
			var sidePadding = centerConfig.sidePadding || 20;
			var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
			//Start with a base font of 30px
			ctx.font = "30px " + fontStyle;

			//Get the width of the string and also the width of the element minus 10 to give it 5px side padding
			var stringWidth = ctx.measureText(txt).width;
			var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

			// Find out how much the font can grow in width.
			var widthRatio = elementWidth / stringWidth;
			var newFontSize = Math.floor(30 * widthRatio);
			var elementHeight = (chart.innerRadius * 2);

			// Pick a new font size so it will not be larger than the height of label.
      var fontSizeToUse = Math.min(newFontSize, elementHeight);

			//Set font settings to draw it correctly.
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
			var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
			ctx.font = fontSizeToUse + "px " + fontStyle;
			ctx.fillStyle = color;

			//Draw text in center
			ctx.fillText(txt, centerX, centerY);
		}
	}
});

// Запускаем рендеринг рабочего стола:

startDashboardPage();

// Запуск страницы рабочего стола:

async function startDashboardPage() {
  speedChart();
  getBanners();

	dataTable = await queryToServer('first');
	let second = await queryToServer('second');

	dataBar = getBarData(second, false);
	preOrderBar = getBarData(second, true);

	dataDonat = getDonatData(dataTable);
	preOrderTable = getDataPreOrder(dataTable);
	preOrderDonat = getDonatData(preOrderTable);

	currentDonut = dataDonat;

	getDataSettleBlocks();

	console.log(dataTable);
	console.log(preOrderTable);
	console.log(dataDonat);
	console.log(preOrderDonat);
	console.log(dataBar);
	console.log(preOrderBar);

	drawTable(dataTable);
	drawDonat(currentDonut, getDonutText(currentRows), false);
	drawBar(dataBar, false);

	toogleClick();

	eventForEvents()
	loader.hide();
}

// Отправка запросов на сервер:

function queryToServer(query) {
	return fetch('https://new.topsports.ru/api.php', {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/x-www-form-urlencoded;charset=UTF-8'
		},
		body: JSON.stringify({
			action: query
		})
	})
	.then((response) => {
    return response.json();
	})
	.then((data) => {
		console.log(data);
		return data;
  })
  .catch((error) => {
    console.log(error);
  })
}

//=====================================================================================================
// Получение и заполнение данных:
//=====================================================================================================

// Получение и заполнение данных в блоке "Взаиморасчеты":

async function getDataSettleBlocks() {
	sumBeforeShip = 0;
	sumShip = 0;
	dataTable.forEach(element => {
		if (element["sum1"] != undefined) {
			let el = element["sum1"];
			sumBeforeShip += Number(el);
		}
		if (element["sum2"] != undefined) {
			let el = element["sum2"];
			sumBeforeShip += Number(el);
		}
		if (element["sum4"] != undefined) {
			let el = element["sum4"];
			sumShip += Number(el);
		}
  });
  document.querySelector('#before-shipment .qty').textContent = '—'; // нет данных "Активных заказов"?
  document.querySelector('#before-shipment .money').textContent = sumBeforeShip > 0 ? `${convertPrice(sumBeforeShip)} руб.` : '0 руб.';

  document.querySelector('#sum-shipment .qty').textContent = '—'; // нет данных "Активных заказов"?
  document.querySelector('#sum-shipment .date').textContent = '—'; // нет данных "Оплата до"?
  document.querySelector('#sum-shipment .money').textContent = sumShip > 0 ? `${convertPrice(sumShip)} руб.` : '0 руб.';

  let deposits = await queryToServer('get_deposit');
  document.querySelector('#overpayment .qty').textContent = deposits && deposits.numkredit > 0 ? deposits.numkredit : '—';
  document.querySelector('#overpayment .money').textContent = deposits && deposits.kredit > 0 ? `${convertPrice(deposits.kredit)} руб.` : '0 руб.';

  document.querySelector('#deposit .qty').textContent = deposits && deposits.numdepos > 0 ?  `${convertPrice(deposits.numdepos)} руб.` : '0 руб.';; // numdepos это "Неснижаемый остаток"?
	document.querySelector('#deposit .money').textContent = deposits && deposits.depos > 0 ? `${convertPrice(deposits.depos)} руб.` : '0 руб.';
}

// Получение данных для диаграммы "Заказы в работе":

function getDonatData(data) {
	let statuses = {
		"Отгружен": 0,
		"Собран": 0,
		"Ожидает подтверждения": 0,
		"В наличии": 0
	}
	data.forEach(element => {
		let status = element["order_status"];
		statuses[status]++;
	})
	return statuses;
}

// Получение данных для текста внутри диаграммы "Заказы в работе":

function getDonutText(data) {
	let num = 0;
	let sum = 0;
	data.forEach(element => {
		if (!element[0].classList.contains('displayNone')) {
			num++;
			sum += Number(element[1]["order_sum"]);
		}
	})
	let cases = [2, 0, 1, 1, 1, 2];
	let str = titles[(num % 100 > 4 && num % 100 < 20) ? 2 : cases[(num % 10 < 5) ? num % 10 : 5]];
  return `${num} ${str} на общую сумму ${convertPrice(sum)} руб.`;
}

// Получение данных для таблицы "Заказы в работе":

function getDataPreOrder(data) {
	let preOrderData = [];
	data.forEach(element => {
		if (typeof element["order_event"] != undefined) {
			if (element["order_event"].indexOf('Предзаказ') >= 0) {
				preOrderData.push(element);
			}
		}
	})
	return preOrderData;
}

// Получение данных для графика "Ежегодная динамика товарооборота":

function getBarData(data, isPreOrder) {
	let d = data[0];
	let keysD = Object.keys(d);
	let valueForBar = [];
	if (isPreOrder) {
		keysD.forEach(element => {
			valueForBar.push(d[element]["preorder_sum"]);
		})
	} else {
		keysD.forEach(element => {
			let values = Object.values(d[element]);
			let sum = 0;
			values.forEach(val => sum += Number(val));
			valueForBar.push(sum);
		});
	}
	return valueForBar;
}

//=====================================================================================================
// Отрисовка графиков:
//=====================================================================================================

// Отрисовка диаграммы "Заказы в работе":

function drawDonat(data, dT, redraw) {
	if (redraw) {
		chartDonut.destroy();
	}
	let labels = Object.keys(data);
	let dataD = Object.values(data);
	chartDonut = new Chart(ctx, {
		type: 'doughnut', // тип графика
		// Отображение данных
		data: {
			//  Название линии
			labels: labels,
			//  Настройка отображения данных
			datasets: [{
				// название
				label: false,
				// цвета шкал графика
				backgroundColor: ['#9FCB93', '#B5A6BB', '#96B6D3', '#FBCD80'],
				// цвет бордера шкал и графика
				borderColor: 'transparent',
				// данные для отображения
				data: dataD,
				// Цвет бордеров шкал
				borderColor: ['#ffffff'],
				//  расстояние между шкалами
				borderWidth: 2
			}]
		},
		// Настройки отображения графика
		options: {
			// диаметр "кольца"
			cutoutPercentage: 70,
			elements: {
				center: {
					text: dT,
					color: '#34495E', // Default is #000000
					fontStyle: "'Open Sans', sans-serif", // Default is Arial
					fontSize: 18,
					sidePadding: 10 // Defualt is 20 (as a percentage)
				}
			},
			// отображение/скрытие названия диаграммы
			legend: {
				display: false
			},
			// поворот угла стартового значения
			rotation: 5,
			// отступы графика
			layout: {
				padding: {
					left: 10,
					right: 10,
					top: -10,
					bottom: 0
				}
			},
			// адаптивность
			responsive: true,
			// отклюдчаем лишнее свободное пространство вокруг графика
		}
  });
  // document.querySelector('.orders-info').textContent = dT;
}

// Отрисовка таблицы "Заказы в работе":

function drawTable(data) {
	let table = document.getElementById('table'),
			content = '';
	let id = 0;
	data.forEach(element => {
		content += `<div id="row${id}" class="row">
									<div class="textR">
										<div class="nameO">${element["order_number"]} от ${element["order_date"]}</div>
										<div class="typeO">${element["order_event"]}</div>
									</div>
									<div id="sum${id}" class="sumR">`;
		if (typeof element["sum1"] != undefined) {
			if (element["sum1"] > 0) {
				content += `<div id="vp${id}" class="pill vputi c10">${element["sum1"]}</div>`;
			}
		}
		if (typeof element["sum2"] != undefined) {
			if (element["sum2"] > 0) {
				content += `<div id="vn${id}" class="pill vnali c10">${element["sum2"]}</div>`;
			}
		}
		if (typeof element["sum3"] != undefined) {
			if (element["sum3"] > 0) {
				content += `<div id="sobr${id}" class="pill sobrn c10">${element["sum3"]}</div>`;
			}
		}
		if (typeof element["sum4"] != undefined) {
			if (element["sum4"] > 0) {
				content += `<div id="ot${id}" class="pill otgrz c10">${element["sum4"]}</div>`;
			}
		}
		content += `</div></div>`;
		id++;
	})

	table.innerHTML = content;
	for (let i = 0; i < id; i++) {
		let row = [document.getElementById(`row${i}`), data[i]]
		//rows.push(document.getElementById(`row${i}`));
		rows.push(row);
	}
	console.log(rows);
	currentRows = [];
	currentRows = [...rows];
}

// Получение данных и заполнение графика "Рекламации в работе":

// Старый код:
async function speedChart() {
	let speedChartDiv = document.querySelector('.speed-chart');
	let gaugeEl = document.querySelector('.gauge'); // сама диаграмма
	let reclResult = document.querySelector('.recl-result'); // надпись с результатом под диаграммой
	let speedPointer = document.querySelector('.speed-point'); // cтрелка указатель в диаграмме
	let recl = await queryToServer('reclamation');

	// Автовыравнивание стрелки диаграммы
	// данные для примера, так как источник оригинальных данных для этих значений неизвестен
	let totalRecls = recl.length; // количество поданных всего рекламаций пользователем
	let doneRecls = 0;
	recl.forEach(element => {
		if ((element["status_text"] == 'Исполнена') || (element["status_text"] == 'Не удовлетворена')) {
			doneRecls++;
		}
	})
	// колличество обработанных рекламаций пользователя
	let reclsInWork = totalRecls - doneRecls; //  рекламации в работе
	let result = doneRecls / totalRecls; //  коэффицент обработанных рекламаций
	let pointerStep = 0.005 * (result * 100).toFixed(0);
  let pointerDeg = -0.25 + pointerStep;

  // заполнение диаграммы данными
	setGaugeValue(gaugeEl, result.toFixed(2));

	//  функция для динамического запуска диаграммы с данными
	function setGaugeValue(gauge, value) { //  gauge - диаграмма, value - данные (в формате от 0.01 (1%) до 1 (100%))
		if (value < 0 || value > 1) {
			return;
		}
		gauge.querySelector('.g-fill').style.transform = `rotate(${value / 2}turn)`; //  работа спид-диагараммы согласно переданным данным данными
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
}

// Отрисовка графика "Ежегодная динамика товарооборота":

function drawBar(data, redraw) {
	if (redraw) {
		chartBar.destroy();
	}
	chartBar = new Chart(barChart, {
		type: 'bar', // тип графика
		// Отображение данных
		data: {
			labels: [`2017`, `2018`, `2019`, `2020`, '2021'],
			//  Настройка отображения данных
			datasets: [{
				label: 'test', // название графика
				barPercentage: 1,
				barThickness: 'flex',
				maxBarThickness: 120,
				minBarLength: 1,
				data: data,
				backgroundColor: ['#9FCB93', '#F7AC93', '#96B6D3', '#B5A6BB', '#FBCD80']
			}]
		},
		options: {
			legend: false, // отображение/скрытие названия графика
			scales: {
				xAxes: [{
					gridLines: {
						offsetGridLines: true,
						drawOnChartArea: true // Убрать/показать сетку
					}
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true // Начало всегда с нуля
					},
					gridLines: {
						offsetGridLines: true,
						drawOnChartArea: false // Убрать/показать сетку
					}
				}]
			},
			// адаптивность
			responsive: true,
			maintainAspectRatio: false, // отключаем лишнее свободное пространство вокруг графика
		}
	})
}

//=====================================================================================================
// Работа с данными таблицы "Заказы в работе":
//=====================================================================================================

// Включение/отключение предзаказов:

function toogleClick() {
	toogleTable.onclick = function () {
		if (this.classList.contains('checked')) {
			this.classList.remove('checked');
			redrawTable(dataTable);
			currentDonut = [...dataDonat];
			drawDonat(currentDonut, getDonutText(currentRows), true);
		} else {
			this.classList.add('checked');
			redrawTable(preOrderTable);
			currentDonut = [...preOrderDonat];
			drawDonat(currentDonut, getDonutText(currentRows), true);
		}
	}
	toogleBar.onclick = function () {
		if (this.classList.contains('checked')) {
			this.classList.remove('checked');
			drawBar(dataBar, true);
		} else {
			this.classList.add('checked');
			drawBar(preOrderBar, true);
		}
	}
}

// Перерисовка таблицы при включении/отключении предзаказов:

function redrawTable(data) {
	let table = document.getElementById('table');
	content = '';
	table.innerHTML = content;
	rows = [];
	drawTable(data);
	atChangeTable();
}

// Получение "пилюль" для навешивания на них обработчика события:

function eventForEvents() {
	let keys = Object.keys(events);
	keys.forEach(element => {
		let el = document.getElementById(events[element]["id"]);
		let eC = events[element]["Class"];
		getOnClick(el, element, eC);
	})
}

// Навешивание обработчика события на "пилюли", запуск отображения/скрытия строк таблицы:

function getOnClick(element, eventName, eventClass) {
	element.onclick = function () {
		if (events[eventName]["Active"]) {
			currentRows.forEach(el => {
				if ((typeof (el[0].querySelector('.' + eventClass)) != undefined) && (el[0].querySelector('.' + eventClass) != null)) {
					el[0].querySelector('.' + eventClass).classList.add('displayNone');
				}
			})
			events[eventName]["Active"] = false;
			this.classList.remove(this.id);
			this.classList.remove('checked');
		} else {
			currentRows.forEach(el => {
				if ((typeof (el[0].querySelector('.' + eventClass)) != undefined) && (el[0].querySelector('.' + eventClass) != null)) {
					el[0].querySelector('.' + eventClass).classList.remove('displayNone');
				}
			})
			events[eventName]["Active"] = true;
			this.classList.add(this.id);
			this.classList.add('checked');
		}
		checkRows(currentRows);
		hideRows();
		drawDonat(currentDonut, getDonutText(currentRows), true)
	}
}

// Изменение данных таблицы:

function atChangeTable() {
	let keys = Object.keys(events);
	keys.forEach(element => {
		let el = document.getElementById(events[element]["id"]);
		let eC = events[element]["Class"];

		if (events[element]["Active"]) {
			currentRows.forEach(elem => {
				if ((typeof (elem[0].querySelector('.' + eC)) != undefined) && (elem[0].querySelector('.' + eC) != null)) {
					elem[0].querySelector('.' + eC).classList.remove('displayNone');
				}
			})
		} else {
			currentRows.forEach(elem => {
				if ((typeof (elem[0].querySelector('.' + eC)) != undefined) && (elem[0].querySelector('.' + eC) != null)) {
					elem[0].querySelector('.' + eC).classList.add('displayNone');
				}
			})
		}
	})
	checkRows(currentRows);
	hideRows();
}

// Проверка необходимости отображения/скрытия строк таблицы:

function checkRows(rowsTable) {
	hiddenRows = [];
	rowsTable.forEach(element => {
		if (element[0].classList.contains('displayNone')) {
			let row = element[0].querySelector('.sumR').querySelectorAll('div');
			let hidden = true;
			row.forEach(el => {
				if (!el.classList.contains('displayNone')) {
					hidden = false;
				}
			})
			if (!hidden) {
				element[0].classList.remove('displayNone');
			}
		} else {
			let row = element[0].querySelector('.sumR').querySelectorAll('div');
			let hidden = true;
			row.forEach(el => {
				if (!el.classList.contains('displayNone')) {
					hidden = false;
				}
			})
			if (hidden) {
				hiddenRows.push(element);
			}
		}
	})
}

// Скрытие строк таблицы:

function hideRows() {
	hiddenRows.forEach(element => {
		element[0].classList.add('displayNone');
	})
}

//=====================================================================================================
// Настройки и подключение баннеров:
//=====================================================================================================

// Настройки карусели с баннерами:

var bannersCarousel = {
  isNav: true,            // Наличие навигации (точек или картинок под каруселью)
  navType: 'dot',         // Тип навигации ('img' или 'dot')
  isInfinitie: true,      // Бесконечное зацикливание карусели
  isAnimate: true,        // Анимация смены слайдов (анимировать смену слайдов или нет)
  switchAmount: 1,        // Количество перелистываемых слайдов за раз
  isCenter: true,         // Активная картинка всегда по центру карусели (работает только для бесконечной карусели)
  isHoverToggle: false,   // Листание при наведении на картинку (если false, то будет листание по клику)
  durationBtns: 600,      // Продолжительность анимации при переключении кнопками вперед/назад (мc)
  durationNav: 400,       // Продолжительность анимации при переключении миниатюрами/индикаторами(мс)
  animateFunc: 'ease',    // Эффект анимации
  isAutoScroll: true,     // Автоматическая прокрутка
  interval: 6000          // Интервал между автоматической прокруткой (мс)
}

// Динамическая загрузка картинок в статические баннеры и в карусель с баннерами:

function getBanners() {
  sendRequest(`../json/dashboard_banners.json`)
  .then(result => {
    var imagesData = JSON.parse(result);
    fillTemplate({
      area: '#dashboard-banners',
      items: imagesData
		});
		document.querySelectorAll('#dashboard-banners .banner').forEach(el => checkImg(el, 'delete'));
    fillTemplate({
      area: '#banners .carousel-gallery',
      items: imagesData
		});
    var curCarousel = getEl('#banners .carousel');
    renderCarousel(curCarousel);
  })
  .catch(err => {
    console.log(err);
  });
}
