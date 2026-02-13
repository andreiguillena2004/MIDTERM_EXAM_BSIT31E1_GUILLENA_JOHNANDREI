namespace BowlingApp.API.Models
{
    public class Frame
    {
        public int Id { get; set; }
        public int FrameNumber { get; set; } // 1-10
        public int? Roll1 { get; set; }
        public int? Roll2 { get; set; }
        public int? Roll3 { get; set; } // Only used for 10th frame
        
        // This should store the total score for this frame (including bonuses from future frames if strike/spare)
        public int? Score { get; set; } 

        public int PlayerId { get; set; }
    }
}
