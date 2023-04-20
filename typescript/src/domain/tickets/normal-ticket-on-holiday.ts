import {Ticket, TicketPrice} from '../ticket'

export class NormalTicketOnHoliday implements Ticket {

    public withBasePrice(basePrice: TicketPrice): { forDate: (date: string) => Promise<TicketPrice> } {
        return {
            forDate: () => {
                const reduction = 0
                return Promise.resolve({cost: Math.ceil(basePrice.cost * (1 - reduction / 100))})
            },
        }
    }
}
