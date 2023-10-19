from library.functions import handle_duplicate_orders
import os

API_KEY = os.environ.get('MONDAY_API_KEY')
handle_duplicate_orders(API_KEY)
