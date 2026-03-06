using Ecommerce.Api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Ecommerce.Api.Features.Products;
using Ecommerce.Api.Features.Cart;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<EcommerceDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// Auto migrate on startup for simplicity in this task
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EcommerceDbContext>();
    db.Database.EnsureCreated();
}

app.UseHttpsRedirection();

// Map Endpoints (Vertical Slices)
app.MapGet("/api/products", async (IMediator mediator) => await mediator.Send(new GetProducts.Query()));

app.MapGet("/api/cart/{userId}", async (string userId, IMediator mediator) => 
    await mediator.Send(new GetCart.Query { UserId = userId }));

app.MapPost("/api/cart", async (AddToCart.Command command, IMediator mediator) => 
    await mediator.Send(command));

app.MapPut("/api/cart/{cartItemId}", async (int cartItemId, UpdateCartItem.Command command, IMediator mediator) => {
    command.CartItemId = cartItemId;
    return await mediator.Send(command);
});

app.MapDelete("/api/cart/{cartItemId}", async (int cartItemId, IMediator mediator) => 
    await mediator.Send(new RemoveFromCart.Command { CartItemId = cartItemId }));

app.Run();
