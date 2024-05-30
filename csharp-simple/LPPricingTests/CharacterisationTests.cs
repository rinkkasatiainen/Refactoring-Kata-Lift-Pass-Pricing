using System.Net;
using System.Text.Json;
using FluentAssertions;
using LPPricing;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LPPricingTests;

public class CharacterisationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    private readonly HttpClient _client;

    public CharacterisationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task DefaultCost()
    {
        var response = await _client.GetAsync("/prices?type=1jour");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<Result>(responseContent);

        result.Should().BeEquivalentTo(new Result() { cost = 35 });
    }


    [Fact]
    public async Task ARandomMonday()
    {
        var response = await _client.GetAsync("/prices?type=1jour&date=2024-05-20");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<Result>(responseContent);

        result.Should().BeEquivalentTo(new Result() { cost = 23 });
    }

    [Fact]
    public async Task AHolidayMonday()
    {
        var response = await _client.GetAsync("/prices?type=1jour&date=2024-05-27");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<Result>(responseContent);

        result.Should().BeEquivalentTo(new Result() { cost = 35 });
    }
}