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
                return NotFound();
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
            return NotFound();
        }

        return item.ToDto();
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> CreateTask(CreateTaskDto dto)
    {
        if (dto.TaskListId.HasValue)
        {
        var listExists = await context.TaskLists.AnyAsync(l => l.Id == dto.TaskListId.Value);
        if (!listExists)
        {
            return BadRequest(new { message = $"TaskList with id {dto.TaskListId.Value} does not exist." });
        }
        }

        // Compute next order among INCOMPLETE tasks only
        var nextOrder = 0;
        if (dto.TaskListId.HasValue)
        {
        var max = await context.TaskItems
            .Where(t => t.TaskListId == dto.TaskListId && !t.IsComplete)
            .Select(t => (int?)t.Order)
            .MaxAsync();
            nextOrder = (max ?? -1) + 1;
        }

        var entity = new TaskItem
        {
            Title = dto.Title,
            IsComplete = dto.IsComplete,
            DueDate = dto.DueDate,
            TaskListId = dto.TaskListId,
            Order = nextOrder
        };

        context.TaskItems.Add(entity);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = entity.Id }, entity.ToDto());
    }

    // PUT: api/tasks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto dto)
    {
        var existing = await context.TaskItems
            .FirstOrDefaultAsync(t => t.Id == id);

        if (existing == null)
        {
            return NotFound();
        }

        // If moving to another list, validate target list exists
        if (dto.TaskListId.HasValue)
        {
            var listExists = await context.TaskLists.AnyAsync(l => l.Id == dto.TaskListId.Value);
            if (!listExists)
            {
                return BadRequest(new { message = $"TaskList with id {dto.TaskListId.Value} does not exist." });
            }
        }

        // Apply only provided fields
        if (dto.Title is not null)
        {
            existing.Title = dto.Title;
        }

        if (dto.IsComplete.HasValue)
        {
            existing.IsComplete = dto.IsComplete.Value;
        }

        if (dto.DueDate.HasValue)
        {
            existing.DueDate = dto.DueDate;
        }

        if (dto.TaskListId.HasValue)
        {
            existing.TaskListId = dto.TaskListId;
        }

        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await context.TaskItems.AnyAsync(e => e.Id == id))
            {
                return NotFound();
            }

            throw;
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
            return NotFound();
        }

        context.TaskItems.Remove(item);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
