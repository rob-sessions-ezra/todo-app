namespace Todo.Api.Dtos;

public record TaskListDto(int Id, string Name, IEnumerable<TaskItemDto> TaskItems);
public record CreateTaskListDto(string Name);
public record RenameTaskListDto(string Name);
public record ReorderTasksDto(int[] TaskIds);
