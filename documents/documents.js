'use strict';
console.log('test');


function startDocsPage() {
  sendRequest(`${urlRequest.api}files/files.php?type=docs`)
  .then(result => {
    var data = JSON.parse(result);
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
          //content: '<div class="toggle #access#" onclick="toggle(event)"><div class="toggle-in"></div></div>'
        }]
      }
      initTable('docs-table', settings);
  })
  .catch(err => {
    console.log(err);
  });
}
startDocsPage();
