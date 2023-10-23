import io
import json
import logging
import traceback

from fdk import response
from fdk import context

from library.functions import get_products


def handler(ctx: context, data: io.BytesIO = None):
    logger = logging.getLogger()

    API_KEY = ctx.Config()['API_KEY']
    formtype = json.loads(data.getvalue()).get('formtype' , 'IDF')

    response_dict = {}
    try:
        response_dict = get_products(API_KEY , formtype)
    except (Exception,):
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))
        response_dict['error'] = 'An error has occurred'

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )
