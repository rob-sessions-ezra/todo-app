namespace Todo.Api.Entities;

public class TaskList : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Child tasks
    public ICollection<TaskItem> TaskItems { get; set; } = [];
}
