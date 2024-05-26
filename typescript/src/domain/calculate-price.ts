// Domain functions
import {GetBasePrice, GetHolidays, TicketPrice} from "../../domain/types";

type CalculatesPrice = (liftPassType: string, age: number, date: string) => Promise<TicketPrice>

type Holiday  = Date

export const getPrice:
    (basePriceFor: GetBasePrice, listHolidays: GetHolidays) => CalculatesPrice =
    (basePriceFor, listHolidays) => async (liftPassType, age, date) => {
        if (age < 6) {
            return {cost: 0}
        } else {
            const basePrice: TicketPrice = await basePriceFor(liftPassType)

            if (liftPassType !== 'night') {
                const holidays = await listHolidays()

                let isHoliday
                let reduction = 0
                for (const row of holidays) {
                    // eslint-disable-next-line max-len
                    const holiday = row.holiday as unknown as Holiday
                    if (date) {
                        const d = new Date(date)
                        if (d.getFullYear() === holiday.getFullYear()
                            && d.getMonth() === holiday.getMonth()
                            && d.getDate() === holiday.getDate()) {
                            isHoliday = true
                        }
                    }
                }
                if (!isHoliday && new Date(date).getDay() === 1) {
                    reduction = 35
                }
                if (age < 15) {
                    return {cost: Math.ceil(basePrice.cost * .7)}
                } else {
                    if (age === undefined) {
                        const cost = basePrice.cost * (1 - reduction / 100)
                        return {cost: Math.ceil(cost)}
                    } else {
                        if (age > 64) {
                            const cost = basePrice.cost * .75 * (1 - reduction / 100)
                            return {cost: Math.ceil(cost)}
                        } else {
                            const cost = basePrice.cost * (1 - reduction / 100)
                            return {cost: Math.ceil(cost)}
                        }
                    }
                }
            } else {
                if (age >= 6) {
                    if (age > 64) {
                        return {cost: Math.ceil(basePrice.cost * .4)}
                    } else {
                        return basePrice
                    }
                } else {
                    return {cost: 0}
                }
            }
        }
    }