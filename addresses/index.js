'use strict';
var shops = document.querySelector('.shops');


// setWidth(shops, 440)
//initDropDown('#sys-type');
initForm('#new-address-modal')

function startAddrPage() {
  sendRequest(`../json/addresses.json`)
  .then(result => {
    var data = JSON.parse(result);
    loader.hide();
    console.log(data);
    var addrData = {
      area: '#shop',
      items: data,
      sign: '@@',
      sub:[{
        area: '.time-block',
        items: 'time'
      }]
    };
    fillTemplate(addrData);
  })
  .catch(err => {
    console.log(err);
    loader.hide();
  });
}
startAddrPage();


function setWidth(el, num) {
  el.style.width = num + 'px';
}


//  Показывает/скрывает блок внутри главного блока, который по умолчанию скрыт

function toggleInnerBlock(event) {
  var parent = event.target.closest('.toggle-block');
  var targetBlock = parent.querySelector('.target-block');

  if (targetBlock) {
    targetBlock.classList.toggle('displayNone');
  }
}


function toggleOuterBlock(el) {
  if (event.target.className === 'edit icon') {
    return;
  }
  if (el.classList.contains('outer')) {
    var parentEl = el.parentElement;
    var outerTarget = parentEl.querySelector('.outer-target');
    outerTarget.classList.toggle('displayNone');
  }
}
