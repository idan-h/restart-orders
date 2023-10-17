import io
import json
import logging
import os

from fdk import response
from fdk import context

from library.functions import create_order, update_order


def handler(ctx: context, data: io.BytesIO = None):
    api_key = os.environ.get("API_KEY")
    logger = logging.getLogger()

    logger.info(api_key)
    logger.info(ctx.RequestURL())
    logger.info(ctx.Config())

    order_id = None
    try:
        body = json.loads(data.getvalue())
        logger.info(body)

        if 'id' in body.keys():
            logger.info('Update order')
            update_order(api_key, body)
        else:
            logger.info('Create order')
            create_order(api_key, body)
    except (Exception,) as ex:
        logging.getLogger().info('error: ' + str(ex))

    response_dict = {'error': 'An error has occurred'} if order_id is None else {'id': order_id}

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )
