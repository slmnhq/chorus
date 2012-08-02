require "spec_helper"

describe EventsController do
  let(:current_user) { users(:carly) }

  before do
    log_in current_user
  end

  describe "#index" do
    let(:event) { Events::Base.first }

    before do
      Activity.create!(:entity => object, :event => event)
    end

    context "when getting the activities for an instance" do
      let(:object) { instances(:greenplum) }

      it "presents the instance's activities" do
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
      let(:object) { users(:bob) }

      it "presents the user's activities" do
        any_instance_of(User) { |u| mock.proxy(u).accessible_events(current_user) }
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "user", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a workfile" do
      let(:object) { workfiles(:bob_public) }

      it "presents the workfile's activities" do
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "workfile", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a workspace" do
      let(:object) { workspaces(:alice_public) }

      it "presents the workspace's activities" do
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "workspace", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a gpdb_table" do
      let(:object) { datasets(:bobs_table) }

      it "presents the gpdb_table's activities" do
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "dataset", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for an hdfs file" do
      let(:object) { HdfsFileReference.first }

      let(:event1) { FactoryGirl.create(:note_on_hdfs_file_event, :hdfs_file => object) }
      let(:event2) { FactoryGirl.create(:note_on_hdfs_file_event, :hdfs_file => object) }

      it "presents the workspace's activities" do
        mock_present { |models| models.should include(event) }
        get :index, :entity_type => "hdfs_file", :entity_id => "#{object.hadoop_instance_id.to_s}|#{object.path}"
        response.code.should == "200"
      end
    end

    context "when getting the activities for the current user's home page" do
      let(:object) { datasets(:bobs_table) }

      before do
        mock(Events::Base).for_dashboard_of(current_user) { fake_relation [event] }
      end

      it "presents the user's activities" do
        mock_present { |models| models.should == [event] }
        get :index, :entity_type => "dashboard"
        response.code.should == "200"
      end
    end
  end

  describe "#show" do
    let(:event) { events(:note_on_alice_private) }

    it "shows the particular event " do
      mock_present { |model| model.should == event }
      log_in users(:alice)
      get :show, :id => event.to_param
      response.code.should == "200"
    end

    it "returns an error when trying to show an activity for which the user doesn't have access" do
      log_in users(:bob)
      get :show, :id => event.to_param
      response.code.should == "404"
    end

    FIXTURE_FILES = {
        "greenplumInstanceCreated" => Events::GREENPLUM_INSTANCE_CREATED,
        "hadoopInstanceCreated" => Events::HADOOP_INSTANCE_CREATED,
        "greenplumInstanceChangedOwner" => Events::GREENPLUM_INSTANCE_CHANGED_OWNER,
        "greenplumInstanceChangedName" => Events::GREENPLUM_INSTANCE_CHANGED_NAME,
        "hadoopInstanceChangedName" => Events::HADOOP_INSTANCE_CHANGED_NAME,
        "publicWorkspaceCreated" => Events::PUBLIC_WORKSPACE_CREATED,
        "privateWorkspaceCreated" => Events::PRIVATE_WORKSPACE_CREATED,
        "workspaceMakePublic" => Events::WORKSPACE_MAKE_PUBLIC,
        "workspaceMakePrivate" => Events::WORKSPACE_MAKE_PRIVATE,
        "workspaceArchived" => Events::WORKSPACE_ARCHIVED,
        "workspaceUnarchived" => Events::WORKSPACE_UNARCHIVED,
        "workfileCreated" => Events::WORKFILE_CREATED,
        "sourceTableCreated" => Events::SOURCE_TABLE_CREATED,
        "userCreated" => Events::USER_ADDED,
        "sandboxAdded" => Events::WORKSPACE_ADD_SANDBOX,
        "noteOnGreenplumInstanceCreated" => Events::NOTE_ON_GREENPLUM_INSTANCE,
        "noteOnHadoopInstanceCreated" => Events::NOTE_ON_HADOOP_INSTANCE,
        "hdfsExternalTableCreated" => Events::WORKSPACE_ADD_HDFS_AS_EXT_TABLE,
        "noteOnHdfsFileCreated" => Events::NOTE_ON_HDFS_FILE,
        "noteOnWorkspaceCreated" => Events::NOTE_ON_WORKSPACE,
        "noteOnWorkfileCreated" => Events::NOTE_ON_WORKFILE,
        "noteOnDatasetCreated" => Events::NOTE_ON_DATASET,
        "noteOnWorkspaceDatasetCreated" => Events::NOTE_ON_WORKSPACE_DATASET,
        "importSuccess" => Events::FILE_IMPORT_SUCCESS,
        "importFailed" => Events::FILE_IMPORT_FAILED,
        "membersAdded" => Events::MEMBERS_ADDED
    }

    FIXTURE_FILES.each do |filename, event_class_name|

      generate_fixture "activity/#{filename}.json" do
        event = event_class_name.first
        Activity.global.create!(:event => event)
        get :show, :id => event.to_param
      end
    end
  end
end
