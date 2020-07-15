'use strict';
startDocsPage();

function startDocsPage() {
  sendRequest(`../json/data_documents.json`)
  // sendRequest(urlRequest.main, {action: 'files', data: {type: 'docs'}})
  .then(result => {
    console.log(result);
    var data = JSON.parse(result);
    loader.hide();
    data = convertData(data);
    console.log(data);
    var settings = {
        data: data,
        head: true,
        result: false,
        cols: [{
          key: 'file_name',
          title: 'Наименование',
          content: `<div class="row">
                      <a href="http://api.topsports.ru/files/files.php?type=docs&id=#id#" target="_blank">
                        <div class="download icon"></div>
                    	</a>
                      <div><a href="http://api.topsports.ru/files/files.php?type=docs&mode=view&id=#id#" target="_blank">#title#</a></div>
                    </div>`
        }]
      }
      initTable('docs-table', settings);
  })
  .catch(err => {
    loader.hide();
    console.log(err);
  });
}
