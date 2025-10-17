namespace Todo.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Todo.Api.Data;
using Todo.Api.Models;

[ApiController]
[Route("api/lists")]
public class ListsController(
    TaskContext context,
    ILogger<ListsController> logger) : ControllerBase
{
    private readonly TaskContext _context = context;
    private readonly ILogger<ListsController> _logger = logger;

    // GET: api/lists
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskList>>> GetLists()
    {
        return await _context.TaskLists
            .Include(l => l.TaskItems)
            .ToListAsync();
    }

    // GET: api/lists/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskList>> GetList(int id)
    {
        var list = await _context.TaskLists
            .Include(l => l.TaskItems)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (list == null)
        {
            return NotFound();
        }

        return list;
    }

    // POST: api/lists
    [HttpPost]
    public async Task<ActionResult<TaskList>> CreateList(TaskList list)
    {
        _context.TaskLists.Add(list);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetList), new { id = list.Id }, list);
    }

    // DELETE: api/lists/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteList(int id)
    {
        var list = await _context.TaskLists.FindAsync(id);
        if (list == null)
        {
            return NotFound();
        }

        _context.TaskLists.Remove(list);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
