'use strict';

// Запускаем рендеринг страницы рекламации:

startReclPage();

// Запуск страницы рекламации:

function startReclPage() {
  // sendRequest(urlRequest.main, {action: 'recl', data: {recl_id: document.location.search.replace('?', '')}})
  sendRequest(`../json/reclamation.json`)
  .then(result => {
    var data = JSON.parse(result);
    console.log(data);
    initPage(data);
  })
  .catch(error => {
    console.log(error);
    // location.href = '/err404.html';
  });
}

// Инициализация страницы:

function initPage(data) {
  includeHTML();
  fillTemplate({
    area: '#main',
    items: data.recl
  });
  loader.hide();
}

// Загрузка документов:

function uploadFiles() {

}

