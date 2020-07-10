'use strict';

// Авторизация на сайте:

function logIn(event) {
  event.preventDefault();

  var formData = new FormData(document.getElementById('log-in')),
      data = {action: 'login', data: {}};
  formData.forEach((value, key) => {
    data.data[key] = value;
  });

  var request = new XMLHttpRequest();
  request.addEventListener('error', () => showError('Произошла ошибка, попробуйте позже'));
  request.addEventListener('load', () => {
    if (request.status !== 200) {
      showError('Произошла ошибка, попробуйте позж');
    } else {
      var result = JSON.parse(request.response);
      if (result.ok) {
        location.href = '/dashboard';
      } else {
        showError('Пользователь не найден');
      }
    }
  });
  request.open('POST', 'https://new.topsports.ru/api.php');
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.send(JSON.stringify(data));
}

// Отображение ошибки на странице авторизации:

function showError(text) {
  var error = document.getElementById('error');
  error.textContent = text;
  error.style.display = 'block';
}