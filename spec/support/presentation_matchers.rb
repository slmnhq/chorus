RSpec::Matchers.define :have_presented do |model|
  def decoded_response(response)
    response.decoded_body.try(:[], :response)
  end

  match do |response|
    hash = decoded_response(response)
    hash.should be_present
    presenter_class = "#{model.class}Presenter".constantize
    hash.should == presenter_class.present(model).as_json[:response].stringify_keys
  end

  failure_message_for_should do |response|
    "response should have presented #{model.inspect}, but it was <#{decoded_response(response)}>"
  end

  failure_message_for_should_not do |model|
    "response should not have presented #{model.inspect}, but did"
  end

  description do
    "have presented #{model.inspect}"
  end
end