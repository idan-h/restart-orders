import io
import json
import logging
import traceback

from fdk import response
from fdk import context

from library.functions import handle_duplicate_orders


def handler(ctx: context, data: io.BytesIO = None):
    logger = logging.getLogger()

    API_KEY = ctx.Config()['API_KEY']

    try:
        handle_duplicate_orders(API_KEY)
    except (Exception,):
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))

    return response.Response(
        ctx, response_data=json.dumps({'ok': True}),
        headers={"Content-Type": "application/json"}
    )
