# update doc string and delete this line
""" gene_table.py: 
    Generates .csv files to be read by gene_table.js for ModulomeVis site
"""

import numpy as np
import pandas as pd

# insert helper functions if necessary

# edit function name, inputs, doc string, etc...
def gene_table_df(ica_data, k, row):
    '''
    input: ica_data, from github.com/SBRG/ICA
           k, the i-modulon's index
           row, its associated row in curated_enrichments.csv
    output: a dataframe for producing the table (in this case, just the table)
    '''
    res = pd.DataFrame()
    
    return res