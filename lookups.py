from helpers.monday_api import MondayApi, MondayBoard
BOARD_ID = 1289515521

BI_MONDAY_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI4ODIwMzA4MSwiYWFpIjoxMSwidWlkIjo1MDEyNDQ2NywiaWFkIjoiMjAyMy0xMC0xMlQwODo0OTowMC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTkyNjA2MDEsInJnbiI6ImV1YzEifQ.2yE5g-JP2gcLiwBjVfMkiLZe7UZTo2vjm768yF9rcIA'
BI_MONDAY_API_URL = 'https://api.monday.com/v2'

def get_products():
    monday_api = MondayApi(BI_MONDAY_API_KEY, BI_MONDAY_API_URL)
    monday_board = MondayBoard(monday_api, id=BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items')
    products = [i.get('name') for i in items ]

    return products


def get_product_categories():
    monday_api = MondayApi(BI_MONDAY_API_KEY, BI_MONDAY_API_URL)
    monday_board = MondayBoard(monday_api, id=BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items')
    categories = []
    for item in items:
        for column_value in item.get('column_values'):
            if column_value.get('title') == 'קטגוריה':
                categories.append(column_value.get('text'))
    return list(set(categories))



def get_products_and_categories():
    monday_api = MondayApi(BI_MONDAY_API_KEY, BI_MONDAY_API_URL)
    monday_board = MondayBoard(monday_api, id=BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items')
    products_and_categories = []
    for item in items:
        for column_value in item.get('column_values'):
            if column_value.get('title') == 'קטגוריה':
                products_and_categories.append([item.get('name'), column_value.get('text')])
    return products_and_categories



def get_order(order_id):
    monday_api = MondayApi(BI_MONDAY_API_KEY, BI_MONDAY_API_URL)
    monday_board = MondayBoard(monday_api, id=1291189607)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items')
    for item in items:
        for column_value in item.get('column_values'):
            if column_value.get('title') == 'מספר הזמנה':
                if column_value.get('text') == str(order_id):
                    return item
    return None

print(get_order(123) )

