import {GetHolidays} from '../repositories/get-holidays'
import {Holiday} from '../holiday'

export const isHolidayOn: (listHolidays: GetHolidays) => (date: string) => Promise<boolean> =
    listHolidays => async (date: string) => {
        const holidays = await listHolidays()
        let isHoliday = false
        for (const row of holidays) {
            // eslint-disable-next-line max-len
            const holiday = row.holiday as unknown as Holiday
            if (date) {
                const d = new Date(date)
                if (d.getFullYear() === holiday.getFullYear()
                    && d.getMonth() === holiday.getMonth()
                    && d.getDate() === holiday.getDate()) {
                    isHoliday = true
                }
            }
        }
        return isHoliday
    }
