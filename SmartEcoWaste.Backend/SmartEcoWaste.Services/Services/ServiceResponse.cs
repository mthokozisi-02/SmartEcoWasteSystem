using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Services
{
    public class ServiceResponse<T>
    {
        public bool? IsSuccess { get; set; }
        public string? Message { get; set; }
        public DateTime? Time { get; set; }
        public T? Data { get; set; }

        public ServiceResponse() { }

        public ServiceResponse(T data, string message)
        {
            IsSuccess = true;
            Message = message;
            Time = DateTime.UtcNow;
            Data = data;
        }

        public static ServiceResponse<T> Success(T data, string message)
        => new()
        {
            IsSuccess = true,
            Message = message,
            Data = data,
            Time = DateTime.UtcNow
        };

        public static ServiceResponse<T> Fail(string message)
            => new()
            {
                IsSuccess = false,
                Message = message,
                Time = DateTime.UtcNow
            };
    }
}
