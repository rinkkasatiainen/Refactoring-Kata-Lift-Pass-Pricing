import {Ticket, TicketPrice} from '../ticket'

export class KidsTickets implements Ticket {
    public withBasePrice(basePrice: TicketPrice): { forDate: (date: string) => Promise<TicketPrice> } {
        return {
            forDate: () => Promise.resolve({cost: Math.ceil(basePrice.cost * .7)}),
        }
    }
}
