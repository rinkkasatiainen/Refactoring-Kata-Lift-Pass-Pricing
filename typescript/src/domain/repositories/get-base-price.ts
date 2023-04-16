// Repository functions
import {TicketPrice} from '../ticket'

export type GetBasePrice = (liftPassType: string) => Promise<TicketPrice>
