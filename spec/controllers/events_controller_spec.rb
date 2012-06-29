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
        get :index, :instance_id => object.id
      end
    end

    context "when getting the activities for a hadoop instance" do
      let(:object) { FactoryGirl.create(:hadoop_instance) }

      it "presents the hadoop instance's activities" do
        mock_present { |models| models.should =~ [event1, event2] }
        get :index, :hadoop_instance_id => object.id
      end
    end

    context "when getting the activities for a user" do
      let(:object) { FactoryGirl.create(:user) }

      it "presents the user's activities" do
        mock_present { |models| models.should =~ [event1, event2] }
        get :index, :user_id => object.id
      end
    end

    context "when getting the activities for a workfile" do
      let(:object) { FactoryGirl.create(:workfile) }

      it "presents the workfile's activities" do
        mock_present { |models| models.should =~ [event1, event2] }
        get :index, :workfile_id => object.id
      end
    end

    context "when getting the activities for a workspace" do
      let(:object) { FactoryGirl.create(:workspace) }

      it "presents the workspace's activities" do
        mock_present { |models| models.should =~ [event1, event2] }
        get :index, :workspace_id => object.id
      end
    end

    context "when getting the activities for the current user's home page" do
      it "presents the user's activities" do
        mock(Events::Base).for_dashboard_of(current_user) { fake_relation [dashboard_event1, dashboard_event2] }
        mock_present { |models| models.should =~ [dashboard_event1, dashboard_event2] }
        get :index
      end
    end
  end

  describe "#show" do
    it "shows the particular activity " do
      stub(Events::Base).for_dashboard_of(current_user) { fake_relation [dashboard_event1, dashboard_event2] }
      mock_present { |model| model.should == dashboard_event1 }
      get :show, :id => dashboard_event1.to_param
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
      "sandboxAdded" => :sandbox_added_event
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
