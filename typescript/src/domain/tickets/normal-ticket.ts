import {Ticket, TicketPrice} from '../ticket'

export class NormalTicket implements Ticket {
    public withBasePrice(basePrice: TicketPrice): { forDate: (date: string) => Promise<TicketPrice> } {
        return {
            forDate: date => {
                let reduction = 0
                if (new Date(date).getDay() === 1) {
                    reduction = 35
                }
                return Promise.resolve({cost: Math.ceil(basePrice.cost * (1 - reduction / 100))})
            },
        }
    }
}
