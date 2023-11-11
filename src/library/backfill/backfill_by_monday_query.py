# To run this script you need to execute from your terminal (after you activate your virtualenv):
# python3 -m src.library.backfill.backfill_by_monday_query --is_production --api_key "your_api_key"
# api_key: Monday API key
# is_production: Boolean flag for production mode, if adding "--is_production" then the script will backfill by prodcution orders board and subitems board, otherwise it will backfill by playground orders board and subitems board.

import argparse
import requests
from ..monday_api import MondayApi, MondayBoard
from ..consts import API_URL


def update_items_and_subitems(item_board_id, subitem_board_id, api_key):
    item_url = 'https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/market-place-create-or-update-item'
    item_json = {"event": {"pulseId": 1, "boardId": 1}}

    subitems_url = 'https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/market-place-create-or-update-subitem'
    subitem_json = {"event": {"pulseId": 1, "boardId": 1, "parentItemId": 1}}
    orders = get_all_items_by_board(item_board_id, api_key)
    print("orders:")
    for order in orders:
        json = item_json
        json['event']['pulseId'] = int(order['id'])
        json['event']['boardId'] = int(item_board_id)
        res = requests.post(item_url, json=json , verify=False)
        print(f"post :{json} , status code : {res.status_code} , response text : {res.text} ")

    orders = get_all_items_by_board(subitem_board_id, api_key)
    print("subitems::")
    for order in orders:
        json = subitem_json
        json['event']['pulseId'] = int(order['id'])
        json['event']['boardId'] = int(subitem_board_id)
        json['event']['parentItemId'] = int(order['parent_item']['id'])
        res = requests.post(subitems_url, json=json , verify=False)
        print(f"post :{json} , status code : {res.status_code} , response text : {res.text} ")
    

def get_all_items_by_board(board_id, api_key):
    monday_api = MondayApi(api_key, API_URL)
    monday_board = MondayBoard(monday_api, id=board_id)

    items_page = monday_board.get_item_id_with_parent_item_id_if_exist(return_items_as='json', limit=25).get('data').get('boards')[0].get('items_page')
    all_items = items_page.get('items')
    cursor = items_page.get('cursor')
    while cursor:
        items_page = monday_board.get_item_id_with_parent_item_id_if_exist(
            return_items_as='json',
            limit=25,
            cursor=cursor
        ).get('data').get('boards')[0].get('items_page')
        all_items += items_page.get('items')
        cursor = items_page.get('cursor')
        
    return all_items

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill by Monday query.")
    parser.add_argument('--is_production', action='store_true', help='Boolean flag for production mode.')
    parser.add_argument('--api_key', type=str, required=True, help='API key for Monday API.')

    args = parser.parse_args()

    is_production = args.is_production
    api_key = args.api_key
    
    if is_production:
        # production:
        order_borad_id = 1289582579
        subitem_board_id = 1290061519
    else:
        # playgorund:
        order_borad_id = 1308624313
        subitem_board_id = 1308624326

    print(f"Going to backfill by - order_borad_id: {order_borad_id}, subitem_board_id: {subitem_board_id}")
    update_items_and_subitems(order_borad_id, subitem_board_id, api_key)
