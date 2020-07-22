'use strict';

function startClaimPage() {
  sendRequest(`../json/recls_data.json`)
  .then(result => {
    var data = JSON.parse(result);
    loader.hide();
    if (data) {
      window['reclamationsData'] = data;
    }
    var settings = {
      data: data,
      head: true,
      result: false,
      trFunc: 'onclick=directRecl()',
      cols: [
        {
          key: 'num',
          title: '№',
          sort: 'text',
          filter: 'search'
        }, {
          key: 'date',
          title: 'Дата',
          sort: 'date'
        }, {
          key: 'name',
          title: 'Наименование/Артикул',
          sort: 'text',
          filter: 'search'
        }, {
          key: 'manager',
          title: 'Менеджер',
          sort: 'text',
          filter: 'full'
        }, {
          key: 'status-str',
          title: 'Статус',
          sort: 'text',
          filter: 'full',
          content: '<div class="status-wr"><div class="pill #status#">#status-str#</div></div>'
        }
      ]
    };
    initTable('#recls-table', settings);
  })
  .catch(err => {
    console.log('err');
    loader.hide();
    initTable('#recls-table', settings);
  });
}

startClaimPage();


function directRecl() {
  document.location.href = "/reclamation";
}
