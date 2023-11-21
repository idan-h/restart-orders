import re

import pandas as pd

from src.library.functions import create_order, get_products
from src.library.tests.main import API_KEY
from src.library.tests.mapping import sew_mapping, excel2_mapping, status_mapping, \
    weapons_mapping

first_ex = 'src/notebooks/dora/first_ex.xlsx'
excel2 = 'src/notebooks/eti/excel2.xlsx'
sewing_workshop_excel = 'src/notebooks/sew/sewing_workshop_excel.xlsx'
weapons_excel = 'src/notebooks/weapons/amlahia6.11.23.xlsx'
new_weapons_excel = 'src/notebooks/weapons/amlahia20.11.23.xlsx'


def get_product_number(product_name, products):
    for product in products:
        if product_name == product['name']:
            product_number = product['product_number']
            return product_number
    return None


def create_sub_item(item, products, quantity):
    sub_item = None
    note_item = None
    if quantity and isinstance(quantity, (int, float)):
        product_number = get_product_number(item, products)
        if product_number:
            sub_item = {  # no product_number
                'name': item,
                'product_number': product_number,
                'quantity': quantity,
            }
        else:
            note_item = f"{quantity} יחידות {item}"
    return sub_item, note_item


def create_phone(phone_value):
    if not isinstance(phone_value, str):
        phone_value = str(int(phone_value))
    phone = re.sub(r'\D', '', phone_value)
    if phone.startswith('5'):
        phone = '0' + phone
    return phone


def create_location(location_value):
    valid_locations = ['דרום', 'צפון', 'אחר', 'מרכז']
    location = location_value if location_value in valid_locations else 'אחר'
    return location


def create_sew_order(sub_items, sub_note, note, additional_items, name, phone):
    for item in sub_items:
        item_name = item['name']
        if item_name in sub_note and sub_note[item_name]:
            note += f'\n{item_name}-\n{sub_note[item_name]}'

    if additional_items:
        note += f'\nמוצרים נוספים:'
        for item in additional_items:
            if item in sub_note:
                note += f'\n{additional_items[item]}-\n{sub_note[item]}'

    order = {
        'name': name,
        'note': note,
        'phone': phone,
        'unit': '',
        'job': '',
        'email': '',
        'location': 'אחר',
        'tenant': 'sew',
        'type': 'SEW',
        'subitems': sub_items,
        'order_status': 'ממתין'
    }
    return order


def first_ex_to_create_order_dto(input_file):
    df = pd.read_excel(input_file).fillna('')
    orders = []
    items = list(df.iloc[:, 3:9].columns)
    products = get_products(API_KEY)

    for index, row in df.iterrows():
        contact_numbers = re.sub(r'[\\/]', '\n', f"{row['טלפון איש קשר']}\n")
        phone_numbers = contact_numbers.splitlines()
        phone = create_phone(phone_numbers[0])
        note_phone = ','.join(phone_numbers[1:])
        notes = {
            'הערות': row['הערות'],
            'מה צריך': row['מה צריך'],
            'טלפון נוסף': note_phone,
            'מיקום בארץ של החיילים': row['מיקום בארץ של החיילים'],
        }

        sub_items = []
        for item in items:
            quantity = row[item]
            sub_item, note_item = create_sub_item(item, products, quantity)
            if sub_item:
                sub_items.append(sub_item)
            if note_item:
                notes['מוצרים נוספים'] = note_item

        note = '\n'.join(
            f"{title}: {value}" for title, value in notes.items() if value
        )

        order = {
            'name': row['שם איש קשר'] or row['שם ממבקש'],
            'note': note,
            'phone': phone,
            'unit': str(row['שם ממבקש']),
            'job': '',
            'email': '',
            'location': 'אחר',
            'tenant': 'dora',
            'type': 'IDF',
            'subitems': sub_items
        }

        orders.append(order)

    return orders


def sewing_workshop_excel_to_create_order_dto(input_file):
    not_found = set()

    df = pd.read_excel(input_file).fillna('')
    orders = []
    products = get_products(API_KEY)
    name = None
    phone = None
    sub_items = []
    additional_items = dict()
    note = ''
    sub_note = dict()

    for index, row in df.iterrows():
        row_name = row['שם']
        if row_name and row_name != name:
            if name:
                order = create_sew_order(
                    sub_items, sub_note, note, additional_items, name, phone
                )
                orders.append(order)

            name = row_name
            phone = create_phone(row['טלפון'])
            sub_items = []
            additional_items = dict()
            note = f"תאריך: {row['תאריך']}"
            sub_note = dict()

        notes = {
            'הערה': row['הערה'],
            'מיקום': row['מיקום'],
            'כמות שסופקה': row['כמות שסופקה'],
            'מי אסף': row['מי אסף'],
            'התקדמות': row['התקדמות'],
            'הושלם': row['הושלם'],
        }

        item_value = row['מוצר']
        items = sew_mapping.get(item_value)
        if items:
            notes['שם מוצר מקורי'] = item_value
            items = items if isinstance(items, list) else [items]
        else:
            items = [item_value]
            not_found.add(item_value)
            # print(item_value)
        order_quantity = row['כמות בהזמנה']

        for item in items:
            sub_item, note_item = create_sub_item(item, products, order_quantity)
            if sub_item:
                sub_items.append(sub_item)
            if note_item:
                additional_items[item] = note_item

            sub_note[item] = '\n'.join(
                f"{title}: {value}" for title, value in notes.items() if value
            )

    order = create_sew_order(
        sub_items, sub_note, note, additional_items, name, phone
    )
    orders.append(order)
    for i in not_found:
        print(i)
    return orders


