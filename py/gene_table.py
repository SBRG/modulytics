""" gene_table.py: 
    Generates .csv files to be read by gene_table.js for ModulomeVis site
"""

import numpy as np
import pandas as pd
import requests
import re

# helper functions
# note that this function is also in gene_histograms.py

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

def get_db_link(gene, locus_to_db):
    '''
    input: gene, the b number
           locus_to_db, a df indexed by b number with "ID" column of EG numbers
    output: link to the gene on EcoCyc database
    '''
    # skip gene if it's not in locus_to_db
    if not(gene in locus_to_db.index):
        print('Gene missing from DB:', gene)
        return np.nan
    
    # generate link
    new_id = locus_to_db.ID[gene]
    link = 'https://ecocyc.org/gene?orgid=ECOLI&id='+new_id
    
    # test link
    request = requests.get(link)
    if request.status_code == 200:
        return link
    else:
        print('Web site does not exist:', gene, new_id) 
        return np.nan

# main function
def gene_table_df(ica_data, k, row, locus_to_db = None, links = None, operon_commas = True):
    '''
    input: ica_data, from github.com/SBRG/ICA
           k, the i-modulon's index
           row, its associated row in curated_enrichments.csv
           locus_to_db, df for "get_db_link()". Use if full link list is not computed
           links, a pandas series or dictionary connecting genes to links
    output: a dataframe for producing the gene table in javascript
    '''
    # get TFs and large table
    tfs = parse_tf_string(ica_data,row.TF)
    DF_gene = ica_data.component_DF(k,tfs=tfs)

    # only genes in the i-modulon
    res = DF_gene.loc[DF_gene.comp>ica_data.thresholds[k]]
    res = res.append(DF_gene.loc[DF_gene.comp<-ica_data.thresholds[k]])
    
    # sort
    res = res[['comp','gene_name', 'product', 'operon', 'TF']+tfs]
    res = res.sort_values('comp', ascending = False)
    
    
    # add link
    if links is None:
        res['link'] = [get_db_link(g, locus_to_db) for g in res.index]
    else:
        res['link'] = [links[g] for g in res.index]
    
    # clean up
    res.index.name = 'locus'
    res.TF = [s.replace(',', ', ') for s in res.TF]
    if operon_commas:
        res.operon = [s.replace(',', ', ') for s in res.operon]

    
    return res