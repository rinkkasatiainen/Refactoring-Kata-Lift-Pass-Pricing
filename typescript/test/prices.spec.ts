import {createApp} from "../src/prices"
import request from 'supertest'
import {expect} from 'chai';

describe('prices', () => {

    let app, connection

    beforeEach(async () => {
        ({app, connection} = await createApp())
        await request(app).put('/prices?type=1jour&cost=35').expect(200)
        await request(app).put('/prices?type=night&cost=19').expect(200)
    });

    it('default cost', async () => {
        const {body} = await request(app)
            .get('/prices?type=1jour')

        expect(body.cost).equal(35)
    });
    it('works for night passes', async () => {
        const {body} = await request(app)
            .get(`/prices?type=night&age=25`)

        expect(body.cost).equal(19)
    });
    it('works for monday deals', async () => {
        const {body} = await request(app)
            .get(`/prices?type=1jour&age=${15}&date=2024-05-28}`)

        expect(body.cost).equal(35)
    });
});
