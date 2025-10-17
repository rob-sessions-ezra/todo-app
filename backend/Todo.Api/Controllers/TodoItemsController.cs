namespace Todo.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Todo.Api.Data;
using Todo.Api.Models;

[ApiController]
[Route("api/tasks")]
public class TodoItemsController(
    TodoContext context,
    ILogger<TodoItemsController> logger) : ControllerBase
{
    private readonly TodoContext _context = context;
    private readonly ILogger<TodoItemsController> _logger = logger;

    // GET: api/TodoItems
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems()
    {
        return await _context.TodoItems.ToListAsync();
    }

    // GET: api/TodoItems/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TodoItem>> GetTodoItem(int id)
    {
        var item = await _context.TodoItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        return item;
    }

    // POST: api/TodoItems
    [HttpPost]
    public async Task<ActionResult<TodoItem>> CreateTodoItem(TodoItem item)
    {
        _context.TodoItems.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTodoItem), new { id = item.Id }, item);
    }

    // PUT: api/TodoItems/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTodoItem(int id, TodoItem item)
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
            if (!await _context.TodoItems.AnyAsync(e => e.Id == id))
            {
                return NotFound();
            }

            throw;
        }

        return NoContent();
    }

    // DELETE: api/TodoItems/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTodoItem(int id)
    {
        var item = await _context.TodoItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _context.TodoItems.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
