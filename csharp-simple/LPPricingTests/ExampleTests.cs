using LPPricing;

namespace LPPricingTests;

public class PricesTest 
{
    Func<string, double> getBasePrice;
    Func<List<Holiday>> listHoliday;
    private CalculatesPrices calculatesPrices;

    public PricesTest()
    {
        getBasePrice = (_) => 35; 
        listHoliday = () => []; 
        this.calculatesPrices = new CalculatesPrices(getBasePrice, listHoliday);
    }

    [Fact]
    public void DefaultCost()
    {
        var result = calculatesPrices.Handle("1jour", null, null);
        Assert.Equal(35, result.cost);
    }

    [Theory]
    [InlineData(5, 0)]
    [InlineData(6, 25)]
    [InlineData(14, 25)]
    [InlineData(15, 35)]
    [InlineData(25, 35)]
    [InlineData(64, 35)]
    [InlineData(65, 27)]
    public void WorksForAllAges(int age, int expectedCost)
    {
        var result = calculatesPrices.Handle("1jour", age, null);
        Assert.Equal(expectedCost, result.cost);
    }

    [Theory]
    [InlineData(5, 0)]
    [InlineData(6, 19)]
    [InlineData(25, 19)]
    [InlineData(64, 19)]
    [InlineData(65, 8)]
    public void WorksForNightPasses(int age, int expectedCost)
    {
        getBasePrice = (_) => 19; 
        calculatesPrices = new CalculatesPrices(getBasePrice, listHoliday); 
        var result = calculatesPrices.Handle("night", age, null);
        Assert.Equal(expectedCost, result.cost);
    }

    [Theory]
    [InlineData(15, "2019-02-22", 35)]
    [InlineData(15, "2024-05-27", 35)]
    [InlineData(15, "2019-03-11", 23)]
    [InlineData(65, "2019-03-11", 18)]
    public void WorksForMondayDeals(int age, string date, int expectedCost)
    {
        listHoliday = () => [new Holiday(){ holiday = "2024-05-27"}]; 
        calculatesPrices = new CalculatesPrices(getBasePrice, listHoliday); 
        var result = calculatesPrices.Handle("1jour", age, date);
        Assert.Equal(expectedCost, result.cost);
    }

}
