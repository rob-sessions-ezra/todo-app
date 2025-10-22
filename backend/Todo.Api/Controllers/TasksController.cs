namespace Todo.Api.Controllers;

using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Todo.Api.Data;
using Todo.Api.Entities;
using Todo.Api.Dtos;
using Todo.Api.Mappings;

[ApiController]
[Route("api/tasks")]
public class TasksController(
    TaskContext context,
    ILogger<TasksController> logger) : ControllerBase
{
    private readonly TaskContext _context = context;
    private readonly ILogger<TasksController> _logger = logger;

    // GET: api/tasks?listId=5
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItemDto>>> GetTasks([FromQuery] int? listId)
    {
        if (listId.HasValue)
        {
            var listExists = await _context.TaskLists
                .AsNoTracking()
                .AnyAsync(l => l.Id == listId.Value);

            if (!listExists)
            {
                return NotFound();
            }

            var items = await _context.TaskItems
                .AsNoTracking()
                .Where(t => t.TaskListId == listId.Value)
                .OrderBy(t => t.IsComplete)
                .ThenBy(t => t.Order)
                .ToListAsync();

            return Ok(items.Select(t => t.ToDto()));
        }

        var all = await _context.TaskItems
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
        var item = await _context.TaskItems
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
            var listExists = await _context.TaskLists.AnyAsync(l => l.Id == dto.TaskListId.Value);
            if (!listExists)
            {
                return BadRequest($"TaskList with id {dto.TaskListId.Value} does not exist.");
            }
        }

        // Compute next order among INCOMPLETE tasks only
        var nextOrder = 0;
        if (dto.TaskListId.HasValue)
        {
            var max = await _context.TaskItems
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

        _context.TaskItems.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = entity.Id }, entity.ToDto());
    }

    // PUT: api/tasks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto dto)
    {
        var existing = await _context.TaskItems
            .FirstOrDefaultAsync(t => t.Id == id);

        if (existing == null)
        {
            return NotFound();
        }

        if (dto.TaskListId.HasValue)
        {
            var listExists = await _context.TaskLists.AnyAsync(l => l.Id == dto.TaskListId.Value);
            if (!listExists)
            {
                return BadRequest($"TaskList with id {dto.TaskListId.Value} does not exist.");
            }
        }

        existing.Title = dto.Title;
        existing.IsComplete = dto.IsComplete;
        existing.DueDate = dto.DueDate;
        existing.TaskListId = dto.TaskListId;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.TaskItems.AnyAsync(e => e.Id == id))
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
        var item = await _context.TaskItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _context.TaskItems.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
