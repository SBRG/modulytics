""" gene_scatter.py: 
    Generates .csv files to be read by gene_table.js for ModulomeVis site
"""

import numpy as np
import pandas as pd
from matplotlib.colors import to_hex
import requests

# Note: this helper function is also used in gene_table
def get_db_link(gene, locus_to_db):
    '''
    input: gene, the b number
           locus_to_db, a df indexed by b number with "ID" column of EG numbers
    output: link to the gene on EcoCyc database
    '''
    # skip gene if it's not in locus_to_db
    if not(gene in locus_to_db.index):
        #print('Gene missing from DB:', gene)
        return np.nan
    
    # generate link
    new_id = locus_to_db.ID[gene]
    link = 'https://ecocyc.org/gene?orgid=ECOLI&id='+new_id
    
    # test link
    request = requests.get(link)
    if request.status_code == 200:
        return link
    else:
        #print('Web site does not exist:', gene, new_id) 
        return np.nan

# edit function name, inputs, doc string, etc...
def gene_scatter_df(ica_data, k, base_conds, links):
    '''
    input: ica_data, from github.com/SBRG/ICA
           k, the i-modulon's index
           base_conds, a list of the indices of the baseline conditions
           links, a pandas series or dict connecting b_nums and ecocyc links
    output: a dataframe for producing the table (in this case, just the table)
    '''
    columns = ['name', 'x', 'y', 'cog', 'color', 'link']
    res = pd.DataFrame(columns = columns, index = ica_data.S.index)
    res.index.name = 'locus'

    cutoff = ica_data.thresholds[k]

    # x&y scatterplot points
    res.x = ica_data.X[base_conds].mean(axis=1)
    res.y = ica_data.S[k]

    # add other data
    res.name = [ica_data.num2name[l] for l in res.index]
    res.cog = ica_data.gene_info.cog[res.index]
    res.color = [to_hex(ica_data.gene_colors[gene]) for gene in res.index]

    # if the gene is in the i-modulon, it is clickable
    in_im = res.index[res.y.abs()>cutoff]
    for g in in_im:
        res.link[g] = links[g]

    # add a row to store the threshold
    cutoff_row = pd.DataFrame([cutoff] + [np.nan]*5, columns=['thresh'], index = columns).T
    res = pd.concat([cutoff_row, res])

    return res