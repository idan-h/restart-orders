import io
import json
import logging
import traceback
from fdk import response
from fdk import context

from library.functions import market_place_create_or_update_subitem

def handler(ctx: context, data: io.BytesIO = None):
    jsonData = json.loads(data.getvalue())
    try:
        logger = logging.getLogger()

        API_KEY = ctx.Config()['API_KEY']
        ORACLE_DSN = ctx.Config()['ORACLE_DSN']
        ORACLE_PASSWORD = ctx.Config()['ORACLE_PASSWORD']
        ORACLE_USER = ctx.Config()['ORACLE_USER']

        response_dict = {}
        logger.info(f'jsonData {jsonData}')

        response_dict['itemId'] = jsonData['event']['pulseId']
        response_dict['boardId'] = jsonData['event']['boardId']
        response_dict['parentItemId'] = jsonData['event']['parentItemId']

        market_place_create_or_update_subitem(API_KEY, response_dict['itemId'], response_dict['boardId'], response_dict['parentItemId']\
                                              , ORACLE_USER, ORACLE_PASSWORD, ORACLE_DSN)
    except (Exception,):
        logger.error('error: ' + traceback.format_exc().replace('\n', ''))

    return response.Response(
        ctx, response_data=json.dumps(jsonData),
        headers={"Content-Type": "application/json"}
    )
