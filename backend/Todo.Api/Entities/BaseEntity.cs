namespace Todo.Api.Entities;

public abstract class BaseEntity
{
    public Guid OwnerUserId { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}
