import json
import math
import os
from datetime import datetime

from flask import Flask
from flask import request

from src.db import mimic_db_operations

app = Flask("lift-pass-pricing")

db_like = None

f = open(os.path.join(os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__))), "prices_db.json"), "r")

rawdata = json.load(f)
data = {
    "prices": rawdata.get("prices"),
    "holidays": [datetime.fromisoformat(x) for x in rawdata.get("holidays")]
}


@app.route("/prices", methods=['GET', 'PUT'])
def prices():
    res = {}
    global db_like
    if db_like is None:
        db_like = mimic_db_operations()
    if request.method == 'PUT':
        return {}
    elif request.method == 'GET':
        result = db_like.read_price( request.args['type'])

        if 'age' in request.args and request.args.get('age', type=int) < 6:
            res["cost"] = 0
        else:
            if "type" in request.args and request.args["type"] != "night":
                is_holiday = False
                reduction = 0
                list_of_holidays = db_like.list_holidays()
                for holiday in list_of_holidays:
                    if "date" in request.args:
                        d = datetime.fromisoformat(request.args["date"])
                        if d.year == holiday.year and d.month == holiday.month and holiday.day == d.day:
                            is_holiday = True
                if not is_holiday and "date" in request.args and datetime.fromisoformat(
                        request.args["date"]).weekday() == 0:
                    reduction = 35

                # TODO: apply reduction for others
                if 'age' in request.args and request.args.get('age', type=int) < 15:
                    res['cost'] = math.ceil(result["cost"] * .7)
                else:
                    if 'age' not in request.args:
                        cost = result['cost'] * (1 - reduction / 100)
                        res['cost'] = math.ceil(cost)
                    else:
                        if 'age' in request.args and request.args.get('age', type=int) > 64:
                            cost = result['cost'] * .75 * (1 - reduction / 100)
                            res['cost'] = math.ceil(cost)
                        elif 'age' in request.args:
                            cost = result['cost'] * (1 - reduction / 100)
                            res['cost'] = math.ceil(cost)
            else:
                if 'age' in request.args and request.args.get('age', type=int) >= 6:
                    if request.args.get('age', type=int) > 64:
                        res['cost'] = math.ceil(result['cost'] * .4)
                    else:
                        res.update(result)
                else:
                    res['cost'] = 0

    return res


if __name__ == "__main__":
    app.run(port=3005)
