namespace Todo.Api.Entities;

using System.Collections.Generic;

public class TaskList : BaseEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Child tasks
    public ICollection<TaskItem> TaskItems { get; set; } = [];
}
