from .monday_api import MondayApi, MondayBoard
from .consts import API_URL , SUPPLIERS_BOARD_ID
import uuid
import json
from datetime import datetime

class suppliers:
    @staticmethod
    def get_sectors(api_key):
        monday_api = MondayApi(api_key, API_URL)
        monday_board = MondayBoard(monday_api, id=SUPPLIERS_BOARD_ID)
        sector_field_labels = json.loads(monday_board.get_column_details("תחום")['settings_str'])['labels']

        return [{"name": v, "id": k} for k, v in sector_field_labels.items()]

    def __init__(self , api_key):
        self.api_key = api_key
        self.monday_api = MondayApi(api_key, API_URL)
        self.monday_board = MondayBoard(self.monday_api, id=SUPPLIERS_BOARD_ID)

    def create_supplier(self, dto):
        supplier_id = uuid.uuid4().hex

        new_item = self.monday_board.insert_item(dto['supplier_name'], {
            'status_1': {"label": dto['sector']},
            'text': dto['contact_name'],
            'phone': dto['phone'],
            'text1': dto['location'],
            'text2': supplier_id,
            'date': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S') + " UTC",  # Modified Date
        })
        new_item_id = int(new_item['create_item']['id'])

        for subitem in dto.get('subitems', []):
            self.monday_board.insert_subitem(subitem['name'], {
                'connect_boards': {"linkedPulseIds": [{"linkedPulseId": subitem['product_number']}]},  # Product
                'numbers': subitem['quantity'],  # Quantity
                'long_text' : subitem['note'] # Note
            }, new_item_id)

        return supplier_id


    def update_supplier(self, dto):
        existing_item = self.monday_board.get_items_by_column_values('text2', str(dto['id']), return_items_as='json')\
            .get('data').get('items_page_by_column_values').get('items')[0]
        existing_item_id = int(existing_item['id'])

        column_values = {
            'status_1': {"label": dto['sector']},
            'text': dto['contact_name'],
            'phone': dto['phone'],
            'text1': dto['location'],
            'date': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S') + " UTC",  # Modified Date
        }

        self.monday_board.change_multiple_column_values(column_values, existing_item_id)

        subitems_ids = [x['id'] for x in existing_item.get('subitems', [])]

        for item_id in subitems_ids:
            self.monday_board.delete_item(item_id)

        for subitem in dto.get('subitems', []):
            self.monday_board.insert_subitem(subitem['name'], {
                'connect_boards': {"linkedPulseIds": [{"linkedPulseId": subitem['product_number']}]},  # Product
                'numbers': subitem['quantity'],  # Quantity
                'long_text' : subitem['note'] # Note
            }, existing_item_id)


    def get_supplier(self, order_id):
        supplier = self.monday_board.get_items_by_column_values('text2', str(order_id), return_items_as='json')\
            .get('data').get('items_page_by_column_values').get('items')[0]

        if not supplier:
            return None

        column_values = {v['id']: v['text'] for v in supplier.get('column_values')}

        subitems = supplier.get('subitems', [])

        for item in subitems:
            item.update({v['id']: v['value'] for v in item.get('column_values')})
            del item['column_values']

        return {
            'supplier_name': supplier['name'],
            'sector': column_values['status_1'],
            'contact_name': column_values['text'],
            'phone': column_values['phone'],
            'location': column_values['text1'],
            'subitems': [{
                'name': i['name'],
                'product_number': json.loads(i['connect_boards'])['linkedPulseIds'][0]['linkedPulseId'],
                'quantity': i['numbers'],
                'note': i['long_text']
            } for i in subitems]
        }


