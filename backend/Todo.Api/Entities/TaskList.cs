namespace Todo.Api.Entities;

using System.Collections.Generic;

public class TaskList
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<TaskItem> TaskItems { get; set; } = [];
}
