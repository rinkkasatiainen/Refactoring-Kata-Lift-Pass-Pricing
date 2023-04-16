import {Ticket, TicketPrice} from '../ticket'

export class NightPass implements Ticket {
    public constructor(private readonly age: number) {
    }

    public withBasePrice(basePrice: TicketPrice): { forDate: (date: string) => Promise<TicketPrice> } {
        return {
            forDate: () => {
                if (this.age > 64) {
                    return Promise.resolve({cost: Math.ceil(basePrice.cost * .4)})
                }
                return Promise.resolve(basePrice)
            },
        }
    }
}
