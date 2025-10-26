using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Todo.Api.Data;
using Todo.Api.Dtos;
using Todo.Api.Entities;
using Todo.Api.Mappings;

namespace Todo.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController(
    TaskContext context) : ControllerBase
{
    // GET: api/tasks?listId=5
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItemDto>>> GetTasks([FromQuery] int? listId)
    {
        if (listId.HasValue)
        {
            var listExists = await context.TaskLists
                .AsNoTracking()
                .AnyAsync(l => l.Id == listId.Value);

            if (!listExists)
            {
                return NotFound(new { message = "List not found." });
            }

            var items = await context.TaskItems
                .AsNoTracking()
                .Where(t => t.TaskListId == listId.Value)
                .OrderBy(t => t.IsComplete)
                .ThenBy(t => t.Order)
                .ToListAsync();

            return Ok(items.Select(t => t.ToDto()));
        }

        var all = await context.TaskItems
            .AsNoTracking()
            .OrderBy(t => t.TaskListId)
            .ThenBy(t => t.IsComplete)
            .ThenBy(t => t.Order)
            .ToListAsync();

        return Ok(all.Select(t => t.ToDto()));
    }

    // GET: api/tasks/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItemDto>> GetTask(int id)
    {
        var item = await context.TaskItems
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (item == null)
        {
            return NotFound(new { message = "Task not found." });
        }

        return item.ToDto();
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> CreateTask(CreateTaskDto dto)
    {
        // Require a valid list
        var listExists = await context.TaskLists.AnyAsync(l => l.Id == dto.TaskListId);
        if (!listExists)
        {
            return BadRequest(new { message = $"TaskList with id {dto.TaskListId} does not exist." });
        }

        // Compute next order among INCOMPLETE tasks only
        var max = await context.TaskItems
            .Where(t => t.TaskListId == dto.TaskListId && !t.IsComplete)
            .Select(t => (int?)t.Order)
            .MaxAsync();
        var nextOrder = (max ?? -1) + 1;

        var entity = new TaskItem
        {
            Title = dto.Title,
            IsComplete = false,
            Priority = PriorityLevel.Normal,
            TaskListId = dto.TaskListId,
            Order = nextOrder
        };

        context.TaskItems.Add(entity);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = entity.Id }, entity.ToDto());
    }

    // PATCH: api/tasks/{id}/title
    [HttpPatch("{id}/title")]
    public async Task<IActionResult> UpdateTitle(int id, [FromBody] UpdateTaskTitleDto body)
    {
        if (body is null || string.IsNullOrWhiteSpace(body.Title))
        {
            return BadRequest(new { message = "Title is required." });
        }

        var existing = await context.TaskItems.FirstOrDefaultAsync(t => t.Id == id);
        if (existing is null)
        {
            return NotFound(new { message = "Task not found." });
        }

        var next = body.Title.Trim();
        if (!string.Equals(existing.Title, next, StringComparison.Ordinal))
        {
            existing.Title = next;
            await context.SaveChangesAsync();
        }

        return NoContent();
    }

    // PATCH: api/tasks/{id}/complete
    [HttpPatch("{id}/complete")]
    public async Task<IActionResult> UpdateCompletion(int id, [FromBody] UpdateTaskCompletionDto body)
    {
        var existing = await context.TaskItems.FirstOrDefaultAsync(t => t.Id == id);
        if (existing is null)
        {
            return NotFound(new { message = "Task not found." });
        }

        var desired = body?.IsComplete ?? false;
        if (existing.IsComplete != desired)
        {
            existing.IsComplete = desired;
            await context.SaveChangesAsync();
        }

        return NoContent();
    }

    // PATCH: api/tasks/{id}/priority
    [HttpPatch("{id}/priority")]
    public async Task<IActionResult> UpdatePriority(int id, [FromBody] UpdateTaskPriorityDto body)
    {
        if (body is null)
        {
            return BadRequest(new { message = "Priority is required." });
        }

        var existing = await context.TaskItems.FirstOrDefaultAsync(t => t.Id == id);
        if (existing is null)
        {
            return NotFound(new { message = "Task not found." });
        }

        if (existing.Priority != body.Priority)
        {
            existing.Priority = body.Priority;
            await context.SaveChangesAsync();
        }

        return NoContent();
    }

    // DELETE: api/tasks/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var item = await context.TaskItems.FindAsync(id);
        if (item == null)
        {
            return NotFound(new { message = "Task not found." });
        }

        context.TaskItems.Remove(item);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
