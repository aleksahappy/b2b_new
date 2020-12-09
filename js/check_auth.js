'use strict';

// Основные настройки и данные:

var local = 0,
    urlRequest,
    userInfo;

if (local) {
  urlRequest = {
    main: 'http://new.loc/api.php',
    new: 'http://new.loc/',
    api: 'http://api.loc/'
  }
} else {
  urlRequest = {
    main: 'https://new.topsports.ru/api.php',
    new: 'https://new.topsports.ru/',
    api: 'https://api.topsports.ru/'
  }
}

// Проверка авторизован ли пользователь:

// (function(){
//   var path = location.pathname.replace('index.html', '').replace(/\//g, '').replace('registr', ''),
//       xhr = new XMLHttpRequest();
//   xhr.open('POST', urlRequest.main, false);
//   try {
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.send(JSON.stringify({action: 'checkauth'}));
//     if (xhr.status !== 200) {
//       console.log(`Ошибка ${xhr.status}: ${xhr.statusText}`);
//       throw new Error(`Ошибка ${xhr.status}: ${xhr.statusText}`);
//     } else {
//       var result = JSON.parse(xhr.response);
//       if (result.login) {
//         userInfo = result;
//         if (!path) {
//           location.href = '/dashboard';
//         }
//       } else {
//         if (path) {
//           location.href = `/?${location.href}`;
//         }
//       }
//     }
//   } catch(err) {
//     console.log(err);
//     if (path) {
//       location.href = `/?${location.href}`;
//     }
//   }
// })();
