namespace Ecommerce.Api.Domain;

public class CartItem
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty; // Mock logged-in user ID
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
}
