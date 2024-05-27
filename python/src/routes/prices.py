from flask import request

from src.infra.db import mimic_db_operations
from src.domain.calculate_price import calculate_price, calc_price


def get_base_price(db):
    return db.read_price


def get_holidays(db):
    return db.list_holidays



def add_routes(app, mimics_db):

    @app.get("/prices")
    def get_prices():
        type_ = None
        date_ = None
        age_ = None
        if "age" in request.args:
            age_ = request.args.get('age', type=int)
        if "type" in request.args:
            type_ = request.args['type']
        if "date" in request.args:
            date_ = request.args["date"]

        return calc_price(get_base_price(mimics_db), get_holidays(mimics_db))(age_, date_, type_)


    @app.route("/prices", methods=['PUT'])
    def prices():
        return {}



