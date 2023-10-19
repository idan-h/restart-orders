from library.monday_api import MondayApi, MondayBoard
from library.consts import API_URL, PRODUCT_BOARD_ID, ORDERS_BOARD_ID , DONATIONS_BOARD_ID
import uuid
import json
import pandas as pd


def create_order(api_key, dto):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)

    order_id = uuid.uuid4().hex

    new_item = monday_board.insert_item(dto['name'], {
        'short_text': dto['note'],  # Note
        'text8': dto['phone'],  # Phone
        'text0': dto['unit'],  # Unit
        'text7': dto['job'],  # Job
        'email': {"email": dto['email'], "text": ""},  # Email
        'dropdown': dto['location'],  # Location
        'color': {"label": dto['tenant']},  # Tenant Code
        'text5': order_id,  # Custom Id
    })
    new_item_id = int(new_item['create_item']['id'])

    for subitem in dto.get('subitems', []):
        monday_board.insert_subitem(subitem['name'], {
            'connect_boards': {"linkedPulseIds": [{"linkedPulseId": subitem['product_number']}]},  # Product
            'numbers': subitem['quantity'],  # Quantity
        }, new_item_id)

    return order_id


def update_order(api_key, dto):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)

    existing_item = monday_board.get_items_by_column_values('text5', str(dto['id']), return_items_as='json')\
        .get('data').get('items_page_by_column_values').get('items')[0]
    existing_item_id = int(existing_item['id'])

    is_cancel = dto.get('is_cancel', False)

    column_values = {'status': 'בוטל'} if is_cancel else {
        'short_text': dto['note'],  # Note
        'dropdown': dto['location'],  # Location
    }

    monday_board.change_multiple_column_values(column_values, existing_item_id)

    if is_cancel:
        return

    subitems_ids = [x['id'] for x in existing_item.get('subitems', [])]

    for item_id in subitems_ids:
        monday_board.delete_item(item_id)

    for subitem in dto.get('subitems', []):
        monday_board.insert_subitem(subitem['name'], {
            'connect_boards': {"linkedPulseIds": [{"linkedPulseId": subitem['product_number']}]},  # Product
            'numbers': subitem['quantity'],  # Quantity
        }, existing_item_id)


def get_order(api_key, order_id):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)
    order = monday_board.get_items_by_column_values('text5', str(order_id), return_items_as='json')\
        .get('data').get('items_page_by_column_values').get('items')[0]
    column_values = {v['id']: v['text'] for v in order.get('column_values')}

    if column_values.get('status') == 'בוטל':
        return {'is_cancel': True}

    subitems = order.get('subitems', [])

    for item in subitems:
        item.update({v['id']: v['value'] for v in item.get('column_values')})
        del item['column_values']

    return {
        'name': order['name'],
        'note': column_values['short_text'],  # Note
        'phone': column_values['text8'],  # Phone
        'unit': column_values['text0'],  # Unit
        'job': column_values['text7'],  # Job
        'email': column_values['email'],  # Email
        'location': column_values['dropdown'],  # Location
        'subitems': [{
            'name': i['name'],
            'product_number': json.loads(i['connect_boards'])['linkedPulseIds'][0]['linkedPulseId'],
            'quantity': int(i['numbers'].replace('"', '')),
        } for i in subitems]
    }


def get_products(api_key):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=PRODUCT_BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items_page').get('items')
    products = [{'name': i.get('name'), 'product_number': int(i.get('id'))} for i in items]

    return products


