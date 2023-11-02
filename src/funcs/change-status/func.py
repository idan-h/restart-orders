import io
import json
import logging
import traceback
 
from fdk import response
from fdk import context
 
from library.functions import update_order_status
 
def handler(ctx: context, data: io.BytesIO = None):
    logger = logging.getLogger()
 
    API_KEY = ctx.Config()['API_KEY']

    try:
        body = json.loads(data.getvalue())
 
        if 'username' not in body.keys() or 'password' not in body.keys():
            logger.info('Login to user ')
            response_dict = {"error": "username or password wasn't provided"}
        else:
            order_id = body["orderId"]
            subitem_id = body["subItemId"]
            status = body["status"]
            subitem_board_id = body["subItemBoardId"]
            success = update_order_status(API_KEY, order_id, subitem_id, subitem_board_id, status)
            response_dict = {"status": success}
    except (Exception,):
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))
        response_dict = {'error': 'An error has occurred'}
 
    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )