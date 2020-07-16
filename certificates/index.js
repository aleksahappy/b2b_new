'use strict';

startCertPage();

function startCertPage() {
  sendRequest(`../json/data_certificates.json`)
  // sendRequest(urlRequest.main, {action: 'files', data: {type: 'cert'}})
  .then(result => {
    var data = JSON.parse(result);
    console.log(data);
    loader.hide();
    var cerfData =  {
      area: '#certif-data',
      items: data
    };
    fillTemplate(cerfData);

  })
  .catch(err => {
    console.log(err);
  });
}
