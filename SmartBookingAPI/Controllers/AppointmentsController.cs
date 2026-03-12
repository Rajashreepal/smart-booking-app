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
    public class AppointmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AppointmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            IQueryable<Appointment> query = _context.Appointments;

            if (userRole != "admin")
            {
                query = query.Where(a => a.UserId == userId);
            }

            var appointments = await query
                .OrderByDescending(a => a.BookedAt)
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetAppointment(string id)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found." });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "admin" && appointment.UserId != userId)
            {
                return Forbid();
            }

            return Ok(appointment);
        }

        [HttpPost]
        public async Task<ActionResult<Appointment>> BookAppointment([FromBody] BookingRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Get slot
            var slot = await _context.TimeSlots.FindAsync(request.SlotId);
            if (slot == null)
            {
                return NotFound(new { success = false, message = "Slot not found." });
            }

            if (!slot.IsActive)
            {
                return BadRequest(new { success = false, message = "This slot is no longer active." });
            }

            if (slot.BookedCount >= slot.MaxCapacity)
            {
                return BadRequest(new { success = false, message = "This slot is already fully booked." });
            }

            // Check for duplicate booking
            var existingBooking = await _context.Appointments
                .FirstOrDefaultAsync(a => a.UserId == userId && a.SlotId == request.SlotId && a.Status != "cancelled");

            if (existingBooking != null)
            {
                return BadRequest(new { success = false, message = "You already have a booking for this slot." });
            }

            // Check for time conflicts
            var userAppointments = await _context.Appointments
                .Where(a => a.UserId == userId && a.Date == slot.Date && a.Status != "cancelled")
                .ToListAsync();

            foreach (var appt in userAppointments)
            {
                if (IsTimeOverlap(slot.StartTime, slot.EndTime, appt.StartTime, appt.EndTime))
                {
                    return BadRequest(new { success = false, message = $"You already have a booking on this date from {appt.StartTime} – {appt.EndTime}." });
                }
            }

            // Get user details
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized();
            }

            // Create appointment
            var appointment = new Appointment
            {
                Id = $"appt-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                SlotId = request.SlotId,
                UserId = userId,
                UserName = user.Name,
                UserEmail = user.Email,
                UserPhone = request.UserPhone,
                Service = slot.Service,
                Date = slot.Date,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
                Status = "confirmed",
                Notes = request.Notes,
                BookedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);

            // Update slot booked count
            slot.BookedCount++;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Appointment confirmed!", appointment });
        }

        [HttpPut("{id}/cancel")]
        public async Task<ActionResult> CancelAppointment(string id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new { success = false, message = "Appointment not found." });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "admin" && appointment.UserId != userId)
            {
                return Forbid();
            }

            appointment.Status = "cancelled";

            // Free up the slot
            var slot = await _context.TimeSlots.FindAsync(appointment.SlotId);
            if (slot != null && slot.BookedCount > 0)
            {
                slot.BookedCount--;
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Appointment cancelled." });
        }

        [HttpPut("{id}/complete")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> CompleteAppointment(string id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new { message = "Appointment not found." });
            }

            appointment.Status = "completed";
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Appointment marked as completed." });
        }

        private bool IsTimeOverlap(string start1, string end1, string start2, string end2)
        {
            var s1 = TimeToMinutes(start1);
            var e1 = TimeToMinutes(end1);
            var s2 = TimeToMinutes(start2);
            var e2 = TimeToMinutes(end2);

            return s1 < e2 && e1 > s2;
        }

        private int TimeToMinutes(string time)
        {
            var parts = time.Split(':');
            return int.Parse(parts[0]) * 60 + int.Parse(parts[1]);
        }
    }
}
