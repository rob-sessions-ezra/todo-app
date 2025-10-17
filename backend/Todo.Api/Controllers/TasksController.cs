namespace Todo.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Todo.Api.Data;
using Todo.Api.Models;

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
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks([FromQuery] int? listId)
    {
        if (listId.HasValue)
        {
            return await _context.TaskItems
                .Where(t => t.TaskListId == listId.Value)
                .ToListAsync();
        }

        return await _context.TaskItems.ToListAsync();
    }

    // GET: api/tasks/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {
        var item = await _context.TaskItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        return item;
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(TaskItem item)
    {
        if (item.TaskListId.HasValue)
        {
            var listExists = await _context.TaskLists.AnyAsync(l => l.Id == item.TaskListId.Value);
            if (!listExists)
            {
                return BadRequest($"TaskList with id {item.TaskListId.Value} does not exist.");
            }
        }

        _context.TaskItems.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTask), new { id = item.Id }, item);
    }

    // PUT: api/tasks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, TaskItem item)
    {
        if (id != item.Id)
        {
            return BadRequest();
        }

        _context.Entry(item).State = EntityState.Modified;

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
