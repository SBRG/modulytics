/**
 * @summary Creates interactive regulon scatter plots for ModulomeVis
 * @author Kevin Rychel
 * requires Papa parse, Highcharts
 */
 
function generateRegulonScatter(csvContent, container, tf_i){
    
    var data = Papa.parse(csvContent, {dynamicTyping: true}).data;
    var tf_idx = 2 + tf_i;
    
    // basics
    var reg_name = data[0][tf_idx]
    reg_name = reg_name.charAt(0).toUpperCase() + reg_name.slice(1);
    var xmin = data[2][tf_idx]
    var xmax = data[4][tf_idx]
    var r2 = data[1][tf_idx].toFixed(4)
    
    // coordinates
    var coord_data = [];
    for (i = 5; i < data.length; i++) {
        coord_data.push({x: data[i][tf_idx], y: data[i][1], name: data[i][0]}); 
    }
    
    // line
    var line_data = [[xmin, data[5][tf_idx]]] // left most point
    var xmid = data[3][tf_idx] //xmid encodes a broken line
    if (xmid != null) { 
        line_data.push([xmid, data[5][tf_idx]]);
    }
    line_data.push([xmax, data[6][tf_idx]]);
    
    // set up the plot
    var chartOptions = {
        title: {
            text: ''
        },
        xAxis: {
            title: {
                text: reg_name + ' Expression'
            },
            crosshair: true,
            startOnTick: false,
            endOnTick: false,
            min: xmin,
            max: xmax
        },
        yAxis: {
            title:{
                text: 'iModulon Activity',
            },
            crosshair: true,
            startOnTick: false,
            endOnTick: false
        },
        series: [{
            name: 'Samples',
            type: 'scatter',
            data: coord_data,
            color: '#2085e3',
            showInLegend: false
        }, {
            name: 'R<sup>2</sup><sub>adj</sub> = '+r2,
            type:'line',
            data: line_data,
            color: 'black',
            marker: {
                enabled: false
            },
            enableMouseTracking: false
        }],
        tooltip: {
            formatter: function() {
                var tooltip = "<b>"+this.point.name+"</b>";
                tooltip += "<br>"+reg_name+' Expression: '+this.point.x.toFixed(3);
                tooltip += "<br>iModulon Activity: " + this.point.y.toFixed(3);
                return tooltip;
            }
        },
        legend: {
            useHTML: true
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        }
    };

    // make the chart
    var chart = Highcharts.chart(container, chartOptions);
}