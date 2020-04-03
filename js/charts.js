'use strict';
let inValue = [120000000, 30000000];
let inAmount = [20000, 5000];

//payment chart
const paymentChart = () => {
  const ctx = document.getElementById('myChart').getContext('2d');
  const chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'doughnut',

      // The data for our dataset
      data: {
          labels: ['', ''],
          datasets: [{
              label: false,
              backgroundColor: ['#DFA12A', '#E7575F'],
              borderColor: 'transparent',
              data: [inValue[0], inValue[1]]
          }]
      },

      // Configuration options go here
      options: {
        cutoutPercentage: 80,
        legend: {
          display: false
        }
      }
  });

  //display payment chart info
  const donutSum = document.querySelector('.donut-sum');
  const freeProduct = document.querySelector('.free-product');
  const deptSum = document.querySelector('.dept-sum');

  freeProduct.innerHTML = inValue[0] + ' р.';
  deptSum.innerHTML = inValue[1] + ' р.';
  let sum = inValue[0] + inValue[1];
  donutSum.innerHTML = sum + ' р.';

};

//products chart
const productsChart = () => {
  const ctx = document.getElementById('myChart1').getContext('2d');
  const chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'doughnut',

      // The data for our dataset
      data: {
          labels: ['', ''],
          datasets: [{
              label: false,
              backgroundColor: ['#2A659D', '#DFA12A'],
              borderColor: 'transparent',
              data: [inValue[0], inValue[1]]
          }]
      },

      // Configuration options go here
      options: {
        cutoutPercentage: 80,
        legend: {
          display: false
        }
      }
  });

  //display payment chart info
  const donutSum1 = document.querySelector('#donut-sum1');
  const stockProduct = document.querySelector('.stock-product');
  const stockSum = document.querySelector('.stock-sum');

  stockProduct.innerHTML = inAmount[0] + ' шт.';
  stockSum.innerHTML = inAmount[1] + ' шт.';
  let sum = inAmount[0] + inAmount[1];
  donutSum1.innerHTML = sum + ' шт.';

};





paymentChart();
productsChart();