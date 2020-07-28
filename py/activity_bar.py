# update doc string and delete this line
""" gene_table.py: 
    Generates .csv files to be read by gene_table.js for ModulomeVis site
"""

import numpy as np
import pandas as pd
from itertools import chain

# metadata disagreement check
def metadata_disagreement_check(sample_meta, ignored_cols):
    '''
    input: sample_meta, [samples x features], which contains 'project_id',
                        'condition_id', and 'Biological Replicates' as columns
           ignored_cols, columns of sample_meta that are expected to be different within conditions
    output: displays conditions (groups of samples) with disagreements in other features, which will
            need to be reconciled if these columns are meant to describe the entire condition.
    '''
    # get the features to iterate through
    meta_columns = sample_meta.columns.to_list()
    for col in ignored_cols:
        meta_columns.remove(col)
    
    # find the disagreements
    for cond, group in sample_meta.groupby(['project_id','condition_id'], sort = False):
        cond_name = cond[0]+'__'+cond[1] # project__cond
        dis = False
        for meta_col in meta_columns:
            if (group[meta_col].isna().any()):# nans
                if not(group[meta_col].isna().all()): # if one is nan, all should be nan
                    dis = True
                    print('Disagreement:', cond_name, meta_col)
            else: # all rows have values
                if (group.loc[group.index[0], meta_col] != group[meta_col].values).any():
                    dis = True
                    print('Disagreement:', cond_name, meta_col)
            
            if meta_col == 'Biological Replicates': # one extra check here
                if group.loc[group.index[0], meta_col] != len(group.index):
                    dis = True
                    print('Disagreement in number of replicates:', cond_name, len(group.index))
        if dis:
            display(group)
    return None


# edit function name, inputs, doc string, etc...
def activity_bar_df(ica_data, k, sample_meta):
    '''
    input: ica_data, from github.com/SBRG/ICA
           k, the i-modulon's index
    output: a dataframe for producing the activity bar graph in javascript
    '''
    
    # get the row of A
    A_k = ica_data.A.loc[k]

    # initialize the dataframe
    max_replicates = int(sample_meta['Biological Replicates'].max())
    columns = ['A_avg', 'A_std', 'n'] + list(chain(*[['rep%i_idx'%(i), 'rep%i_A'%(i)] for i in range(1, max_replicates+1)]))
    res = pd.DataFrame(columns = columns)

    # iterate through conditions and fill in rows
    for cond, group in sample_meta.groupby(['project_id','condition_id'], sort = False):
        
        # get condition name and A values
        cond_name = cond[0]+'__'+cond[1] # project__cond
        vals = A_k[group.sample_id]
        
        # compute statistics
        new_row = [vals.mean(), vals.std(), len(vals)]
        
        # fill in individual samples (indices and values)
        for idx in group.index:
            new_row += [idx, vals[group.sample_id[idx]]]
        new_row += [np.nan]*((max_replicates-len(vals))*2)

        res.loc[cond_name] = new_row
    
    # clean up
    res.index.name = 'condition'
    res = res.reset_index()
    
    return res