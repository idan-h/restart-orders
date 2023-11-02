import time
import re
import requests
import json
import pandas as pd
from pandas import json_normalize

SUPPORTED_RETURN_TYPES = ['json', 'dataframe']


class MondayApi:
    def __init__(self, api_key, api_url):
        self.headers = {"Authorization": api_key, "Api-Version": "2023-10"}
        self.apiUrl = api_url

    def query(self, query, variables=None, return_items_as='dataframe'):
        if return_items_as.lower() not in SUPPORTED_RETURN_TYPES:
            raise ValueError(
                f'The type {return_items_as} is not supported. at the moment we support the data types above: {SUPPORTED_RETURN_TYPES}')
        data = {'query': query, 'variables': variables}
        req = requests.post(url=self.apiUrl, json=data, headers=self.headers)
        if req.status_code == 200:
            if "errors" in req.json().keys():
                req_json = req.json()
                if req_json.get('error_code') == 'ComplexityException':
                    match = re.search(r"reset in (\d+) seconds", req_json['error_message'])
                    seconds = int(match.group(1)) if match else 20
                    time.sleep(seconds + 5)
                    return self.query(query, variables, return_items_as)
                else:
                    raise Exception(f"ERROR! - please see the errors in the response.\n{req_json}")
            elif "data" in req.json().keys():
                if return_items_as.lower() == 'json':
                    return req
                return pd.DataFrame(req.json()['data'])
            else:
                raise Exception(f"no data returned! - please see the errors in the response.\n{req.json()}")
        raise Exception(f"ERROR! - request status ({req.status_code})")

    def list_boards(self, limit=5):
        query = '{ boards (limit:' + str(limit) + ') {name id} }'
        r = json_normalize(self.query(query)['boards'])
        return r

    def get_board_id(self, board_name):
        query = '{ boards (limit:999999) {name id} }'
        r = json_normalize(self.query(query)['boards'])
        r = r[r['name'] == board_name]
        return r

    def list_users(self, limit=5):
        query = '{ users (limit:' + str(limit) + ') {name id} }'
        r = json_normalize(self.query(query)['users'])
        return r

    def get_user(self, name):
        df = self.list_users(1000000)
        r = df[df['name'] == name]
        return r

    def get_user_id(self, name):
        r = self.get_user(name)['id'].values
        return r if r.size > 0 else None


