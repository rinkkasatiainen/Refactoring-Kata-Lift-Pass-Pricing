import {expect} from 'chai'
import {getPrice} from '../src/domain/calculate-price'

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
                const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 21, aRandomMonday)

                const cost = Math.ceil(basePrice * 0.65)
                expect(result).to.eql({cost})
            })
            it('Monday for a child is more expensive than for an adult', async () => {
                const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 14, aRandomMonday)

                const cost = Math.ceil(basePrice * 0.7)
                expect(result).to.eql({cost})
            })
            it('Monday for more than 64y old has bigger reduction', async () => {
                const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 65, aRandomMonday)

                const cost = Math.ceil(basePrice * 0.65 * 0.75)
                expect(result).to.eql({cost})

            })
            it('typically uses base price', async () => {
                const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 21, notMonday)

                expect(result).to.eql({cost: basePrice})
            })
            it('costs nothing for 5yo', async () => {
                const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 5, aRandomMonday)

                expect(result).to.eql({cost: 0})
            })
        })
        describe('a holiday', () => {
            const listHolidays = () => Promise.resolve(
                [{holiday: new Date(aRandomMonday)}, {holiday: new Date(notMonday)}]
            )

            it('no reduction on holidays, even on Mondays', async () => {
                const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 21, aRandomMonday)

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
            const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 21, aRandomMonday)

            const cost = basePrice
            expect(result).to.eql({cost})
        })
        it('reduction for 65yo on night passes', async () => {
            const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 65, aRandomMonday)

            const cost = Math.ceil(basePrice * 0.4)
            expect(result).to.eql({cost})
        })
        it('free for child < 6', async () => {
            const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 5, aRandomMonday)

            expect(result).to.eql({cost: 0})
        })
    })

    describe('characterisation tests', () => {
        const dddEuropeDates = ['2024-05-27', '2024-05-28', '2024-05-29', '2024-05-30', '2024-05-30']
        const getBasePrice = () => Promise.resolve({cost: 35})
        const listHolidays = () => Promise.resolve(
            dddEuropeDates.map(date => ({holiday: new Date(date)}))
        )
        describe('it', () => {


            [
                // @ts-ignore
                {age: 5, expectedCost: 0},
                {age: 6, expectedCost: 25},
                {age: 14, expectedCost: 25},
                {age: 15, expectedCost: 35},
                {age: 25, expectedCost: 35},
                {age: 64, expectedCost: 35},
                {age: 65, expectedCost: 27}
            ].forEach(({age, expectedCost}) => {
                it('works for all ages', async () => {
                    const {cost} = await getPrice(getBasePrice, listHolidays)("1jour", age, dddEuropeDates[2])

                    expect(cost).equal(expectedCost)
                });
            });

            [
                {age: 5, expectedCost: 0},
                {age: 6, expectedCost: 19},
                {age: 25, expectedCost: 19},
                {age: 64, expectedCost: 19},
                {age: 65, expectedCost: 8},
            ]
                .forEach(({age, expectedCost}) => {
                    const getBasePrice = () => Promise.resolve({cost: 19})
                    it('works for night passes', async () => {
                        const {cost} = await getPrice(getBasePrice, listHolidays)("night", age, dddEuropeDates[2])

                        expect(cost).equal(expectedCost)
                    });
                });

            [
                {age: 15, expectedCost: 35, date: '2019-02-22'},
                {age: 15, expectedCost: 35, date: '2024-05-28'}, // monday on holiday
                {age: 15, expectedCost: 23, date: '2019-03-11'},
                {age: 65, expectedCost: 18, date: '2024-03-11'}, // monday
            ]
                .forEach(({age, expectedCost, date}) => {
                    it('works for monday deals', async () => {
                        const {cost} = await getPrice(getBasePrice, listHolidays)("1jour", age, date)

                        expect(cost).equal(expectedCost)
                    });
                })


        })
    })

})
