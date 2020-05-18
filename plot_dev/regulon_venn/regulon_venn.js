/**
 * @summary Creates regulon and i-modulon comparison venn diagrams for ModulomeVis
 * @author Katherine Decker
 * requires Papa parse, Highcharts, and Highcharts data module
 */

 function generateVenn(csvContent, container) {

    // See if csvContent is null
    if (! csvContent){
        return;
    }

    // get the data
    var data = Papa.parse(csvContent).data;

    // gene counts (leaving out operons for now)
    var regulon = parseFloat(data[1][1]);
    var imodulon = parseFloat(data[2][1]);
    var overlap = parseFloat(data[3][1]);

    // set up plot
    var myChart = Highcharts.chart(container, {
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
           value: regulon
         }, {
           sets: ['i-Modulon Genes'],
           color: '#2085e3',
           opacity: 0.6,
           index: 1,
           value: imodulon
         }, {
           sets: ['Regulon Genes', 'i-Modulon Genes'],
           value: overlap,
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