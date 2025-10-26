using Todo.Api.Entities;
using Todo.Api.Dtos;

namespace Todo.Api.Mappings;

public static class EntityToDtoMapper
{
	// Map a TaskItem entity to TaskItemDto
	public static TaskItemDto ToDto(this TaskItem item) =>
		new(
			item.Id,
			item.Title,
			item.IsComplete,
			item.TaskListId,
			item.Order,
			item.Priority
		);

	// Map a TaskList entity to TaskListDto (including its tasks)
	public static TaskListDto ToDto(this TaskList list) =>
		new(
			list.Id,
			list.Name,
			(list.TaskItems ?? []).Select(t => t.ToDto())
		);
}
