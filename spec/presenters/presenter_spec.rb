require 'spec_helper'

describe Presenter, :type => :view do
  before do
    @user = FactoryGirl.build :user
    @presenter = Presenter.new(@user, view)
  end

  describe "#model" do
    it "returns the model" do
      @presenter.model.should == @user
    end
  end

  describe ".present_collection" do
    it "serializes an array" do
      Presenter.present_collection([@user], view).as_json.should be_a(Array)
    end
  end
end
