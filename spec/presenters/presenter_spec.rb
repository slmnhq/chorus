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

  describe ".present" do
    it "wraps the response" do
      Presenter.present(@user, view).as_json.should have_key(:response)
    end
  end

  describe ".present_collection" do
    it "wraps the response" do
      Presenter.present_collection([@user], view).as_json.should have_key(:response)
    end

    it "serializes an array" do
      Presenter.present_collection([@user], view).as_json[:response].should be_a(Array)
    end

    context "pagination" do
      it "when un-paginated has no pagination info" do
        models = User.order(:username)
        Presenter.present_collection(models, view).as_json.should_not have_key(:pagination)
      end

      it "when paginated has pagination info" do
        models = User.order(:username).paginate(:page => 1, :per_page => 2)
        json = Presenter.present_collection(models, view).as_json
        json.should have_key(:pagination)
        json[:pagination][:page].should == 1
        json[:pagination][:per_page].should == 2
        json[:pagination][:total].should == User.count
      end
    end
  end
end
