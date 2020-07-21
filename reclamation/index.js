'use strict';
var headPan = document.querySelector('.row.head-pan');
var closeChat = document.querySelector('.close-chat');
var chatWrap = document.querySelector('.chat-wrap');
var progressBar = document.querySelector('.progress-bar');
var progressTitle = document.querySelectorAll('.progress-title');
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
    if (key === 'status1' || key === 'status2' || key === 'status3') {
      reclState[key] = data[key];
    }
  }
}


function putReclStatus() {
  var progressBar = document.querySelector('.progress-bar');
  var result = document.querySelector('.point.result');
  var resultTitle = result.closest('progress-title');
  var done = document.querySelector('.point.undone');
  var parentDone = done.closest('.progress-item');
  var progressItems = document.querySelectorAll('.progress-item');

  for (let prop in reclState) {
    if (reclState[prop] === '1') {

      if (prop === 'status1') {
        console.log('Do something with status1');
      }
      if (prop === 'status2') {
        console.log('Do something with status2');
        result.className = 'point denied';
        progressBar.removeChild(parentDone);
        for (let i = 0; i < progressItems.length; i++) {
          var resultTitle = progressItems[2].querySelector('.progress-title');
          resultTitle.innerHTML = 'Не удоволетворена';
          resultTitle.classList.remove('non-active');
          resultTitle.classList.add('denied');
        }
      }
      if (prop === 'status3') {
        console.log('Do something with status3');
        result.className = 'point accepted';
        done.className = 'point done';
        for (let i = 0; i < progressItems.length; i++) {
          var statusTitle = progressItems[2].querySelector('.progress-title');
          var resultTitle = progressItems[3].querySelector('.progress-title');
          statusTitle.innerHTML = 'Удоволетворена';
          statusTitle.classList.add('accepted');
          resultTitle.classList.remove('non-active');
        }
      }
    }
  }
}


function setChatPos() {
  var headPanCoords = headPan.getBoundingClientRect();
  chatWrap.style.top = headPanCoords.top + headPan.offsetHeight + 'px';
}
setChatPos();


// function setTitleRight() {
//   var result = 0;
//   for (let i = 0; i < progressTitle.length; i++) {
//     var closestIc = progressTitle[i].nextElementSibling.nextElementSibling;
//     result = (progressTitle[i].offsetWidth + closestIc.offsetWidth);
//   }
//   console.log(result);
// }
// setTitleRight();
//
//
// function getRightPos(title, icon) {
//   var right = (title.offsetWidth - icon.offsetWidth) / 2;
//   return '-' + right + 'px';
// }
