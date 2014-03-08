function loadUtilHC(utildata) {
  $('#kwhChart').highcharts({
          chart: {
              type: 'bar'
          },
          title: {
              text: 'Dollar Cost per kWH',
              x: -20 //center
          },
          subtitle: {
            text: 'Source: www.nrel.gov',
            x: -20
          },
          colors : [
            '#00CC00'
          ],
          xAxis: {
              categories: [
                  'Commercial', 'Residential', 'Industrial'
              ]
          },
          yAxis: {
              min: 0,
              title: {
                  text: '$/kWh'
              }
          },
          legend: {
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'middle',
              borderWidth: 0,
              itemStyle: {
                fontSize: '16px'
              }
          },
          tooltip: {
              pointFormat: '$/kWh: <b>{point.y:.3f}</b>',
          },
          series: [{
              name: 'kWh',
              data: [utildata.outputs.commercial, utildata.outputs.residential, utildata.outputs.industrial],
              dataLabels: {
                  enabled: true,
                  style: {
                      fontSize: '16px',
                      fontFamily: 'Verdana, sans-serif',
                  }
              }
          }]
      });
}

function loadSolarHC(pvdata) {
  $('#pvChart').highcharts({
        title: {
            text: 'Monthly Solar Production',
            x: -20 //center
        },
        subtitle: {
            text: 'Source: www.nrel.gov',
            x: -20
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'kWh'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }],
            itemStyle: {
              fontSize: '16px'
            }
        },
        tooltip: {
            valueSuffix: ' kWh'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0,
            itemStyle: {
              fontSize: '16px'
            }
        },
        series: [{
            name: 'AC',
            data: pvdata.outputs.ac_monthly
        }, {
            name: 'DC',
            data: pvdata.outputs.dc_monthly
        }
    });
}

function dailyConsumption(dataset) {
  $('#dcChart').highcharts({
      chart: {
          zoomType: 'x',
          spacingRight: 20
      },
      title: {
          text: 'Daily Energy Consumption'
      },
      subtitle: {
          text: document.ontouchstart === undefined ?
              'Click and drag in the plot area to zoom in' :
              'Pinch the chart to zoom in'
      },
      xAxis: {
          type: 'datetime',
          maxZoom: 14 * 24 * 3600000, // fourteen days
          title: {
              text: null
          }
      },
      yAxis: {
          title: {
              text: 'kilowatts per hour'
          }
      },
      tooltip: {
          shared: true
      },
      legend: {
          enabled: false
      },
      plotOptions: {
          area: {
              fillColor: {
                  linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                  stops: [
                      [0, Highcharts.getOptions().colors[0]],
                      [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                  ]
              },
              lineWidth: 1,
              marker: {
                  enabled: false
              },
              shadow: false,
              states: {
                  hover: {
                      lineWidth: 1
                  }
              },
              threshold: null
          }
      },

      series: [{
          type: 'area',
          name: 'kWh',
          pointInterval: 24 * 3600 * 1000,
          pointStart: Date.UTC(2011, 0, 01),
          data: dataset
      }]
  });
}
