using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace SmartEcoWaste.Infrastructure.Middleware
{
    

    public class AuthMiddleware
    {
        private readonly RequestDelegate _next;

        public AuthMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = context.User.FindFirst(ClaimTypes.Role)?.Value;

                context.Items["UserId"] = userId;
                context.Items["UserRole"] = role;
            }

            await _next(context);
        }
    }
}
