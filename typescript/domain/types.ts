export interface TicketPrice {
    cost: number;
}

interface Holiday {
    getFullYear: () => number;
    getMonth: () => number;
    getDate: () => number;
}

// Repository functions
export type GetBasePrice = (liftPassType: string) => Promise<TicketPrice>
export type GetHolidays = () => Promise<Array<{ holiday: Holiday }>>