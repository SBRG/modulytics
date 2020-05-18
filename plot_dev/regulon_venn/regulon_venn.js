/**
 * @summary Creates regulon and i-modulon comparison venn diagrams for ModulomeVis
 * @author Katherine Decker
 * requires Papa parse, Highcharts, and Highcharts data module
 */

 function generateVenn(csvContent, container) {
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
    var myChart = Highcharts.chart('container', {
       accessibility: {
         point: {
           descriptionFormatter: function (point) {
             var intersection = point.sets.join(', '),
               name = point.name,
               ix = point.index + 1,
               val = point.value;
             return ix + '. Intersection: ' + intersection + '. ' +
               (point.sets.length > 1 ? name + '. ' : '') + 'Value ' + val + '.';
           }
         }
       },
       series: [{
         type: 'venn',
         name: 'Regulon Venn Diagram',
         data: [{
           sets: ['Regulon Genes'],
           color: '#15c70c',
           opacity: 0.6,
           index: 2,
           value: 3
         }, {
           sets: ['i-Modulon Genes'],
           color: '#2085e3',
           opacity: 0.6,
           index: 1,
           value: 3
         }, {
           sets: ['Regulon Genes', 'i-Modulon Genes'],
           value: 2,
           index: 3,
           color: '#3de3e0',
           opacity: 0.6,
           name: 'Genes in Regulon and i-Modulon'
         }]
       }],
       title: {
         text: ''
       }
     });

 };