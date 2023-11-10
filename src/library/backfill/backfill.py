import requests
import pandas as pd
import urllib3
urllib3.disable_warnings()


item_url = 'https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/market-place-create-or-update-item'
item_json = {"event": {"pulseId": 1, "boardId": 1308624313}}

subitems_url = 'https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/market-place-create-or-update-subitem'
subitem_json = {"event": {"pulseId": 1, "boardId": 1308624313, "parentItemId": 1}}

df = pd.read_csv('csv.csv').reset_index()  # make sure indexes pair with number of rows

for i, r in df.iterrows():
    if r['type'] == 'item':
        url = item_url
        json = item_json
        json['event']['pulseId'] = int(r['item_id'])
    elif r['type'] == 'subitem':
        url = subitems_url
        json = subitem_json
        json['event']['pulseId'] = int(r['subitem_id'])
        json['event']['parentItemId'] = int(r['item_id'])
    else:
        print('not a subitem or item , skipping. ' , r['type'], r['item_id'], r['subitem_id'] )
        continue
    res = requests.post(url, json=json , verify=False)
    print(f"index :{i} , status code : {res.status_code} , response text : {res.text} ")



