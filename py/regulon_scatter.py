""" regulon_scatter.py: 
    Generates .csv files to be read by regulon_scatter.js for ModulomeVis site
"""

import numpy as np
import pandas as pd
import re
from scipy.optimize import curve_fit
from sklearn.metrics import r2_score

def broken_line(x, A, B, C): # this is your 'straight line' y=f(x)
    y = np.zeros(len(x),dtype=np.float)
    y += (A*x+B) * (x >= C)
    y += (A*C + B) * (x < C)
    return y

def solid_line(x,A,B):
    y = (A*x+B)
    return y

def get_fit(x,y):
    
    def adj_r2(f,x,y,params):
        n = len(x)
        k = len(params)-1
        r2 = r2_score(y,f(x,*params))
        return 1 - np.true_divide((1-r2)*(n-1),(n-k-1))

    all_params = []
    for c in [min(x),np.mean(x),max(x)]:
        try:
            all_params.append(curve_fit(broken_line, x, y,p0=[1,1,c])[0])
        except:
            pass
        
    all_params.append(curve_fit(solid_line,x,y)[0])

    best_r2 = -np.inf
    for params in all_params:
        if len(params) == 2:
            r2 = adj_r2(solid_line,x,y,params)
        else:
            r2 = adj_r2(broken_line,x,y,params)
            
        if r2 > best_r2:
            best_r2 = r2
            best_params = params
            
    if best_r2 < 0:
        return [0,np.mean(y)],0

    return best_params,best_r2

def get_tfs_to_scatter(ica_data, tf_string):
    
    rename_tfs = {'csqR':'yihW', 'hprR':'yedW'}
    res = []
    if type(tf_string) == str:
        tfs = re.split('\+|\/', tf_string)
        
        for tf in tfs:
            if tf in rename_tfs.keys():
                tf = rename_tfs[tf]
            
            if tf in ica_data.name2num.keys():
                b_num = ica_data.name2num[tf]
                if b_num in ica_data.X.index:
                    res += [tf]
    return res

def regulon_scatter_df(ica_data, k, row):
    '''
    input: ica_data, from github.com/SBRG/ICA
           k, the i-modulon's index
           row, the corresponding row in curated_enrichments.csv
    output: a dataframe for producing the scatter plot
    '''
    tfs = get_tfs_to_scatter(ica_data, row.TF)

    if len(tfs) == 0:
        return None

    # coordinates for points
    coord = pd.DataFrame(columns = ['A']+tfs, index = ica_data.A.columns)
    coord['A'] = ica_data.A.loc[k]
    ylim = np.array([coord['A'].min(),coord['A'].max()])
    
    # params for fit line
    param_df = pd.DataFrame(columns = ['A']+tfs, index = ['R2', 'xmin', 'xmid', 'xmax', 'ystart', 'yend'])
    
    # fill in dfs
    for tf in tfs:

        # coordinates
        coord[tf] = ica_data.X.loc[ica_data.name2num[tf]]
        xlim = np.array([coord[tf].min(), coord[tf].max()])
        # fit line
        params, r2 = get_fit(coord[tf], coord['A'])
        if len(params) == 2: # unbroken
            y = solid_line(xlim,*params)
            out = [xlim[0], np.nan, xlim[1], y[0], y[1]] 
        else: # broken
            xvals = np.array([xlim[0],params[2],xlim[1]])
            y = broken_line(xvals,*params)
            out = [xlim[0], params[2], xlim[1], y[0], y[2]]

        param_df[tf] = [r2]+out 

    res = pd.concat([param_df, coord], axis = 0)
    res = res.sort_values('R2', axis = 1, ascending=False)
    res = res[pd.Index(['A']).append(res.columns.drop('A'))]
    
    return res