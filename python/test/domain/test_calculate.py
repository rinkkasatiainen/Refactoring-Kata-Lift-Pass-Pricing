from datetime import datetime
from typing import List, TypeAlias, NamedTuple

import pytest

from src.domain.calculate_price import calc_price


class DateX(NamedTuple):
    year: int
    month: int
    day: int


ActsLikeADate: TypeAlias = DateX


def fake_holidays_with(holidays: List[ActsLikeADate]):
    def get_holidays(_self):
        return holidays

    return get_holidays


def fake_base_price(price):
    def get_base_price(_self, _type):
        return {"cost": price}

    return get_base_price


a_random_monday = '2022-02-28'
not_monday = '2022-03-01'


class Test_ADayPass_NotInHoliday:
    get_holidays = fake_holidays_with([])
    get_base_price_fn = fake_base_price(35)
    def test_appears_to_have_discount_on_monday(self):
        calculate_price = calc_price(self.get_base_price_fn, self.get_holidays)
        price = calculate_price(21, a_random_monday, '1jour')

        assert price == {"cost": 23}


    def test_monday_for_a_child_is_more_expensive_than_for_adult(self):
        calculate_price = calc_price(self.get_base_price_fn, self.get_holidays)
        price = calculate_price(14, a_random_monday, '1jour')

        assert price == {"cost": 25}

    def test_aged_over_64_for_bigger_reduction(self):
        calculate_price = calc_price(self.get_base_price_fn, self.get_holidays)
        price = calculate_price(65, a_random_monday, '1jour')

        assert price == {"cost": 18}

    def test_base_price(self):
        calculate_price = calc_price(self.get_base_price_fn, self.get_holidays)
        price = calculate_price(21, not_monday, '1jour')

        assert price == {"cost": 35}


class Test_ADayPass_DuringHoliday:
    a_random_monday_on_holiday = '2024-05-27'
    not_monday_on_holiday = '2024-05-28'

    get_holidays = fake_holidays_with([ datetime.fromisoformat(a_random_monday_on_holiday)])
    get_base_price_fn = fake_base_price(35)
    def test_no_reduction_on_holidays_on_mondays(self):
        calculate_price = calc_price(self.get_base_price_fn, self.get_holidays)
        price = calculate_price(21, self.a_random_monday_on_holiday, '1jour')

        assert price == {"cost": 35}


class Test_NightPasses:
    a_random_monday_on_holiday = '2024-05-27'
    not_monday_not_on_holiday = '2024-05-28'

    get_holidays = fake_holidays_with([ datetime.fromisoformat(a_random_monday_on_holiday)])
    get_base_price_fn = fake_base_price(35)

    def test_no_reduction_on_night_passes(self):
        calculate_price = calc_price(self.get_base_price_fn, self.get_holidays)
        price = calculate_price(21, self.a_random_monday_on_holiday, 'night')

        assert price == {"cost": 35}

    def test_reduction_for_65_yo(self):
        calculate_price = calc_price(self.get_base_price_fn, self.get_holidays)
        price = calculate_price(65, self.a_random_monday_on_holiday, 'night')

        assert price == {"cost": 14}


class Test_CharacterisationTests:
    a_random_monday_on_holiday = '2024-05-27'
    not_monday_not_on_holiday = '2024-05-28'

    get_holidays = fake_holidays_with([ datetime.fromisoformat(a_random_monday_on_holiday)])
    get_base_price_fn = fake_base_price(35)

    def test_default_cost(self):
        response = calc_price(self.get_base_price_fn, self.get_holidays)(type_='1jour')
        assert response == {'cost': 35}

    @pytest.mark.parametrize(
        "age,expectedCost", [
            (5, 0),
            (6, 25),
            (14, 25),
            (15, 35),
            (25, 35),
            (64, 35),
            (65, 27),
        ])
    def test_works_for_all_ages(self, age, expectedCost):
        response = calc_price(self.get_base_price_fn, self.get_holidays)(type_='1jour', age_=age)
        assert response == {'cost': expectedCost}

    @pytest.mark.parametrize(
        "age,expectedCost", [
            (5, 0),
            (6, 19),
            (25, 19),
            (64, 19),
            (65, 8),
        ])
    def test_works_for_night_passes(self, age, expectedCost):
        response = calc_price(lambda _: {"cost": 19}, self.get_holidays)(type_='night', age_=age)
        assert response == {'cost': expectedCost}

    @pytest.mark.parametrize(
        "age,expectedCost,ski_date", [
            (15, 35, '2019-02-22'),
            (15, 35, '2024-05-27'),  # monday, holiday
            (15, 23, '2019-03-11'),  # monday
            (65, 18, '2019-03-11'),  # monday
        ])
    def test_works_for_monday_deals(self, age, expectedCost, ski_date):
        response = calc_price(self.get_base_price_fn, self.get_holidays)(type_='1jour', age_=age, date_=ski_date)
        assert response == {'cost': expectedCost}
