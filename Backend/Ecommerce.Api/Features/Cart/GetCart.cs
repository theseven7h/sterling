using Ecommerce.Api.Domain;
using Ecommerce.Api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Features.Cart;

public static class GetCart
{
    public class Query : IRequest<List<CartItem>>
    {
        public string UserId { get; set; } = string.Empty;
    }

    public class Handler : IRequestHandler<Query, List<CartItem>>
    {
        private readonly EcommerceDbContext _context;

        public Handler(EcommerceDbContext context)
        {
            _context = context;
        }

        public async Task<List<CartItem>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await _context.CartItems
                .Include(c => c.Product)
                .Where(c => c.UserId == request.UserId)
                .ToListAsync(cancellationToken);
        }
    }
}
