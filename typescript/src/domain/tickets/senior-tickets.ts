import {Ticket, TicketPrice} from '../ticket'
import {IsHolidayOn} from '../get-price'

export class SeniorTickets implements Ticket {

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
                return Promise.resolve({cost: Math.ceil(basePrice.cost * .75 * (1 - reduction / 100))})
            },
        }
    }
}
