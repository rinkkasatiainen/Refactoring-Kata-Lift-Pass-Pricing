import {Ticket, TicketPrice} from '../ticket'

export class ChildTickets implements Ticket {
    public withBasePrice(): { forDate: (date: string) => Promise<TicketPrice> } {
        return {
            forDate() {
                return Promise.resolve({cost: 0})
            },
        }
    }
}
