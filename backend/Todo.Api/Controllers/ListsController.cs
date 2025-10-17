namespace Todo.Api.Controllers;

using System;
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
