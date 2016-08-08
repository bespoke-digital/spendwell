
from io import StringIO
import csv
import json
from zipfile import ZipFile


def export_user_data(export_file, owner):
    export = {
        'institutions': [],
        'accounts': [],
        'transactions': [],
        'buckets': [],
    }

    for institution in owner.institutions.all():
        export['institutions'].append({
            'id': institution.id,
            'name': institution.name,
        })

    for account in owner.accounts.filter(disabled=False):
        export['accounts'].append({
            'id': account.id,
            'institution': account.institution.id,
            'name': account.name,
            'type': account.type,
            'subtype': account.subtype,
            'current_balance': account.current_balance,
        })

        for transaction in account.transactions.all():
            export['transactions'].append({
                'id': transaction.id,
                'account': transaction.account.id,
                'description': transaction.description,
                'amount': transaction.amount,
                'date': transaction.date.isoformat(),
            })

    for bucket in owner.buckets.all():
        export['buckets'].append({
            'id': bucket.id,
            'name': bucket.name,
            'type': bucket.type,
            'filters': json.dumps(bucket._filters),
        })

    with ZipFile(export_file, mode='x') as zip_file:
        for key, values in export.items():
            if len(values) == 0:
                continue

            with StringIO() as csv_file:
                writer = csv.DictWriter(csv_file, fieldnames=values[0].keys())
                writer.writeheader()
                for row in values:
                    writer.writerow(row)

                zip_file.writestr('{}.csv'.format(key), csv_file.getvalue())
