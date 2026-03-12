using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartBookingAPI.Models
{
    public class Appointment
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string SlotId { get; set; } = string.Empty;

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string UserEmail { get; set; } = string.Empty;

        [Required]
        [Phone]
        [StringLength(20)]
        public string UserPhone { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Service { get; set; } = string.Empty;

        [Required]
        public string Date { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string StartTime { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string EndTime { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "confirmed"; // confirmed, cancelled, completed, pending

        [StringLength(500)]
        public string? Notes { get; set; }

        public DateTime BookedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("SlotId")]
        public virtual TimeSlot? Slot { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}
