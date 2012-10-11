require "spec_helper"

describe EventsController do
  let(:current_user) { users(:the_collaborator) }

  before do
    log_in current_user
  end

  describe "#index" do
    let(:event) { Events::Base.first }

    before do
      Activity.create!(:entity => object, :event => event)
    end

    context "when getting the activities for a gpdb instance" do
      let(:object) { gpdb_instances(:default) }

      it "presents the gpdb instance's activities" do
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "greenplum_instance", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a hadoop instance" do
      let(:object) { hadoop_instances(:hadoop) }

      it "presents the hadoop instance's activities" do
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "hadoop_instance", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a user" do
      let(:object) { users(:owner) }

      it "presents the user's activities" do
        any_instance_of(User) { |u| mock.proxy(u).accessible_events(current_user) }
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "user", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a workfile" do
      let(:object) { workfiles(:public) }

      it "presents the workfile's activities" do
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "workfile", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a workspace" do
      let(:object) { workspaces(:public_with_no_collaborators) }

      it "presents the workspace's activities" do
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "workspace", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a gpdb_table" do
      let(:object) { datasets(:table) }

      it "presents the gpdb_table's activities" do
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "dataset", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for an hdfs file" do
      let(:object) { HdfsEntry.first }

      it "presents the workspace's activities" do
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "hdfs_file", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for the current user's home page" do
      let(:object) { datasets(:table) }

      before do
        mock(Events::Base).for_dashboard_of(current_user) { fake_relation [event] }
      end

      it "presents the user's activities" do
        mock_present do |models,view,options|
          models.should == [event]
          options[:activity_stream].should be_true
        end
        get :index, :entity_type => "dashboard"
        response.code.should == "200"
      end
    end
  end

  describe "#show" do
    let(:event) { events(:note_on_no_collaborators_private) }

    it "shows the particular event " do
      mock_present do |model, view, options|
        model.should == event
        options[:activity_stream].should be_true
      end
      log_in users(:no_collaborators)
      get :show, :id => event.to_param
      response.code.should == "200"
    end

    it "returns an error when trying to show an activity for which the user doesn't have access" do
      log_in users(:owner)
      get :show, :id => event.to_param
      response.code.should == "404"
    end

    FIXTURE_FILES = {
        "greenplumInstanceCreated" => Events::GreenplumInstanceCreated,
        "gnipInstanceCreated" => Events::GnipInstanceCreated,
        "auroraInstanceProvisioned" => Events::ProvisioningSuccess,
        "auroraInstanceProvisioningFailed" => Events::ProvisioningFail,
        "hadoopInstanceCreated" => Events::HadoopInstanceCreated,
        "greenplumInstanceChangedOwner" => Events::GreenplumInstanceChangedOwner,
        "greenplumInstanceChangedName" => Events::GreenplumInstanceChangedName,
        "hadoopInstanceChangedName" => Events::HadoopInstanceChangedName,
        "publicWorkspaceCreated" => Events::PublicWorkspaceCreated,
        "privateWorkspaceCreated" => Events::PrivateWorkspaceCreated,
        "workspaceMakePublic" => Events::WorkspaceMakePublic,
        "workspaceMakePrivate" => Events::WorkspaceMakePrivate,
        "workspaceArchived" => Events::WorkspaceArchived,
        "workspaceUnarchived" => Events::WorkspaceUnarchived,
        "workfileCreated" => Events::WorkfileCreated,
        "sourceTableCreated" => Events::SourceTableCreated,
        "userCreated" => Events::UserAdded,
        "sandboxAdded" => Events::WorkspaceAddSandbox,
        "noteOnGreenplumInstanceCreated" => Events::NoteOnGreenplumInstance.where(:insight => false),
        "insightOnGreenplumInstance" => Events::NoteOnGreenplumInstance.where(:insight => true),
        "noteOnGnipInstanceCreated" => Events::NoteOnGnipInstance.where(:insight => false),
        "insightOnGnipInstanceCreated" => Events::NoteOnGnipInstance.where(:insight => true),
        "noteOnHadoopInstanceCreated" => Events::NoteOnHadoopInstance,
        "hdfsExternalTableCreated" => Events::WorkspaceAddHdfsAsExtTable,
        "noteOnHdfsFileCreated" => Events::NoteOnHdfsFile,
        "noteOnWorkspaceCreated" => Events::NoteOnWorkspace,
        "noteOnWorkfileCreated" => Events::NoteOnWorkfile,
        "noteOnDatasetCreated" => Events::NoteOnDataset,
        "noteOnWorkspaceDatasetCreated" => Events::NoteOnWorkspaceDataset,
        "membersAdded" => Events::MembersAdded,
        "fileImportCreated" => Events::FileImportCreated,
        "fileImportSuccess" => Events::FileImportSuccess,
        "fileImportFailed" => Events::FileImportFailed,
        "datasetImportCreated" => Events::DatasetImportCreated,
        "datasetImportSuccess" => Events::DatasetImportSuccess,
        "datasetImportFailed" => Events::DatasetImportFailed,
        "workfileUpgradedVersion" => Events::WorkfileUpgradedVersion,
        "chorusViewCreatedFromWorkfile" => Events::ChorusViewCreated.from_workfile,
        "chorusViewCreatedFromDataset" => Events::ChorusViewCreated.from_dataset,
        "chorusViewChanged" => Events::ChorusViewChanged,
        "workspaceChangeName" => Events::WorkspaceChangeName,
        "tableauWorkbookPublished" => Events::TableauWorkbookPublished,
        "tableauWorkfileCreated" => Events::TableauWorkfileCreated
    }

    FIXTURE_FILES.each do |filename, event_relation|

      generate_fixture "activity/#{filename}.json" do
        event = event_relation.first
        Activity.global.create!(:event => event)
        get :show, :id => event.to_param
      end
    end
  end
end
