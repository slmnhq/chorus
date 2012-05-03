require 'spec_helper'

describe ErrorPresenter do
  it "renders a blank field error" do
    invalid_record = User.new
    invalid_record.valid?

    presenter = ErrorPresenter.new(invalid_record.errors)

    rendered = Hashie::Mash.new(presenter.as_json)

    rendered.username.BLANK.should == {}
  end

  it "renders additional data associated with an error" do
    invalid_record = User.new
    invalid_record.password = "shrt"
    invalid_record.valid?

    presenter = ErrorPresenter.new(invalid_record.errors)

    rendered = Hashie::Mash.new(presenter.as_json)

    rendered.password.TOO_SHORT['count'].should == 6
  end
end
