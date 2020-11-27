'use strict';

// Запуск страницы документов:

startDocsPage();

function startDocsPage() {
  // sendRequest(`../json/documents.json`)
  sendRequest(urlRequest.main, {action: 'files', data: {type: 'docs'}})
  .then(result => {
    if (result) {
      var data = JSON.parse(result);
    }
    initPage(data);
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage(data = []) {
  var settings = {
    data: data,
    desktop: {
      head: true,
      result: false,
      cols: [{
        title: 'Наименование',
        keys: ['file_name'],
        content: `<div class="row">
                    <a href="https://new.topsports.ru/api.php?action=files&type=docs&id=#id#" target="_blank">
                      <div class="download icon"></div>
                    </a>
                    <div><a href="https://new.topsports.ru/api.php?action=files&type=docs&mode=view&id=#id#" target="_blank">#title#</a></div>
                  </div>`
      }]
    }
  }
  initTable('#docs', settings);
  loader.hide();
}
