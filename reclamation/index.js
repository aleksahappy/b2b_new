'use strict';
var closeChat = document.querySelector('.close-chat');
var chatWrap = document.querySelector('.chat-wrap');


function startReclPage() {
  loader.hide();
  testPanelWork();
}
startReclPage();

//закрыть окно чата

closeChat.addEventListener('click', function() {
    chatWrap.style.display = 'none';
});


//  Функция для работы тестовой панели

function testPanelWork() {
  /* test */
  var test = document.querySelector('.test-wrap');
  var closeTest = document.querySelector('.test-close');
  var btn1 = document.querySelector('.first');
  var btn2 = document.querySelector('.second');
  var btn3 = document.querySelector('.third');
  var btn4 = document.querySelector('.fourth');
  var progressItem = document.querySelectorAll('.progress-item');
  var progressBar = document.querySelector('.progress-bar');
  var refundBtn = document.querySelector('#refund-btn');

  /* состояние 1 */
  btn1.addEventListener('click', function() {
    refundBtn.classList.remove('refund-btn');

    for (let i = 0; i < progressItem.length; i++) {

      var point1 = progressItem[1].querySelector('.point');
      point1.classList.remove('inprogress-active');
      point1.classList.add('inProgress-progress');
      var text1 = progressItem[1].querySelector('.progress-title');
      text1.style.color = '#000000';
      var line1 = progressItem[1].querySelector('.line');
      line1.removeAttribute('style');

      var point2 = progressItem[2].querySelector('.point');
      point2.classList.remove('cancel-progress');
      point2.classList.add('solution-progress');
      point2.classList.remove('approved-progress');
      var text2 = progressItem[2].querySelector('.progress-title');
      text2.innerHTML = 'Решение';
      text2.style.color = '#9A9A9A';
      var line22 = progressItem[2].querySelector('.line');
      line22.removeAttribute('style');

      var line2 = progressItem[3].querySelector('.line');
      line2.classList.remove('undone');
      var point3 = progressItem[3];
      progressBar.appendChild(point3);
      var point33 = progressItem[3].querySelector('.point');
      point33.classList.remove('done-progress-active');
      point33.classList.add('done-progress');
      var line3 = progressItem[3].querySelector('.line');
      line3.classList.remove('undone');
      line3.removeAttribute('style');
      var text3 = progressItem[3].querySelector('.progress-title');
      text3.removeAttribute('style');
    }
  });

  /* состояние 2 */
  btn2.addEventListener('click', function() {
    refundBtn.classList.add('refund-btn');


    for (var i = 0; i < progressItem.length; i++) {

      var point1 = progressItem[1].querySelector('.point');
      point1.classList.remove('inprogress-active');
      point1.classList.add('inProgress-progress');
      var text1 = progressItem[1].querySelector('.progress-title');
      text1.style.color = '#000000';
      var line1 = progressItem[1].querySelector('.line');
      line1.removeAttribute('style');

      var point2 = progressItem[2].querySelector('.point');
      point2.classList.remove('cancel-progress');
      point2.classList.remove('approved-progress');
      point2.classList.add('solution-progress');
      var text2 = progressItem[2].querySelector('.progress-title');
      text2.innerHTML = 'Решение';
      text2.style.color = '#9A9A9A';
      var line22 = progressItem[2].querySelector('.line');
      line22.removeAttribute('style');

      var point3 = progressItem[3];
      progressBar.appendChild(point3);
      var line3 = progressItem[3].querySelector('.line');
      line3.classList.add('undone');
      line3.removeAttribute('style');
      var point33 = progressItem[3].querySelector('.point');
      point33.classList.remove('done-progress-active');
      point33.classList.add('done-progress');
      var text3 = progressItem[3].querySelector('.progress-title');
      text3.removeAttribute('style');
    }

  });


  /* состояние 3 */
  btn3.addEventListener('click', function() {
    // console.log('test3');
    for (var i = 0; i < progressItem.length; i++) {


      var point1 = progressItem[1].querySelector('.point');
      point1.classList.remove('inProgress-progress');
      point1.classList.add('inprogress-active');
      var text1 = progressItem[1].querySelector('.progress-title');
      text1.style.color = '#D97E00';
      var line1 = progressItem[1].querySelector('.line');
      line1.style.borderColor = '#A89271';

      var point2 = progressItem[2].querySelector('.point');
      point2.classList.remove('solution-progress');
      point2.classList.remove('approved-progress');
      point2.classList.add('cancel-progress');
      var text2 = progressItem[2].querySelector('.progress-title');
      text2.innerHTML = 'Не удоволетворена';
      text2.style.color = '#D10D17';
      var line2 = progressItem[2].querySelector('.line');
      line2.style.borderColor = '#A89271';

      var point3 = progressItem[3];
      progressBar.removeChild(point3);
    }
  });

  /* состояние 4 */
  btn4.addEventListener('click', function () {
    console.log('test3');
    for (var i = 0; i < progressItem.length; i++) {

        var point1 = progressItem[1].querySelector('.point');
        point1.classList.remove('inProgress-progress');
        point1.classList.add('inprogress-active');
        var line1 = progressItem[1].querySelector('.line');
        line1.style.borderColor = '#A89271';

        var point2 = progressItem[2].querySelector('.point');
        point2.classList.remove('solution-progress');
        point2.classList.add('approved-progress');
        var text2 = progressItem[2].querySelector('.progress-title');
        text2.innerHTML = 'Удоволетворена';
        text2.style.color = '#378C22';
        var line2 = progressItem[2].querySelector('.line');
        line2.style.borderColor = '#A89271';

        var point33 = progressItem[3];
        progressBar.appendChild(point33);
        var point3 = progressItem[3].querySelector('.point');
        point3.classList.remove('done-progress');
        point3.classList.add('done-progress-active');
        var line3 = progressItem[3].querySelector('.line');
        line3.classList.add('undone');
        line3.style.borderColor = '#A89271';
        var text3 = progressItem[3].querySelector('.progress-title');
        text3.style.color = '#3E228C';
    }
  });

  /* скрыть панель до перезагрузки */
  closeTest.addEventListener('click', function() {
      test.style.display = 'none';
  });

}
