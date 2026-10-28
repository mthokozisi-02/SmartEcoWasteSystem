using FluentAssertions;
using SmartEcoWaste.Services.Helpers;
using SmartEcoWaste.Tests.Infrastructure;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace SmartEcoWaste.Tests.Security
{
    public class ProductionSecurityTests : IClassFixture<TestWebApplicationFactory>
    {
        private readonly TestWebApplicationFactory _factory;
        private readonly HttpClient _client;

        public ProductionSecurityTests(TestWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Cors_UntrustedOrigin_DoesNotReturnAllowOriginHeader()
        {
            // Arrange
            using var request = new HttpRequestMessage(HttpMethod.Options, "/api/user-login");
            request.Headers.Add("Origin", "https://untrusted-malicious-site.com");
            request.Headers.Add("Access-Control-Request-Method", "POST");

            // Act
            var response = await _client.SendAsync(request);

            // Assert: Access-Control-Allow-Origin header must NOT contain the untrusted origin
            if (response.Headers.TryGetValues("Access-Control-Allow-Origin", out var allowOrigins))
            {
                allowOrigins.Should().NotContain("https://untrusted-malicious-site.com");
                allowOrigins.Should().NotContain("*");
            }
        }

        [Fact]
        public async Task Cors_TrustedOrigin_ReturnsAllowOriginHeader()
        {
            // Arrange
            using var request = new HttpRequestMessage(HttpMethod.Options, "/api/user-login");
            request.Headers.Add("Origin", "http://localhost:4200");
            request.Headers.Add("Access-Control-Request-Method", "POST");

            // Act
            var response = await _client.SendAsync(request);

            // Assert
            response.Headers.Should().ContainKey("Access-Control-Allow-Origin");
            response.Headers.GetValues("Access-Control-Allow-Origin").Should().Contain("http://localhost:4200");
        }

        [Fact]
        public async Task Swagger_WhenNotInDevelopment_ReturnsNotFound()
        {
            // Act: In Testing / Production environment, Swagger UI must not be exposed
            var response = await _client.GetAsync("/swagger/index.html");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Theory]
        [InlineData("short", false, "at least 12")] // Too short (<12)
        [InlineData("alllowercase123!", false, "uppercase")] // Missing uppercase
        [InlineData("ALLUPPERCASE123!", false, "lowercase")] // Missing lowercase
        [InlineData("NoDigitsInPassword!", false, "digit")] // Missing digit
        [InlineData("NoSpecialChars123", false, "special")] // Missing special char
        [InlineData("Admin1234567!", false, "common")] // Breached / common pattern
        [InlineData("P@ssw0rd2026!Secure", true, "")] // Valid robust password
        public void PasswordValidation_EnforcesRobustSecurityPolicy(string password, bool shouldPass, string expectedErrorSubstr)
        {
            // Act
            var (isValid, errorMessage) = PasswordPolicyHelper.ValidatePassword(password);

            // Assert
            isValid.Should().Be(shouldPass);
            if (!shouldPass)
            {
                errorMessage.Should().Contain(expectedErrorSubstr);
            }
        }
    }
}
