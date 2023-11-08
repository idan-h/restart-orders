import io
import json
import logging
import traceback
from fdk import response
from fdk import context

from library.functions import market_place_create_or_update_order

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

        market = market_place_create_or_update_order(api_key, "1308624505", "1308624313","ADMIN", "dx$D5D6p4Qg9!nk", "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.il-jerusalem-1.oraclecloud.com))(connect_data=(service_name=g47ff6ba2516085_mondaydb_low.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))" )
    

        market_place_create_or_update_order(API_KEY, response_dict['itemId'], response_dict['boardId'],\
                                             ORACLE_USER, ORACLE_PASSWORD, ORACLE_DSN)
    except (Exception,):
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))

    return response.Response(
        ctx, response_data=json.dumps(jsonData),
        headers={"Content-Type": "application/json"}
    )
