import os
from src.library.functions import create_order, update_order, get_order, get_products

API_KEY = os.environ['RESTART_MONDAY_API_KEY']


if __name__ == "__main__":
    create_order_dto = {
        'name': 'asdf',
        'note': '123',  # Note
        'phone': '1',  # Phone
        'unit': '1',  # Unit
        'job': '1',  # Job
        'email': "adsf@asdf.com",  # Email
        'location': 'דרום',  # Location
        'tenant': 'example',
        'type': 'EMR',
        'subitems': [{
            'name': 'lalala',
            'product_number': 1289515528,
            'quantity': 22,
        }]
    }

    update_order_dto = {
        'id': 'xxx',
        'note': '333',  # Note
        'location': 'צפון',  # Location
        'is_cancel': True,
        'subitems': [
            {
                'name': 'AAA',
                'product_number': 1289516873,
                'quantity': 10,
            },
            {
                'name': 'BBB',
                'product_number': 1289516863,
                'quantity': 5,
            },
        ]
    }

    order_id = create_order(API_KEY, create_order_dto)

    print(order_id)

    update_order_dto['id'] = order_id
    update_order(API_KEY, update_order_dto)

    order = get_order(API_KEY, order_id)

    print(order)

    products = get_products(API_KEY)
    print(products)
