require "spec_helper"

describe NotesController do
  describe "#create" do
    before do
      @user = FactoryGirl.create(:user)
      log_in @user
    end

    it "creates a note on the model specified by the 'entity_type' and 'entity_id'" do
      mock(Events::Note).create_from_params({
        "entity_type" => "greenplum_instance",
        "entity_id" => "3",
        "body" => "I'm a note",
      }, @user)
      post :create, :note => { :entity_type => "greenplum_instance", :entity_id => "3", :body => "I'm a note" }
      response.code.should == "201"
    end

    it "sanitizes the body of note" do
      mock(Events::Note).create_from_params(
          {
              "entity_type" => "greenplum_instance",
              "entity_id" => "3",
              "body" => "<b>not evil</b> ",
          }, @user)
      post :create, :note => { :entity_type => "greenplum_instance", :entity_id => "3", :body => "<b>not evil</b> <script>alert('Evil!')</script>" }
      response.code.should == "201"
    end

    it "uses authorization" do
      id = gpdb_instances(:greenplum).to_param
      mock(controller).authorize!(:create, Events::Note, "greenplum_instance", id)
      post :create, :note => { :entity_type => "greenplum_instance", :entity_id => id, :body => "I'm a note" }
    end

    context "with datasets" do
      it "associates the datasets to the Note" do
        workspace = workspaces(:public)
        associated_datasets = workspace.bound_datasets[0..1]
        associated_dataset_ids = associated_datasets.map(&:id)
        post :create, :note => { :entity_type => "workspace", :entity_id => workspace.id, :body => "I'm a real note" , :dataset_ids => associated_dataset_ids }
        response.code.should == "201"
        Events::NoteOnWorkspace.first.datasets.should == associated_datasets
      end
    end


    context "with workfiles" do
      it "associates the workfiles to the Note" do
        workspace = workspaces(:public)
        associated_workfiles = workspace.workfiles[0..1]
        associated_workfile_ids = associated_workfiles.map(&:id)
        post :create, :note => { :entity_type => "workspace", :entity_id => workspace.id, :body => "I'm a real note" , :workfile_ids => associated_workfile_ids }
        response.code.should == "201"
        Events::NoteOnWorkspace.first.workfiles.should =~ associated_workfiles
      end
    end

    context "with an exception" do
      it "responds with an error code" do
        workspace = workspaces(:archived)
        post :create, :note => { :entity_type => "workspace", :entity_id => workspace.id, :body => "I'm a faulty note" }
        response.code.should == "422"
      end
    end

    context "with 'notify users'" do
      let(:users_to_notify) { [users(:owner), users(:no_collaborators)] }

      it "notifies the recipients" do
        workspace = workspaces(:public)
        post :create, :note => { :entity_type => "workspace", :entity_id => workspace.id, :body => "Notify people note", :recipients => users_to_notify.map(&:id) }
        response.code.should == "201"
        users_to_notify.each do |user|
          user.notification_events.first.body.should == "Notify people note"
        end
      end
    end
  end

  describe "#update" do
    let(:note) { FactoryGirl.create(:note_on_greenplum_instance_event) }
    context "as the note owner" do
      before do
        log_in note.actor
      end

      it "update the note on a gpdb instance" do
        post :update, :id => note.id, :note => {:body => "Some crazy content"}
        response.code.should == "200"

        Events::Note.first.body.should == "Some crazy content"
      end
    end

    context "not as the note owner" do
      let(:other_user) { FactoryGirl.create(:user) }
      before do
        log_in other_user
      end

      it "update the note on a gpdb instance" do
        post :update, :id => note.id, :note => {:body => "Some crazy content"}
        response.code.should == "403"

        Events::Note.first.body.should_not == "Some crazy content"
      end
    end

    it "sanitize the Note body before update" do
      log_in note.actor
      post :update, :id => note.id, :note => {:body => "Hi there<script>alert('haha I am evil')</script>"}
      response.code.should == "200"

      Events::Note.first.body.should == "Hi there"
    end

  end

  describe "#destroy" do
    let(:note) { Events::NoteOnGreenplumInstance.first }

    before do
      log_in note.actor
    end

    it "destroys the note with the given id" do
      delete :destroy, :id => note.id
      Events::NoteOnGreenplumInstance.find_by_id(note.id).should be_nil
    end

    it "returns an empty JSON body" do
      delete :destroy, :id => note.id
      response.body.should == "{}"
    end

    it "uses the note access to check permissions" do
      mock(controller).authorize!(:destroy, note)
      delete :destroy, :id => note.id
    end
  end
end
