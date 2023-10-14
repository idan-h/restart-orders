import requests
import json
import pandas as pd
from pandas.io.json import json_normalize

SUPPORTED_RETURN_TYPES = ['json', 'dataframe']


class MondayApi:
    def __init__(self, api_key, api_url):
        self.headers = {"Authorization": api_key}
        self.apiUrl = api_url

    def query(self, query, variables=None, return_items_as='dataframe'):
        if return_items_as.lower() not in SUPPORTED_RETURN_TYPES:
            raise ValueError(
                f'The type {return_items_as} is not supported. at the moment we support the data types above: {SUPPORTED_RETURN_TYPES}')
        data = {'query': query, 'variables': variables}
        req = requests.post(url=self.apiUrl, json=data, headers=self.headers)
        if req.status_code == 200:
            if "errors" in req.json().keys():
                raise Exception(f"ERROR! - please see the errors in the response.\n{req.json()}")
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
        if not (board_name or id):
            raise Exception("at least one argument need to be given. (board name or board id)")
        self.board_id = str(id) if id else self.mondayApi.get_board_id(board_name)['id'].values[0]

    def get_board_details(self):
        query = '{boards(ids:' + str(
            self.board_id) + ') { name id description groups {id title}  items (limit:1){ name column_values{title id type value} } } }'
        r = json_normalize(self.mondayApi.query(query)['boards'])
        return r

    def list_columns(self):
        return pd.DataFrame(list(self.get_board_details()['items'])[0][0]['column_values'])

    def get_column_details(self, column_title):
        df = self.list_columns()
        df = df[df['title'] == column_title]
        return df

    def get_column_id(self, column_title):
        res = self.mondayApi.query(
            'query {  boards (ids: ' + self.board_id + ') {columns{id      title    }  }}')
        if 'boards' in res.keys():
            res = res['boards']
            if len(res) > 0:
                res = res[0]
                if 'columns' in res.keys():
                    res = res['columns']
                    df = pd.DataFrame(res)
                    df = df[df['title'] == column_title]
                    return df['id'].values
        return []



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

    def get_items(self, return_items_as='dataframe', page_size=500, page=1, group_id=None,
                  group_title=None):
        QUERY_TEMPLATE = '''
              {{
              boards(ids:{board_id})
              {{
                {filter_group_id[0]}
                items (limit:{page_size} page:{page_num}){{
                  id
                  name,
                  group {{
                    title
                  }}
                  column_values {{
                    title
                    text
                    type
                  }}
                }}
                {filter_group_id[1]}
                }}
                }}'''

        groups_ids = [self.get_group_id(group)[0] for group in group_title] if group_title else group_id
        # join groups id to support graphql format
        filter_group_ids = (f'groups(ids:[' + ', '.join(groups_ids) + '])' ' {', '}') if groups_ids else ('', '')
        query = QUERY_TEMPLATE.format(board_id=str(self.board_id), page_size=page_size, page_num=page,
                                      filter_group_id=filter_group_ids)

        if return_items_as == 'json':
            return self.mondayApi.query(query, return_items_as=return_items_as).json()
        else:
            if any(filter_group_ids):
                r = json_normalize(
                    self.mondayApi.query(query, return_items_as=return_items_as)['boards'][0]['groups'][0]['items'])
            else:
                r = json_normalize(self.mondayApi.query(query, return_items_as=return_items_as)['boards'][0]['items'])
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
