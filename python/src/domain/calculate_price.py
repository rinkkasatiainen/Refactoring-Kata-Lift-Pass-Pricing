import math
from datetime import datetime


def matches_dates(holidays, date):
    for holiday in holidays:
        d = datetime.fromisoformat(date)
        if d.year == holiday.year and d.month == holiday.month and holiday.day == d.day:
            return True
    return False


def calc_price(get_base_price_fn, get_holidays_fn):
    def inner(age_ = None, date_ = None, type_ = None):
        base_price = get_base_price_fn(type_)
        if age_ and age_ < 6:
            result = {"cost": 0}
        else:
            if type_ != "night":

                reduction = 0
                is_holiday = False
                if date_:
                    holidays = get_holidays_fn()
                    is_holiday = matches_dates(holidays, date_)

                if not is_holiday and date_ and datetime.fromisoformat(date_).weekday() == 0:
                    reduction = 35

                # TODO: apply reduction for others
                if age_ and age_ < 15:
                    result = {"cost": math.ceil(base_price["cost"] * .7)}
                else:
                    if not age_:
                        result = {"cost": math.ceil(base_price['cost'] * (1 - reduction / 100))}
                    else:
                        if age_ and age_ > 64:
                            result = {"cost": math.ceil(base_price['cost'] * .75 * (1 - reduction / 100))}
                        elif age_:
                            result = {"cost": math.ceil(base_price['cost'] * (1 - reduction / 100))}
            else:
                if age_ and age_ >= 6:
                    if age_ and age_ > 64:
                        result = {"cost": math.ceil(base_price['cost'] * .4)}
                    else:
                        result = base_price
                else:
                    result = {"cost": 0}
        return result
        # return calculate_price(age, date, type_, get_base_price_fn, get_holidays_fn)

    return inner

def calculate_price(age_, date_: str, type_, get_base_price_fn, get_holidays_fn):
    base_price = get_base_price_fn(type_)
    if age_ and age_ < 6:
        result = {"cost": 0}
    else:
        if type_ != "night":

            reduction = 0
            is_holiday = False
            if date_:
                holidays = get_holidays_fn()
                is_holiday = matches_dates(holidays, date_)

            if not is_holiday and date_ and datetime.fromisoformat(date_).weekday() == 0:
                reduction = 35

            # TODO: apply reduction for others
            if age_ and age_ < 15:
                result = {"cost": math.ceil(base_price["cost"] * .7)}
            else:
                if not age_:
                    result = {"cost": math.ceil(base_price['cost'] * (1 - reduction / 100))}
                else:
                    if age_ and age_ > 64:
                        result = {"cost": math.ceil(base_price['cost'] * .75 * (1 - reduction / 100))}
                    elif age_:
                        result = {"cost": math.ceil(base_price['cost'] * (1 - reduction / 100))}
        else:
            if age_ and age_ >= 6:
                if age_ and age_ > 64:
                    result = {"cost": math.ceil(base_price['cost'] * .4)}
                else:
                    result = base_price
            else:
                result = {"cost": 0}
    return result
