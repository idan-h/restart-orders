
from main import API_KEY
from src.library.functions import get_products


if __name__ == "__main__":
    products = get_products(API_KEY)
    print(products)
