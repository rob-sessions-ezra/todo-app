using Microsoft.EntityFrameworkCore;
using Todo.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Register InMemory EF Core for TodoContext
builder.Services.AddDbContext<TodoContext>(options => options.UseInMemoryDatabase("TodoInMemoryDb"));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();

app.Run();
