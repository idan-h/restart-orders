from .monday_api import MondayApi, MondayBoard
from .oracle_db import OracleDB
from .consts import API_URL, PRODUCT_BOARD_ID, ORDERS_BOARD_ID, DONATIONS_BOARD_ID , SUPPLIERS_BOARD_ID, PLATFORM_REGISTRATION_BOARD_ID , ORDERS_SUBITEMS_BOARD_ID
import uuid
import json
import pandas as pd
import json
from datetime import datetime


def create_order(api_key, dto):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)

    order_id = uuid.uuid4().hex

    new_item = monday_board.insert_item(dto['name'], {
        'long_text': dto['note'],  # Note
        'text8': dto['phone'],  # Phone
        'text0': dto['unit'],  # Unit
        'text7': dto['job'],  # Job
        'email': {"email": dto['email'], "text": ""},  # Email
        'dropdown': dto['location'],  # Location
        'color': {"label": dto['tenant']},  # Tenant Code
        'text5': order_id,  # Custom Id
        'status4': {"label": dto.get('type', 'IDF')},  # Form Type
        'date_11': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S') + " UTC",  # Modified Date
    })
    new_item_id = int(new_item['create_item']['id'])

    for subitem in dto.get('subitems', []):
        monday_board.insert_subitem(subitem['name'], {
            'connect_boards': {"linkedPulseIds": [{"linkedPulseId": subitem['product_number']}]},  # Product
            'numbers': subitem['quantity'],  # Quantity
        }, new_item_id)

    return order_id


def update_order(api_key, dto):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)

    existing_item = monday_board.get_items_by_column_values('text5', str(dto['id']), return_items_as='json')\
        .get('data').get('items_page_by_column_values').get('items')[0]
    existing_item_id = int(existing_item['id'])

    is_cancel = dto.get('is_cancel', False)

    column_values = {'status': 'בוטל'} if is_cancel else {
        'long_text': dto['note'],  # Note
        'dropdown': dto['location'],  # Location
        'date_11': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S') + " UTC",  # Modified Date
    }

    monday_board.change_multiple_column_values(column_values, existing_item_id)

    if is_cancel:
        return

    subitems_ids = [x['id'] for x in existing_item.get('subitems', [])]

    for item_id in subitems_ids:
        monday_board.delete_item(item_id)

    for subitem in dto.get('subitems', []):
        monday_board.insert_subitem(subitem['name'], {
            'connect_boards': {"linkedPulseIds": [{"linkedPulseId": subitem['product_number']}]},  # Product
            'numbers': subitem['quantity'],  # Quantity
        }, existing_item_id)


def get_order(api_key, order_id):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)
    order = monday_board.get_items_by_column_values('text5', str(order_id), return_items_as='json')\
        .get('data').get('items_page_by_column_values').get('items')[0]
    column_values = {v['id']: v['text'] for v in order.get('column_values')}

    if column_values.get('status') == 'בוטל':
        return {'is_cancel': True}

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
            'name': i['name'],
            'product_number': json.loads(i['connect_boards'])['linkedPulseIds'][0]['linkedPulseId'],
            'quantity': int(i['numbers'].replace('"', '')),
        } for i in subitems]
    }


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


