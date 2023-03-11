// Domain concepts - value objects
export interface TicketPrice {
    cost: number;
}

export interface Holiday {
    getFullYear: () => number;
    getMonth: () => number;
    getDate: () => number;
}

interface Ticket {
    withBasePrice: (basePrice: TicketPrice) => {
        forDate: (date: string) => Promise<TicketPrice>;
    };
}

// Repository functions
export type GetBasePrice = (liftPassType: string) => Promise<TicketPrice>
export type GetHolidays = () => Promise<Array<{ holiday: Holiday }>>
export type IsHolidayOn = (date: string) => Promise<boolean>;
// Domain functions
type CalculatesPrice = (liftPassType: string, age: number, date: string) => Promise<TicketPrice>


const getTicket: (isHolidayOn: IsHolidayOn) => (liftPassType: string, age: number) => Ticket =
    isHolidayOn => (liftPassType: string, age: number) => {
        if (age < 6) {
            const newVar: Ticket = {withBasePrice: () => ({forDate: () => Promise.resolve({cost: 0})})}
            return newVar
        }
        if (liftPassType === 'night') {
            return {
                withBasePrice: basePrice => ({
                    forDate: () => Promise.resolve(age > 64 ? {cost: Math.ceil(basePrice.cost * .4)} : basePrice),
                }),
            }
        }
        if (age < 15) {
            return {
                withBasePrice: basePrice => ({
                    forDate: () => Promise.resolve({cost: Math.ceil(basePrice.cost * .7)}),
                }),
            }
        }
        if (age > 64) {
            return {
                withBasePrice: basePrice => ({
                    forDate: async (date) => {
                        let reduction = 0
                        const isHoliday = await isHolidayOn(date)
                        if (!isHoliday && new Date(date).getDay() === 1) {
                            reduction = 35
                        }
                        return ({cost: Math.ceil(basePrice.cost * .75 * (1 - reduction / 100))})
                    },
                }),
            }
        }
        return {
            withBasePrice: basePrice => ({
                forDate: async (date) => {
                    let reduction = 0
                    const isHoliday = await isHolidayOn(date)
                    if (!isHoliday && new Date(date).getDay() === 1) {
                        reduction = 35
                    }
                    return ({cost: Math.ceil(basePrice.cost * (1 - reduction / 100))})
                },
            }),
        }
    }

export const getPrice:
    (basePriceFor: GetBasePrice, holidayOn: IsHolidayOn) => CalculatesPrice =
    (basePriceFor, holidayOn: IsHolidayOn) => async (liftPassType, age, date) => {
        const basePrice: TicketPrice = await basePriceFor(liftPassType)

        const ticket = getTicket(holidayOn)(liftPassType, age)

        return ticket.withBasePrice(basePrice).forDate(date)
    }
