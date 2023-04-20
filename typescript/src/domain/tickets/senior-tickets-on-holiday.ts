import {Ticket, TicketPrice} from '../ticket'

export class SeniorTicketsOnHoliday implements Ticket {


    public withBasePrice(basePrice: TicketPrice): { forDate: (date: string) => Promise<TicketPrice> } {
        return {
            forDate: async () => Promise.resolve({cost: Math.ceil(basePrice.cost * .75 * (1 - 0 / 100))}),
        }
    }
}