def excel2_to_create_order_dto(input_file):
    df = pd.read_excel(input_file, skiprows=5, usecols=range(1, 35)).fillna('')
    df.replace(['-', pd.NaT], '', inplace=True)
    orders = []
    items = list(df.iloc[:, 7:].columns)
    products = get_products(API_KEY)

    status_mapping = {
        'נקלט': 'ממתין',
        'טופל': 'בוצע',
    }

    for index, row in df.iterrows():
        date = row['תאריך']
        notes = {
            'תאריך': date,
            'פניה התקבלה': row['פניה התקבלה '],
        }
        contact_numbers = re.sub(r'[\\/]', '\n', f"{row['טלפון']}\n")
        phone_numbers = contact_numbers.splitlines()
        phone = create_phone(phone_numbers[0])
        note_phone = ','.join(phone_numbers[1:])
        if note_phone:
            notes['טלפון נוסף'] = note_phone

        location_value = row['יעד']
        location = create_location(location_value)

        sub_items = []
        note_items = []
        for item in items:
            mapped_items = excel2_mapping.get(item, [item])
            quantity = row[item]
            for mapped_item in mapped_items:
                sub_item, note_item = create_sub_item(mapped_item, products, quantity)
                if sub_item:
                    sub_items.append(sub_item)
                if note_item:
                    note_items.append(note_item)
        if note_items:
            notes['מוצרים נוספים'] = ', '.join(note_item for note_item in note_items)

        note = '\n'.join(
            f"{title}: {value}" for title, value in notes.items() if value
        )

        if not date or (not sub_items and not note_items):
            continue

        order = {
            'name': row['שם איש קשר'],
            'note': note,
            'phone': phone,
            'unit': str(row['יחידה']),
            'job': '',
            'email': '',
            'location': location,
            'tenant': 'eti',
            'type': 'IDF',
            'subitems': sub_items,
            'order_status': status_mapping[row['סטטוס']]
        }

        orders.append(order)

    return orders


def get_filtered_wepons_sheet_df(old_sheet_input_file: str, new_sheet_input_file: str):
    df_old = pd.read_excel(old_sheet_input_file, sheet_name=1).fillna('')
    df_new = pd.read_excel(new_sheet_input_file,).fillna('')
    print(df_old.shape[0])
    print(df_new.shape[0])
    df_filtered = df_new[~df_new["שם מלא"].isin(df_old["שם מלא"])]
    return df_filtered

def weapons_df2_to_create_order_dto(df):
    df.replace(['-', pd.NaT], '', inplace=True)
    orders = []
    items = list(df.iloc[:, 6:].columns)
    products = get_products(API_KEY)

    for index, row in df.iterrows():
        date = row['חותמת זמן']
        notes = {
            'תאריך': date,
            'מיקום בארץ': row['מיקום בארץ'],
        }
        phone = create_phone(row['מספר לפון'])

        location_value = row['מיקום בארץ']
        location = create_location(location_value)

        sub_items = []
        note_items = []
        for item in items:
            mapped_item = weapons_mapping.get(item, item)
            quantity = row[item]
            sub_item, note_item = create_sub_item(mapped_item, products, quantity)
            if sub_item:
                sub_items.append(sub_item)
            if note_item:
                note_items.append(note_item)
        if note_items:
            notes['מוצרים נוספים'] = ', '.join(note_item for note_item in note_items)

        note = '\n'.join(
            f"{title}: {value}" for title, value in notes.items() if value
        )

        if not date or (not sub_items and not note_items):
            continue

        order = {
            'name': row['שם מלא'],
            'note': note,
            'phone': phone,
            'unit': str(row['יחידה']),
            'job': str(row['תפקיד']),
            'email': '',
            'location': location,
            'tenant': 'sew',
            'type': 'SEW',
            'subitems': sub_items,
            'order_status': 'ממתין'
        }

        orders.append(order)

    return orders
    


def weapons_sheet2_to_create_order_dto(input_file):
    df = pd.read_excel(input_file, sheet_name=1).fillna('')
    return weapons_df2_to_create_order_dto(df)

def old_weapons_sheet_and_new_weapons_sheet2_to_create_order_dto(old, new):
    df = get_filtered_wepons_sheet_df(old, new)
    return weapons_df2_to_create_order_dto(df)

# first_ex_orders = first_ex_to_create_order_dto(first_ex)
# for o in first_ex_orders:
#     try:
#         create_order(API_KEY, o)
#     except Exception as e:
#         print(o, e)

# excel2_orders = excel2_to_create_order_dto(excel2)
# for o in excel2_orders:
#     try:
#         create_order(API_KEY, o)
#     except Exception as e:
#         print(o, e)

# sewing_workshop_excel_orders = sewing_workshop_excel_to_create_order_dto(
#     sewing_workshop_excel)
# for o in sewing_workshop_excel_orders:
#     try:
#         create_order(API_KEY, o)
#     except Exception as e:
#         print(o, e)

# weapons_excel_orders2 = weapons_sheet2_to_create_order_dto(weapons_excel)
# for o in weapons_excel_orders2:
#     try:
#         create_order(API_KEY, o)
#     except Exception as e:
#         print(o, e)

# weapons_excel_orders1 = sewing_workshop_excel_to_create_order_dto(weapons_excel)
# for o in weapons_excel_orders1:
#     try:
#         create_order(API_KEY, o)
#     except Exception as e:
#         print(o, e)

weapons_excel_orders2 = old_weapons_sheet_and_new_weapons_sheet2_to_create_order_dto(weapons_excel, new_weapons_excel)
for o in weapons_excel_orders2:
    try:
        create_order(API_KEY, o)
    except Exception as e:
        print(o, e)