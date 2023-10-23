import io
import json
import logging
import traceback

from fdk import response
from fdk import context

from library.functions import get_products
from urllib.parse import urlparse, parse_qs


def get_query_param(url, param_name, default=None):
    parsed_url = urlparse(url)
    query_params = parse_qs(parsed_url.query)
    return query_params.get(param_name, [default])[0]


def handler(ctx: context, data: io.BytesIO = None):
    logger = logging.getLogger()

    API_KEY = ctx.Config()['API_KEY']
    form_type = get_query_param(ctx.RequestURL(), 'type', 'IDF')

    response_dict = {}
    try:
        response_dict = get_products(API_KEY, form_type)
    except (Exception,):
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))
        response_dict['error'] = 'An error has occurred'

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )
