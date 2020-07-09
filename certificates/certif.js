'use strict';
'use strict';
console.log('test');


function startCertPage() {
  sendRequest(`${urlRequest.api}files/files.php?type=cert`)
  .then(result => {
    var data = JSON.parse(result);
    console.log(data);
    loader.hide();
    var cerfData =  {
      area: 'certif-data',
      items: data
    };
    fillTemplate(cerfData);

  })
  .catch(err => {
    console.log(err);
  });
}
startCertPage();
