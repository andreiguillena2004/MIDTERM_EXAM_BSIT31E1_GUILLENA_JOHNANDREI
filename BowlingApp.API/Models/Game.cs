using System;
using System.Collections.Generic;

namespace BowlingApp.API.Models
{
    public class Game
    {
        public int Id { get; set; }
        public DateTime DatePlayed { get; set; } = DateTime.Now;
        public ICollection<Player> Players { get; set; } = new List<Player>();
        public bool IsFinished { get; set; }
    }
}
