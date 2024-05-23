using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;


namespace LPPricingTests;

public class UnitTest1 : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    // CreatePrice("1jour", 35);
    // CreatePrice("night", 19);

    public UnitTest1(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Test1()
    {
        // await using var application = new WebApplicationFactory<Program>();
        var application = _factory;
        using var client = application.CreateClient();

        Dictionary<string, object> dict = new()
        {
            { "type", "1jour" },
            { "cost", "35" }
        };

        HttpContent aadict = JsonContent.Create(dict);
        var response = await client.PutAsync("/prices", aadict);
    }
}