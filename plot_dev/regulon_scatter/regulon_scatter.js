/**
 * @summary Creates interactive regulon scatter plots for ModulomeVis
 * @author Kevin Rychel
 * requires Papa parse, Highcharts
 */
 
 // Write Highcharts plot to container 
 function plotRegulon(data, tf_idx, container) {
    
    console.log('plot',tf_idx);
    
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
                text: 'I-modulon Activity',
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
                tooltip += "<br>I-modulon Activity: " + this.point.y.toFixed(3);
                return tooltip;
            }
        },
        legend: {
            useHTML: true
        },
        credits: {
            enabled: false
        }
    };

    // make the chart
    var chart = Highcharts.chart(container, chartOptions);
    return;
 };
 

function generateRegulonScatter(csvContent, container){
    // get the data
    var data = Papa.parse(csvContent, {dynamicTyping: true}).data;
    var n_tfs = data[0].length - 2;
    // ids can't conflict with others, so use the data 
    var new_id = data[0][2];
    
    // single regulon case
    if (n_tfs == 1) {
        $('#'+container).append($('<div/>', {id: new_id, 'float': 'left', 'display':'inline-block', 'style': 'width: '+300+'px;height: 300px;'}));
        plotRegulon(data, 2, new_id);
    } else { // multiple
        
        // compute new width
        var full_width = document.getElementById(container).offsetWidth;
        var new_width = full_width/n_tfs - 10;
        
        // iterate through all the tfs
        // ERROR TO FIX: This for loop only goes around once when I call these functions.
        //               Comment out the functions, and it logs all correct iterations. wtf.
        for (i=0; i < n_tfs; i++) {
            console.log(i)
            $('#'+container).append($('<div/>', {id: new_id+i, 'float': 'left', 'display':'inline-block', 'style': 'width: '+300+'px;height: 300px;'}));
            plotRegulon(data, 2+i, new_id+i);
        }        
        console.log('done');
    }
};