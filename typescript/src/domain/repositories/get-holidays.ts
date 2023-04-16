import {Holiday} from '../holiday'

export type GetHolidays = () => Promise<Array<{ holiday: Holiday }>>
