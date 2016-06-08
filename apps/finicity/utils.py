
import re
from string import capwords


def maybe_list(obj):
    if isinstance(obj, list):
        return obj
    else:
        return [obj]


def normalize_transaction_description(description):
    if description.lower().startswith('amazon web services'):
        return 'Amazon Web Services'

    if description.lower().startswith('audible'):
        return 'Audible'

    if description.lower().startswith('browserstack.com'):
        return 'BrowserStack'

    if 'crunchyroll' in description.lower():
        return 'Crunchyroll'

    if description.lower().startswith('digital ocean'):
        return 'Digital Ocean'

    if description.lower().startswith('freshbooks'):
        return 'Freshbooks'

    if description.lower().startswith('github.com'):
        return 'Github'

    if description.lower().startswith('netflix'):
        return 'Netflix'

    if description.lower().startswith('playstation'):
        return 'PlayStation'

    if description.lower().startswith('plex'):
        return 'Plex'

    if description.lower().startswith('trello'):
        return 'Trello'

    if description.lower().startswith('usenetserver.com'):
        return 'UsenetServer'

    if description.lower().startswith('wikimedia'):
        return 'Wikimedia'

    if description.lower().startswith('www hover com'):
        return 'Hover'

    if description.lower() == 'bbs securities msp' or description.lower() == 'cdn shr invest':
        return 'Wealthsimple'

    if description.lower().startswith('dropbox'):
        return 'Dropbox'

    if description.lower().startswith('meundies.com'):
        return 'MeUndies'

    if description.lower().startswith('oculus'):
        return 'Oculus'

    description = description.split('   ')
    if len(description) > 1:
        description = description[:-1]
    description = ' '.join(description)

    description = description.replace('*', ' ')
    description = re.sub(r'[\d-]+$', '', description)
    description = capwords(description)

    return description
