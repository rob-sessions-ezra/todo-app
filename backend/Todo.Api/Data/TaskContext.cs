namespace Todo.Api.Data;

using Microsoft.EntityFrameworkCore;
using Todo.Api.Entities;

public class TaskContext(DbContextOptions<TaskContext> options) : DbContext(options)
{
    public DbSet<TaskItem> TaskItems { get; set; } = null!;

    public DbSet<TaskList> TaskLists { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>().HasQueryFilter(t => !t.IsDeleted);
        modelBuilder.Entity<TaskList>().HasQueryFilter(l => !l.IsDeleted);

        modelBuilder.Entity<TaskList>()
            .HasMany(l => l.TaskItems)
            .WithOne(t => t.TaskList)
            .HasForeignKey(t => t.TaskListId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
    }
}
