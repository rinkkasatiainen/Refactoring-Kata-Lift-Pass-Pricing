export interface TicketPrice {
    cost: number;
}

export interface Ticket {
    withBasePrice: (basePrice: TicketPrice) => {
        forDate: (date: string) => Promise<TicketPrice>;
    };
}
