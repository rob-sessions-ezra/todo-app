namespace Todo.Api.Data;

using Microsoft.EntityFrameworkCore;
using Todo.Api.Models;

public class TodoContext(DbContextOptions<TodoContext> options) : DbContext(options)
{
    public DbSet<TodoItem> TodoItems { get; set; }
}
