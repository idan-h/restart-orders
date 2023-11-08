import io
import json
import logging
import traceback
from fdk import response
from fdk import context
from library.monday_api import MondayApi , MondayBoard
from library.consts import API_URL , ORDERS_BOARD_ID

def handler(ctx: context, data: io.BytesIO = None):
    j = json.loads(data.getvalue())
    logger = logging.getLogger()
    logger.info('what"s up ???')

    API_KEY = ctx.Config()['API_KEY']

    response_dict = {}


    response_dict['itemId'] = j['event']['pulseId']
    response_dict['boardId'] = j['event']['boardId']

    monday_api = MondayApi(API_KEY, API_URL)
    monday_board = MondayBoard(monday_api, id=response_dict['boardId'])
    items = monday_board.get_item_v2(response_dict['itemId']).get('data').get('items')
    response_dict['item'] = items
    logger.info(f'response {response_dict}')

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )
