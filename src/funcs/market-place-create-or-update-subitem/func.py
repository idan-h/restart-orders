import io
import json
import logging
import traceback
from fdk import response
from fdk import context

from library.functions import market_place_create_or_update_subitem

def handler(ctx: context, data: io.BytesIO = None):
    jsonData = json.loads(data.getvalue())
    logger = logging.getLogger()

    API_KEY = ctx.Config()['API_KEY']

    response_dict = {}
    logger.info(f'jsonData {jsonData}')

    response_dict['itemId'] = jsonData['event']['pulseId']
    response_dict['boardId'] = jsonData['event']['boardId']

    market_place_create_or_update_subitem(API_KEY, response_dict['itemId'], response_dict['boardId'])
    # monday_api = MondayApi(API_KEY, API_URL)
    # monday_board = MondayBoard(monday_api, id=response_dict['boardId'])
    # items = monday_board.get_item_v2(response_dict['itemId']).get('data').get('items')
    # response_dict['item'] = items
    # logger.info(f'response {response_dict}')

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )
