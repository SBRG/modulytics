/**
 * @summary Creates regulon and i-modulon comparison venn diagrams for ModulomeVis
 * @author Katherine Decker
 * requires Papa parse, Highcharts, and Highcharts data module
 */

 function generateVenn(csvContent, container) {

    // get the data
    var data = Papa.parse(csvContent).data;

    // gene counts (leaving out operons for now)
    var regulon = parseFloat(data[2][1]);
    var imodulon = parseFloat(data[3][1]);
    var overlap = parseFloat(data[4][1]);
    var regulon2 = parseFloat(data[5][1]);
    var imodulon2 = parseFloat(data[6][1]);
    var overlap2 = parseFloat(data[7][1]);

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
       credits: {
           enabled: false
       },
       series: [{
         type: 'venn',
         name: 'Regulon Venn Diagram',
         data: [{
           sets: ['i-Modulon Genes'],
           color: '#2085e3',
           opacity: 0.7,
           value: imodulon
         }, {
           sets: ['Regulon Genes'],
           color: '#15c70c',
           opacity: 0.7,
           value: regulon
         }, {
           sets: ['Regulon Genes', 'i-Modulon Genes'],
           value: overlap,
           color: '#3de3e0',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon'
         }, {
           sets: ['i-Modulon all contained in Regulon'],
           value: imodulon2,
           color: '#3de3e0',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon'
         }, {
           sets: ['Regulon Genes', 'i-Modulon all contained in Regulon'],
           value: imodulon2,
           color: '#3de3e0',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon'
         }, {
           sets: ['Regulon all contained in i-Modulon'],
           value: regulon2,
           color: '#37d7b4',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon'
         }, {
           sets: ['i-Modulon Genes', 'Regulon all contained in i-Modulon'],
           value: regulon2,
           color: '#37d7b4',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon'
         }, {
           sets: ['Regulon == i-Modulon'],
           value: overlap2,
           color: '#37d7b4',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon'
         }]
       }],
       title: {
         text: ''
       },
       exporting: {
         enabled: false
       }
     });

 };