def handle_duplicate_orders(api_key):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)

    items_page = monday_board.get_items(return_items_as='json').get('data').get('boards')[0].get('items_page')
    all_items = items_page.get('items')
    cursor = items_page.get('cursor')
    while cursor:
        items_page = monday_board.get_items(
            return_items_as='json',
            cursor=cursor
        ).get('data').get('boards')[0].get('items_page')
        all_items += items_page.get('items')
        cursor = items_page.get('cursor')

    # Data frame manipulations
    json_df = pd.json_normalize(all_items, record_path='column_values', meta=['id'], meta_prefix='meta_')
    df_filtered = json_df[json_df['id'].isin(['text8', 'text0', 'text42', 'status'])]
    df = df_filtered.pivot(index='meta_id', columns='id', values='text').reset_index()
    df.columns.name = None

    df['text8'] = df['text8'] \
        .apply(lambda x: "972" + x.lstrip("0") if x and not x.startswith('972') else x)

    df['similar_id'] = df.groupby('text8')['meta_id'].transform(lambda x: x.iloc[0] if len(x) > 1 else None)
    mask = df['similar_id'].isna()
    df.loc[mask, 'similar_id'] = df[mask].groupby('text0')['meta_id'].transform(
        lambda x: x.iloc[0] if len(x) > 1 else None)

    df_has_similar_id = df[df['similar_id'].notna() & df['text42'].isna()]
    df_has_similar_id = df_has_similar_id[df_has_similar_id['status'] == 'ממתין']

    for index, row in df_has_similar_id.iterrows():
        result = monday_board.change_multiple_column_values({
            'text42': row['similar_id'],  # Similar Id
            'status': 'פוטנציאל לכפילות',  # Status
        }, row['meta_id'])
        print(result)


def insert_clearing_transaction(api_key , j):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=DONATIONS_BOARD_ID)

    res = monday_board.get_items_by_column_values(monday_board.get_column_id("id"), j['donation']['id'],
                                                  return_items_as='json')
    if res['data']['items_page_by_column_values']['items']:
        print("item already exists")
        return False

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
        monday_board.get_column_id('share_details_with_charities'): j['donor']['invoice_information'][
            'share_details_with_charities'],
        monday_board.get_column_id('card_last_4'): j['transfer']['card_last_4'],
        monday_board.get_column_id('checkout_locale'): j['transfer']['checkout_locale'],
        monday_board.get_column_id('completed_at'): j['transfer']['completed_at'],
        monday_board.get_column_id('currency'): j['transfer']['currency'],
        monday_board.get_column_id('payment_type'): j['transfer']['payment_type'],
        monday_board.get_column_id('total_amount'): j['transfer']['total_amount'],
        monday_board.get_column_id('uk_tax_payer'): j['transfer']['uk_tax_payer'],
    })
    return True


def get_suppliers_sectors(api_key):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=SUPPLIERS_BOARD_ID)
    sector_field_labels = json.loads(monday_board.get_column_details("תחום")['settings_str'])['labels']

    return [{"name" : v , "id" : k } for k , v in sector_field_labels.items()]


def validate_user_login(api_key, email, password):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=PLATFORM_REGISTRATION_BOARD_ID)
    password_column_id = monday_board.get_column_id("Password")
    print(password_column_id)
    users =  monday_board.get_items_by_column_values(monday_board.get_column_id("Email"), email, return_items_as='json')
    users = users.get('data').get('items_page_by_column_values').get('items')
    if not users:
        print("user not found")
        return False

    user = users[0]
 
    column_values = {v['id']: v['text'] for v in user.get('column_values')}
 
    print(column_values)
    if column_values.get(password_column_id) == password:
        return True
    else:
        return False
    
def get_subitem_statuses(api_key):
    try :
        monday_api = MondayApi(api_key, API_URL)
        monday_board = MondayBoard(monday_api, id=ORDERS_SUBITEMS_BOARD_ID)
        details = json.loads(monday_board.get_column_details("סטטוס")['settings_str'])['labels']
        statuses = list(details.values())
    except Exception as e:
        print(e)
        statuses = []
    return statuses


def assign_product(api_key , order_id , subitem_id ,subitem_board_id ,  user_id ):
    try:
        monday_api = MondayApi(api_key, API_URL)
        monday_board = MondayBoard(monday_api, id=subitem_board_id)
        columnVals = {
            "text4": user_id,
            "status" : {"label": "בטיפול"}
        }
        monday_board.change_multiple_column_values( columnVals ,subitem_id )

        return True
    except Exception as e:
        print(e)
        return False


def unassign_product(api_key , order_id , subitem_id ,subitem_board_id ):
    try:
        monday_api = MondayApi(api_key, API_URL)
        monday_board = MondayBoard(monday_api, id=subitem_board_id)
        columnVals = {
            "text4": "",
            "status" : {"label": "ממתין"}
        }
        monday_board.change_multiple_column_values( columnVals ,subitem_id )

        return True
    except Exception as e:
        print(e)
        return False

