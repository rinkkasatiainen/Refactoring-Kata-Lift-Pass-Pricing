import express from 'express'
import mysql, {Connection} from 'mysql2/promise'

interface BasePrice {
    cost: number;
}

interface Holiday {
    getFullYear: () => number;
    getMonth: () => number;
    getDate: () => number;
}

type GetBasePrice = (liftPassType: string) => Promise<BasePrice>
type GetHolidays = () => Promise<Array<{ holiday: Holiday }>>

const getBasePrice: (conn: Connection) => GetBasePrice =
    // @ts-ignore
    conn => async (liftPassType: string) => ((await conn.query(
        'SELECT cost FROM `base_price` ' +
        'WHERE `type` = ? ',
        [liftPassType]))[0][0] as unknown as BasePrice)


const getHolidays: (conn: Connection) => GetHolidays =
    // @ts-ignore
    conn => async () => (await conn.query(
        'SELECT * FROM `holidays`'
    ))[0] as mysql.RowDataPacket[]

const getPrice:
    (basePriceFor: GetBasePrice, listHolidays: GetHolidays, liftPassType: string, age: number, date: string) =>
        Promise<BasePrice> =
    async (basePriceFor, listHolidays,  liftPassType, age, date) => {
        if (age < 6) {
            return {cost: 0}
        } else {
            const basePrice: BasePrice = await basePriceFor(liftPassType)

            if (liftPassType !== 'night') {
                const holidays = await listHolidays()

                let isHoliday
                let reduction = 0
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
                if (!isHoliday && new Date(date).getDay() === 1) {
                    reduction = 35
                }
                if (age < 15) {
                    return {cost: Math.ceil(basePrice.cost * .7)}
                } else {
                    if (age === undefined) {
                        const cost = basePrice.cost * (1 - reduction / 100)
                        return {cost: Math.ceil(cost)}
                    } else {
                        if (age > 64) {
                            const cost = basePrice.cost * .75 * (1 - reduction / 100)
                            return {cost: Math.ceil(cost)}
                        } else {
                            const cost = basePrice.cost * (1 - reduction / 100)
                            return {cost: Math.ceil(cost)}
                        }
                    }
                }
            } else {
                if (age >= 6) {
                    if (age > 64) {
                        return {cost: Math.ceil(basePrice.cost * .4)}
                    } else {
                        return basePrice
                    }
                } else {
                    return {cost: 0}
                }
            }
        }
    }

async function createApp() {
    const app = express()

    const connectionOptions = {host: 'localhost', user: 'root', database: 'lift_pass', password: 'mysql'}
    const connection = await mysql.createConnection(connectionOptions)

    // These look a lot like repositories
    const basePriceFor = getBasePrice(connection)
    const listHolidays = getHolidays(connection)

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
        const result: BasePrice  = await getPrice(basePriceFor, listHolidays, liftPassType, age, date)
        res.json(result)
    })
    return {app, connection}
}

export {createApp}
