'use strict';
var headPan = document.querySelector('.row.head-pan');
var closeChat = document.querySelector('.close-chat');
var chatWrap = document.querySelector('.chat-wrap');
var progressBar = document.querySelector('.progress-bar');
var progressItems = document.querySelectorAll('.progress-item');
var reclState = {};


function startReclPage() {
  sendRequest(`../json/recl_data.json`)
  .then(result => {
    var data = JSON.parse(result);
    loader.hide();
    var reclData = {
      area: '#recl',
      items: data,
      sign: '@@'
    };
    fillTemplate(reclData);
    getReclStatus(data);
    putReclStatus();
  })
  .catch(err => {
    console.log(err);
    loader.hide();
  });
}
startReclPage();

//закрыть окно чата

closeChat.addEventListener('click', function() {
    chatWrap.style.display = 'none';
});


function getReclStatus(data) {
  for (let key in data) {
    if (key === 'status1' || key === 'status2' || key === 'status3' || key === 'status4') {
      reclState[key] = data[key];
    }
  }
}


function putReclStatus() {
  var refundBtn = document.querySelector('#refund-btn');
  var progressBar = document.querySelector('.progress-bar');
  var process = document.querySelector('.point.wait');
  var result = document.querySelector('.point.result');
  var resultTitle = result.closest('progress-title');
  var done = document.querySelector('.point.undone');
  var parentDone = done.closest('.progress-item');
  var progressItems = document.querySelectorAll('.progress-item');

  for (let prop in reclState) {
    if (reclState[prop] === '1') {

      if (prop === 'status1') {
        console.log('Do something with status1');
        refundBtn.className = 'sub-act btn disabled';
      }

      if (prop === 'status2') {
        console.log('Do something with status2');
        refundBtn.className = 'btn act';
        process.className = 'point process';
        for (let i = 0; i < progressItems.length; i++) {
          var processTitle = progressItems[1].querySelector('.progress-title');

          processTitle.classList.remove('non-active');
          processTitle.classList.add('active');
        }
      }

      if (prop === 'status3') {
        console.log('Do something with status3');
        refundBtn.className = 'btn act';
        process.className = 'point process';
        result.className = 'point denied';
        progressBar.removeChild(parentDone);
        for (let i = 0; i < progressItems.length; i++) {
          var processTitle = progressItems[1].querySelector('.progress-title');
          var resultTitle = progressItems[2].querySelector('.progress-title');

          processTitle.classList.remove('non-active');
          processTitle.classList.add('active');
          resultTitle.innerHTML = 'Не удоволетворена';
          resultTitle.classList.remove('non-active');
          resultTitle.classList.add('denied');
        }
      }

      if (prop === 'status4') {
        console.log('Do something with status4');
        refundBtn.className = 'btn act';
        process.className = 'point process';
        result.className = 'point accepted';
        done.className = 'point done';
        for (let i = 0; i < progressItems.length; i++) {
          var processTitle = progressItems[1].querySelector('.progress-title');
          var statusTitle = progressItems[2].querySelector('.progress-title');
          var resultTitle = progressItems[3].querySelector('.progress-title');

          processTitle.classList.remove('non-active');
          processTitle.classList.add('active');
          statusTitle.innerHTML = 'Удоволетворена';
          statusTitle.classList.add('accepted');
          resultTitle.classList.remove('non-active');
        }
      }
    }
  }
}


function setChatPos() {
  var chat = document.querySelector('.chat-wrap');
  chatWrap.style.top = (window.innerHeight - chat.offsetHeight) + 'px';
}
//setChatPos();