def update_order_status(api_key , order_id , subitem_id ,subitem_board_id, subitem_status ):
    try:
        monday_api = MondayApi(api_key, API_URL)
        monday_board = MondayBoard(monday_api, id=subitem_board_id)
        columnVals = {
            "status" : { "label": subitem_status }
        }
        monday_board.change_multiple_column_values( columnVals ,subitem_id )

        return True
    except Exception as e:
        print(e)
        return False



def get_unassigned_orders(api_key):
    orders = get_valid_orders(api_key)

    orders = [order for order in orders if any(subItem.userId is None or subItem.userId == "None" for subItem in order.subItems)]   
    return orders_to_json(orders)

def get_assigned_orders_to_user(api_key, user_id):
    orders = get_valid_orders(api_key)

    orders = [order for order in orders if any(subItem.userId is not None and subItem.userId == user_id for subItem in order.subItems)]   
    return orders_to_json(orders)

def get_valid_orders(api_key):
    monday_api = MondayApi(api_key, API_URL)
    # TODO revert
    # monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)
    monday_board = MondayBoard(monday_api, id=1308624313)

    # TODO handle pagination
    # status7 is the 'בקשה תקינה?' column
    items = monday_board.get_items_by_column_values('status7', 'בקשה תקינה', return_items_as='json', limit=5)\
        .get('data').get('items_page_by_column_values').get('items')

    # print(items)
    orders = convert_to_orders(items)
    return orders

def convert_to_orders(items):
    orders = []
    for item in items:
        # print(item)
        id = item['id']
        name = item['name']
        region = next((col['text'] for col in item['column_values'] if col['id'] == 'dropdown'), "None") # region
        unit = next((col['text'] for col in item['column_values'] if col['id'] == 'text0'), "None") # unit
        phone = next((col['text'] for col in item['column_values'] if col['id'] == 'text8'), "None") # phone
        # print(f"id: {id} name: {name} phone: {phone} region: {region} unit: {unit}")
        subItems = []
        for subitem in item['subitems']:
            sub_id = subitem['id']
            board_id = subitem['board']['id']
            product_id = next((get_product_id_from_connect_boards(col['value']) for col in subitem['column_values'] if col['id'] == 'connect_boards'), "None") # productId / מספר מוצר
            quantity = next((col['text'] for col in subitem['column_values'] if col['id'] == 'numbers'), "None") # quantity / כמות 
            user_id = next((col['text'] for col in subitem['column_values'] if col['id'] == 'text4'), "None") # userId / אימייל משויך להזמנה
            status = next((col['text'] for col in subitem['column_values'] if col['id'] == 'status'), "None")  
            # print(f"sub_id: {sub_id} board_id: {board_id} product_id: {product_id} quantity: {quantity} user_id: {user_id} status: {status}")
            subItems.append(SubItem(sub_id, board_id, product_id, quantity, user_id, status))
        orders.append(Order(id, name, phone, region, unit, subItems))
    return orders

def orders_to_json(orders):
    orders_dict = [order.to_dict() for order in orders]
    return json.dumps(orders_dict)

# get index value
def get_index_from_enum_value(value):
    if value is None:
        return -1
    value = json.loads(value)
    if value['index'] is None:
        return "-1"
    
    return value['index']

def get_email_from_value(value):
    if value is None:
        return ""
    value = json.loads(value)
    if value['email'] is None:
        return ""
    
    return value['email']

def get_create_at_from_value(value):
    if value is None:
        return ""
    value = json.loads(value)
    if value['created_at'] is None:
        return ""
    
    return value['created_at']

def get_last_updated_from_value(value):
    if value is None:
        return ""
    value = json.loads(value)
    if value['updated_at'] is None:
        return ""
    
    return value['updated_at']


