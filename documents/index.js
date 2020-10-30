'use strict';

// Запускаем рендеринг страницы документов:

startDocsPage();

// Запуск страницы документов:

function startDocsPage() {
  // sendRequest(`../json/documents.json`)
  sendRequest(urlRequest.main, {action: 'files', data: {type: 'docs'}})
  .then(result => {
    var data = JSON.parse(result);
    initPage(data);
  })
  .catch(error => {
    console.log(error);
    loader.hide();
    alerts.show('Во время загрузки страницы произошла ошибка. Попробуйте позже.');
  });
}

// Инициализация страницы:

function initPage(data) {
  if (!data || !data.length) {
    return;
  }
  var settings = {
    data: data,
    head: true,
    result: false,
    cols: [{
      title: 'Наименование',
      key: 'file_name',
      content: `<div class="row">
                  <a href="https://new.topsports.ru/api.php?action=files&type=docs&id=#id#" target="_blank">
                    <div class="download icon"></div>
                  </a>
                  <div><a href="https://new.topsports.ru/api.php?action=files&type=docs&mode=view&id=#id#" target="_blank">#title#</a></div>
                </div>`
    }]
  }
  initTable('#docs', settings);
  loader.hide();
}
