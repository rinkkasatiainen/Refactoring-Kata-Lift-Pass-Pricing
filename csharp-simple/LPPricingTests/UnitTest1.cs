using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;


namespace LPPricingTests;

public class UnitTest1 : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    private readonly HttpClient _client;
    // CreatePrice("1jour", 35);
    // CreatePrice("night", 19);

    public UnitTest1(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();

        CreatePrice("1jour", 35);
        CreatePrice("night", 18);
    }

    private async Task CreatePrice(string type, int cost)
    {
        Dictionary<string, object> dict = new()
        {
            { "type", type },
            { "cost", cost.ToString() }
        };

        HttpContent aadict = JsonContent.Create(dict);
        var response = await _client.PutAsync($"/prices?type={type}&cost={cost.ToString()}", aadict);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
    
    
    [Fact]
    public async Task DefaultCost()
    {
        var response = await _client.GetAsync("/prices?type=1jour");
        
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        throw new Exception(response.Content.ToString());
        response.Content.ToString().Should().Be(" {\"cost\": 34}");
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