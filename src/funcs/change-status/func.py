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
    ORACLE_DSN = ctx.Config()['ORACLE_DSN']
    ORACLE_PASSWORD = ctx.Config()['ORACLE_PASSWORD']
    ORACLE_USER = ctx.Config()['ORACLE_USER']

    try:
        body = json.loads(data.getvalue())
 
        if 'orderId' not in body.keys():
            raise Exception('Order id not provided')

        if 'subItemId' not in body.keys():
            raise Exception('Sub item id not provided')

        if 'subItemBoardId' not in body.keys():
            raise Exception('Sub item board id not provided')

        if 'status' not in body.keys():
            raise Exception('Status not provided')

        order_id = body["orderId"]
        subitem_id = body["subItemId"]
        status = body["status"]
        subitem_board_id = body["subItemBoardId"]
        success = update_order_status(API_KEY, order_id, subitem_id, subitem_board_id, status, ORACLE_USER, ORACLE_PASSWORD, ORACLE_DSN)
        response_dict = {"status": success} if success else {"error": "Failed to update status"}

    except (Exception,) as e:
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))
        response_dict = {'error': 'An error has occurred ' + str(e)}
 
    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )