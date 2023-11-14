import io
import json
import logging
import traceback

from fdk import response
from fdk import context

from library.functions import assign_product
from urllib.parse import urlparse , unquote


def handler(ctx: context, data: io.BytesIO = None):
    logger = logging.getLogger()

    API_KEY = ctx.Config()['API_KEY']
    ORACLE_DSN = ctx.Config()['ORACLE_DSN']
    ORACLE_PASSWORD = ctx.Config()['ORACLE_PASSWORD']
    ORACLE_USER = ctx.Config()['ORACLE_USER']

    parsed_url = urlparse(ctx.RequestURL())

    response_dict = {}
    try:
        user_id = unquote( parsed_url.query.split('=')[1])
        if not user_id:
            raise Exception('User id is none')

        body = json.loads(data.getvalue())

        if 'orderId' not in body.keys():
            raise Exception('Order id not provided')

        if 'subItemId' not in body.keys():
            raise Exception('Sub item id not provided')

        if 'subItemBoardId' not in body.keys():
            raise Exception('Sub item board id not provided')

        success = assign_product(API_KEY, body["orderId"], body["subItemId"], body["subItemBoardId"] , user_id, ORACLE_USER, ORACLE_PASSWORD, ORACLE_DSN)
        if success:
            response_dict = {"success": "Product was assigned successfully"}
        else:
            response_dict = {"error": "Product assignment failed"}

    except Exception as e:
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))
        response_dict['error'] = 'An error has occurred ' + str(e)

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )
