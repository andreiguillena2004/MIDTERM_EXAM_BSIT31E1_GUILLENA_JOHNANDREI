using BowlingApp.API.Data;
using BowlingApp.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BowlingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private readonly BowlingContext _context;

        public GameController(BowlingContext context)
        {
            _context = context;
        }

        // POST: api/Game
        // Create a new game with players
        [HttpPost]
        public async Task<ActionResult<Game>> CreateGame([FromBody] List<string> playerNames)
        {
            if (playerNames == null || playerNames.Count == 0)
            {
                return BadRequest("At least one player name is required.");
            }

            // 1. Create a new Game entity
            var game = new Game
            {
                DatePlayed = DateTime.Now,
                IsFinished = false
            };

            // 2. Create Player entities for each name provided
            foreach (var name in playerNames)
            {
                var player = new Player
                {
                    Name = name
                };
                game.Players.Add(player);
            }

            // 3. Save to Database
            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            // 4. Return the created Game object
            return CreatedAtAction(nameof(GetGame), new { id = game.Id }, game);
        }

        // GET: api/Game/5
        // Get game details and current scores
        [HttpGet("{id}")]
        public async Task<ActionResult<Game>> GetGame(int id)
        {
            // 1. Find the Game by ID with Players and Frames included
            var game = await _context.Games
                .Include(g => g.Players)
                    .ThenInclude(p => p.Frames.OrderBy(f => f.FrameNumber))
                .FirstOrDefaultAsync(g => g.Id == id);

            if (game == null)
            {
                return NotFound();
            }

            return game;
        }

        // POST: api/Game/5/roll
        // Record a roll for a specific player
        [HttpPost("{gameId}/roll")]
        public async Task<IActionResult> Roll(int gameId, [FromBody] RollRequest request)
        {
            // 1. Find the Game and Player
            var game = await _context.Games
                .Include(g => g.Players)
                    .ThenInclude(p => p.Frames.OrderBy(f => f.FrameNumber))
                .FirstOrDefaultAsync(g => g.Id == gameId);

            if (game == null)
            {
                return NotFound("Game not found.");
            }

            var player = game.Players.FirstOrDefault(p => p.Id == request.PlayerId);
            if (player == null)
            {
                return NotFound("Player not found.");
            }

            var frames = player.Frames.OrderBy(f => f.FrameNumber).ToList();

            // 2. Determine the current frame
            Frame currentFrame = GetCurrentFrame(frames);

            if (currentFrame == null)
            {
                // Create a new frame
                int nextFrameNumber = frames.Count + 1;
                if (nextFrameNumber > 10)
                {
                    return BadRequest("Game is already complete for this player.");
                }

                currentFrame = new Frame
                {
                    FrameNumber = nextFrameNumber,
                    PlayerId = player.Id
                };
                _context.Frames.Add(currentFrame);
                frames.Add(currentFrame);
            }

            // 3. Update the Frame with the rolled pins
            if (currentFrame.FrameNumber < 10)
            {
                // Normal frames (1-9)
                if (currentFrame.Roll1 == null)
                {
                    // First roll
                    if (request.Pins < 0 || request.Pins > 10)
                    {
                        return BadRequest("Invalid pin count.");
                    }
                    currentFrame.Roll1 = request.Pins;
                }
                else if (currentFrame.Roll2 == null)
                {
                    // Second roll
                    int maxPins = 10 - currentFrame.Roll1.Value;
                    if (request.Pins < 0 || request.Pins > maxPins)
                    {
                        return BadRequest($"Invalid pin count. Max allowed: {maxPins}");
                    }
                    currentFrame.Roll2 = request.Pins;
                }
            }
            else
            {
                // 10th frame special handling
                if (currentFrame.Roll1 == null)
                {
                    if (request.Pins < 0 || request.Pins > 10)
                    {
                        return BadRequest("Invalid pin count.");
                    }
                    currentFrame.Roll1 = request.Pins;
                }
                else if (currentFrame.Roll2 == null)
                {
                    // If first roll was a strike, pins reset to 10
                    int maxPins = currentFrame.Roll1.Value == 10 ? 10 : 10 - currentFrame.Roll1.Value;
                    if (request.Pins < 0 || request.Pins > maxPins)
                    {
                        return BadRequest($"Invalid pin count. Max allowed: {maxPins}");
                    }
                    currentFrame.Roll2 = request.Pins;
                }
                else if (currentFrame.Roll3 == null)
                {
                    // Third roll only if strike or spare in 10th
                    bool isStrike = currentFrame.Roll1.Value == 10;
                    bool isSpare = (currentFrame.Roll1.Value + currentFrame.Roll2.Value) == 10;

                    if (!isStrike && !isSpare)
                    {
                        return BadRequest("No bonus roll allowed.");
                    }

                    // Calculate max pins for third roll
                    int maxPins = 10;
                    if (isStrike && currentFrame.Roll2.Value != 10)
                    {
                        // After strike and non-strike second roll
                        maxPins = 10 - currentFrame.Roll2.Value;
                    }
                    // If second roll was also a strike, pins reset to 10

                    if (request.Pins < 0 || request.Pins > maxPins)
                    {
                        return BadRequest($"Invalid pin count. Max allowed: {maxPins}");
                    }
                    currentFrame.Roll3 = request.Pins;
                }
            }

            // 4. Calculate scores for all frames
            CalculateScores(frames);

            // 5. Check if game is finished for this player
            bool playerFinished = IsPlayerFinished(frames);

            // Check if all players are finished
            if (playerFinished)
            {
                bool allPlayersFinished = true;
                foreach (var p in game.Players)
                {
                    var pFrames = p.Frames.OrderBy(f => f.FrameNumber).ToList();
                    if (!IsPlayerFinished(pFrames))
                    {
                        allPlayersFinished = false;
                        break;
                    }
                }
                game.IsFinished = allPlayersFinished;
            }

            // 6. Save changes
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Helper: Get current incomplete frame
        private Frame? GetCurrentFrame(List<Frame> frames)
        {
            foreach (var frame in frames)
            {
                if (!IsFrameComplete(frame))
                {
                    return frame;
                }
            }
            return null; // All frames complete, need to create new one
        }

        // Helper: Check if a frame is complete
        private bool IsFrameComplete(Frame frame)
        {
            if (frame.FrameNumber < 10)
            {
                // Strike completes the frame
                if (frame.Roll1 == 10)
                {
                    return true;
                }
                // Two rolls complete the frame
                return frame.Roll1 != null && frame.Roll2 != null;
            }
            else
            {
                // 10th frame
                if (frame.Roll1 == null) return false;
                if (frame.Roll2 == null) return false;

                bool isStrike = frame.Roll1.Value == 10;
                bool isSpare = (frame.Roll1.Value + frame.Roll2.Value) == 10;

                // If strike or spare, need third roll
                if (isStrike || isSpare)
                {
                    return frame.Roll3 != null;
                }

                return true; // Open frame in 10th, no bonus
            }
        }

        // Helper: Check if player has finished all frames
        private bool IsPlayerFinished(List<Frame> frames)
        {
            if (frames.Count < 10) return false;
            var tenthFrame = frames.FirstOrDefault(f => f.FrameNumber == 10);
            return tenthFrame != null && IsFrameComplete(tenthFrame);
        }

        // Helper: Calculate scores for all frames
        private void CalculateScores(List<Frame> frames)
        {
            int runningScore = 0;

            for (int i = 0; i < frames.Count; i++)
            {
                var frame = frames[i];
                int? frameScore = CalculateFrameScore(frames, i);

                if (frameScore.HasValue)
                {
                    runningScore += frameScore.Value;
                    frame.Score = runningScore;
                }
                else
                {
                    frame.Score = null; // Waiting for bonus rolls
                }
            }
        }

        // Helper: Calculate individual frame score
        private int? CalculateFrameScore(List<Frame> frames, int frameIndex)
        {
            var frame = frames[frameIndex];

            if (frame.Roll1 == null)
            {
                return null;
            }

            if (frame.FrameNumber < 10)
            {
                // Strike
                if (frame.Roll1 == 10)
                {
                    // Need next 2 rolls for bonus
                    var nextRolls = GetNextRolls(frames, frameIndex, 2);
                    if (nextRolls.Count < 2)
                    {
                        return null; // Waiting for bonus
                    }
                    return 10 + nextRolls[0] + nextRolls[1];
                }

                if (frame.Roll2 == null)
                {
                    return null; // Waiting for second roll
                }

                // Spare
                if (frame.Roll1 + frame.Roll2 == 10)
                {
                    // Need next 1 roll for bonus
                    var nextRolls = GetNextRolls(frames, frameIndex, 1);
                    if (nextRolls.Count < 1)
                    {
                        return null; // Waiting for bonus
                    }
                    return 10 + nextRolls[0];
                }

                // Open frame
                return frame.Roll1.Value + frame.Roll2.Value;
            }
            else
            {
                // 10th frame - no looking ahead, just sum all rolls
                if (frame.Roll2 == null)
                {
                    return null;
                }

                bool isStrike = frame.Roll1.Value == 10;
                bool isSpare = (frame.Roll1.Value + frame.Roll2.Value) == 10;

                if ((isStrike || isSpare) && frame.Roll3 == null)
                {
                    return null; // Waiting for bonus roll
                }

                int score = frame.Roll1.Value + frame.Roll2.Value;
                if (frame.Roll3.HasValue)
                {
                    score += frame.Roll3.Value;
                }
                return score;
            }
        }

        // Helper: Get next N rolls from subsequent frames
        private List<int> GetNextRolls(List<Frame> frames, int currentFrameIndex, int count)
        {
            var rolls = new List<int>();

            for (int i = currentFrameIndex + 1; i < frames.Count && rolls.Count < count; i++)
            {
                var frame = frames[i];

                if (frame.Roll1.HasValue)
                {
                    rolls.Add(frame.Roll1.Value);
                }

                if (rolls.Count < count && frame.Roll2.HasValue)
                {
                    rolls.Add(frame.Roll2.Value);
                }

                if (rolls.Count < count && frame.Roll3.HasValue)
                {
                    rolls.Add(frame.Roll3.Value);
                }
            }

            return rolls;
        }
    }

    public class RollRequest
    {
        public int PlayerId { get; set; }
        public int Pins { get; set; }
    }
}
