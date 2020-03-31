'use strict';

//'Payments' chart
google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(drawChart);
function drawChart() {
  let data = google.visualization.arrayToDataTable([
    ['Task', ''],
    ['Товар в наличии', 120000],
    ['ДЗ', 30000]
  ]);

  let options = {
    title: '',
    pieHole: 0.8,
    colors: ['#DFA12A', '#E7575F'],
    legend: {
      position: 'none'
    },
    chartArea: {
      width: '100%'
    },
    pieSliceText: 'value',
    pieSliceTextStyle: {
      color: '#34495E',
      fontSize: 20
    }

  };

  let chart = new google.visualization.PieChart(document.getElementById('donutchart'));
  chart.draw(data, options);
}

//'Products' chart
// google.charts.load("current", { packages: ["corechart"] });
// google.charts.setOnLoadCallback(drawChart1);
// function drawChart1() {
//   let data = google.visualization.arrayToDataTable([
//     ['Task', 'Hours per Day'],
//     ['Work', 11],
//     ['Eat', 2],
//     ['Commute', 2],
//     ['Watch TV', 2],
//     ['Sleep', 7]
//   ]);

//   let options = {
//     title: 'My Daily Activities',
//     pieHole: 0.4,
//   };

//   let chart = new google.visualization.PieChart(document.getElementById('donutchart1'));
//   chart.draw(data, options);
// }