require "spec_helper"

describe NotesController do
  describe "#create" do
    before do
      @user = FactoryGirl.create(:user)
      log_in @user
    end

    it "creates a note on the model specified by the 'entity_type' and 'entity_id'" do
      mock(Events::Note).create_for_entity("greenplum_instance", "3", "I'm a note", @user)
      post :create, :note => { :entity_type => "greenplum_instance", :entity_id => "3", :body => "I'm a note" }
      response.code.should == "201"
    end
  end

  describe "#update" do
    context "as the note owner" do
      let(:note) { FactoryGirl.create(:note_on_greenplum_instance_event) }
      before do
        log_in note.actor
      end

      it "update the note on an instance" do
        post :update, :id => note.id, :note => {:body => "Some crazy content"}
        response.code.should == "200"

        Events::Note.first.body.should == "Some crazy content"
      end
    end

    context "not as the note owner" do
      let(:note) { FactoryGirl.create(:note_on_greenplum_instance_event) }
      let(:other_user) { FactoryGirl.create(:user) }
      before do
        log_in other_user
      end

      it "update the note on an instance" do
        post :update, :id => note.id, :note => {:body => "Some crazy content"}
        response.code.should == "403"

        Events::Note.first.body.should_not == "Some crazy content"
      end
    end

  end
end
