import io
import json
import logging
import traceback

from fdk import response
from fdk import context

from library.suppliers import suppliers
from urllib.parse import urlparse


def handler(ctx: context, data: io.BytesIO = None):
    logger = logging.getLogger()

    API_KEY = ctx.Config()['API_KEY']

    parsed_url = urlparse(ctx.RequestURL())

    response_dict = {}
    try:
        suplier_id = parsed_url.query.split('=')[1]
        if not suplier_id:
            raise Exception('suplier id is none')
        s = suppliers(API_KEY)
        response_dict = s.get_supplier(suplier_id)
    except (Exception,):
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))
        response_dict['error'] = 'An error has occurred'

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )
