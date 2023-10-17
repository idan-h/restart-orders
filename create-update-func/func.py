import io
import json
import logging

from fdk import response
from fdk import context
import oci

from library.functions import create_order, update_order


API_KEY_SECRET_OCID = "ocid1.vaultsecret.oc1.il-jerusalem-1.amaaaaaad7jh6nqagozrecoqlbygczbjllj5n3sq6bpb3qqu3xnbrlopmfta"
# API_KEY = None


def get_secret_from_vault(secret_ocid):
    signer = oci.auth.signers.get_resource_principals_signer()
    client = oci.secrets.SecretsClient(config={}, signer=signer)
    secret_content = client.get_secret_bundle(secret_id=secret_ocid).data.secret_bundle_content.content
    return secret_content


def handler(ctx: context, data: io.BytesIO = None):
    # global API_KEY

    logger = logging.getLogger()

    # if API_KEY is None:
    #     logger.info('Retrieving secret API_KEY')
    #     API_KEY = get_secret_from_vault(API_KEY_SECRET_OCID)
    API_KEY = ctx.Config()['API_KEY']

    logger.info(API_KEY)
    logger.info(ctx.Config())

    response_dict = {}
    try:
        body = json.loads(data.getvalue())
        logger.info(body)

        if 'id' in body.keys():
            logger.info('Update order')
            update_order(API_KEY, body)
            response_dict['success'] = True
        else:
            logger.info('Create order')
            order_id = create_order(API_KEY, body)
            response_dict['success'] = True
            response_dict['id'] = order_id
    except (Exception,) as ex:
        logging.getLogger().info('error: ' + str(ex))
        response_dict['error'] = 'An error has occurred'

    return response.Response(
        ctx, response_data=json.dumps(response_dict),
        headers={"Content-Type": "application/json"}
    )
