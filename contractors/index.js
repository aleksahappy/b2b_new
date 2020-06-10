'use strict';

var addContraBtn = document.querySelector('#addContraBtn');
var contraModal = document.querySelector('#contraModal');
var closeContraModal = document.querySelector('#addContra .close-btn');

addContraBtn.addEventListener('click', () => {
  contraModal.style.display = 'block';
});

closeContraModal.addEventListener('click', () => {
  contraModal.style.display = 'none';
});
