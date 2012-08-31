module Chorus
  module VERSION #:nodoc:
    MAJOR         = 2
    MINOR         = 2
    SERVICE_PACK  = 0
    PATCH         = 0

    STRING = [MAJOR, MINOR, SERVICE_PACK, PATCH, ENV['BUILD_NUMBER']].compact.join('.')
  end
end
