using System.Text.Json.Serialization;

namespace Todo.Api.Entities;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PriorityLevel
{
    // Default priority level
    Normal = 0,

    // High priority level
    Fire = 10
}

public class TaskItem : BaseEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsComplete { get; set; }
    public int Order { get; set; }
    public PriorityLevel Priority { get; set; } = PriorityLevel.Normal;

    // FK to owning list
    public int? TaskListId { get; set; }
    public TaskList? TaskList { get; set; }
}
