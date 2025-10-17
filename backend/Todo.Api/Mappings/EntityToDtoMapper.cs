namespace Todo.Api.Mappings;

using System.Linq;
using Todo.Api.Entities;
using Todo.Api.Dtos;

public static class EntityToDtoMapper
{
	// Map a TaskItem entity to TaskItemDto
	public static TaskItemDto ToDto(this TaskItem item) =>
        new(
			item.Id,
			item.Title,
			item.IsComplete,
			item.DueDate,
			item.TaskListId
		);

	// Map a TaskList entity to TaskListDto (including its tasks)
	public static TaskListDto ToDto(this TaskList list) =>
		new(
			list.Id,
			list.Name,
			(list.TaskItems ?? []).Select(t => t.ToDto())
		);
}
