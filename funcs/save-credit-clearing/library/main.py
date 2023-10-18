from functions import create_order, update_order, get_order, get_products

API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI4OTMxNzgzNywiYWFpIjoxMSwidWlkIjo1MDE4MTcwNSwiaWFkIjoiMjAyMy0xMC0xN1QxNjoxNDowNy4xMjFaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTkyNjA2MDEsInJnbiI6ImV1YzEifQ.-e4L5oyY3Sq-2uaRIdPm2Ae5q4ucxy_mtUyC0t43eIU'


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
