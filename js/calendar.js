'use strict';

// Инициализация календаря:

function initCalendar(el) {
  el = getEl(el);
  if (el && el.id) {
    window[`${el.id}Calendar`] = new Calendar(el);
  }
}

// Класс календаря

class Calendar {
  constructor(obj) {
    this.wrap = obj;
    this.input = getEl('input', obj);
    this.init();
  }

  // Разметка календаря:
  markup =
  `<div class='input-area'>
    <div class='month-navigator'>
      <div class='month-previous'></div>
      <div class='nav-center'>
        <div class='month'>October 2019</div>
        <div class='years-nav'>
          <div class='prev-year'></div>
          <div class='next-year'></div>
        </div>
      </div>
      <div class='month-next'></div>
    </div>
    <table class='tbl-calendar'>
      <thead class='thead'>
        <tr class='row-days'>
          <th class='th-day'>Пн</th>
          <th class='th-day'>Вт</th>
          <th class='th-day'>Ср</th>
          <th class='th-day'>Чт</th>
          <th class='th-day'>Пт</th>
          <th class='th-day'>Сб</th>
          <th class='th-day'>Вс</th>
        </tr>
      </thead>
      <tbody class='tbody'></tbody>
    </table>
  </div>`;

  months = [
    { fullname: 'Январь', shortname: 'Янв' },
    { fullname: 'Февраль', shortname: 'Фев' },
    { fullname: 'Март', shortname: 'Мар' },
    { fullname: 'Апрель', shortname: 'Апр' },
    { fullname: 'Май', shortname: 'Май' },
    { fullname: 'Июнь', shortname: 'Июн' },
    { fullname: 'Июль', shortname: 'Июл' },
    { fullname: 'Август', shortname: 'Авг' },
    { fullname: 'Сентябрь', shortname: 'Сен' },
    { fullname: 'Октябрь', shortname: 'Окт' },
    { fullname: 'Ноябрь', shortname: 'Ноя' },
    { fullname: 'Декабрь', shortname: 'Дек' },
  ];

  days = [
    { fullname: 'Воскресенье', shortname: 'Вс' },
    { fullname: 'Понедельник', shortname: 'Пн' },
    { fullname: 'Вторник', shortname: 'Вт' },
    { fullname: 'Среда', shortname: 'Ср' },
    { fullname: 'Четверг', shortname: 'Чт' },
    { fullname: 'Пятница', shortname: 'Пт' },
    { fullname: 'Суббота', shortname: 'Сб' },
  ];

  // Инициализация календаря
  init() {
    this.create();
    this.addEventListeners();
  }

  // Создание календаря:
  create() {
    // Создание контейнера:
    this.cContainer = document.createElement('div');
    this.cContainer.classList.add('calendar');

    // Добавление разметки в контейнер:
    this.cContainer.innerHTML = this.markup;

    // Добавление контейнера на страницу:
    this.wrap.appendChild(this.cContainer);

    // Получение необходимых элементов календаря:
    this.cInputArea = this.cContainer.getElementsByClassName('input-area')[0];
    this.cMonthNavigator = this.cInputArea.getElementsByClassName('month-navigator')[0];
    this.cMonthPrevious = this.cMonthNavigator.getElementsByClassName('month-previous')[0];
    this.cMonthNav = this.cMonthNavigator.getElementsByClassName('month')[0];
    this.cMonthNext = this.cMonthNavigator.getElementsByClassName('month-next')[0];
    this.cYearPrev = this.cMonthNavigator.getElementsByClassName('prev-year')[0];
    this.cYearNext = this.cMonthNavigator.getElementsByClassName('next-year')[0];
    this.cNavCenter = this.cInputArea.getElementsByClassName('nav-center')[0];
    this.cYearsNav = this.cInputArea.getElementsByClassName('years-nav')[0];
    this.tBody = this.cInputArea.getElementsByClassName('tbody')[0];
  }

  // Навешивание обработчиков событий:
  addEventListeners() {
    // открытие календаря
    this.input.addEventListener('focus', () => this.open());
    // закрытие календаря
    this.input.addEventListener('focusout', () => this.hide());
    // месяц назад
    this.cMonthPrevious.addEventListener('click', () => this.previous());
    // месяц вперед
    this.cMonthNext.addEventListener('click', () => this.next());
    // год назад
    this.cYearPrev.addEventListener('click', () => this.previousYear());
    // год вперед
    this.cYearNext.addEventListener('click', () => this.nextYear());
    // установка даты
    this.tBody.addEventListener('click', () => this.setDate());
  }

