/**
 * @summary Creates interactive gene weight histograms for ModulomeVis
 * @author Kevin Rychel
 * requires Papa parse, Highcharts, and Highcharts data module
 */
 
function generateHist(csvContent, container) {

    // get the data
    var data = Papa.parse(csvContent).data;

    // bins
    var bins = data[0].slice(1).map(x=>parseFloat(x).toFixed(3));
    var binsize = parseFloat(bins[1]) - parseFloat(bins[0]);        

    //thresholds and number of series
    var thresh1 = parseFloat(data[1][1]);
    var thresh2 = parseFloat(data[1][2]);
    var num_series = parseInt(data[1][3]);

    // get bar height data
    var bar_heights = [[null].concat(bins)]
    for (i = 0; i < num_series; i++) {
        bar_heights[i+1] = [data[i+2][0]].concat(data[i+2].slice(1).map(x=>+x));
    }

    // set up plot
    var myChart = Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        xAxis: {
            startOnTick: false,
            endOnTick: false,
            plotLines: [{
                value: thresh1,
                zIndex: 5,
                color: 'black'
            }, {
                value: thresh2,
                zIndex: 5,
                color: 'black'
            }],
            title: {
                text: 'I-modulon Weight'
            }
        }, 
        yAxis: {
            type: 'logarithmic',
            startOnTick: false,
            endOnTick: false,
            tickInterval: 1,
            minorTickInterval: 0.1,
            title: {
                text: 'Number of Genes'
            }
        },
        plotOptions: {
            column: {
                pointPadding: 0,
                borderWidth: 0,
                groupPadding: 0,
                shadow: false,
                grouping: false
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            floating: true,
            layout: 'vertical',
            labelFormatter: function() {
                if (this.name == 'unreg'){
                    return 'Unregulated';
                } else {
                    return 'Regulated by '+this.name;
                }
            }
        },
        data: {
            columns: bar_heights
        },
        colors: [
            '#9c9c9c', '#2085e3', '#15c70c', '#e33d3d', '#3de3e0',
            '#e3983d', '#d13ce8', '#4600a8', '#167500', '#0d21ff'
        ],
        tooltip: {
            formatter: function() {
                
                var index = this.point.index + 1;
                
                //header: range of bin
                var x_min = parseFloat(data[0][index]) - binsize/2;
                var x_max = x_min + binsize;
                var x_range = x_min.toFixed(3) + ': ' + x_max.toFixed(3);
                var tooltip = '<span style="font-size: 8px">' + x_range + '</span><br>';
                
                //find the metadata for this series
                var arg;
                for (i = 2; i < 2+(num_series); i++) {
                    if (data[i][0] == this.series.name) {
                        arg = i - 2;
                    }
                }
                var genes = data[2 + num_series + arg][index]
                var series_color = this.color

                //main: num genes or list
                tooltip += '<span style="color:'+series_color+'">●</span>';
                if (genes.length == 2) {
                    tooltip += 'Unregulated: ' + this.point.y;
                } else {
                    if (this.point.y > 50){
                        tooltip += 'Regulated by ' + this.series.name + ': ' + this.point.y;
                    } else {
                    genes = genes.slice(2, -2);
                    tooltip += genes.replace(/' '/gi, ", ");
                    }
                }
                return tooltip;
            }
        },
        credits: {
            enabled: false
        }
    });
};