# get json from connect_boards column and return the product id
def get_product_id_from_connect_boards(connect_boards_object):
    if connect_boards_object is None:
        return "None"
    connect_boards_object = json.loads(connect_boards_object)
    if connect_boards_object['linkedPulseIds'] is None:
        return "None"
    if connect_boards_object['linkedPulseIds'][0] is None:
        return "None"
    if connect_boards_object['linkedPulseIds'][0]['linkedPulseId'] is None:
        return "None"
    
    return connect_boards_object['linkedPulseIds'][0]['linkedPulseId']

def get_user_order(api_key, item_id):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=ORDERS_BOARD_ID)
    items = monday_board.get_item(item_id).get('data').get('items')
    orders = convert_to_orders(items)
    return orders_to_json(orders)

# TODO pass DB connection details
def market_place_create_or_update_order(api_key, item_id, board_id, dbUser, dbPassword, dbDsn):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=board_id)
    oracleDB = OracleDB(dbUser, dbPassword, dbDsn)
    oracleDB.connect()
    items = monday_board.get_item_v2(item_id).get('data').get('items')

    print(f"Items: {items}")
    order = Order.from_monday_item(items[0], board_id)
    print(f"Order: {order.to_json()}")

    query = """
INSERT INTO orders (id, name, phone, region, unit, comments, role, orderValidationStatus, orderStatus, priority, email, createdAt, lastUpdated, board_id)
VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14)
"""
    params = (order.id, order.name, order.phone, order.region, order.unit, order.comments, order.role, order.orderValidationStatus, order.orderStatus, order.priority, order.email, order.createdAt, order.lastUpdated, order.board_id)
        
    # TODO DELETE logs
    print("query: ")
    print(query)
    print("params: ")
    print(params)

    print(oracleDB.execute(query, params))

    # TODO DELETE logs
    query = """SELECT * FROM orders"""
    print(oracleDB.execute(query, return_rows=True))
    # oracleDB.execute(query, params)
    print(f"Done")

# TODO pass DB connection details
def market_place_create_or_update_subitem(api_key, item_id, board_id):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=board_id)
    items = monday_board.get_item_v2(item_id).get('data').get('items')

    print(f"Items: {items}")
    subItem = SubItem.from_monday_item(items[0], board_id)
    print(f"SubItem: {subItem.to_json()}")

    # TODO insert to DB


class SubItem:
    def __init__(self, id, subItemBoardId, productId, quantity, userId, status=None, order_id="empty", comments = "empty"):
        self.id = id
        self.subItemBoardId = subItemBoardId
        self.productId = productId
        self.quantity = quantity
        self.userId = userId
        self.status = status
        self.comments = comments
        self.order_id = order_id

    def from_monday_item(subitem, board_id, order_id):
        sub_id = subitem['id']
        product_id = next((get_product_id_from_connect_boards(col['value']) for col in subitem['column_values'] if col['id'] == 'connect_boards'), "None") # productId / מספר מוצר
        quantity = next((col['text'] for col in subitem['column_values'] if col['id'] == 'numbers'), "None") # quantity / כמות 
        user_id = next((col['text'] for col in subitem['column_values'] if col['id'] == 'text4'), "None") # userId / אימייל משויך להזמנה
        status = next((col['text'] for col in subitem['column_values'] if col['id'] == 'status'), "None")  
        # print(f"sub_id: {sub_id} board_id: {board_id} product_id: {product_id} quantity: {quantity} user_id: {user_id} status: {status}")
        
        return SubItem(sub_id, board_id, product_id, quantity, user_id, status, order_id)
    
    # used for debuging 
    def to_json(self):
        return json.dumps(self.__dict__)
    
    # Used to return to UI
    def to_dict(self):
        return self.__dict__

