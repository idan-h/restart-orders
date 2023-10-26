import json

from library.monday_api import MondayApi, MondayBoard
from library.consts import API_URL, PRODUCT_BOARD_ID, ORDERS_BOARD_ID , PRODUCT_BOARD_FORM_TYPE_ID
import json
import requests


API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI4ODIwMzA4MSwiYWFpIjoxMSwidWlkIjo1MDEyNDQ2NywiaWFkIjoiMjAyMy0xMC0xMlQwODo0OTowMC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTkyNjA2MDEsInJnbiI6ImV1YzEifQ.2yE5g-JP2gcLiwBjVfMkiLZe7UZTo2vjm768yF9rcIA'



bjson = b'{\r\n\t\r\n\t\t\r\n\t\t\r\n\t\t\"donation\":{\r\n\t\t\"amount\": 180,\r\n\t\t\"norm_anount\": 180,\r\n\t\t\"comment\": \"\",\r\n\t\t\"created_at\": \"2023-10-17 08:16:55 UTC\",\r\n        \"currency\": \"ILS\",\r\n        \r\n            \r\n\t\t\t\r\n\t\t\"charity_id\": \"1637\",\r\n\t\t\"charity_name_en\": \"Restart\",\r\n\t\t\"charity_name_he\": \"\xd7\xa8\xd7\x99\xd7\xa1\xd7\x98\xd7\x90\xd7\xa8\xd7\x98\",\r\n\t\t\"charity_number\": \"580658813\",\r\n\t\t\"target_id\": 110269,\r\n\t\t\"target_name_en\": \"The Family support unit\",\r\n        \"target_name_he\": \"\xd7\x94\xd7\xa1\xd7\x99\xd7\x99\xd7\xa8\xd7\xaa \xd7\x9c\xd7\x9e\xd7\xa2\xd7\x9f \xd7\x94\xd7\x9e\xd7\xa9\xd7\xa4\xd7\x97\xd7\x95\xd7\xaa\",\r\n\t\t\"id\": \"124\",\r\n\t\t\"end_recurring\":\"\",\r\n        \"recurring\":  \"false\" ,\r\n        \"recurring_months\": \"\",\r\n\t\t\"recurring_payment_number\": \"\"\r\n\t\t\t},\r\n\t\t\r\n\r\n\t\"donor\": {\r\n\t\t\"donated_with_account\": \"false\",\r\n\t\t\"donor_email\": \"benkatzman087@gmail.com\",\r\n\t\t\"donor_first_name\": \"\xd7\x91\xd7\x9f\",\r\n\t\t\"donor_last_name\": \"\xd7\x9b\xd7\xa6\xd7\x9e\xd7\x9f\",\r\n\t\t\"donor_phone\": \"0549923011\",\r\n\t\t\"donor_il_id\": \"206056087\",\r\n\t\"invoice_information\": {\r\n\t\t\t\"address\": \"\",\r\n\t\t\t\"company_number\": \"\",\r\n\t\t\t\"recipient_name\": \"\xd7\x91\xd7\x9f \xd7\x9b\xd7\xa6\xd7\x9e\xd7\x9f\",\r\n\t\t\t\"share_details_with_charities\": \"true\"\r\n\t\t}\r\n\t},\r\n\t\"transfer\": {\r\n\t\t\"card_last_4\": \"6313\",\r\n\t\t\"checkout_locale\": \"he\",\r\n\t\t\"completed_at\": \"2023-10-17 08:17:32 UTC\",\r\n\t\t\"currency\": \"ILS\",\r\n\t\r\n\t\t\"payment_type\":\"payme\",\r\n\t\t\"total_amount\": \"180\",\r\n\t\t\"uk_tax_payer\": \"false\"\r\n\t}\r\n}'

j = json.loads(bjson)


res = requests.post('https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/save_credit_clearing' , json=j, verify = False)

print(res.json())

exit()

def get_products(api_key):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=PRODUCT_BOARD_ID)
    items = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items_page').get('items')

    products = [{
        'name': i.get('name'),
        'product_number': int(i.get('id')),
        'type': next((z['text'] for z in i.get('column_values') if z['id'] == 'dropdown'), None)
    } for i in items]

    return products

def get_order(api_key, order_id):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)
    order = monday_board.get_items_by_column_values('text5', str(order_id), return_items_as='json')\
        .get('data').get('items_page_by_column_values').get('items')[0]
    column_values = {v['id']: v['text'] for v in order.get('column_values')}

    if column_values.get('status') == 'בוטל':
        return {'is_cancel': True}

    products = get_products(api_key)

    subitems = order.get('subitems', [])

    for item in subitems:
        item.update({v['id']: v['value'] for v in item.get('column_values')})
        del item['column_values']



    return {
        'name': order['name'],
        'note': column_values['long_text'],  # Note
        'phone': column_values['text8'],  # Phone
        'unit': column_values['text0'],  # Unit
        'job': column_values['text7'],  # Job
        'email': column_values['email'],  # Email
        'location': column_values['dropdown'],  # Location
        'type': column_values['status4'],  # From Type
        'subitems': [{
            'name': list(filter(lambda product: product['product_number'] == json.loads(i['connect_boards'])['linkedPulseIds'][0]['linkedPulseId'] , products))[0]['name'],
            'product_number': json.loads(i['connect_boards'])['linkedPulseIds'][0]['linkedPulseId'],
            'quantity': int(i['numbers'].replace('"', '')),
        } for i in subitems]
    }


