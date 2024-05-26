import express from "express";
import {mimicDbConnection} from "./infra/db";
import {getPrice} from "./domain/calculate-price";
import {TicketPrice} from "../domain/types";
import {getBasePrice, getHolidays} from "./infra/repository";


async function createApp() {

    const app = express()

    const connection = await mimicDbConnection()

    // These look a lot like repositories
    const basePriceFor = getBasePrice(connection)
    const listHolidays = getHolidays(connection)

    // This looks like domain concept
    const priceForTicket = getPrice(basePriceFor, listHolidays)

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.put('/prices', async (req, res) => {
        // This does nothing here

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
