module JsonHelper
  extend ActiveSupport::Concern

  included do
    unless ActionDispatch::TestResponse < RocketPants::TestHelper::ResponseHelper
      ActionDispatch::TestResponse.send :include, RocketPants::TestHelper::ResponseHelper
    end
  end

  def decoded_errors
    response.decoded_body.try(:errors)
  end
end
