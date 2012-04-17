module JsonHelper
  def decoded_errors
    response.decoded_body.try(:errors)
  end
end
