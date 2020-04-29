'use strict';

// checkAuth();

//=====================================================================================================
// Авторизация на сайте при загрузке страницы:
//=====================================================================================================

// Проверка авторизован ли пользователь:

function checkAuth() {
  var path = location.pathname.replace('index.html', '').replace(/\//g, '');
  if (path === '' && location.search === '?error=1') {
    var error = document.getElementById('error');
    if (error) {
      error.style.display = 'block';
    }
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://new.topsports.ru/api/check_auth.php', false);
    try {
      xhr.send();
      if (xhr.status != 200) {
        console.log(`Ошибка ${xhr.status}: ${xhr.statusText}`);
        new Error(`Ошибка ${xhr.status}: ${xhr.statusText}`);
      } else {
        console.log(xhr.response);
        var data = JSON.parse(xhr.response);
        if (data.ok) {
          if (path === '' || path === 'registr') {
            location.href = '/desktop';
          } else {
            window.userInfo = data.user_info;
          }
        } else {
          if (path !== '') {
           location.href = '/';
          }
        }
      }
    } catch(err) {
      console.log(err);
      if (path !== '') {
        location.href = '/';
      }
    }
  }
}
