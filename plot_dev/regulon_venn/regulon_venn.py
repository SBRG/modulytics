""" regulon_venn.py:
    Generates .csv files to be read by regulon_venn.js for ModulomeVis site
"""

# import
import pandas as pd


def gene_venn_df(ica_data, k):
    tf = enrich.TF[k]

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

    # Get component genes and operons
    comp_genes = set(ica_data.show_enriched(k).index)
    both_genes = set(reg_genes & comp_genes)

    reg_operons = len(ica_data.genes2operons(reg_genes))
    comp_operons = len(ica_data.genes2operons(comp_genes))
    both_operons = len(ica_data.genes2operons(reg_genes & comp_genes))

    return (pd.DataFrame([len(reg_genes), len(comp_genes), len(both_genes),
                          reg_operons, comp_operons, both_operons], columns=['Number'],
                         index=['reg_genes', 'comp_genes', 'both_genes',
                                'reg_ops', 'comp_ops', 'both_ops']))
