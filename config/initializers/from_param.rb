module ActiveRecord
  class Base
    def self.from_param(param)
      find_by_id(param)
    end
  end
end
