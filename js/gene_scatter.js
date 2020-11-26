/**
 * @summary Creates interactive gene weight histograms for ModulomeVis
 * @author Kevin Rychel
 * requires Highcharts, Papa Parse
 */

//helper for querystring params
function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

// edit function below
// Write Highcharts plot to container (see gene_histogram.js for example)
function generateGeneScatter(csvContent, container) {
    var data = Papa.parse(csvContent, {dynamicTyping: true}).data;

    // basics
    var thresh = data[1][2]
    var x_type = data[1][1]
    
    // set up x axis label
    if (x_type == 'start') {
        var x_label = 'Gene Start';
        var x_label_dec = 0;
    } else if (x_type == 'gene number') {
        var x_label = 'Arbitrary Gene Number';
        var x_label_dec = 0;
    }

    // coordinates
    var coord_data = [];
    var xmin = 100; // find xmin since default is always zero
    for (i = 2; i < data.length; i++) {
        coord_data.push({
            b_num: data[i][0],
            name: data[i][1],
            x: data[i][2],
            y: data[i][3],
            cog: data[i][4],
            color: data[i][5],
            link: data[i][6]
        });
        if (data[i][2] < xmin) {
            xmin = data[i][2];
        }
    }

    // sort by COG so that no annotation is in the back
    function compare(a, b) {
        let comparison = 0;
        if (a.cog == 'No COG category') {
            if (b.cog != 'No COG category') {
                comparison = -1
            }
        } else if (b.cog == 'No COG category') {
            comparison = 1
        }
        return comparison;
    }

    coord_data.sort(compare);

    // set up the plot
    var chartOptions = {
        title: {
            text: ''
        },
        xAxis: {
            title: {
                text: x_label
            },
            crosshair: true,
            startOnTick: false,
            endOnTick: false,
            min: xmin
        },
        yAxis: {
            title: {
                text: 'iModulon Weight',
            },
            crosshair: true,
            startOnTick: false,
            endOnTick: false,
            plotLines: [{
                value: thresh,
                zIndex: 5,
                color: 'black'
            }, {
                value: -thresh,
                zIndex: 5,
                color: 'black'
            }],
        },
        series: [{
            name: 'Genes',
            type: 'scatter',
            data: coord_data,
            turboThreshold: 0, // should optimize better in future
            events: {
                click: function (e) {
                    var link = 'gene.html?';
                    link += 'organism=' + qs('organism') + '&';
                    link += 'dataset=' + qs('dataset') + '&';
                    link += 'gene_id=' + e.point.b_num;
                    window.open(link);
                }
            }
        }],
        tooltip: {
            formatter: function () {

                if ((this.point.name == null)||(this.point.name == this.point.b_num)) {

                    var tooltip = '<b>' + this.point.b_num + '</b>'
                } else {
                    var tooltip = this.point.b_num + ": <b>" + this.point.name + "</b>";
                }
                tooltip += "<br>Category: " + this.point.cog;
                tooltip += "<br>" + x_label + ": " + this.point.x.toFixed(x_label_dec);
                tooltip += "<br>iModulon Weight: " + this.point.y.toFixed(3);
                return tooltip;
            }
        },
        legend: {
            enabled: false
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
    return;
};