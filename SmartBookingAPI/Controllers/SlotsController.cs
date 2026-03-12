using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBookingAPI.Data;
using SmartBookingAPI.DTOs;
using SmartBookingAPI.Models;
using System.Security.Claims;

namespace SmartBookingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SlotsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SlotsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<TimeSlot>>> GetSlots()
        {
            var slots = await _context.TimeSlots
                .OrderBy(s => s.Date)
                .ThenBy(s => s.StartTime)
                .ToListAsync();

            return Ok(slots);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TimeSlot>> GetSlot(string id)
        {
            var slot = await _context.TimeSlots.FindAsync(id);

            if (slot == null)
            {
                return NotFound(new { message = "Slot not found." });
            }

            return Ok(slot);
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<TimeSlot>> CreateSlot([FromBody] CreateSlotRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var slot = new TimeSlot
            {
                Id = $"slot-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                Date = request.Date,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Service = request.Service,
                Duration = request.Duration,
                MaxCapacity = request.MaxCapacity,
                BookedCount = 0,
                IsActive = true,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.TimeSlots.Add(slot);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Slot created successfully.", slot });
        }

        [HttpPut("{id}/toggle")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> ToggleSlotStatus(string id)
        {
            var slot = await _context.TimeSlots.FindAsync(id);
            if (slot == null)
            {
                return NotFound(new { message = "Slot not found." });
            }

            slot.IsActive = !slot.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Slot status updated." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> DeleteSlot(string id)
        {
            var slot = await _context.TimeSlots.FindAsync(id);
            if (slot == null)
            {
                return NotFound(new { message = "Slot not found." });
            }

            var hasActiveBookings = await _context.Appointments
                .AnyAsync(a => a.SlotId == id && a.Status == "confirmed");

            if (hasActiveBookings)
            {
                return BadRequest(new { success = false, message = "Cannot delete a slot with active bookings." });
            }

            _context.TimeSlots.Remove(slot);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Slot deleted." });
        }
    }
}
