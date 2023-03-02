import {expect} from 'chai'
import {getPrice} from '../src/domain/get-price'

describe('get-price', () => {
    describe('a day pass', () => {
        const liftPassType = '1jour'
        describe('when not a holiday', () => {
            const listHolidays = () => Promise.resolve([])
            const basePrice = 20
            const getBasePrice = () => Promise.resolve({cost: basePrice})

            const aRandomMonday = '2022-02-28'
            const notMonday = '2022-02-27'

            it('appears to have a discount of 35% on Monday', async () => {
                const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 21, aRandomMonday)

                const cost = Math.floor(basePrice * 0.65)
                expect(result).to.eql({cost})
            })
            it('Monday for a child is more expensive than for an adult', async () => {
                const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 14, aRandomMonday)

                const cost = Math.floor(basePrice * 0.7)
                expect(result).to.eql({cost})
            })
            it('typically uses base price', async () => {
                const result = await getPrice(getBasePrice, listHolidays)(liftPassType, 21, notMonday)

                expect(result).to.eql({cost: basePrice})
            })
        })
    })
})