class MondayBoard:
    def __init__(self, MondayApi: MondayApi, board_name=None, id=None):
        self.mondayApi = MondayApi
        self.columns_df = None
        if not (board_name or id):
            raise Exception("at least one argument need to be given. (board name or board id)")
        self.board_id = str(id) if id else self.mondayApi.get_board_id(board_name)['id'].values[0]

    def get_board_details(self):
        query = '{boards(ids:' + str(
            self.board_id) + ') {  columns{ id title settings_str } name id description groups {id title}   } }'
        r = self.mondayApi.query(query , return_items_as = 'json').json()['data']['boards'][0]
        return r

    def list_columns(self):
        return list(self.get_board_details()['columns'])

    def get_column_details(self, column_title):
        columns = self.list_columns()
        for column in columns:
            if column['title'] == column_title:
                return column
        return []

    def get_columns(self):
        res = self.mondayApi.query(
            'query {  boards (ids: ' + self.board_id + ') {columns{id      title    }  }}')
        if 'boards' in res.keys():
            res = res['boards']
            if len(res) > 0:
                res = res[0]
                if 'columns' in res.keys():
                    res = res['columns']
                    self.columns_df = pd.DataFrame(res)

    def get_column_id(self, column_title):
        if self.columns_df is None:
            self.get_columns()
        res = self.columns_df[self.columns_df['title'] == column_title]['id'].values
        if not len(res) :
            return []
        return res[0]

    def list_groups(self):
        return pd.DataFrame(self.get_board_details()['groups'][0])

    def get_group_id(self, title):
        df = self.list_groups()
        return df[df["title"] == title]['id'].values

    def insert_item(self, item_name, columnVals, group_id=None):
        if group_id:
            query = 'mutation ($ItemName: String!, $columnVals: JSON!) { create_item (board_id:' + str(
                self.board_id) + ', group_id: "' + group_id + '",item_name:$ItemName, column_values:$columnVals) { id } } '
        else:
            query = 'mutation ($ItemName: String!, $columnVals: JSON!) { create_item (board_id:' + str(
                self.board_id) + ',item_name:$ItemName, column_values:$columnVals) { id } } '
        vars = {'ItemName': item_name, 'columnVals': json.dumps(columnVals)}
        return self.mondayApi.query(query, vars)

    def insert_subitem(self, item_name, columnVals, item_id):
        query = 'mutation ($ItemName: String!, $columnVals: JSON!, $ItemId: ID!) { ' \
                'create_subitem (parent_item_id:$ItemId,' \
                'item_name:$ItemName, column_values:$columnVals) { id } } '
        vars = {'ItemName': item_name, 'columnVals': json.dumps(columnVals), 'ItemId': item_id}
        return self.mondayApi.query(query, vars)

    def change_multiple_column_values(self, columnVals, item_id):
        query = '''
            mutation ($columnVals: JSON!, $ItemId: ID!, $BoardId: ID!) {
              change_multiple_column_values(board_id: $BoardId, item_id: $ItemId, column_values: $columnVals) {
                id
              }
            }
            '''
        vars = {'columnVals': json.dumps(columnVals), 'ItemId': item_id, 'BoardId': self.board_id}
        return self.mondayApi.query(query, vars)

    def add_column(self , title, column_type):
        query = '''
            mutation ($BoardId: ID!, $Title: String!, $ColumnType: ColumnType!) {
              create_column(board_id: $BoardId, title: $Title, column_type: $ColumnType) {
                id
              }
            }
            '''
        vars = {'BoardId': self.board_id, 'Title': title, 'ColumnType': column_type}
        return self.mondayApi.query(query, vars)

    def delete_item(self, item_id):
        QUERY_TEMPLATE = '''
         mutation {{
             delete_item (item_id: {item_id}) {{ 
                 id
             }}
         }}'''
        self.mondayApi.query(QUERY_TEMPLATE.format(item_id=item_id))

    def get_items(self, return_items_as='dataframe', limit=500, cursor=None):
        QUERY_TEMPLATE = '''
              {{
              boards(ids:{board_id})
              {{
                items_page (limit:{limit}{cursor}) {{
                    cursor
                    items {{
                      id
                      name,
                      column_values {{
                        id
                        text
                      }}
                    }}
                  }}
              }}
              }}'''

        query = QUERY_TEMPLATE.format(board_id=str(self.board_id), limit=limit,
                                      cursor=f', cursor: "{cursor}"' if cursor else '')

        if return_items_as == 'json':
            return self.mondayApi.query(query, return_items_as=return_items_as).json()
        else:
            return json_normalize(self.mondayApi.query(query, return_items_as=return_items_as)['boards'][0]['items'])

    def get_subitems(self, return_items_as='dataframe', limit=500):
        QUERY_TEMPLATE = '''
              {{
              boards(ids:{board_id})
              {{
                items_page (limit:{limit}) 
                {{
                    items
                    {{
                        subitems
                        {{
                            column_values
                            {{
                                column{{
                                    id
                                    title
                                    settings_str
                                }}
                            }}
                        }}
                    }}
                }}
              }}
              }}'''

        query = QUERY_TEMPLATE.format(board_id=str(self.board_id), limit=limit)

        if return_items_as == 'json':
            return self.mondayApi.query(query, return_items_as=return_items_as).json()
        else:
            result = self.mondayApi.query(query, return_items_as=return_items_as)
            return json_normalize(self.mondayApi.query(query, return_items_as=return_items_as)['boards'][0]['items_page']['items'][0]['subitems'])


    def get_items_by_column_values(self, column_id, column_value, return_items_as='dataframe', limit=1):
        if limit < 0:
            QUERY_TEMPLATE = '''
                    {{
                    items_page_by_column_values(board_id:{board_id}, columns: [{{column_id: "{column_id}",
                    column_values: ["{column_value}"]}}]) {{
                        items {{
                            id
                            name
                            column_values {{
                                id
                                text
                                type
                            }}
                            subitems {{
                                id
                                name
                                column_values {{
                                    id
                                    value
                                    type
                                }}
                            }}
                          }}
                        }}
                    }}
                    '''
            query = QUERY_TEMPLATE.format(board_id=str(self.board_id), column_id=column_id, column_value=column_value)
        else:
            QUERY_TEMPLATE = '''
                    {{
                    items_page_by_column_values(board_id:{board_id}, columns: [{{column_id: "{column_id}",
                    column_values: ["{column_value}"]}}], limit:{limit}) {{
                        items {{
                            id
                            name
                            column_values {{
                                id
                                text
                                type
                            }}
                            subitems {{
                                id
                                name
                                column_values {{
                                    id
                                    value
                                    type
                                }}
                            }}
                          }}
                        }}
                    }}
                    '''
            query = QUERY_TEMPLATE.format(board_id=str(self.board_id), column_id=column_id, column_value=column_value , limit=limit)



        if return_items_as == 'json':
            return self.mondayApi.query(query, return_items_as=return_items_as).json()
        else:
            r = json_normalize(self.mondayApi.query(query, return_items_as=return_items_as))
            return r
    def write_update(self, item_id, update_text):
        QUERY_TEMPLATE = '''
              mutation {{
              create_update (item_id:{item_id} , body: "{update_text}")
              {{ 
                id
              }}
              }}'''
        self.mondayApi.query(QUERY_TEMPLATE.format(item_id=item_id, update_text=update_text))

    def notify_user(self, user_id, target_id, target_type, notification_text):
        """
        The target_type argument has two different options:
        Projects will refer to Items or Boards. Use the item or board ID as the target ID.
        e.g -> user_id = 28252801 (Ben Hababo's id) , target_id = 2753656481 (dashboard id)
        target_type = 'Project'  , notification_text = 'This is a board notification'
        Posts will refer to Updates posted to items as replies or new updates.
        Use the update or reply ID to send the notification related to this update.
        e.g -> user_id = 28252801 (Ben Hababo's id) , target_id = 2753656481 (update id)
        target_type = 'Post'  , notification_text = 'This is a update notification'
        """
        query = f'''
              mutation {{
              create_notification (user_id:{user_id} , target_id: {target_id} , text: "{notification_text}" , target_type: {target_type})
              {{ 
                id
              }}
              }}'''
        self.mondayApi.query(query)
