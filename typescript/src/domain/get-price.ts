// Domain concepts - value objects
export interface TicketPrice {
    cost: number;
}

export interface Holiday {
    getFullYear: () => number;
    getMonth: () => number;
    getDate: () => number;
}

// Repository functions
export type GetBasePrice = (liftPassType: string) => Promise<TicketPrice>
export type GetHolidays = () => Promise<Array<{ holiday: Holiday }>>
// Domain functions
type CalculatesPrice = (liftPassType: string, age: number, date: string) => Promise<TicketPrice>


interface Ticket {
    withBasePrice: (basePrice: TicketPrice) => {
        forDate: (date: Date) => TicketPrice;
    };
}

const getTicket: (liftPassType: string, age: number) => Ticket | undefined =
    (liftPassType: string, age: number) => {
        if (age < 6) {
            const newVar: Ticket = {withBasePrice: () => ({forDate: () => ({cost: 0})})}
            return newVar
        }
        if (liftPassType === 'night') {
            return {
                withBasePrice: basePrice => ({
                    forDate: () => age > 64 ? {cost: Math.ceil(basePrice.cost * .4)} : basePrice,
                }),
            }
        }
        if ( age < 15) {
            return {
                withBasePrice: basePrice => ({
                    forDate: () => ({ cost: Math.ceil(basePrice.cost * .7)}),
                }),
            }

        }
        return undefined
    }

export type IsHolidayOn = (date: string) => Promise<boolean>;
export const getPrice:
    (basePriceFor: GetBasePrice, holidayOn: IsHolidayOn) => CalculatesPrice =
    (basePriceFor, holidayOn: IsHolidayOn) => async (liftPassType, age, date) => {
        const basePrice: TicketPrice = await basePriceFor(liftPassType)
        // Create a new Bonsai tree branch
        const ticket = getTicket(liftPassType, age)
        if (ticket !== undefined) {
            // if there is a ticket, use that. otherwise, use the legacy code path
            return ticket.withBasePrice(basePrice).forDate(new Date(date))
        }
        let reduction = 0
        const isHoliday = await holidayOn(date)
        if (!isHoliday && new Date(date).getDay() === 1) {
            reduction = 35
        }

        if (age > 64) {
            const cost = basePrice.cost * .75 * (1 - reduction / 100)
            return {cost: Math.ceil(cost)}
        } else {
            const cost = basePrice.cost * (1 - reduction / 100)
            return {cost: Math.ceil(cost)}
        }
    }
