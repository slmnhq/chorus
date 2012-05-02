RSpec::Matchers.define :have_presented do |model|
  def decoded_response(response)
    response.decoded_body.try(:[], :response)
  end

  match do |response|
    hash = decoded_response(response)
    hash.should be_present
    view_context = matcher_execution_context.controller.view_context
    hash.should == Presenter.present(model, view_context).as_json.stringify_keys
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