""" gene_histogram.py: 
    Generates .csv files to be read by gene_histogram.js for ModulomeVis site
"""

import numpy as np
import pandas as pd
import re

# Helper functions
def parse_tf_string(ica_data, tf_str):
    '''
    input: the TF string stored in enrichments
    output: list of relevant TFs
    Ignores TFs that are not in the trn file
    '''
    if not(type(tf_str) == str):
        return []
    tf_str = tf_str.replace(' ', '').replace('[', '').replace(']', '')
    tfs = re.split('\+|\/', tf_str)

    # Check if there is an issue, just remove the issues for now.
    bad_tfs = []
    for tf in tfs:
        if (tf not in ica_data.trn.TF.unique()):
            print('MISSING TF:', tf)
            bad_tfs += [tf]
    tfs = list(set(tfs) - set(bad_tfs))
    
    return tfs

def tf_combo_string(row):
    '''
    input: boolean series indexed by TFs for a given gene
    output: a string formatted for display ('Regulated by ...')
    '''
    if row.sum() == 0:
        return 'unreg'
    if row.sum() == 1:
        return row.index[row][0]
    if row.sum() == 2:
        return ' and '.join(row.index[row])
    else:
        return ', '.join(row.index[row][:-1]) + ', and ' + row.index[row][-1]

def sort_tf_strings(tfs, unique_elts):
    '''
    input: tfs, the list of tfs which is in a desired order
           unique_elts, all combo strings made by tf_combo_string
    output: a sorted list of combo strings so that they will have consistent ordering
    '''
    # unreg always goes first
    unique_elts.remove('unreg')
    sorted_elts = ['unreg']

    # then the individual TFs
    for tf in tfs:
        if tf in unique_elts:
            sorted_elts += [tf]
            unique_elts.remove(tf)

    # then pairs
    pairs = [i for i in unique_elts if ',' not in i]
    for i in tfs:
        for j in tfs:
            name = i + ' and ' + j
            if name in pairs:
                sorted_elts += [name]
                unique_elts.remove(name)

    # then longer combos, which won't be sorted for now
    return sorted_elts + unique_elts
    
    
# Main function = gene_hist_df
def gene_hist_df(ica_data, k, row, bins = 20, tol = 0.001):
    '''
    input: ica_data, from github.com/SBRG/ICA
           k, the i-modulon's index
           row, its associated row in curated_enrichments.csv
           bins, number of bins in the histogram
           tol, determines distance to threshold for deciding if a bar is in the i-modulon
    output: a dataframe for producing the histogram in javascript
    '''
    # get TFs
    if not(type(row.TF) == str):
        tfs = []
    else:
        tfs = parse_tf_string(ica_data, row.TF)
        
    # get genes
    DF_gene = ica_data.component_DF(k,tfs=tfs)
    
    # add a tf_combo column
    if len(tfs) == 0:
        DF_gene['tf_combos'] = ['unreg']*DF_gene.shape[0]
    else:
        tf_bools = DF_gene[tfs]
        DF_gene['tf_combos'] = [tf_combo_string(tf_bools.loc[g]) for g in tf_bools.index]
    
    # get the list of tf combos in the correct order
    tf_combo_order = sort_tf_strings(tfs, list(DF_gene.tf_combos.unique()))
    
    # compute bins
    xmin = min(min(DF_gene.comp),-ica_data.thresholds[k])
    xmax = max(max(DF_gene.comp),ica_data.thresholds[k])
    width = 2*ica_data.thresholds[k]/(np.floor(2*ica_data.thresholds[k]*bins/(xmax-xmin)-1))
    xmin = -ica_data.thresholds[k]-width*np.ceil((-ica_data.thresholds[k] - xmin)/width)
    xmax = xmin + width*bins
    
    # column headers: bin middles
    columns = np.arange(xmin + width/2, xmax + width/2, width)[:bins] # [:bins] shouldn't be necessary, but weird case
    index = ['thresh'] + tf_combo_order + [i + '_genes' for i in tf_combo_order]
    res = pd.DataFrame(index = index, columns = columns)

    # row 0: threshold indices and number of unique tf combos
    thresh1 = -ica_data.thresholds[k]#np.argwhere(np.isclose(-ica_data.thresholds[k], columns))[0][0]
    thresh2 = ica_data.thresholds[k]#np.argwhere(np.isclose(ica_data.thresholds[k], columns))[0][0]
    num_combos = len(tf_combo_order)
    res.loc['thresh'] = [thresh1, thresh2, num_combos] + [np.nan]*(len(columns) - 3)

    # next set of rows: heights of bars
    for r in tf_combo_order:
        res.loc[r] = np.histogram(DF_gene.comp[DF_gene.tf_combos == r], bins, (xmin, xmax))[0]

    # last set of rows: gene names
    for b_mid in columns:

        # get the bin bounds
        b_lower = b_mid - width/2
        b_upper = b_lower + width
        for r in tf_combo_order:
            # get the genes for this regulator and bin
            genes = DF_gene.gene_name[(DF_gene.tf_combos == r) &
                                      (DF_gene.comp < b_upper) &
                                      (DF_gene.comp > b_lower)]
            res.loc[r, b_mid] = len(genes)

            gene_list = np.array2string(genes.values, separator = ' ')

            # don't list unregulated genes unless they are in the i-modulon
            if r == 'unreg':
                if (b_lower+tol >= ica_data.thresholds[k]) or (b_upper-tol <= -ica_data.thresholds[k]):
                    res.loc[r+'_genes', b_mid] = gene_list
                else:
                    res.loc[r+'_genes', b_mid] = '[]'
            else:
                res.loc[r+'_genes', b_mid] = gene_list
    return res