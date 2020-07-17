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
    testRecl();
  })
  .catch(err => {
    console.log('err');
    loader.hide();
    initTable('#recls-table', settings);
  });
}

startClaimPage();


function testRecl() {
  var table = document.querySelector('#recls-table');
  var trs = table.querySelectorAll('tr');

  for (let i = 0; i < trs.length; i++) {
    trs[i].addEventListener('click', () => {
      document.location.href = "/reclamation";
    });
  }
}
