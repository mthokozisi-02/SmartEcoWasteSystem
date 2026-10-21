namespace SmartEcoWaste.Data.Dtos
{
    /// <summary>
    /// Sent by the client on logout to allow the server to revoke the refresh token immediately.
    /// </summary>
    public class LogoutDto
    {
        public required string RefreshToken { get; set; }
    }
}
