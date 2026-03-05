using Ecommerce.Api.Domain;
using Ecommerce.Api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Features.Cart;

public static class AddToCart
{
    public class Command : IRequest<CartItem>
    {
        public string UserId { get; set; } = string.Empty;
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class Handler : IRequestHandler<Command, CartItem>
    {
        private readonly EcommerceDbContext _context;

        public Handler(EcommerceDbContext context)
        {
            _context = context;
        }

        public async Task<CartItem> Handle(Command request, CancellationToken cancellationToken)
        {
            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == request.UserId && c.ProductId == request.ProductId, cancellationToken);

            if (existingItem != null)
            {
                existingItem.Quantity += request.Quantity;
                await _context.SaveChangesAsync(cancellationToken);
                
                // Return explicitly with Product included
                return await _context.CartItems.Include(c => c.Product).FirstAsync(c => c.Id == existingItem.Id, cancellationToken);
            }

            var newItem = new CartItem
            {
                UserId = request.UserId,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };

            _context.CartItems.Add(newItem);
            await _context.SaveChangesAsync(cancellationToken);
            
            return await _context.CartItems.Include(c => c.Product).FirstAsync(c => c.Id == newItem.Id, cancellationToken);
        }
    }
}
