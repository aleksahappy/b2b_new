'use strict';

var addContraBtn = document.querySelector('#addContraBtn');
var addContraBtnMob = document.querySelector('#addContraBtnMob');
var contraModal = document.querySelector('#contraModal');
var closeContraModal = document.querySelector('#addContra .close-btn');

function contraModalWin() {
  addContraBtn.addEventListener('click', () => {
    contraModal.style.display = 'block';
  });

  addContraBtnMob.addEventListener('click', () => {
    contraModal.style.display = 'block';
  });

  closeContraModal.addEventListener('click', () => {
    contraModal.style.display = 'none';
  });

  contraModal.addEventListener('click', function (event) {
      if (event.target === this) {
        contraModal.style.display = 'none';
      }
  });

  window.addEventListener('keydown', function (event) {
      if(event.key === 'Escape') {
        contraModal.style.display = 'none';
      }
  });

}
contraModalWin();