monday_api = MondayApi(API_KEY, API_URL)
monday_board = MondayBoard(monday_api, id=1301955381)

monday_board.insert_item('test' , {"long_text":"benben"})
exit()
#
# for item , value in j.items():
#     if isinstance(value , dict):
#         for k , v in value.items():
#             if isinstance(v, dict):
#                 for i , j in v.items():
#                     key = i
#                     path = f"j['{item}']['{k}']['{i}']"
#                     print(f"monday_board.get_column_id('{key}')[0]: {path},")
#             else:
#                 key = k
#                 path = f"j['{item}']['{k}']"
#                 print(f"monday_board.get_column_id('{key}')[0]: {path},")
#
#     else:
#         key = item
#         path = f"j['{item}']"
#         print(f"monday_board.get_column_id('{key}')[0]: {path},")

# if the value is number then add it to monday_board as numbers otherwise add it as text
def add_dynamic_column(item , value):
    if isinstance(value , int) or isinstance(value , float):
        monday_board.add_column(item , 'numbers')
    else:
        monday_board.add_column(item , 'text')


# for item , value in j['donor']['invoice_information'].items():
#     if isinstance(value , dict):
#         for k , v in value.items():
#             add_dynamic_column(k , v)
#
#     else:
#         add_dynamic_column(item , value)


res = monday_board.get_items_by_column_values(monday_board.get_column_id("id"), j['donation']['id'],
                                              return_items_as='json')
if res['data']['items_page_by_column_values']['items']:
    print("item already exists")
else:
    print("item does not exists")
    print(res)
exit()

# insert the json to monday board
new_item = monday_board.insert_item(j['donor']['donor_email'], {
monday_board.get_column_id('amount'): j['donation']['amount'],
monday_board.get_column_id('norm_anount'): j['donation']['norm_anount'],
monday_board.get_column_id('comment'): j['donation']['comment'],
monday_board.get_column_id('created_at'): j['donation']['created_at'],
monday_board.get_column_id('currency'): j['donation']['currency'],
monday_board.get_column_id('charity_id'): j['donation']['charity_id'],
monday_board.get_column_id('charity_name_en'): j['donation']['charity_name_en'],
monday_board.get_column_id('charity_name_he'): j['donation']['charity_name_he'],
monday_board.get_column_id('charity_number'): j['donation']['charity_number'],
monday_board.get_column_id('target_id'): j['donation']['target_id'],
monday_board.get_column_id('target_name_en'): j['donation']['target_name_en'],
monday_board.get_column_id('target_name_he'): j['donation']['target_name_he'],
monday_board.get_column_id('id'): j['donation']['id'],
monday_board.get_column_id('end_recurring'): j['donation']['end_recurring'],
monday_board.get_column_id('recurring'): j['donation']['recurring'],
monday_board.get_column_id('recurring_months'): j['donation']['recurring_months'],
monday_board.get_column_id('recurring_payment_number'): j['donation']['recurring_payment_number'],
monday_board.get_column_id('donated_with_account'): j['donor']['donated_with_account'],
monday_board.get_column_id('donor_email'): {"text":j['donor']['donor_email'],"email":j['donor']['donor_email']},
monday_board.get_column_id('donor_first_name'): j['donor']['donor_first_name'],
monday_board.get_column_id('donor_last_name'): j['donor']['donor_last_name'],
monday_board.get_column_id('donor_phone'): j['donor']['donor_phone'],
monday_board.get_column_id('donor_il_id'): j['donor']['donor_il_id'],
monday_board.get_column_id('address'): j['donor']['invoice_information']['address'],
monday_board.get_column_id('company_number'): j['donor']['invoice_information']['company_number'],
monday_board.get_column_id('recipient_name'): j['donor']['invoice_information']['recipient_name'],
monday_board.get_column_id('share_details_with_charities'): j['donor']['invoice_information']['share_details_with_charities'],
monday_board.get_column_id('card_last_4'): j['transfer']['card_last_4'],
monday_board.get_column_id('checkout_locale'): j['transfer']['checkout_locale'],
monday_board.get_column_id('completed_at'): j['transfer']['completed_at'],
monday_board.get_column_id('currency'): j['transfer']['currency'],
monday_board.get_column_id('payment_type'): j['transfer']['payment_type'],
monday_board.get_column_id('total_amount'): j['transfer']['total_amount'],
monday_board.get_column_id('uk_tax_payer'): j['transfer']['uk_tax_payer'],
})

print(str(new_item['create_item']['id']))


