namespace Todo.Api.Entities;

using System.Collections.Generic;

public class TaskList
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Child tasks
    public ICollection<TaskItem> TaskItems { get; set; } = [];

    // Soft-delete flag
    public bool IsDeleted { get; set; } = false;

    // History
    public DateTime? DeletedAt { get; set; }
}
