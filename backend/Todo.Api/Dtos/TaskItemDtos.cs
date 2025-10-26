using Todo.Api.Entities;

namespace Todo.Api.Dtos;

public record TaskItemDto(int Id, string Title, bool IsComplete, int? TaskListId, int Order, PriorityLevel Priority);
public record CreateTaskDto(string Title, int TaskListId);
public record UpdateTaskTitleDto(string Title);
public record UpdateTaskCompletionDto(bool IsComplete);
public record UpdateTaskPriorityDto(PriorityLevel Priority);