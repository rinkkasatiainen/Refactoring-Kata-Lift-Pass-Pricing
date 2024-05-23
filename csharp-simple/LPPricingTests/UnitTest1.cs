using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.VisualStudio.TestPlatform.TestHost;

namespace LPPricingTests;

public class UnitTest1 : IClassFixture<WebApplicationFactory<Program>>
{
    // CreatePrice("1jour", 35);
    // CreatePrice("night", 19);

    [Fact]
    public async Task Test1()
    {
        await using var application = new WebApplicationFactory<Program>();
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