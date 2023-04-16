import mysql, {Connection} from 'mysql2/promise'
import {GetHolidays} from '../../domain/repositories/get-holidays'

export const getHolidays: (conn: Connection) => GetHolidays =
    // @ts-ignore
    conn => async () => (await conn.query(
        'SELECT * FROM `holidays`'
    ))[0] as mysql.RowDataPacket[]
