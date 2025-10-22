namespace Todo.Api.Controllers;

using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Todo.Api.Data;
using Todo.Api.Dtos;
using Todo.Api.Entities;
using Todo.Api.Mappings;

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
    public async Task<ActionResult<IEnumerable<TaskListDto>>> GetLists()
    {
        var lists = await _context.TaskLists
            .AsNoTracking()
            .Include(l => l.TaskItems)
            .ToListAsync();

        var result = lists.Select(l => l.ToDto()).ToList();

        return Ok(result);
    }

    // GET: api/lists/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskListDto>> GetList(int id)
    {
        var list = await _context.TaskLists
            .AsNoTracking()
            .Include(l => l.TaskItems)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (list == null)
        {
            return NotFound();
        }

        return Ok(list.ToDto());
    }

    // POST: api/lists
    [HttpPost]
    public async Task<ActionResult<TaskListDto>> CreateList(CreateTaskListDto dto)
    {
        var entity = new TaskList
        {
            Name = dto.Name
        };

        _context.TaskLists.Add(entity);
        await _context.SaveChangesAsync();

        var result = new TaskListDto(entity.Id, entity.Name, []);
        return CreatedAtAction(nameof(GetList), new { id = entity.Id }, result);
    }

    // PATCH: api/lists/5/title
    [HttpPatch("{id}/title")]
    public async Task<ActionResult<TaskListDto>> RenameList(int id, [FromBody] RenameTaskListDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Name is required.");
        }

        var list = await _context.TaskLists.FindAsync(id);
        if (list is null)
        {
            return NotFound();
        }

        var trimmed = dto.Name.Trim();
        if (string.Equals(list.Name, trimmed, StringComparison.Ordinal))
        {
            // No change
            return Ok(list.ToDto());
        }

        list.Name = trimmed;
        await _context.SaveChangesAsync();

        // Return updated list with items
        var updated = await _context.TaskLists
            .AsNoTracking()
            .Include(l => l.TaskItems)
            .FirstAsync(l => l.Id == id);

        return Ok(updated.ToDto());
    }

    // PUT: api/lists/5/reorder-tasks
    [HttpPut("{listId}/reorder-tasks")]
    public async Task<IActionResult> ReorderTasks(int listId, [FromBody] ReorderTasksDto body)
    {
        if (body?.TaskIds is null || body.TaskIds.Length == 0)
        {
            return BadRequest("TaskIds are required.");
        }

        if (!await _context.TaskLists.AnyAsync(l => l.Id == listId))
        {
            return NotFound("List not found.");
        }

        // Load INCOMPLETE tasks for the list (only these are reorderable)
        var tasks = await _context.TaskItems
            .Where(t => t.TaskListId == listId && !t.IsComplete)
            .ToListAsync();

        // Validate permutation
        var existingIds = tasks.Select(t => t.Id).OrderBy(x => x).ToArray();
        var suppliedIds = body.TaskIds.Distinct().OrderBy(x => x).ToArray();
        if (existingIds.Length != body.TaskIds.Length || !existingIds.SequenceEqual(suppliedIds))
        {
            return BadRequest("TaskIds must include all the incomplete task ids for this list.");
        }

        // Apply order
        var orderById = body.TaskIds
            .Select((id, index) => new { id, index })
            .ToDictionary(x => x.id, x => x.index);

        foreach (var t in tasks)
        {
            t.Order = orderById[t.Id];
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/lists/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteList(int id)
    {
        var list = await _context.TaskLists
            .Include(l => l.TaskItems)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (list == null)
        {
            return NotFound();
        }

        _context.TaskLists.Remove(list);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
