from library.monday_api import MondayApi, MondayBoard
from library.consts import API_URL, ORDERS_BOARD_ID
from main import API_KEY

monday_api = MondayApi(API_KEY, API_URL)
monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)

item = monday_board.get_items(return_items_as='json', limit=1)\
    .get('data').get('boards')[0].get('items_page').get('items')[0]

count = 0
while True:
    count += 1
    result = monday_board.change_multiple_column_values({
        'short_text': next((x['text'] for x in item['column_values'] if x['id'] == 'short_text'), None),
    }, item['id'])
    print(result)
    print(count)
