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

  describe "#to_json" do
    before(:each) do
      @presentation = @presenter.to_json({ :foo => "bar", :bro => [ { :fooz => 22, :widgets => false }, { :fooz => 44, :widgets => true }]})
    end

    it "converts to JSON" do
      @presentation.should == { :foo => "bar", :bro => [ { :fooz => 22, :widgets => false }, { :fooz => 44, :widgets => true }]}.to_json
    end
  end

  describe "#present" do
    before(:each) do

    end

    it "calls #to_hash" do
      @presenter.should_receive :to_hash
      @presenter.present
    end

    it "calls to_json" do
      @presenter.should_receive :to_json
      @presenter.present
    end
  end
end