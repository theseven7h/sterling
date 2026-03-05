using Ecommerce.Api.Domain;
using Ecommerce.Api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Features.Products;

public static class GetProducts
{
    public class Query : IRequest<List<Product>> { }

    public class Handler : IRequestHandler<Query, List<Product>>
    {
        private readonly EcommerceDbContext _context;

        public Handler(EcommerceDbContext context)
        {
            _context = context;
        }

        public async Task<List<Product>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await _context.Products.ToListAsync(cancellationToken);
        }
    }
}
