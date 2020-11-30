/**
 * @summary Creates interactive activity bar plots for ModulomeVis
 * @author Kevin Rychel
 * requires Papa parse, Highstock, highcharts exporting module
 */
 
// need global variables
 var cols_to_show = [];
 var col_to_color = -1;
 var chart, chartOptions;
 
 // data download helper function
 function data_download(csv_data, file_name) {
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);

    // Set the HREF to a Blob representation of the data to be downloaded
    a.href = window.URL.createObjectURL(
        new Blob([csv_data], {type: 'text/plain'})
    );

    // Use download attribute to set set desired file name
    a.setAttribute("download", file_name);

    // Trigger the download by simulating click
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
 }
 
 // finds an element in a list
 function get_index(meta_head, elt_name) {
    var is_thing = (elt) => elt==elt_name;
    return meta_head.findIndex(is_thing);
 }
 
 // picks columns of interest based on what is in the metadata header
 function pick_cols_of_interest(meta_head) {
    cols_of_interest = []
    
    // bacillus
    var phase_idx = get_index(meta_head, 'phase')
    if (phase_idx != -1) {
        var media_idx = get_index(meta_head, 'media');
        var supplement_idx = get_index(meta_head, 'supplement');
        var time_idx = get_index(meta_head, 'time_min');
        
        return [media_idx, supplement_idx, phase_idx, time_idx]
    }
    
    // ecoli
    var media_idx = get_index(meta_head, 'Base Media');
    if (media_idx != -1) {
        var carbon_idx = get_index(meta_head, 'Carbon Source (g/L)');
        var supp_idx = get_index(meta_head, 'Supplement');
        var strain_idx = get_index(meta_head, 'Strain Description');
        
        return [strain_idx, media_idx, carbon_idx, supp_idx];
    }
    
    // staph
    var strain2 = get_index(meta_head, 'strain');
    if (strain2 != -1) {
        var time = get_index(meta_head, 'sample-time');
        var media2 = get_index(meta_head, 'base-media');
        var conditions = get_index(meta_head, 'conditions');
        
        return [strain2, media2, conditions, time];
    }
    
    return cols_of_interest;
 }
 
 function get_cols_to_show() {
    return cols_to_show;
 }
 function get_col_to_color() {
    return col_to_color;
 }
 
 // Write Highcharts plot to container
 function generateActivityBar(metaCSV, dataCSV, container) {
    // get the data
    var metadata = Papa.parse(metaCSV, {dynamicTyping: true}).data;
    var data = Papa.parse(dataCSV, {dynamicTyping: true}).data;
    
    // parse the metadata header to find the important columns
    var sample_idx = get_index(metadata[0], 'sample');
    if (sample_idx == -1) {
        sample_idx = 0
    }
    var project_idx = get_index(metadata[0], 'project');
    var link_idx = get_index(metadata[0], 'DOI');
    
    // cols of interest: tooltip will show these metadata
    // These will be updated by the modal
    cols_to_show = pick_cols_of_interest(metadata[0]);
    
    // zoom thresh: number of columns at which less data is displayed
    var zoom_thresh = 40
    
    // rearrange data for highcharts
    var bar_heights = [];
    var cond_names = [];
    var vert_lines = []; var curr_proj = null;
    var plot_bands = [];
    var point_locs = [];
    for (i = 1; i < data.length-1; i++) {
        
        // add in the basics
        cond_names.push(data[i][1]);
        bar_heights.push(data[i][2]);
        
        // look at projects to determine vertical lines & plot bands
        var meta_idx = data[i][5] + 1;
        var project = metadata[meta_idx][project_idx];
        
        if (project != curr_proj) {
            
            // first project
            if (curr_proj == null) {
                plot_bands.push({label:{text:project, verticalAlign: 'bottom', y: 5, x:5, rotation: 300, textAlign: 'right', style:{color: 'gray'}}, from:-0.5, color:'white'})
            } else { //all other projects
                vert_lines.push({value: i-1.5, width: 1, zIndex: 5, color: 'gray'});
                plot_bands[plot_bands.length-1]['to'] = i-0.5;
                plot_bands.push({label:{text:project, verticalAlign: 'bottom', y: 5, x:5, rotation: 300, textAlign: 'right', style:{color: 'gray'}}, from:i-0.5, color:'white'});
            }
            curr_proj = project;
        }
        
        // add point locations for individual samples
        for (j = 0; j < data[i][4]; j++) {
            point_locs.push([i-1, data[i][6 + 2*j]]);
        }
    }
    plot_bands[plot_bands.length-1]['to'] = data.length-1.5;
    
    // set up plot
    chartOptions = {
        chart: {
            spacingBottom: 50,
            zoomType: 'x',
            events: {
                load: function() {
                    $('.highcharts-scrollbar').hide()
                }
            },
            resetZoomButton: {
                position: {
                    verticalAlign: 'bottom'
                }
            }
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: cond_names,
            crosshair: true,
            plotLines: vert_lines,
            plotBands: plot_bands,
            labels: {
                enabled: false
            },
            scrollbar: {
                enabled: true,
                margin: 50,
                showFull: false
            },
            events: {
                // resize events
                afterSetExtremes: function(e) {
                    if (e.trigger == "zoom") { 
                        // toggle project/condition labels
                        if (e.max - e.min < zoom_thresh) {
                            chart.update({
                                chart: {
                                    spacingBottom: 15
                                },
                                xAxis: {
                                    labels: {enabled: true},
                                    plotBands: [],
                                    scrollbar: {margin: 10}
                                }
                            });
                        } else {
                            chart.update({
                                chart: {
                                    spacingBottom: 50
                                },
                                xAxis: {
                                    labels: {enabled: false},
                                    plotBands: plot_bands,
                                    scrollbar: {margin: 50}
                                }
                            });
                        }
                    }
                }
            }
        },
        yAxis: {
            title:{
                text: 'iModulon Activity',
            },
            crosshair: true,
            startOnTick: false,
            endOnTick: false
        },
        plotOptions: {
            column: {
                pointPadding: 0,
                borderWidth: 1,
                groupPadding: 0,
                shadow: false,
            }
        },
        series: [{
                name: 'A_avg',
                type: 'column',
                data: bar_heights,
                color: '#2085e3',
                events: {
                    click: function(e) {
                        // do nothing if the metadata doesn't contain links
                        if (link_idx == -1) {
                            return
                        }
                        
                        // go to the DOI of this sample on click
                        // find DOI
                        var index = e.point.index + 1;
                        var meta_index = data[index][5] + 1;
                        var link = metadata[meta_index][link_idx];
                        
                        // check if it exists
                        if (link != null) {
                            //sometimes the link is the last word
                            var link_str = link.split(" "); 
                            link = link_str[link_str.length -1]
                            
                            if (link[0] == 'h') {
                                window.open(link);
                            } else {
                                window.open('http://' + link);
                            }
                        }
                    }
                }
            }, {
                name: 'A',
                type: 'scatter',
                data: point_locs,
                color: 'black',
                jitter: {
                    x: 0.25,
                    y: 0
                },
                marker: {
                    radius: 2
                },
                stickyTracking: false,
            }],
        tooltip: {
            formatter: function() {
                
                var tooltip = "";
                // bars
                if (this.series.name == 'A_avg') {
                    var index = this.point.x + 1;
                    var meta_index = data[index][5] + 1;
                    // header: condition name (n)
                    tooltip += '<span style="font-size: 10px">' + data[index][1] + ' (' + data[index][4] + ')</span><br>';
                    
                    // activity 
                    tooltip += 'A: '+ this.point.y.toFixed(2);
                    if (data[index][4] > 1) {
                        tooltip +=  ' ± ' + data[index][3].toFixed(2);
                    }
                }
                else {
                    index = this.point.x + 1;
                    meta_index = this.point.index + 1;
                    
                    // header: sample name
                    tooltip += '<span style="font-size: 10px">' + metadata[meta_index][sample_idx] + '</span><br>';
                    
                    // activity
                    tooltip += 'A: '+ this.point.y.toFixed(2);
                }
                
                // metadata
                cols_of_interest = get_cols_to_show()
                col_color = get_col_to_color()
                for (col in cols_of_interest) {
                    meta_val = metadata[meta_index][cols_of_interest[col]]
                    if (meta_val != null) {
                        tooltip += '<br>'
                        if (cols_of_interest[col] == col_color) {
                            tooltip += '<b>'
                        }
                        tooltip += metadata[0][cols_of_interest[col]] + ': ';
                        tooltip += meta_val;
                        if (cols_of_interest[col] == col_color) {
                            tooltip += '</b>'
                        }
                    }
                }
                
                return tooltip;
            },
            shared: false
        },
        exporting: {
            menuItemDefinitions: {
                downloadMeta: {
                    onclick: function() {
                        data_download(metaCSV, 'metadata.csv');
                    },
                    text: 'Download metadata'
                },
                downloadData: {
                    onclick: function() {
                        data_download(dataCSV, 'activity_data.csv');
                    },
                    text: 'Download activity data'
                }
            },
            buttons: {
                contextButton: {
                    menuItems: ['viewFullscreen', 'downloadPNG', 'downloadPDF', 'downloadData', 'downloadMeta']
                }
            }
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    };

    // make the chart
    chart = Highcharts.chart(container, chartOptions);
 };
 
 // Fill in the modal menu for modifying this plot
  function generateModal(metaCSV, dataCSV, modal, container, button) {
    // get the data
    var metadata = Papa.parse(metaCSV, {dynamicTyping: true}).data;
    var data = Papa.parse(dataCSV, {dynamicTyping: true}).data;
    
    var to_add = "";
    
    for (i = 0; i < metadata[0].length; i++) {
        
        // start form
        to_add += '<div class="form-check"><input class="form-check-input" type="checkbox" id="'
        to_add += 'modal_display' + i.toString() + '"' // form check ID
        if (cols_to_show.includes(i)) { // check the currently active ones
            to_add += " checked";
        }
        // continue form
        to_add += '><label class="form-check-label" for="defaultCheck1">'
        
        // add color button
        to_add += '<a id="modal_color' + i.toString()
        to_add += '"><i class="fas fa-tint-slash"></i></a>'
        
        // add label name
        to_add += metadata[0][i]
        to_add += '</label></div>' // end form
    }
    
    document.getElementById(container).innerHTML = to_add;
    
    // add function links to the color buttons
    for (i = 0; i < metadata[0].length; i++) {
        document.getElementById('modal_color'+i.toString()).onclick = function() {
            updateColor(metadata, data, this.id)
        }
    }
    
    // add function link to the make changes button
    document.getElementById(button).onclick = function() {
        modalChanges(metadata[0]);
        $('#'+modal).modal('toggle');
    }
};

// Onclick Make Changes function
function modalChanges(metadata_cols) {
    var new_cols = []
    for (i = 0; i < metadata_cols.length; i++) {
        var elt_name = 'modal_display' + i.toString();
        if (document.getElementById(elt_name).checked) {
            new_cols.push(i);
        }
    }
    
    cols_to_show = new_cols;
}

// Onclick Color Changes function
function updateColor(metadata, data, i_str) {
    var metadata_cols = metadata[0]
    var i = parseInt(i_str.slice(11));
    var current_color = get_col_to_color();
    var current_str = 'modal_color' + current_color.toString();
    
    if (i != current_color) { //update to new color
        document.getElementById(i_str).innerHTML = ' <i class="fas fa-tint"></i> ';
        
        if (current_color != -1) {
            document.getElementById(current_str).innerHTML = '<i class="fas fa-tint-slash"></i>';
        }
        col_to_color = i;

        var color_list = get_colors(metadata, data, i);

        chartOptions.series[0].colorByPoint = true;
        chartOptions.plotOptions.column.colors = color_list;
        
        document.getElementById('modal_display'+i.toString()).checked = true;
        
    } else {
        document.getElementById(i_str).innerHTML = '<i class="fas fa-tint-slash"></i>';
        col_to_color = -1;
        
        chartOptions.series[0].colorByPoint = false;
    }
    chart = new Highcharts.Chart('bar', chartOptions);
}

function get_colors(metadata, data, i) {
    // first get the list of sample indices to check (only first from each cond)
    var idx = []
    for (n = 1; n < data.length-1; n++) {
        idx.push(data[n][5]+1);
    }
    
    // get the list of all values and all unique values for each condition
    var vals = []
    var unique_vals = []
    for (j in idx) {
        vals.push(metadata[idx[j]][i]);
        if (!unique_vals.includes(metadata[idx[j]][i])) {
            unique_vals.push(metadata[idx[j]][i]);
        }
    }
    
    // assume these are categorical
    // generate a list of colors, then map colors to values
    var colors = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf']
    while (colors.length < unique_vals.length) {
        // add random colors until we have enough
        colors.push('#' + Math.floor(Math.random()*16777215).toString(16));
    }
    var color_dict = {}
    for (k = 0; k < unique_vals.length; k++) {
        color_dict[unique_vals[k]] = colors[k]
    }
    
    // get a list of colors for each bar
    var result = []
    for (m = 0; m < vals.length; m++) {
        result.push(color_dict[vals[m]]);
    }
    return result;
}