require "spec_helper"

describe NotesController do
  before do
    @user = FactoryGirl.create(:user)
    log_in @user
  end

  describe "#create" do
    it "creates a note on an instance" do
      instance = FactoryGirl.create(:instance)
      post :create, :note => {:entity_id => instance.id, :body => "Some crazy content"}
      response.code.should == "201"

      Events::Note.last.action == Events::NOTE_ON_GREENPLUM_INSTANCE
      Events::Note.last.body.should == "Some crazy content"
    end
  end
end
