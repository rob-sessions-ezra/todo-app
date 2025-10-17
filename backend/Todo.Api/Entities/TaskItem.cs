namespace Todo.Api.Entities;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsComplete { get; set; }
    public DateTime? DueDate { get; set; }

    // FK to owning list
    public int? TaskListId { get; set; }
    public TaskList? TaskList { get; set; }

    // Soft-delete flag
    public bool IsDeleted { get; set; } = false;
}
