// Domain concepts - value objects
import {Ticket, TicketPrice} from './ticket'
import {Holiday} from './holiday'
import {ChildUnder6} from './tickets/child-under6'
import {NightPass} from './tickets/night-pass'
import {KidsTickets} from './tickets/kids-tickets'
import {SeniorTickets} from './tickets/senior-tickets'

// Repository functions
export type GetBasePrice = (liftPassType: string) => Promise<TicketPrice>
export type GetHolidays = () => Promise<Array<{ holiday: Holiday }>>
export type IsHolidayOn = (date: string) => Promise<boolean>;
// Domain functions
type CalculatesPrice = (liftPassType: string, age: number, date: string) => Promise<TicketPrice>

class NormalTicket implements Ticket {
    public constructor(private readonly isHolidayOn: IsHolidayOn) {

    }

    public withBasePrice(basePrice: TicketPrice): { forDate: (date: string) => Promise<TicketPrice> } {
        return {
            forDate: async (date) => {
                let reduction = 0
                const isHoliday = await this.isHolidayOn(date)
                if (!isHoliday && new Date(date).getDay() === 1) {
                    reduction = 35
                }
                return ({cost: Math.ceil(basePrice.cost * (1 - reduction / 100))})
            },
        }
    }
}

const getTicket: (isHolidayOn: IsHolidayOn) => (liftPassType: string, age: number) => Ticket =
    isHolidayOn => (liftPassType: string, age: number) => {
        if (age < 6) {
            return new ChildUnder6()
        }
        if (liftPassType === 'night') {
            return new NightPass(age)
        }
        if (age < 15) {
            return new KidsTickets()
        }
        if (age > 64) {
            return new SeniorTickets(isHolidayOn)
        }
        return new NormalTicket(isHolidayOn)
    }

export const getPrice:
    (basePriceFor: GetBasePrice, holidayOn: IsHolidayOn) => CalculatesPrice =
    (basePriceFor, holidayOn: IsHolidayOn) => async (liftPassType, age, date) => {
        const basePrice: TicketPrice = await basePriceFor(liftPassType)

        const ticket = getTicket(holidayOn)(liftPassType, age)

        return ticket.withBasePrice(basePrice).forDate(date)
    }
