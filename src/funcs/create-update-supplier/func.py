import io
import json
import logging
import traceback
from fdk import response
from fdk import context
import oci
from library.suppliers import suppliers

def handler(ctx: context, data: io.BytesIO = None):
    # global API_KEY
    logger = logging.getLogger()
    API_KEY = ctx.Config()['API_KEY']

    response_dict = {}
    try:
        body = json.loads(data.getvalue())
        s = suppliers(API_KEY)

        if 'id' in body.keys():
            logger.info('Update supplier')
            s.update_supplier(body)
            response_dict['success'] = True
        else:
            logger.info('Create supplier')
            supplier_id = s.create_supplier(body)
            response_dict['success'] = True
            response_dict['id'] = supplier_id

    except (Exception,):
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))
        response_dict['error'] = 'An error has occurred'

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )
