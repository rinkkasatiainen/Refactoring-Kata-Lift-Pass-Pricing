// Domain concepts - value objects
import {Ticket, TicketPrice} from '../ticket'
import {ChildTickets} from '../tickets/child-tickets'
import {NightPass} from '../tickets/night-pass'
import {KidsTickets} from '../tickets/kids-tickets'
import {SeniorTickets} from '../tickets/senior-tickets'
import {GetBasePrice} from '../repositories/get-base-price'
import {IsHolidayOn} from '../holiday'
import {NormalTicket} from '../tickets/normal-ticket'
import {SeniorTicketsOnHoliday} from '../tickets/senior-tickets-on-holiday'
import {NormalTicketOnHoliday} from '../tickets/normal-ticket-on-holiday'

// Domain functions
type CalculatesPrice = (liftPassType: string, age: number, date: string) => Promise<TicketPrice>

const getTicket: (isHolidayOn: IsHolidayOn) => (liftPassType: string, age: number) => Ticket =
    () => (liftPassType: string, age: number) => {
        if (age < 6) {
            return new ChildTickets()
        }
        if (liftPassType === 'night') {
            return new NightPass(age)
        }
        if (age < 15) {
            return new KidsTickets()
        }
        if (age > 64) {
            return new SeniorTickets()
        }
        return new NormalTicket()
    }

const ticketForDate: (isHolidayOn: IsHolidayOn, date: string) => Promise<{
    withBasePrice: (price: TicketPrice) => {
        getTicket: (type: string, age: number) => Promise<TicketPrice>;
    };
}> =
    async (isHolidayOn, date) => {
        const isHoliday = await isHolidayOn(date)
        if (isHoliday) {
            return {
                withBasePrice: price => ({
                    getTicket: (_type, age) => {
                        if (age < 6){
                            return new ChildTickets().withBasePrice().forDate(date)
                        }
                        if (_type === 'night') {
                            return new NightPass(age).withBasePrice(price).forDate(date)
                        }
                        if (age > 64) {
                            return new SeniorTicketsOnHoliday().withBasePrice(price).forDate(date)
                        }
                        return new NormalTicketOnHoliday().withBasePrice(price).forDate(date)
                    },
                }),
            }
        }

        return {
            withBasePrice: price => ({
                getTicket: (type, age) =>
                    getTicket(() => Promise.resolve(false))(type, age).withBasePrice(price).forDate(date),
            }),
        }
    }


export const calculatePrice:
    (basePriceFor: GetBasePrice, holidayOn: IsHolidayOn) => CalculatesPrice =
    (basePriceFor, holidayOn: IsHolidayOn) => async (liftPassType, age, date) => {
        const basePrice: TicketPrice = await basePriceFor(liftPassType)

        // const ticket = getTicket(holidayOn)(liftPassType, age)
        // return ticket.withBasePrice(basePrice).forDate(date)

        // programming by wishful thinking?

        const something = (await ticketForDate(holidayOn, date)).withBasePrice(basePrice)
        return something.getTicket(liftPassType, age)

        // const option3 =  ticketWithBasePrice(basePrice).forDate(date, holidayOn)
        // return option3.getTicket(liftPassType, age)
    }
