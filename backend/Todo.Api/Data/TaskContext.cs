namespace Todo.Api.Data;

using Microsoft.EntityFrameworkCore;
using Todo.Api.Entities;

public class TaskContext(DbContextOptions<TaskContext> options) : DbContext(options)
{
    public DbSet<TaskItem> TaskItems { get; set; } = null!;

    public DbSet<TaskList> TaskLists { get; set; } = null!;
}
