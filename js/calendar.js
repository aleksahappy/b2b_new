'use strict';

// Инициализация календаря:

function initCalendar(el) {
  el = getEl(el);
  if (el) {
    var type = getEl('input', el).dataset.type;
    if (el.id) {
      return window[`${el.id}Calendar`] = type === 'range' ? new CalendarRange(el) : new Calendar(el);
    } else {
      return type === 'range' ? new CalendarRange(el) : new Calendar(el);
    }
  }
}

// Очистка календаря:

function clearCalendar(el) {
  var el = getEl(el);
  if (el.id && window[`${el.id}Calendar`]) {
    window[`${el.id}Calendar`].clear();
  }
}

// Класс календаря:

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
        <div class='month'></div>
        <div class='years-nav'>
          <div class='next-year'></div>
          <div class='prev-year'></div>
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

  months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  // Инициализация календаря
  init() {
    this.create();
    this.getElements();
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
  }

  // Получение элементов календаря для работы:
  getElements() {
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
    // перключение календаря на дату, введенную в текстовое поле
    this.input.addEventListener('input', () => this.setStartDate());
    // месяц назад
    this.cMonthPrevious.addEventListener('click', () => this.previousMonth());
    // месяц вперед
    this.cMonthNext.addEventListener('click', () => this.nextMonth());
    // год назад
    this.cYearPrev.addEventListener('click', () => this.previousYear());
    // год вперед
    this.cYearNext.addEventListener('click', () => this.nextYear());
    // установка даты в текстовое поле:
    this.tBody.addEventListener('click', event => {
      if (event.target.classList.contains('date-cell')) {
        this.selectDate(event);
      }
    });
  }

  // Открытие календаря:
  open() {
    if (!this.wrap.classList.contains('open')) {
      this.curDate = new Date();
      this.setStartDate();
      this.wrap.classList.add('open');
      document.addEventListener('click', this.hide);
    }
  }

  // Запись выбранной даты в value объекта:

  writeValue = function(value = '') {
    this.wrap.value = value;
  }

  // Установка даты, на которой следует открыть календарь:
  setStartDate() {
    var date = this.getStartDate();
    if (!date && this.input.dataset.begin) {
      date = this.getStartDate(this.input.dataset.begin);
    }
    date = date || new Date();
    this.startDate = date;
    this.currentYear = date.getFullYear();
    this.currentMonth = date.getMonth();
    this.updateCalendar();
  }

  // Получение даты, на которой следует открыть календарь:
  getStartDate(string) {
    if (!string) {
      var inputValue = this.input.value.replace(/\s/g, '');
    }
    var date = this.convertInDate(string || inputValue);
    if (!string) {
      if (date) {
        this.selectedDate = date;
        this.writeValue(inputValue);
        this.input.dispatchEvent(new CustomEvent('change', {'detail': 'calendar', 'bubbles': true}));
      } else if (this.selectedDate) {
        this.selectedDate = undefined;
        this.writeValue();
        this.input.dispatchEvent(new CustomEvent('change', {'detail': 'calendar', 'bubbles': true}));
      }
    }
    return date;
  }

  // Преобразование строки в дату:
  convertInDate(string) {
    if (!string || string.length !== 10) {
      return;
    }
    var date = getDateObj(string, 'dd.mm.yyyy');
    if (date && date.getFullYear() < '1900') {
      return;
    }
    return date;
  }

  // Скрытие календаря:
  hide = event => {
    if (event && (document.activeElement === this.input || event.target.closest('.calendar-wrap') === this.wrap)) {
      return;
    }
    this.wrap.classList.remove('open');
    document.removeEventListener('click', this.hide);
  }

  // Очистка календаря:
  clear() {
    this.input.value = '';
  }

  // Создание/обновление содержимого календаря:
  updateCalendar() {
    var year = this.currentYear,
        month = this.currentMonth;
    // кол-во дней в месяце
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    // название месяца в календаре
    this.cMonthNav.textContent = this.months[month] + ' ' + year;
    // первый день выбранного месяца
    var date = new Date(year, month, 1);
    // очищаем календарь
    this.tBody.innerHTML = '';

    // создание календаря динамически
    while (date.getDate() <= daysInMonth && month == date.getMonth()) {
      var row = document.createElement('tr');

      for (var j = 0; j < 7; j++) {
        // приводим отображение календаря к формату пн(0) - вс(6)
        var weekDay = date.getDay();
        if (weekDay === 0) {
          weekDay = 6;
        } else {
          weekDay = weekDay - 1;
        }

        // заполняем календарь
        if (j == weekDay && month == date.getMonth()) {
          var cell = document.createElement('td'),
              cellText = document.createTextNode(date.getDate());
          this.markCurDate(cell, date);
          this.markSelectedDate(cell, date);
          cell.classList.add('date-cell');
          cell.appendChild(cellText);
          row.appendChild(cell);
          date.setDate(date.getDate() + 1);
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

  // Отметить текущую дату:
  markCurDate(cell, date) {
    if (this.currentYear === this.curDate.getFullYear() &&
      this.currentMonth === this.curDate.getMonth() &&
      date.getDate() === this.curDate.getDate()
    ) {
      cell.classList.add('dt-today');
    }
  }

  // Отметить выбранную дату:
  markSelectedDate(cell, date) {
    if (!this.selectedDate) {
      return;
    }
    if (this.currentYear === this.selectedDate.getFullYear() &&
      this.currentMonth === this.selectedDate.getMonth() &&
      date.getDate() === this.selectedDate.getDate()
    ) {
      cell.classList.add('dt-active');
    }
  }

  // Работа кнопки месяц назад
  previousMonth() {
    this.currentYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
    this.currentMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
    this.updateCalendar();
  }

  // Работа кнопки месяц вперед
  nextMonth() {
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

  // Установка даты в текстовое поле:
  selectDate(event) {
    this.selectedDate = new Date(this.currentYear, this.currentMonth, event.target.textContent);
    this.tBody.querySelectorAll('.dt-active').forEach(el => el.classList.remove('dt-active'));
    event.target.classList.add('dt-active');
    this.input.value =
      this.formateTwoDigitNumber(this.selectedDate.getDate()) + '.' +
      this.formateTwoDigitNumber(this.selectedDate.getMonth() + 1) + '.' +
      this.selectedDate.getFullYear();
      this.input.dispatchEvent(new CustomEvent('change', {'detail': 'calendar', 'bubbles': true}));
    this.writeValue(this.input.value);
    this.hide();
  }

  // Вспомогательный метод для форматирования чисел меньше 10
  formateTwoDigitNumber(num) {
    return ('0' + num).slice(-2);
  }
}

// Класс календаря для выбора периода:

class CalendarRange extends Calendar {
  constructor(obj) {
    super(obj);
  }

  // Получение даты, на которой следует открыть календарь:
  getStartDate(string) {
    var result = [],
        isString = string ? true : false;
    if (!string) {
      string = this.input.value.replace(/\s/g, '');
    }
    if (string.length > 10) {
      string = string.split('-');
      string.forEach(el => result.push(this.convertInDate(el)));
    } else {
      result.push(this.convertInDate(string));
    }
    result = result.filter(el => el);
    if (!isString) {
      if (result.length) {
        this.dateFrom = result[0];
        if (result[1] > this.dateFrom) {
          this.dateTo = result[1];
          this.input.dispatchEvent(new CustomEvent('change', {'detail': 'calendar', 'bubbles': true}));
          this.writeValue(string);
        } else {
          this.dateTo = undefined;
        }
      } else if (this.dateFrom) {
        this.dateFrom = undefined;
        this.dateTo = undefined;
        this.writeValue();
        this.input.dispatchEvent(new CustomEvent('change', {'detail': 'calendar', 'bubbles': true}));
      }
    }
    return result[0];
  }

  // Отметить выбранную дату/период:
  markSelectedDate(cell, date) {
    if (!this.dateFrom) {
      return;
    }
    if (this.currentYear === this.dateFrom.getFullYear() &&
      this.currentMonth === this.dateFrom.getMonth() &&
      date.getDate() === this.dateFrom.getDate()
    ) {
      cell.classList.add('dt-active');
      return;
    }
    if (!this.dateTo) {
      return;
    }
    if (this.currentYear === this.dateTo.getFullYear() &&
      this.currentMonth === this.dateTo.getMonth() &&
      date.getDate() === this.dateTo.getDate()
    ) {
      cell.classList.add('dt-active');
      return;
    }
    if (date > this.dateFrom && date < this.dateTo) {
      cell.classList.add('dt-between');
    }
  }

  // Установка даты в текстовое поле:
  selectDate(event) {
    if (!this.dateFrom || (this.dateFrom && this.dateTo)) {
      this.dateFrom = new Date(this.currentYear, this.currentMonth, event.target.textContent);
      if (this.dateFrom && this.dateTo) {
        this.dateTo = undefined;
      }
      this.tBody.querySelectorAll('.date-cell').forEach(el => el.classList.remove('dt-active', 'dt-between'));
      event.target.classList.add('dt-active');
      this.input.value =
        this.formateTwoDigitNumber(this.dateFrom.getDate()) + '.' +
        this.formateTwoDigitNumber(this.dateFrom.getMonth() + 1) + '.' +
        this.dateFrom.getFullYear();
        return;
    }
    if (!this.dateTo) {
      this.dateTo = new Date(this.currentYear, this.currentMonth, event.target.textContent);
      if (this.dateTo <= this.dateFrom) {
        this.dateTo = undefined;
        return;
      }
      this.tBody.querySelectorAll('.date-cell').forEach(cell => {
        var date = new Date(this.currentYear, this.currentMonth, cell.textContent);
        this.markSelectedDate(cell, date)
      });
      this.input.value =
        this.formateTwoDigitNumber(this.dateFrom.getDate()) + '.' +
        this.formateTwoDigitNumber(this.dateFrom.getMonth() + 1) + '.' +
        this.dateFrom.getFullYear() + ' - ' +
        this.formateTwoDigitNumber(this.dateTo.getDate()) + '.' +
        this.formateTwoDigitNumber(this.dateTo.getMonth() + 1) + '.' +
        this.dateTo.getFullYear();
        this.input.dispatchEvent(new CustomEvent('change', {'detail': 'calendar', 'bubbles': true}));
      this.writeValue(this.input.value.replace(/\s/g, ''));
      this.hide();
    }
  }
}
