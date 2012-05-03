module ActiveModel
  module Validations
    class UnlocalizedErrors < Errors
      # errors.rb:322
      def generate_message(attribute, type = :invalid, options = {})
        [type, options]
      end
    end

    def errors
      @errors ||= UnlocalizedErrors.new(self)
    end
  end
end