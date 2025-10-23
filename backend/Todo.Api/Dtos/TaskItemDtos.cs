namespace Todo.Api.Dtos;

using System;

public record TaskItemDto(int Id, string Title, bool IsComplete, DateTime? DueDate, int? TaskListId, int Order);
public record CreateTaskDto(string Title, bool IsComplete = false, DateTime? DueDate = null, int? TaskListId = null);
public record UpdateTaskDto(string? Title = null, bool? IsComplete = null, DateTime? DueDate = null, int? TaskListId = null);