def handle_duplicate_orders(api_key):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)

    items_page = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items_page')
    all_items = items_page.get('items')
    cursor = items_page.get('cursor')
    while cursor:
        items_page = monday_board.get_items(
            return_items_as='json',
            cursor=cursor
        ).get('data').get('boards')[0].get('items_page')
        all_items += items_page.get('items')
        cursor = items_page.get('cursor')

    # Data frame manipulations
    json_df = pd.json_normalize(all_items, record_path='column_values', meta=['id'], meta_prefix='meta_')
    df_filtered = json_df[json_df['id'].isin(['text8', 'text0', 'text42', 'status'])]
    df = df_filtered.pivot(index='meta_id', columns='id', values='text').reset_index()
    df.columns.name = None

    df['text8'] = df['text8'] \
        .apply(lambda x: "972" + x.lstrip("0") if x and not x.startswith('972') else x)

    df['similar_id'] = df.groupby('text8')['meta_id'].transform(lambda x: x.iloc[0] if len(x) > 1 else None)
    mask = df['similar_id'].isna()
    df.loc[mask, 'similar_id'] = df[mask].groupby('text0')['meta_id'].transform(
        lambda x: x.iloc[0] if len(x) > 1 else None)

    df_has_similar_id = df[df['similar_id'].notna() & df['text42'].isna()]
    df_has_similar_id = df_has_similar_id[df_has_similar_id['status'] == 'ממתין']

    for index, row in df_has_similar_id.iterrows():
        result = monday_board.change_multiple_column_values({
            'text42': row['similar_id'],  # Similar Id
            'status': 'פוטנציאל לכפילות',  # Status
        }, row['meta_id'])
        print(result)


def insert_clearing_transaction(api_key , j):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=DONATIONS_BOARD_ID)
    # insert the json to monday board
    new_item = monday_board.insert_item(j['donor']['donor_email'], {
        monday_board.get_column_id('amount'): j['donation']['amount'],
        monday_board.get_column_id('norm_anount'): j['donation']['norm_anount'],
        monday_board.get_column_id('comment'): j['donation']['comment'],
        monday_board.get_column_id('created_at'): j['donation']['created_at'],
        monday_board.get_column_id('currency'): j['donation']['currency'],
        monday_board.get_column_id('charity_id'): j['donation']['charity_id'],
        monday_board.get_column_id('charity_name_en'): j['donation']['charity_name_en'],
        monday_board.get_column_id('charity_name_he'): j['donation']['charity_name_he'],
        monday_board.get_column_id('charity_number'): j['donation']['charity_number'],
        monday_board.get_column_id('target_id'): j['donation']['target_id'],
        monday_board.get_column_id('target_name_en'): j['donation']['target_name_en'],
        monday_board.get_column_id('target_name_he'): j['donation']['target_name_he'],
        monday_board.get_column_id('id'): j['donation']['id'],
        monday_board.get_column_id('end_recurring'): j['donation']['end_recurring'],
        monday_board.get_column_id('recurring'): j['donation']['recurring'],
        monday_board.get_column_id('recurring_months'): j['donation']['recurring_months'],
        monday_board.get_column_id('recurring_payment_number'): j['donation']['recurring_payment_number'],
        monday_board.get_column_id('donated_with_account'): j['donor']['donated_with_account'],
        monday_board.get_column_id('donor_email'): j['donor']['donor_email'],
        monday_board.get_column_id('donor_first_name'): j['donor']['donor_first_name'],
        monday_board.get_column_id('donor_last_name'): j['donor']['donor_last_name'],
        monday_board.get_column_id('donor_phone'): j['donor']['donor_phone'],
        monday_board.get_column_id('donor_il_id'): j['donor']['donor_il_id'],
        monday_board.get_column_id('address'): j['donor']['invoice_information']['address'],
        monday_board.get_column_id('company_number'): j['donor']['invoice_information']['company_number'],
        monday_board.get_column_id('recipient_name'): j['donor']['invoice_information']['recipient_name'],
        monday_board.get_column_id('share_details_with_charities'): j['donor']['invoice_information'][
            'share_details_with_charities'],
        monday_board.get_column_id('card_last_4'): j['transfer']['card_last_4'],
        monday_board.get_column_id('checkout_locale'): j['transfer']['checkout_locale'],
        monday_board.get_column_id('completed_at'): j['transfer']['completed_at'],
        monday_board.get_column_id('currency'): j['transfer']['currency'],
        monday_board.get_column_id('payment_type'): j['transfer']['payment_type'],
        monday_board.get_column_id('total_amount'): j['transfer']['total_amount'],
        monday_board.get_column_id('uk_tax_payer'): j['transfer']['uk_tax_payer'],
    })
    return new_item
