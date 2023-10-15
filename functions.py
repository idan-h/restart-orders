from helpers.monday_api import MondayApi, MondayBoard
from consts.consts import API_URL, PRODUCT_BOARD_ID, ORDERS_BOARD_ID
import uuid
import json


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
        'text48': dto['tenant'],  # Tenant Code
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
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items')
    categories = []
    for item in items:
        for column_value in item.get('column_values'):
            if column_value.get('title') == 'קטגוריה':
                categories.append(column_value.get('text'))
    return list(set(categories))


def get_products_and_categories(api_key):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=PRODUCT_BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items')
    products_and_categories = []
    for item in items:
        for column_value in item.get('column_values'):
            if column_value.get('title') == 'קטגוריה':
                products_and_categories.append([item.get('name'), column_value.get('text')])
    return products_and_categories

