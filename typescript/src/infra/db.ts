import fs from "fs";
import path from "path";

export interface DBOperations {
    readPrices: (type: string) => Promise<{ cost: number }>
    readHolidays: () => Promise<Array<{ holiday: Date }>>
}

export const mimicDbConnection: () => Promise<DBOperations> =
    () => {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, 'prices_db.json'), 'utf8', (err, data) => {
                if (err) {
                    reject(err)
                }
                const d = JSON.parse(data);

                const db = {}
                db['prices'] = d.prices
                db['holidays'] = d.holidays.map(it => ({holiday: new Date(it)}))

                resolve({
                    // @ts-ignore
                    readPrices: type => db.prices[type],
                    // @ts-ignore
                    readHolidays: () => db.holidays,
                })
            });
        })
    }