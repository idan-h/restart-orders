import io
import json
import logging
import traceback

from fdk import response
from fdk import context

from library.functions import get_assigned_orders_to_user
from urllib.parse import urlparse , unquote


def handler(ctx: context, data: io.BytesIO = None):
    logger = logging.getLogger()

    DSN = ctx.Config()['ORACLE_DSN']
    USERNAME = ctx.Config()['ORACLE_USER']
    PASSWORD = ctx.Config()['ORACLE_PASSWORD']

    parsed_url = urlparse(ctx.RequestURL())

    response_dict = {}
    try:
        user_id = unquote( parsed_url.query.split('=')[1])
        if not user_id:
            raise Exception('User id is none')
        
        response_dict = {"orders" : get_assigned_orders_to_user(USERNAME, PASSWORD, DSN, user_id)}
    except (Exception,):
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))
        response_dict['error'] = 'An error has occurred'

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )
