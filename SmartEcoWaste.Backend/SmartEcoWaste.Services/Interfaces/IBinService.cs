using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Interfaces
{
    public interface IBinService
    {
        Task<byte[]> CreateBinAsync(CreateBinDto binDto);
    }
}
