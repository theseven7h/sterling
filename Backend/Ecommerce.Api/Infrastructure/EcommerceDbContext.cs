using Ecommerce.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Infrastructure;

public class EcommerceDbContext : DbContext
{
    public EcommerceDbContext(DbContextOptions<EcommerceDbContext> options) : base(options) { }

    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<CartItem> CartItems { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Seed initial products
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Laptop", Description = "High-performance laptop", Price = 999.99m, ImageUrl = "https://picsum.photos/seed/laptop/400/300" },
            new Product { Id = 2, Name = "Smartphone", Description = "Latest 5G smartphone", Price = 699.99m, ImageUrl = "https://picsum.photos/seed/phone/400/300" },
            new Product { Id = 3, Name = "Headphones", Description = "Noise-cancelling headphones", Price = 199.99m, ImageUrl = "https://picsum.photos/seed/headphones/400/300" },
            new Product { Id = 4, Name = "Keyboard", Description = "Mechanical gaming keyboard", Price = 89.99m, ImageUrl = "https://picsum.photos/seed/keyboard/400/300" }
        );
    }
}
