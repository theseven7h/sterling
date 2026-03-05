using Ecommerce.Api.Domain;
using Ecommerce.Api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Features.Cart;

public static class UpdateCartItem
{
    public class Command : IRequest<CartItem>
    {
        public int CartItemId { get; set; }
        public int Quantity { get; set; }
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
            var item = await _context.CartItems
                .Include(c => c.Product)
                .FirstOrDefaultAsync(c => c.Id == request.CartItemId, cancellationToken);
                
            if (item == null)
            {
                throw new Exception("Cart item not found");
            }
            
            if (request.Quantity <= 0)
            {
                _context.CartItems.Remove(item);
                await _context.SaveChangesAsync(cancellationToken);
                return null!; // Handle on client side or API layer
            }

            item.Quantity = request.Quantity;
            await _context.SaveChangesAsync(cancellationToken);

            return item;
        }
    }
}
