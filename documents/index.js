'use strict';

// Запуск страницы документов:

// getPageData('../json/documents.json')
getPageData(urlRequest.main, 'files', {type: 'docs'})
.then(result => {
  initPage(result);
  loader.hide();
});

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
        content:
        `<div class="row">
          <a href="../api.php?action=files&type=docs&id=#id#" target="_blank">
            <div class="download icon"></div>
          </a>
          <div><a href="../api.php?action=files&type=docs&mode=view&id=#id#" target="_blank">#title#</a></div>
        </div>`
      }]
    }
  }
  initTable('#docs', settings);
}
