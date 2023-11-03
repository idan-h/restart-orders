import io
import json
import logging
import traceback

from fdk import response
from fdk import context

from library.functions import get_user_order
from urllib.parse import urlparse


def handler(ctx: context, data: io.BytesIO = None):
    logger = logging.getLogger()

    API_KEY = ctx.Config()['API_KEY']

    parsed_url = urlparse(ctx.RequestURL())

    response_dict = {}
    try:
        order_id = parsed_url.query.split('=')[1]
        if not order_id:
            raise Exception('order id is none')

        response_dict = get_user_order(API_KEY, order_id)
    except (Exception,) as e:
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))
        response_dict['error'] = 'An error has occurred ' + str(e)

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )


