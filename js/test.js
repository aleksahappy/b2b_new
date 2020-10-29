'use strict';

//=====================================================================================================
// Функции для презентации верстки с тестовыми json:
//=====================================================================================================

// Переключение состояния элементов на checked:

function toggle(event) {
  event.currentTarget.classList.toggle('checked');
}

// Случайное целое число от min до max:

function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}