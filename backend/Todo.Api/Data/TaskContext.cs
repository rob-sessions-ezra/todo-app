namespace Todo.Api.Data;

using Microsoft.EntityFrameworkCore;
using Todo.Api.Entities;

public class TaskContext(DbContextOptions<TaskContext> options) : DbContext(options)
{
    public DbSet<TaskItem> TaskItems { get; set; } = null!;
    public DbSet<TaskList> TaskLists { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;

    // Set by middleware before actions execute; used by global query filters
    public Guid CurrentUserId { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply soft-delete and per-user scoping automatically
        modelBuilder.Entity<TaskItem>().HasQueryFilter(e => !e.IsDeleted && e.OwnerUserId == CurrentUserId);
        modelBuilder.Entity<TaskList>().HasQueryFilter(e => !e.IsDeleted && e.OwnerUserId == CurrentUserId);

        modelBuilder.Entity<TaskList>()
            .HasMany(l => l.TaskItems)
            .WithOne(t => t.TaskList)
            .HasForeignKey(t => t.TaskListId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>().HasIndex(u => u.Email);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.OwnerUserId = CurrentUserId;
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Deleted)
            {
                // soft delete instead of hard delete
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.DeletedAt = now;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
