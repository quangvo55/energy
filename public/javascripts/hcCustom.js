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
        }, {
            name: 'POA',
            data: pvdata.outputs.poa_monthly
        }]
    });
}