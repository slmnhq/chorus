RSpec::Matchers.define :have_presented do |model|
  def hash_for(response)
    JSON.parse(response.body)["response"] rescue nil
  end

  match do |response|
    hash = hash_for(response)
    hash.should be_present
    presenter_class = "#{model.class}Presenter".constantize
    hash.should == presenter_class.present(model).as_json[:response].stringify_keys
  end

  failure_message_for_should do |response|
    "response should have presented #{model.inspect}, but it was <#{hash_for(response)}>"
  end

  failure_message_for_should_not do |model|
    "response should not have presented #{model.inspect}, but did"
  end

  description do
    "have presented #{model.inspect}"
  end
end