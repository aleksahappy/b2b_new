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

userInfo = {login: "TS00000905", name: "Александра", lastname: "Чаплыгина", parentname: "Николаевна", super_user: 1}
// userInfo = {login: "TS00000905", name: "Александра", lastname: "Чаплыгина", parentname: "Николаевна"}

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
//       if (xhr.response) {
//         var result = JSON.parse(xhr.response);
//         if (result.login) {
//           userInfo = result;
//           if (!path) {
//             location.href = '/dashboard';
//           }
//         } else {
//           throw new Error('Неверный ответ на авторизацию.');
//         }
//       } else {
//         throw new Error('Ответ на авторизацию не получен.');
//       }
//     }
//   } catch(error) {
//     // console.log(error);
//     if (path) {
//       location.href = `/?${location.href}`;
//     }
//   }
// })();
