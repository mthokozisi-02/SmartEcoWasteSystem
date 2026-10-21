namespace SmartEcoWaste.Data.Dtos
{
    /// <summary>
    /// Refresh-token request contract.
    /// UserId is intentionally omitted: the backend locates the account by hashing
    /// the supplied token and comparing it against stored hashes, so the caller
    /// cannot influence which account is refreshed by manipulating a user-ID field.
    /// </summary>
    public class RefreshTokenRequestDto
    {
        public required string RefreshToken { get; set; }
    }
}
