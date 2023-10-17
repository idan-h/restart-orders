from helpers.monday_api import MondayApi, MondayBoard
from consts.consts import API_URL, PRODUCT_BOARD_ID, ORDERS_BOARD_ID
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
    subitems_ids = [x['id'] for x in existing_item.get('subitems', [])]
    existing_item_id = int(existing_item['id'])

    monday_board.change_multiple_column_values({
        'short_text': dto['note'],  # Note
        'dropdown': dto['location'],  # Location
        **({'status': 'בוטל'} if dto['is_cancel'] else {})  # Order Status
    }, existing_item_id)

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
            'quantity': i['numbers'],
        } for i in subitems]
    }


def get_products(api_key):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=PRODUCT_BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items_page').get('items')
    products = [{'name': i.get('name'), 'id': i.get('id')} for i in items ]

    return products


def get_product_categories(api_key):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=PRODUCT_BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items_page').get('items')
    categories = []
    for item in items:
        for column_value in item.get('column_values'):
            if column_value.get('title') == 'קטגוריה':
                categories.append(column_value.get('text'))
    return list(set(categories))


def get_products_and_categories(api_key):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=PRODUCT_BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items_page').get('items')
    products_and_categories = []
    for item in items:
        for column_value in item.get('column_values'):
            if column_value.get('title') == 'קטגוריה':
                products_and_categories.append([item.get('name'), column_value.get('text')])
    return products_and_categories


def handle_duplicates(api_key):
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

    df_has_similar_id = df[df['similar_id'].notna() & df['text42'].isna() & df['status'] == 'ממתין']

    for index, row in df_has_similar_id.iterrows():
        result = monday_board.change_multiple_column_values({
            'text42': row['similar_id'],  # Similar Id
            'status': 'פוטנציאל לכפילות',  # Status
        }, row['meta_id'])
        print(result)
