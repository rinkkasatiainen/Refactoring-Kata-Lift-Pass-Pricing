import json
import os
from datetime import datetime


## DBOperations
## read_price(type)
## list_holidays


class MimicsDB:

    def __init__(self, rawdata):
        self.rawdata = rawdata

    def read_price(self, type: str):
        return self.rawdata.get("prices").get(type)

    def list_holidays(self):
        return [ datetime.fromisoformat(x) for x in self.rawdata.get("holidays") ]


def mimic_db_operations():
    f = open(os.path.join(os.path.realpath(
        os.path.join(os.getcwd(), os.path.dirname(__file__))), "prices_db.json"), "r")

    rawdata = json.load(f)

    return MimicsDB(rawdata)


