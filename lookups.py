from helpers.monday_api import MondayApi, MondayBoard
from consts import BI_MONDAY_API_KEY, BI_MONDAY_API_URL, PRODUCT_BOARD_ID, ORDERS_BOARD

def get_products():
    monday_api = MondayApi(BI_MONDAY_API_KEY, BI_MONDAY_API_URL)
    monday_board = MondayBoard(monday_api, id=PRODUCT_BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items')
    products = [i.get('name') for i in items ]

    return products

def get_product_categories():
    monday_api = MondayApi(BI_MONDAY_API_KEY, BI_MONDAY_API_URL)
    monday_board = MondayBoard(monday_api, id=PRODUCT_BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items')
    categories = []
    for item in items:
        for column_value in item.get('column_values'):
            if column_value.get('title') == 'קטגוריה':
                categories.append(column_value.get('text'))
    return list(set(categories))

def get_products_and_categories():
    monday_api = MondayApi(BI_MONDAY_API_KEY, BI_MONDAY_API_URL)
    monday_board = MondayBoard(monday_api, id=PRODUCT_BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items')
    products_and_categories = []
    for item in items:
        for column_value in item.get('column_values'):
            if column_value.get('title') == 'קטגוריה':
                products_and_categories.append([item.get('name'), column_value.get('text')])
    return products_and_categories

def get_order(order_id):
    monday_api = MondayApi(BI_MONDAY_API_KEY, BI_MONDAY_API_URL)
    monday_board = MondayBoard(monday_api, id=ORDERS_BOARD)
    order = monday_board.get_items_by_column_values('text5' , str(order_id) , return_items_as='json').get('data').get('items_by_column_values')
    return order
