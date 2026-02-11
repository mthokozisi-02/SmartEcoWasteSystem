using AutoMapper;
using QRCoder;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Services
{
    public class BinService(IMapper mapper, SmartEcoWasteDbContext smartEcoWasteDbContext ) : IBinService
    {
        private readonly IMapper _mapper = mapper;
        private readonly SmartEcoWasteDbContext _smartEcoWasteDbContext = smartEcoWasteDbContext;
        public async Task<byte[]> CreateBinAsync(CreateBinDto binDto)
        {
            using var transaction = await _smartEcoWasteDbContext.Database.BeginTransactionAsync();

            try {
            
                var newBin = _mapper.Map<Bin>(binDto);
                await _smartEcoWasteDbContext.Bins.AddAsync(newBin);
                await _smartEcoWasteDbContext.SaveChangesAsync();

                var qrCode = CreateQRCode(newBin.Id);
                await transaction.CommitAsync();

                return qrCode;
            }
            catch (Exception ex) {
                await transaction.RollbackAsync();
                return null;
            }
        }

        public byte[] CreateQRCode(int binId)
        {
            var url = $"sqola/report/{binId}";

            using var generator = new QRCodeGenerator();
            var data = generator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
            var qrCode = new PngByteQRCode(data);

            return qrCode.GetGraphic(20);
        }
    }
}
