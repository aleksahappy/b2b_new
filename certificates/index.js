'use strict';

startCertPage();

function startCertPage() {
  // sendRequest(`${urlRequest.api}files/files.php?type=cert`)
  sendRequest(urlRequest.main, {action: 'files', data: {type: 'cert'}})
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
