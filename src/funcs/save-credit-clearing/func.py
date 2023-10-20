import io
import json
from library.functions import insert_clearing_transaction
from fdk import response


def handler(ctx, data: io.BytesIO = None):
    api_key = ctx.Config().get('API_KEY')
    if api_key is None:
        return response.Response(
            ctx, response_data=json.dumps(
                {"message": "API_KEY is not set"}),
            headers={"Content-Type": "application/json"}
        )

    j = json.loads(data.getvalue())
    new_item = insert_clearing_transaction(api_key , j)

    return response.Response(
        ctx, response_data=json.dumps(
            {"message": "Successfully created item"  , "id" : str(new_item['create_item']['id'])}),
        headers={"Content-Type": "application/json"}
    )


