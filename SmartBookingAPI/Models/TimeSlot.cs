using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartBookingAPI.Models
{
    public class TimeSlot
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Date { get; set; } = string.Empty; // YYYY-MM-DD format

        [Required]
        [StringLength(10)]
        public string StartTime { get; set; } = string.Empty; // HH:mm format

        [Required]
        [StringLength(10)]
        public string EndTime { get; set; } = string.Empty; // HH:mm format

        [Required]
        [StringLength(50)]
        public string Service { get; set; } = string.Empty;

        [Required]
        public int Duration { get; set; } // minutes

        [Required]
        public int MaxCapacity { get; set; } = 1;

        public int BookedCount { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        [Required]
        public string CreatedBy { get; set; } = string.Empty; // Admin user ID

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
