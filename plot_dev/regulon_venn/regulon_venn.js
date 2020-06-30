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
    
    // gene lists
    var reg_list = data[2][2].slice(2, -2).replace(/(?:\r\n|\r|\n)/gi, "").replace(/' '/gi, ", ");
    var comp_list = data[3][2].slice(2, -2).replace(/(?:\r\n|\r|\n)/gi, "").replace(/' '/gi, ", ");
    var both_list = data[4][2].slice(2, -2).replace(/(?:\r\n|\r|\n)/gi, "").replace(/' '/gi, ", ");
    
    if (reg_list.length > 1000) {
        reg_list = reg_list.slice(0, 1000) + '...';
    }
    
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
           value: imodulon,
           gene_list: comp_list
         }, {
           sets: ['Regulon Genes'],
           color: '#15c70c',
           opacity: 0.7,
           value: regulon,
           gene_list: reg_list
         }, {
           sets: ['Regulon Genes', 'i-Modulon Genes'],
           value: overlap,
           color: '#3de3e0',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon',
           gene_list: both_list
         }, {
           sets: ['i-Modulon all contained in Regulon'],
           value: imodulon2,
           color: '#3de3e0',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon',
           gene_list: both_list
         }, {
           sets: ['Regulon Genes', 'i-Modulon all contained in Regulon'],
           value: imodulon2,
           color: '#3de3e0',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon',
           gene_list: both_list
         }, {
           sets: ['Regulon all contained in i-Modulon'],
           value: regulon2,
           color: '#37d7b4',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon',
           gene_list: both_list
         }, {
           sets: ['i-Modulon Genes', 'Regulon all contained in i-Modulon'],
           value: regulon2,
           color: '#37d7b4',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon',
           gene_list: both_list
         }, {
           sets: ['Regulon == i-Modulon'],
           value: overlap2,
           color: '#37d7b4',
           opacity: 0.7,
           name: 'Genes in Regulon and i-Modulon',
           gene_list: both_list
         }]
       }],
       title: {
         text: ''
       },
       tooltip: {
           formatter: function() {
               var tooltip = this.point.name + ": <b>" + this.point.value + "</b>";
               tooltip += "<br>" + this.point.gene_list
               
               return tooltip;
           }
       },
       exporting: {
         enabled: false
       }
     });

 };
