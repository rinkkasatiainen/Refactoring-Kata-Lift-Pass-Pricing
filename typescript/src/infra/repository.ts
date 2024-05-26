import {DBOperations} from "./db";
import {GetBasePrice, GetHolidays} from "../../domain/types";

export const getBasePrice: (conn: DBOperations) => GetBasePrice =
    conn => (liftPassType: string) => conn.readPrices(liftPassType);
export const getHolidays: (conn: DBOperations) => GetHolidays =
    conn => () => conn.readHolidays()