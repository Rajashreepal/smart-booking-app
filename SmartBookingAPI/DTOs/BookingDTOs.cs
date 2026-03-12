using System.ComponentModel.DataAnnotations;

namespace SmartBookingAPI.DTOs
{
    public class BookingRequest
    {
        [Required]
        public string SlotId { get; set; } = string.Empty;

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string UserPhone { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Notes { get; set; }
    }

    public class CreateSlotRequest
    {
        [Required]
        public string Date { get; set; } = string.Empty;

        [Required]
        public string StartTime { get; set; } = string.Empty;

        [Required]
        public string EndTime { get; set; } = string.Empty;

        [Required]
        public string Service { get; set; } = string.Empty;

        [Required]
        [Range(15, 240)]
        public int Duration { get; set; }

        [Required]
        [Range(1, 10)]
        public int MaxCapacity { get; set; }
    }
}
