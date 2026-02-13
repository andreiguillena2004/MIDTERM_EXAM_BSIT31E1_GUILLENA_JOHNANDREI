using BowlingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BowlingApp.API.Data
{
    public class BowlingContext : DbContext
    {
        public BowlingContext(DbContextOptions<BowlingContext> options)
            : base(options) { }

        public DbSet<Game> Games { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<Frame> Frames { get; set; }
    }
}
