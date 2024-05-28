using System.Collections;
using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Primitives;
using File = System.IO.File;

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
        Func<String, double> getBasePrice = (liftPassType) => dbContent.prices.GetPrice(liftPassType);
        Func<List<Holiday>> listHoliday = () => dbContent.holidays;

        var queryHandler = new CalculatesPrices(getBasePrice, listHoliday);
        
        app.MapGet("/prices", (Func<string?, int?, string?, Result>)queryHandler.Handle);
    }
}