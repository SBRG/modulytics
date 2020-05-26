""" regulon_venn.py:
    Generates .csv files to be read by regulon_venn.js for ModulomeVis site
"""

# import
import pandas as pd
import numpy as np

def regulon_venn_df(ica_data, k, row):
    tf = row['TF']

    # Take care of and/or enrichments
    if '+' in tf:
        reg_list = []
        for tfx in tf.split('+'):
            reg_list.append(set(ica_data.trn[ica_data.trn.TF == tfx].gene_id.unique()))
        reg_genes = set.intersection(*reg_list)
    elif '/' in tf:
        reg_genes = set(ica_data.trn[ica_data.trn.TF.isin(tf.split('/'))].gene_id.unique())
    else:
        reg_genes = set(ica_data.trn[ica_data.trn.TF == tf].gene_id.unique())

    # Get component genes
    comp_genes = set(ica_data.show_enriched(k).index)
    both_genes = set(reg_genes & comp_genes)
    
    # Get gene and operon counts
    reg_gene_count = len(reg_genes)
    comp_gene_count = len(comp_genes)
    both_gene_count = len(both_genes)
    reg_operon_count = len(ica_data.genes2operons(reg_genes))
    comp_operon_count = len(ica_data.genes2operons(comp_genes))
    both_operon_count = len(ica_data.genes2operons(reg_genes & comp_genes))
    
    # Add adjustments for venn plotting (add '2' for alternates)
    reg_gene_count2 = 0; comp_gene_count2 = 0; both_gene_count2 = 0
    if reg_genes == comp_genes:
        reg_gene_count = 0; comp_gene_count = 0; both_gene_count = 0
        reg_gene_count2 = 0; comp_gene_count2 = 0; both_gene_count2 = len(reg_genes)
    elif all(item in comp_genes for item in reg_genes):
        reg_gene_count = 0; both_gene_count = 0
        reg_gene_count2 = len(reg_genes); comp_gene_count2 = 0; both_gene_count2 = 0
    elif all(item in reg_genes for item in comp_genes):
        comp_gene_count = 0; both_gene_count = 0
        reg_gene_count2 = 0; comp_gene_count2 = len(comp_genes); both_gene_count2 = 0
        
    res = pd.DataFrame([tf, reg_gene_count, comp_gene_count, both_gene_count,
                        reg_gene_count2, comp_gene_count2, both_gene_count2,
                        reg_operon_count, comp_operon_count, both_operon_count], columns=['Value'],
                       index=['TF', 'reg_genes', 'comp_genes', 'both_genes',
                                'reg_genes2', 'comp_genes2', 'both_genes2',
                                'reg_ops', 'comp_ops', 'both_ops'])
    
    # Kevin adding here: gene lists
    just_reg = reg_genes - both_genes
    just_comp = comp_genes - both_genes
    for i, l in zip(['reg_genes', 'comp_genes', 'both_genes'],[just_reg, just_comp, both_genes]):
        gene_list = np.array([ica_data.num2name[g] for g in l])
        gene_list = np.array2string(gene_list, separator = ' ')
        res.loc[i, 'list'] = gene_list
    
    return res