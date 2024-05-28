using System.Collections;
using System.Globalization;

namespace LPPricing;

public class CalculatesPrices(Func<string, double> getBasePrice, Func<List<Holiday>> listHoliday)
{
    public Result Handle(string? type, int? age, string? date )
    {
        double basePrice = getBasePrice(type);

        if (age != null && age < 6)
        {
            return new Result() { cost = 0 };
        }
        else
        {
            if (!"night".Equals(type))
            {
                var holidaysDates = new ArrayList();

                var listOfHolidays = listHoliday();
                foreach (var holiday in listOfHolidays)
                {
                    var _date = holiday.holiday + " 00:00";
                    var d = DateTime.ParseExact(_date, "yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture);
                    holidaysDates.Add(d);
                }

                int reduction = 0;
                var isHoliday = false;
                foreach (DateTime holiday in holidaysDates)
                {
                    if (date != null)
                    {
                        DateTime d = DateTime.ParseExact(date, "yyyy-MM-dd",
                            CultureInfo.InvariantCulture);
                        if (d.Year == holiday.Year &&
                            d.Month == holiday.Month &&
                            d.Date == holiday.Date)
                        {
                            isHoliday = true;
                        }
                    }
                }

                if (date != null)
                {
                    DateTime d = DateTime.ParseExact(date, "yyyy-MM-dd",
                        CultureInfo.InvariantCulture);
                    if (!isHoliday && (int)d.DayOfWeek == 1)
                    {
                        reduction = 35;
                    }
                }

                // TODO apply reduction for others
                if (age != null && age < 15)
                {
                    return new Result() { cost = (int)Math.Ceiling(basePrice * .7) };
                }
                else
                {
                    if (age == null)
                    {
                        double cost = basePrice * (1 - reduction / 100.0);
                        return new Result() { cost = (int)Math.Ceiling(cost) };
                    }
                    else
                    {
                        if (age > 64)
                        {
                            double cost = basePrice * .75 * (1 - reduction / 100.0);
                            return new Result() { cost = (int)Math.Ceiling(cost) };
                        }
                        else
                        {
                            double cost = basePrice * (1 - reduction / 100.0);
                            return new Result() { cost = (int)Math.Ceiling(cost) };
                        }
                    }
                }
            }

            else
            {
                if (age != null && age >= 6)
                {
                    if (age > 64)
                    {
                        return new Result() { cost = (int)Math.Ceiling(basePrice * .4) };
                    }
                    else
                    {
                        return new Result() { cost = (int)basePrice };
                    }
                }
                else
                {
                    return new Result() { cost = 0 };
                }
            }
        }
    }
}