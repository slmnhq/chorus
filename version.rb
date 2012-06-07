module Chorus
  module VERSION #:nodoc:
    MAJOR         = 3
    MINOR         = 0
    SERVICE_PACK  = 0
    PATCH         = 0

    STRING = [MAJOR, MINOR, SERVICE_PACK, PATCH].compact.join('.')
  end
end