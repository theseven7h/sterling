using Ecommerce.Api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Features.Cart;

public static class RemoveFromCart
{
    public class Command : IRequest<bool>
    {
        public int CartItemId { get; set; }
    }

    public class Handler : IRequestHandler<Command, bool>
    {
        private readonly EcommerceDbContext _context;

        public Handler(EcommerceDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(Command request, CancellationToken cancellationToken)
        {
            var item = await _context.CartItems.FirstOrDefaultAsync(c => c.Id == request.CartItemId, cancellationToken);
            
            if (item == null)
            {
                return false;
            }

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
