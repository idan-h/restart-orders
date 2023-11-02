import io
import json
import logging
import traceback
 
from fdk import response
from fdk import context
 
from library.functions import validate_user_login
 
def handler(ctx: context, data: io.BytesIO = None):
    logger = logging.getLogger()
 
    API_KEY = ctx.Config()['API_KEY']
 
    try:
        body = json.loads(data.getvalue())
 
        if 'username' not in body.keys() or 'password' not in body.keys():
            logger.info('Login to user ')
            response_dict = {"error": "username or password wasn't provided"}
        else:
            email = body["username"]
            is_valid = validate_user_login(API_KEY, email, body["password"])
            if(is_valid):
                response_dict = {"userId": email}
            else:
                response_dict = {"error": "Invalid username or password"}
    except (Exception,):
        logger.info('error: ' + traceback.format_exc().replace('\n', ''))
        response_dict['error'] = 'An error has occurred'
 
    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )