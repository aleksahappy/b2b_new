'use strict';

//  Работа универсального модального окна

function modalWin(btn, close, modal) {
  btn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  close.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', function (event) {
      if (event.target === this) {
        modal.style.display = 'none';
      }
  });

  window.addEventListener('keydown', function (event) {
      if(event.key === 'Escape') {
        modal.style.display = 'none';
      }
  });
}
