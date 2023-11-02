import io
import json
import logging
import traceback

from fdk import response
from fdk import context

from library.functions import get_subitem_statuses


def handler(ctx: context, data: io.BytesIO = None):
    logger = logging.getLogger()

    API_KEY = ctx.Config()['API_KEY']

    response_dict = {}
    try:
        response_dict = {"statuses" : get_subitem_statuses(API_KEY)}
    except (Exception,):
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))
        response_dict['error'] = 'An error has occurred'

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )
