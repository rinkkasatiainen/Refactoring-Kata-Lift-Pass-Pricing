import {Connection} from 'mysql2/promise'
import {GetBasePrice} from '../../domain/repositories/get-base-price'
import {TicketPrice} from '../../domain/ticket'

export const getBasePrice: (conn: Connection) => GetBasePrice =
    // @ts-ignore
    conn => async (liftPassType: string) => ((await conn.query(
        'SELECT cost FROM `base_price` ' +
        'WHERE `type` = ? ',
        [liftPassType]))[0][0] as unknown as TicketPrice)
