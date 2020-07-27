""" general_functions.py: 
    Contains additional functions for generating Modulytics sites, not specific to any plots.
"""


def tf_with_links(tf_str, tf_links):
    '''
    inputs: tf, the original TF string from curated_enrichments
            tf_links, a dictionary of urls for each transcription factor
    output: an html string for the TF combination that contains links where appropriate
    
    It is critical that the tfs in 'tf' are in the same format as the keys to tf_links.
    '''

    if not(type(tf_str) == str):
        return tf_str

    # get a list of transcription factors
    and_or = ''
    if '/' in tf_str:
        and_or = ' or '
        tfs = tf_str.split('/')
    elif '+' in tf_str:
        and_or = ' and '
        tfs = tf_str.split('+')
    else:
        tfs = [tf_str]

    # start building an html string
    tfs_html = []
    for tf in tfs:
        if tf in tf_links.keys():
            link = tf_links[tf]
            if type(link)==str:# this tf has a link
                tf_ = '<a href="' + link + '" target="_blank">'+ tf + '</a>'
                tfs_html += [tf_]
            else: # this tf has no link
                tfs_html += [tf]
        # this tf isn't in the tf_links file
        else:
            tfs_html += [tf]
    res = and_or.join(tfs_html)
    return res