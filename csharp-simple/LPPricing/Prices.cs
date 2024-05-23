using System.Collections;
using System.Globalization;
using MySql.Data.MySqlClient;

namespace LPPricing;

public class Prices
{
    public static void mapRoutes(WebApplication app)
    {
        var connection = new MySqlConnection
        {
            ConnectionString = @"Database=lift_pass;Data Source=localhost;User Id=root;Password=mysql"
        };
        connection.Open();

        app.MapPut("/prices", (context) =>
        {
            int liftPassCost = Int32.Parse(context.Request.Query["cost"]);
            string liftPassType = context.Request.Query["type"];

            using (var command = new MySqlCommand( //
                       "INSERT INTO base_price (type, cost) VALUES (@type, @cost) " + //
                       "ON DUPLICATE KEY UPDATE cost = @cost;", connection))
            {
                command.Parameters.AddWithValue("@type", liftPassType);
                command.Parameters.AddWithValue("@cost", liftPassCost);
                command.Prepare();
                command.ExecuteNonQuery();
            }

            return Task.FromResult("");
        });

        app.MapGet("/prices", (context) =>
        {
            int? age = (string)context.Request.Query["age"] != null ? Int32.Parse(context.Request.Query["age"]) : null;

            double basePrice;
            using (var costCmd = new MySqlCommand( //
                       "SELECT cost FROM base_price " + //
                       "WHERE type = @type", connection))
            {
                costCmd.Parameters.AddWithValue("@type", context.Request.Query["type"]);
                costCmd.Prepare();
                basePrice = (int)costCmd.ExecuteScalar();
            }

            if (age != null && age < 6)
            {
                return Task.FromResult("{ \"cost\": 0}");
            }
            else
            {
                if (!"night".Equals(context.Request.Query["type"]))
                {
                    var holidaysDates = new ArrayList();
                    using (var holidayCmd = new MySqlCommand( //
                               "SELECT * FROM holidays", connection))
                    {
                        holidayCmd.Prepare();
                        using (var holidays = holidayCmd.ExecuteReader())
                        {
                            while (holidays.Read())
                            {
                                holidaysDates.Add(holidays.GetDateTime("holiday"));
                            }
                        }
                    }

                    int reduction = 0;
                    var isHoliday = false;
                    foreach (DateTime holiday in holidaysDates)
                    {
                        if ((string)context.Request.Query["date"] != null)
                        {
                            DateTime d = DateTime.ParseExact(context.Request.Query["date"], "yyyy-MM-dd",
                                CultureInfo.InvariantCulture);
                            if (d.Year == holiday.Year &&
                                d.Month == holiday.Month &&
                                d.Date == holiday.Date)
                            {
                                isHoliday = true;
                            }
                        }
                    }

                    if ((string)context.Request.Query["date"] != null)
                    {
                        DateTime d = DateTime.ParseExact(context.Request.Query["date"], "yyyy-MM-dd",
                            CultureInfo.InvariantCulture);
                        if (!isHoliday && (int)d.DayOfWeek == 1)
                        {
                            reduction = 35;
                        }
                    }

                    // TODO apply reduction for others
                    if (age != null && age < 15)
                    {
                        return Task.FromResult("{ \"cost\": " + (int)Math.Ceiling(basePrice * .7) + "}");
                    }
                    else
                    {
                        if (age == null)
                        {
                            double cost = basePrice * (1 - reduction / 100.0);
                            return Task.FromResult("{ \"cost\": " + (int)Math.Ceiling(cost) + "}");
                        }
                        else
                        {
                            if (age > 64)
                            {
                                double cost = basePrice * .75 * (1 - reduction / 100.0);
                                return Task.FromResult("{ \"cost\": " + (int)Math.Ceiling(cost) + "}");
                            }
                            else
                            {
                                double cost = basePrice * (1 - reduction / 100.0);
                                return Task.FromResult("{ \"cost\": " + (int)Math.Ceiling(cost) + "}");
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
                            return Task.FromResult("{ \"cost\": " + (int)Math.Ceiling(basePrice * .4) + "}");
                        }
                        else
                        {
                            return Task.FromResult("{ \"cost\": " + basePrice + "}");
                        }
                    }
                    else
                    {
                        return Task.FromResult("{ \"cost\": 0}");
                    }
                }
            }
        });
    }
}