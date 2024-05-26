using System.Collections;
using System.Globalization;
using System.Text.Json;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using MySql.Data.MySqlClient;
using static Microsoft.AspNetCore.Http.Results;
using static Microsoft.AspNetCore.Http.TypedResults;
using File = System.IO.File;
using Ok = Microsoft.AspNetCore.Http.HttpResults.Ok;

namespace LPPricing;

public record Price
{
    public int cost { get; set; }
};

public class Prices
{
    public Price jour { get; set; }
    public Price night { get; set; }

    public double GetPrice(StringValues stringValues)
    {
        if (stringValues.Equals("1jour"))
        {
            return jour.cost;
        }

        return night.cost;
    }
}

public class Holiday
{
    public string holiday { get; set; }
}

public class Result
{
    public int cost { get; set; }
}

public class DB
{
    public Prices prices { get; set; }
    public List<Holiday> holidays { get; set; }
}

class RequestParams
{
    public string type;
    public int age;
    public string date;
}

public class GetPrices
{
    public static void mapRoutes(WebApplication app)
    {
        var path = Path.Combine(Directory.GetCurrentDirectory(), "prices_db.json");
        string text = File.ReadAllText(path);
        var dbContent = JsonSerializer.Deserialize<DB>(text);

        // var connection = new MySqlConnection
        // {
        // ConnectionString = @"Database=lift_pass;Data Source=localhost;User Id=root;Password=mysql"
        // };
        // connection.Open();

        app.MapPut("/prices", async ([FromQuery(Name = "type")] _type) =>
        {
            var result = await Task.FromResult("ok");
            return;
            // return Results.Ok();
        });

        app.MapGet("/prices2", async (string? type, int? age, string? date
        ) =>
        {
            return new Result() { cost = 1 };
        });

        app.MapGet("/prices", async (string? type, int? age, string? date
        ) =>
        {
            double basePrice = dbContent.prices.GetPrice(type);

            if (age != null && age < 6)
            {
                return new Result() { cost = 0 };
            }
            else
            {
                if (!"night".Equals(type))
                {
                    var holidaysDates = new ArrayList();
                    // using (var holidayCmd = new MySqlCommand( //
                    // "SELECT * FROM holidays", connection))
                    // {
                    // holidayCmd.Prepare();
                    foreach (var holiday in dbContent.holidays)
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
        });
    }
}