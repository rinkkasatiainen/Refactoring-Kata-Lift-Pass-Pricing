import {expect} from 'chai'
import {getPrice} from '../src/domain/get-price'
import {isHolidayOn} from '../src/prices'

describe('get-price', () => {
    const aRandomMonday = '2022-02-28'
    const notMonday = '2022-02-27'
    const basePrice = 20
    const getBasePrice = () => Promise.resolve({cost: basePrice})
    describe('a day pass', () => {
        const liftPassType = '1jour'
        describe('when not a holiday', () => {
            const listHolidays = () => Promise.resolve([])

            it('appears to have a discount of 35% on Monday', async () => {
                const result = await getPrice(getBasePrice, isHolidayOn(listHolidays))(liftPassType, 21, aRandomMonday)

                const cost = Math.ceil(basePrice * 0.65)
                expect(result).to.eql({cost})
            })
            it('Monday for a child is more expensive than for an adult', async () => {
                const result = await getPrice(getBasePrice, isHolidayOn(listHolidays))(liftPassType, 14, aRandomMonday)

                const cost = Math.ceil(basePrice * 0.7)
                expect(result).to.eql({cost})
            })
            it('Monday for more than 64y old has bigger reduction', async () => {
                const result = await getPrice(getBasePrice, isHolidayOn(listHolidays))(liftPassType, 65, aRandomMonday)

                const cost = Math.ceil(basePrice * 0.65 * 0.75)
                expect(result).to.eql({cost})

            })
            it('typically uses base price', async () => {
                const result = await getPrice(getBasePrice, isHolidayOn(listHolidays))(liftPassType, 21, notMonday)

                expect(result).to.eql({cost: basePrice})
            })
            it('costs nothing for 5yo', async () => {
                const result = await getPrice(getBasePrice, isHolidayOn(listHolidays))(liftPassType, 5, aRandomMonday)

                expect(result).to.eql({cost: 0})
            })
        })
        describe('a holiday', () => {
            const listHolidays = () => Promise.resolve(
                [{holiday: new Date(aRandomMonday)}, {holiday: new Date(notMonday)}]
            )

            it('no reduction on holidays, even on Mondays', async () => {
                const result = await getPrice(getBasePrice, isHolidayOn(listHolidays))(liftPassType, 21, aRandomMonday)

                const cost = basePrice
                expect(result).to.eql({cost})
            })
        })
    })
    describe('night passes', () => {
        const listHolidays = () => Promise.resolve(
            [{holiday: new Date(aRandomMonday)}, {holiday: new Date(notMonday)}]
        )
        const liftPassType = 'night'
        it('no reduction on night passes', async () => {
            const result = await getPrice(getBasePrice, isHolidayOn(listHolidays))(liftPassType, 21, aRandomMonday)

            const cost = basePrice
            expect(result).to.eql({cost})
        })
        it('reduction for 65yo on night passes', async () => {
            const result = await getPrice(getBasePrice, isHolidayOn(listHolidays))(liftPassType, 65, aRandomMonday)

            const cost = Math.ceil(basePrice * 0.4)
            expect(result).to.eql({cost})
        })
        it('free for child < 6', async () => {
            const result = await getPrice(getBasePrice, isHolidayOn(listHolidays))(liftPassType, 5, aRandomMonday)

            expect(result).to.eql({cost: 0})
        })
    })
})
