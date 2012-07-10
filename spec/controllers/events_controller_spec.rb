require "spec_helper"

describe EventsController do
  let(:user) { FactoryGirl.create(:user) }
  let(:object) { FactoryGirl.build(:user) }

  let!(:event1) { FactoryGirl.create(:workfile_created_event) }
  let!(:event2) { FactoryGirl.create(:workfile_created_event) }

  let!(:dashboard_event1) { Activity.create! }
  let!(:dashboard_event2) { Activity.create! }

  let(:current_user) { FactoryGirl.create(:admin) }

  before do
    log_in current_user
    Activity.create!(:entity => object, :event => event1)
    Activity.create!(:entity => object, :event => event2)
  end

  describe "#index" do
    context "when getting the activities for an instance" do
      let(:object) { FactoryGirl.create(:instance) }

      it "presents the instance's activities" do
        mock_present { |models| models.should =~ [event1, event2] }
        get :index, :entity_type => "instance", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a hadoop instance" do
      let(:object) { FactoryGirl.create(:hadoop_instance) }

      it "presents the hadoop instance's activities" do
        mock_present { |models| models.should =~ [event1, event2] }
        get :index, :entity_type => "hadoop_instance", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a user" do
      let(:object) { FactoryGirl.create(:user) }

      it "presents the user's activities" do
        mock_present { |models| models.should =~ [event1, event2] }
        get :index, :entity_type => "user", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a workfile" do
      let(:object) { FactoryGirl.create(:workfile) }

      it "presents the workfile's activities" do
        mock_present { |models| models.should =~ [event1, event2] }
        get :index, :entity_type => "workfile", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a workspace" do
      let(:object) { FactoryGirl.create(:workspace) }

      it "presents the workspace's activities" do
        mock_present { |models| models.should =~ [event1, event2] }
        get :index, :entity_type => "workspace", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for a gpdb_table" do
      let!(:object) { FactoryGirl.create(:gpdb_table) }

      let!(:event1) { FactoryGirl.create(:source_table_created_event, :dataset => object) }
      let!(:event2) { FactoryGirl.create(:source_table_created_event, :dataset => object) }

      it "presents the gpdb_table's activities" do
        mock_present { |models| models.should =~ [event1, event2] }
        get :index, :entity_type => "dataset", :entity_id => object.id
        response.code.should == "200"
      end
    end

    context "when getting the activities for an hdfs file" do
      let!(:object) { FactoryGirl.create(:hdfs_file_reference) }

      let!(:event1) { FactoryGirl.create(:note_on_hdfs_file_event, :hdfs_file => object) }
      let!(:event2) { FactoryGirl.create(:note_on_hdfs_file_event, :hdfs_file => object) }

      it "presents the workspace's activities" do
        mock_present { |models| models.should =~ [event1, event2] }
        get :index, :entity_type => "hdfs", :entity_id => object.hadoop_instance_id.to_s + "|" + object.path
        response.code.should == "200"
      end
    end

    context "when getting the activities for the current user's home page" do
      it "presents the user's activities" do
        mock(Events::Base).for_dashboard_of(current_user) { fake_relation [dashboard_event1, dashboard_event2] }
        mock_present { |models| models.should =~ [dashboard_event1, dashboard_event2] }
        get :index, :entity_type => "dashboard"
        response.code.should == "200"
      end
    end
  end

  describe "#show" do
    it "shows the particular event " do
      mock_present { |model| model.should == event1 }
      get :show, :id => event1.to_param
      response.code.should == "200"
    end

    FIXTURE_FILES = {
        "greenplumInstanceCreated" => :greenplum_instance_created_event,
        "hadoopInstanceCreated" => :hadoop_instance_created_event,
        "greenplumInstanceChangedOwner" => :greenplum_instance_changed_owner_event,
        "greenplumInstanceChangedName" => :greenplum_instance_changed_name_event,
        "hadoopInstanceChangedName" => :hadoop_instance_changed_name_event,
        "workfileCreated" => :workfile_created_event,
        "sourceTableCreated" => :source_table_created_event,
        "userCreated" => :user_created_event,
        "sandboxAdded" => :sandbox_added_event,
        "noteOnGreenplumInstanceCreated" => :note_on_greenplum_instance_event,
        "noteOnHadoopInstanceCreated" => :note_on_hadoop_instance_event,
        "hdfsExternalTableCreated" => :hdfs_external_table_created_event,
        "noteOnHdfsFileCreated" => :note_on_hdfs_file_event
    }

    FIXTURE_FILES.each do |filename, event_factory_name|

      generate_fixture "activity/#{filename}.json" do
        event = FactoryGirl.create(event_factory_name)
        activity = Activity.global.create!(:event => event)
        get :show, :id => event.to_param
      end
    end
  end
end
