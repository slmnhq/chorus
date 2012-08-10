module Rails
  module Rack
    class Logger

      # This is a monkey-patch to the this file:
      #
      # /railties-3.2.5/lib/rails/rack/logger.rb
      #
      # All we did was remove some newlines from the logged string,
      # so that request ids would appear on the *same* line as the
      # 'starting request' message.
      #
      def call_app(env)
        request = ActionDispatch::Request.new(env)
        path = request.filtered_path
        Rails.logger.info "Started #{request.request_method} \"#{path}\" for #{request.remote_ip} at #{Time.now.to_default_s}"
        @app.call(env)
      ensure
        ActiveSupport::LogSubscriber.flush_all!
      end

    end
  end
end

