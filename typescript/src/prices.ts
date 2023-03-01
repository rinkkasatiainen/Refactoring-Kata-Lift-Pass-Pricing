import express from 'express'
import mysql, {Connection} from 'mysql2/promise'
import {GetBasePrice, GetHolidays, getPrice, TicketPrice} from './getPrice'

const getBasePrice: (conn: Connection) => GetBasePrice =
    // @ts-ignore
    conn => async (liftPassType: string) => ((await conn.query(
        'SELECT cost FROM `base_price` ' +
        'WHERE `type` = ? ',
        [liftPassType]))[0][0] as unknown as TicketPrice)

const getHolidays: (conn: Connection) => GetHolidays =
    // @ts-ignore
    conn => async () => (await conn.query(
        'SELECT * FROM `holidays`'
    ))[0] as mysql.RowDataPacket[]

async function createApp() {
    const app = express()

    const connectionOptions = {host: 'localhost', user: 'root', database: 'lift_pass', password: 'mysql'}
    const connection = await mysql.createConnection(connectionOptions)

    // These look a lot like repositories
    const basePriceFor = getBasePrice(connection)
    const listHolidays = getHolidays(connection)

    // This looks like domain concept
    const priceForTicket = getPrice(basePriceFor, listHolidays)

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.put('/prices', async (req, res) => {
        const liftPassCost = req.query.cost
        const liftPassType = req.query.type
        await connection.query(
            'INSERT INTO `base_price` (type, cost) VALUES (?, ?) ' +
            'ON DUPLICATE KEY UPDATE cost = ?',
            [liftPassType, liftPassCost, liftPassCost])

        res.json()
    })


    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.get('/prices', async (req, res) => {
        // TODO: precondition check to see all data is given in the request.
        // TODO: TS checks says all these are actually needed by the code. And there is an unnecessary if-clause.
        // @ts-ignore
        const liftPassType: string = req.query.type
        // @ts-ignore
        const age: number = req.query.age
        // @ts-ignore
        const date: string = req.query.date

        // This looks like a Pure Function that has some domain logic.
        const result: TicketPrice = await priceForTicket(liftPassType, age, date)
        res.json(result)
    })
    return {app, connection}
}

export {createApp}
