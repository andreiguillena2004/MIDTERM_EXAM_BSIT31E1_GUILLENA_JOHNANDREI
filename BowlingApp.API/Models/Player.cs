using System.Collections.Generic;

namespace BowlingApp.API.Models
{
    public class Player
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<Frame> Frames { get; set; } = new List<Frame>();

        public int GameId { get; set; }
    }
}
