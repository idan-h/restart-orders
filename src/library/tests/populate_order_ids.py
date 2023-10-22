from src.library.monday_api import MondayApi, MondayBoard
from src.library.consts import API_URL, ORDERS_BOARD_ID
from main import API_KEY
import uuid
import pandas as pd

monday_api = MondayApi(API_KEY, API_URL)
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
df_filtered = json_df[json_df['id'].isin(['text5'])]
df = df_filtered.pivot(index='meta_id', columns='id', values='text').reset_index()
df.columns.name = None

df = df[df['text5'].isna() | (df['text5'].str.strip() == '')]

for index, row in df.iterrows():
    result = monday_board.change_multiple_column_values({
        'text5': uuid.uuid4().hex,  # Order Id
    }, row['meta_id'])
    print(result)
