using Microsoft.EntityFrameworkCore;
using SmartBookingAPI.Models;

namespace SmartBookingAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        public DbSet<Appointment> Appointments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Configure TimeSlot relationships
            modelBuilder.Entity<TimeSlot>()
                .HasOne(t => t.Creator)
                .WithMany(u => u.CreatedSlots)
                .HasForeignKey(t => t.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Appointment relationships
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Slot)
                .WithMany(t => t.Appointments)
                .HasForeignKey(a => a.SlotId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.User)
                .WithMany(u => u.Appointments)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed admin user
            var adminId = "admin-001";
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = adminId,
                    Name = "Admin User",
                    Email = "admin@smartbook.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "admin",
                    Phone = "9999999999",
                    CreatedAt = DateTime.UtcNow
                }
            );
        }
    }
}
