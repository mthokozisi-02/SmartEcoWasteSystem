namespace SmartEcoWaste.Data.Dtos
{
    public class TenantDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string OrganizationType { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}