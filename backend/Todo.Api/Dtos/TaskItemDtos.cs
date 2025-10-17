namespace Todo.Api.Dtos;

public record TaskItemDto(int Id, string Title, bool IsComplete, DateTime? DueDate, int? TaskListId);
public record CreateTaskDto(string Title, bool IsComplete = false, DateTime? DueDate = null, int? TaskListId = null);
public record UpdateTaskDto(string Title, bool IsComplete = false, DateTime? DueDate = null, int? TaskListId = null);