class Order:
    def __init__(self, id, name, phone, region, unit, subItems, board_id, comments = "empty", role = "empty",\
                orderValidationStatus = "empty", orderStatus = "empty", priority = "empty", email = "empty",\
                createdAt = "empty", lastUpdated = "empty"):
        self.id = id
        self.name = '' if name is None else name  
        self.phone = '' if phone is None else phone  
        self.region = '' if region is None else region  
        self.unit = '' if unit is None else unit  
        self.subItems = subItems
        self.comments = '' if comments is None else comments 
        self.role = '' if role is None else role
        self.orderValidationStatus = orderValidationStatus
        self.orderStatus = orderStatus
        self.priority = priority
        self.email = email
        self.createdAt = datetime.fromisoformat(createdAt.replace('Z', '+00:00')) 
        self.lastUpdated = datetime.fromisoformat(lastUpdated.replace('Z', '+00:00')) 
        self.board_id = board_id

    def from_monday_item(item, board_id):
        id = item['id']
        name = item['name']
        region = next((col['text'] for col in item['column_values'] if col['id'] == 'dropdown'), "None") # region
        unit = next((col['text'] for col in item['column_values'] if col['id'] == 'text0'), "None") # unit
        phone = next((col['text'] for col in item['column_values'] if col['id'] == 'text8'), "None") # phone
        comments = next((col['text'] for col in item['column_values'] if col['id'] == 'long_text'), "None") # comments
        role = next((col['text'] for col in item['column_values'] if col['id'] == 'text7'), "None") # role
        orderValidationStatus = next((col['text'] for col in item['column_values'] if col['id'] == 'status7'), "None") # בקשה תקינה
        orderStatus = next((col['text'] for col in item['column_values'] if col['id'] == 'status'), "None") # סטטוס הזמנה
        priority = next((col['text'] for col in item['column_values'] if col['id'] == 'priority'), "None") # דירוג צורף
        email = next((get_email_from_value(col['value']) for col in item['column_values'] if col['id'] == 'email'), "None") # מייל
        createdAt = next((get_create_at_from_value(col['value']) for col in item['column_values'] if col['id'] == 'creation_log'), "None") # תאריך יצירה
        lastUpdated = next((get_last_updated_from_value(col['value']) for col in item['column_values'] if col['id'] == 'last_updated3'), "None") # last updated
        # print(f"id: {id} name: {name} phone: {phone} region: {region} unit: {unit}")
        print("region:")
        print(region)

        subItems = []
        for subitem in item.get('subitems', []):
            sub_id = subitem['id']
            board_id = subitem['board']['id']
            product_id = next((get_product_id_from_connect_boards(col['value']) for col in subitem['column_values'] if col['id'] == 'connect_boards'), "None") # productId / מספר מוצר
            quantity = next((col['text'] for col in subitem['column_values'] if col['id'] == 'numbers'), "None") # quantity / כמות 
            user_id = next((col['text'] for col in subitem['column_values'] if col['id'] == 'text4'), "None") # userId / אימייל משויך להזמנה
            status = next((col['text'] for col in subitem['column_values'] if col['id'] == 'status'), "None")  
            # print(f"sub_id: {sub_id} board_id: {board_id} product_id: {product_id} quantity: {quantity} user_id: {user_id} status: {status}")
            subItems.append(SubItem(sub_id, board_id, product_id, quantity, user_id, status))

        return Order(id, name, phone, region, unit, subItems, board_id, comments, role, orderValidationStatus,\
                     orderStatus, priority, email, createdAt, lastUpdated)

    # used for debuging 
    def to_json(self):
        return json.dumps({
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'region': self.region,
            'unit': self.unit,
            'comments': self.comments,
            'role': self.role,
            'orderValidationStatus': self.orderValidationStatus,
            'orderStatus': self.orderStatus,
            'priority': self.priority,
            'email': self.email,
            'createdAt': self.createdAt.strftime('%Y-%m-%d %H:%M:%S'),
            'lastUpdated': self.lastUpdated.strftime('%Y-%m-%d %H:%M:%S'),
            'board_id': self.board_id,
            'subItems': [subItem.to_json() for subItem in self.subItems]
        })
    
    # Used to return to UI 
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'region': self.region,
            'unit': self.unit,
            'subItems': [subItem.to_dict() for subItem in self.subItems]
        }
