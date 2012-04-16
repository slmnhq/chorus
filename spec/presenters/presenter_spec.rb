require 'spec_helper'

describe Presenter do
  before do
    @user = User.create :username => 'admin', :password => 'secret', :password_confirmation => 'secret'
    @presenter = Presenter.new(@user)
  end

  describe "#model" do
    it "returns the model" do
      @presenter.model.should == @user
    end
  end

  describe ".present" do
    it "wraps the response" do
      Presenter.present(@user).as_json.should have_key(:response)
    end
  end

  describe ".present_collection" do
    it "wraps the response" do
      Presenter.present_collection([@user]).as_json.should have_key(:response)
    end

    it "serializes an array" do
      Presenter.present_collection([@user]).as_json[:response].should be_a(Array)
    end
  end
end