  // Создание содержимого календаря:
  updateCalendar() {
    var month = this.currentMonth,
        year = this.currentYear;
    // кол-во дней в месяце
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    this.tBody.innerHTML = ''; // очищаем календарь
    // название месяца в календаре
    this.cMonthNav.innerHTML = this.months[month].fullname + ' ' + year;
    var date = new Date(year, month, 1); // Первый день выбранного месяца

    //  создание календаря динамически
    while (date.getDate() <= daysInMonth && month == date.getMonth()) {
      var row = document.createElement('tr');

      for (var j = 0; j < 7; j++) {
        //  Приводим отображение календаря к формату пн(0) - вс(6)
        var weekDay = date.getDay();
        if (weekDay === 0) {
          weekDay = 6;
        } else {
          weekDay = weekDay - 1;
        }

        if (j == weekDay && month == date.getMonth()) {
          var cell = document.createElement('td'),
              cellText = document.createTextNode(date.getDate());
          cell.classList.add('date-cell');

          if (
            date.getDate() === this.selectedDate.getDate() &&
            year === this.selectedDate.getFullYear() &&
            month === this.selectedDate.getMonth()
          ) {
            cell.classList.add('dt-active');
          }

          date.setDate(date.getDate() + 1);
          cell.appendChild(cellText);
          row.appendChild(cell);
          cell.addEventListener('click', (e) => {
            this.selectedDate = new Date(year, month, e.target.innerHTML);
            if (document.getElementsByClassName('dt-active')[0]) {
              document.getElementsByClassName('dt-active')[0].classList.remove('dt-active');
            }
            e.target.classList.add('dt-active');
          });
        } else {
          var cell = document.createElement('td');
          var cellText = document.createTextNode('');
          cell.appendChild(cellText);
          row.appendChild(cell);
        }
      }
      this.tBody.appendChild(row);
    }
  }

  // Вспомогательный метод для форматирования чисел меньше 10
  formateTwoDigitNumber(num) {
    return ('0' + num).slice(-2);
  }

  // Работа кнопки месяц назад
  previous() {
    this.currentYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
    this.currentMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
    this.updateCalendar();
  }

  // Работа кнопки месяц вперед
  next() {
    this.currentYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
    this.currentMonth = this.currentMonth === 11 ? 0 : this.currentMonth + 1;
    this.updateCalendar();
  }

  // Работа кнопки год назад:
  previousYear() {
    this.currentYear--;
    this.currentMonth = this.currentMonth === 0 ? 11 : this.currentMonth;
    this.updateCalendar();
  }

  // Работа кнопки год вперед:
  nextYear() {
    this.currentYear++;
    this.currentMonth = this.currentMonth === 11 ? 0 : this.currentMonth;
    this.updateCalendar();
  }

  // Установка даты:
  setDate() {
    this.input.value =
      this.formateTwoDigitNumber(this.selectedDate.getDate()) +'.' +
      this.formateTwoDigitNumber(this.selectedDate.getMonth() + 1) +'.' +
      this.selectedDate.getFullYear();
    this.input.dispatchEvent(new Event('change', {'bubbles': true}));
    this.hide();
  }

  // Открытие календаря:
  open() {
    this.getStartDate();
    this.selectedDate = this.savedDate;
    this.currentMonth = this.savedDate.getMonth();
    this.currentYear = this.savedDate.getFullYear();
    this.updateCalendar();
    this.wrap.classList.add('open');
  }

  // Получение даты, на которой следует открыть календарь:
  getStartDate() {
    var startDate;
    if (this.input.value !== '') {
      startDate = this.input.value;
    } else {
      if (this.input.dataset.begin) {
        startDate = this.input.dataset.begin;
      } else {
        this.savedDate = new Date();
        return;
      }
    }
    startDate = startDate.split(/\/|\.|-/);
    if (startDate.length < 3) {
      this.savedDate = new Date();
      return;
    }
    startDate = startDate[2] + '-' + startDate[1] + '-' + startDate[0];
    this.savedDate = new Date(startDate);
    if(isNaN(this.savedDate.getTime())) {
      this.savedDate = new Date();
      return;
    }
    if (this.savedDate.getFullYear() < '1900') {
      this.savedDate = new Date();
    }
  }

  // Скрытие календаря:
  hide = event => {
    this.wrap.classList.remove('open');
  }
}
