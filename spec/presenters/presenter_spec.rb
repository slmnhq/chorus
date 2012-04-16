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
    it "presents the model" do
      Presenter.present(@user).should == { :response => @user.as_json }.to_json
    end
  end

  describe ".present_collection" do
    it "presents a list of models" do
      Presenter.present_collection([@user]).should == { :response => [@user.as_json] }.to_json
    end
  end
end