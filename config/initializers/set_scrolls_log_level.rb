unless ENV["LOG_LEVEL"]
  rails_scrolls_level_map = {
      0 => 7,
      1 => 6,
      2 => 4,
      3 => 3,
      4 => 1,
      5 => 0
  }
  Scrolls::Log::LOG_LEVEL = rails_scrolls_level_map[Rails.logger.level]
end