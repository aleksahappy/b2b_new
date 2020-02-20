'use strict';
//Переключатель "Товары/Оплаты"
const productsBtn = document.querySelector('#productsBtn');
const paymentBtn = document.querySelector('#paymentBtn');
const paymentTab = document.querySelector('#paymentTab');
const productsTab = document.querySelector('#productsTab');

productsBtn.addEventListener('click', function() {
  productsBtn.classList.add('toggle-active');
  paymentBtn.classList.remove('toggle-active');
  productsTab.style.display = 'flex';
  paymentTab.style.display = 'none';
});

paymentBtn.addEventListener('click', function() {
  paymentBtn.classList.add('toggle-active');
  productsBtn.classList.remove('toggle-active');
  paymentTab.style.display = 'flex';
  productsTab.style.display = 'none';
});


//Слайдер с ползунками

//setTimeout(init2slider('range', 'between', 'rb1', 'rb2'), 0);

const rangeSlider = () => {
//забираем нужные DOM-элементы для манипуляции
const range = document.querySelector('#range');//шкала
const between = document.querySelector('#between');//пройденная шкала
const rangeBtn1 = document.getElementById('rb1');//левый ползунок
const rangeBtn2 = document.getElementById('rb2');//правый ползунок

//работа левого ползунка
rangeBtn1.addEventListener('mousedown', function(evt) {
  let sliderCoords = getCoords(range);//размеры шкалы
  let betweenCoords = getCoords(between);//размеры пройденной шкалы
  let buttonCoords1 = getCoords(rangeBtn1);//размер левого ползунка
  let buttonCoords2 = getCoords(rangeBtn2);//размер правого ползунка
  let shiftX2 = evt.pageX - buttonCoords2.left;//размер смещения правого ползунка без размера кнопки
  let shiftX1 = evt.pageX - buttonCoords1.left;//размер смещения левого ползунка без размера кнопки


   document.onmousemove = function(evt) {
    let left1 = evt.pageX - shiftX1 - sliderCoords.left;//расстояние перетаскивания ползунка
    let right1 = range.offsetWidth - rangeBtn1.offsetWidth;//длина шкалы без ширины левого ползунка

    //условия, чтобы ползунок не выходил за пределы диапазона
    if (left1 < 0) left1 = 0;
    if (left1 > right1) left1 = right1;

    //перемещение самого ползунка
    rangeBtn1.style.marginLeft = left1 + 'px';

    shiftX2 = evt.pageX - buttonCoords2.left;//отслеживание смещения правого ползунка
    let left2 = evt.pageX - shiftX2 - sliderCoords.left;
    let right2 = range.offsetWidth - rangeBtn2.offsetWidth;

    console.log(left1);
    //console.log(left2);

    if (left1 > left2) {
      between.style.width = '0';
      //between.style.marginLeft = left2 + 'px';
      rangeBtn1.style.marginLeft = left2 - 20 + 'px';
    }
    else{
      between.style.width = (left2-left1) + 'px';
      between.style.marginLeft = left1 + 'px';
    }
  };
  document.onmouseup = function() {
      document.onmousemove = document.onmouseup = null;
  };
  return false;

});


//работа правого ползунка
rangeBtn2.addEventListener('mousedown', function(evt) {
  let sliderCoords = getCoords(range);//размеры шкалы
  let betweenCoords = getCoords(between);//размеры пройденной шкалы
  let buttonCoords1 = getCoords(rangeBtn1);//размер левого ползунка
  let buttonCoords2 = getCoords(rangeBtn2);//размер правого ползунка
  let shiftX2 = evt.pageX - buttonCoords2.left;//размер смещения правого ползунка без размера кнопки
  let shiftX1 = evt.pageX - buttonCoords1.left;//размер смещения левого ползунка без размера кнопки


   document.onmousemove = function(evt) {
    let left2 = evt.pageX - shiftX2 - sliderCoords.left;//расстояние перетаскивания ползунка
    let right2 = range.offsetWidth - rangeBtn2.offsetWidth;//длина шкалы без ширины левого ползунка

    //условия, чтобы ползунок не выходил за пределы диапазона
    if (left2 < 0) left2 = 0;
    if (left2 > right2) left2 = right2;

    //перемещение самого ползунка
    rangeBtn2.style.marginLeft = left2 + 'px';

    shiftX1 = evt.pageX - buttonCoords1.left;//отслеживание смещения правого ползунка
    let left1 = evt.pageX - shiftX1 - sliderCoords.left;
    let right1 = range.offsetWidth - rangeBtn1.offsetWidth;

    console.log(left1);
    console.log(left2);

    if (left1 > left2) {
      between.style.width = '0';
      //between.style.marginLeft = left2 + 'px';
      rangeBtn2.style.marginLeft = left1 + 20 + 'px';
    }
    else{
      between.style.width = (left2-left1) + 'px';
      between.style.marginLeft = left1 + 'px';
    }
  };
  document.onmouseup = function() {
      document.onmousemove = document.onmouseup = null;
  };
  return false;

});

rangeBtn1.ondragstart = function() {
    return false;
};
rangeBtn2.ondragstart = function() {
    return false;
};


function getCoords(elem){
  let box = elem.getBoundingClientRect();
  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  }
};
};

rangeSlider();
