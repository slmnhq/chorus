require 'spec_helper_no_transactions'

describe ActivityMigrator do
  describe ".migrate" do
    before :all do
        ActivityMigrator.new.migrate
    end

    context "migrating activities that reference datasets" do
      it "copies SOURCE TABLE CREATED data fields from the legacy activity" do
        Events::SOURCE_TABLE_CREATED.count.should == 12
        event = Events::SOURCE_TABLE_CREATED.find_by_legacy_id('10002')
        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
        event.dataset.should be_a(Dataset)
        event.created_at.to_s.should == "2012-03-07 17:59:20 UTC"
      end

      #it "copies WORKSPACE_ADD_HDFS_AS_EXT_TABLE fields from the legacy activity" do
      #  #expect {
      #  #  ActivityMigrator.new.migrate
      #  #}.to change(Events::WORKSPACE_ADD_HDFS_AS_EXT_TABLE, :count).by(1)
      #
      #  event = Events::WORKSPACE_ADD_HDFS_AS_EXT_TABLE.find(event_id_for('10718'))
      #  event.workspace.should be_instance_of(Workspace)
      #  event.actor.should be_instance_of(User)
      #  event.dataset.should be_a(Dataset)
      #  event.hdfs_file.should be_a(HdfsFileReference)
      #  event.hdfs_file.hadoop_instance_id.should_not be_nil
      #  event.hdfs_file.path.should == "/data/Top_1_000_Songs_To_Hear_Before_You_Die.csv"
      #end

      it "copies FILE IMPORT SUCCESS activities" do
        Events::FILE_IMPORT_SUCCESS.count.should == 5
        event = Events::FILE_IMPORT_SUCCESS.find_by_legacy_id('10177')
        event.workspace.should be_a(Workspace)
        event.workspace.name.should == "ws"
        event.actor.should be_a(User)
        event.actor.username.should == "edcadmin"
        event.dataset.should be_a(Dataset)
        event.dataset.name.should == "sixrows33columns"
        event.additional_data[:filename].should == "sixrows33columns.csv"
        event.additional_data[:import_type].should == "file"
      end

      it "copies FILE IMPORT FAILED activities" do
        Events::FILE_IMPORT_FAILED.count.should == 7
        event = Events::FILE_IMPORT_FAILED.find_by_legacy_id('10368')
        event.workspace.should be_a(Workspace)
        event.workspace.name.should == "active_public"
        event.actor.should be_a(User)
        event.actor.username.should == "edcadmin"
        event.additional_data[:filename].should == "SFO 2011 Annual Survey.csv"
        event.additional_data[:import_type].should == "file"
        event.additional_data[:destination_table].should == "sfo_2011_annual_survey"
        event.additional_data[:error_message].should == "[ERROR: invalid input syntax for type double precision: \"1,909.00\"\n  Where: COPY sfo_2011_annual_survey, line 3851, column runid]"
      end

      it "copies DATASET IMPORT SUCCESS activities" do
        Events::DATASET_IMPORT_SUCCESS.count.should == 96
        event = Events::DATASET_IMPORT_SUCCESS.find_by_legacy_id('10308')
        event.workspace.should be_a(Workspace)
        event.workspace.name.should == "New And Improved Title"
        event.actor.should be_a(User)
        event.actor.username.should == "notadmin"
        event.dataset.should be_a(Dataset)
        #event.additional_data[:dataset].name.should == "clv_data_large_new" TODO fixme when it becomes an id
        # event.additional_data[:source_dataset].name.should == "clv_data_large"
      end

      it "copies DATASET IMPORT FAILED activities" do
        Events::DATASET_IMPORT_FAILED.count.should == 20
        event = Events::DATASET_IMPORT_FAILED.find_by_legacy_id('10336')
        event.workspace.should be_a(Workspace)
        event.workspace.name.should == "New And Improved Title"
        event.actor.should be_a(User)
        event.actor.username.should == "notadmin"
        #event.additional_data[:destination_table].should == "import_try_2"
        #event.additional_data[:source_dataset].name.should == "clv_data_large"
        event.additional_data[:error_message].should include( "ERROR: duplicate key violates unique constraint \"pg_type_typname_nsp_index\"")

        event = Events::DATASET_IMPORT_FAILED.find_by_legacy_id('10174')
        event.additional_data[:error_message].should == ''
      end
    end
    #
    #context "migrating activities that do not reference datasets" do
    #  it "copies PUBLIC WORKSPACE CREATED data fields from the legacy activity" do
    #    #expect {
    #    #  ActivityMigrator.new.migrate
    #    #}.to change(Events::PUBLIC_WORKSPACE_CREATED, :count).by(70)
    #
    #    event = Events::PUBLIC_WORKSPACE_CREATED.find(event_id_for('10158'))
    #
    #    event.workspace.should be_instance_of(Workspace)
    #    event.actor.should be_instance_of(User)
    #  end
    #
    #  it "copied WORKSPACE_ARCHIVED data fields from the legacy activity" do
    #    #expect {
    #    #  ActivityMigrator.new.migrate
    #    #}.to change(Events::WORKSPACE_ARCHIVED, :count).by(4)
    #
    #    event = Events::WORKSPACE_ARCHIVED.find(event_id_for('10304'))
    #
    #    event.workspace.should be_instance_of(Workspace)
    #    event.actor.should be_instance_of(User)
    #  end
    #
    #  it "copied WORKSPACE_UNARCHIVED data fields from the legacy activity" do
    #    #expect {
    #    #  ActivityMigrator.new.migrate
    #    #}.to change(Events::WORKSPACE_UNARCHIVED, :count).by(1)
    #
    #    event = Events::WORKSPACE_UNARCHIVED.find(event_id_for('10721'))
    #
    #    event.workspace.should be_instance_of(Workspace)
    #    event.actor.should be_instance_of(User)
    #  end
    #
    #  it "copies PRIVATE WORKSPACE CREATED data fields from the legacy activity" do
    #    #expect {
    #    #  ActivityMigrator.new.migrate
    #    #}.to change(Events::PRIVATE_WORKSPACE_CREATED, :count).by(3)
    #
    #    event = Events::PRIVATE_WORKSPACE_CREATED.find(event_id_for('10401'))
    #
    #    event.workspace.should be_instance_of(Workspace)
    #    event.actor.should be_instance_of(User)
    #  end
    #
    #  it "copies WORKSPACE MAKE PUBLIC data fields from the legacy activity" do
    #    #expect {
    #    #  ActivityMigrator.new.migrate
    #    #}.to change(Events::WORKSPACE_MAKE_PUBLIC, :count).by(1)
    #
    #    event = Events::WORKSPACE_MAKE_PUBLIC.find(event_id_for('10719'))
    #
    #    event.workspace.should be_instance_of(Workspace)
    #    event.actor.should be_instance_of(User)
    #  end
    #
    #  it "copies WORKSPACE MAKE PRIVATE data fields from the legacy activity" do
    #    #expect {
    #    #  ActivityMigrator.new.migrate
    #    #}.to change(Events::WORKSPACE_MAKE_PRIVATE, :count).by(1)
    #
    #    event = Events::WORKSPACE_MAKE_PRIVATE.find(event_id_for('10720'))
    #
    #    event.workspace.should be_instance_of(Workspace)
    #    event.actor.should be_instance_of(User)
    #  end
    #
    #  it "copies WORKFILE CREATED data fields from the legacy activity" do
    #    #expect {
    #    #  ActivityMigrator.new.migrate
    #    #}.to change(Events::WORKFILE_CREATED, :count).by(36)
    #
    #    event = Events::WORKFILE_CREATED.find(event_id_for('10010'))
    #
    #    event.workspace.should be_instance_of(Workspace)
    #    event.actor.should be_instance_of(User)
    #    event.workfile.should be_instance_of(Workfile)
    #  end
    #
    #  it "copies INSTANCE CREATED (greenplum) data fields from the legacy activity" do
    #    #expect {
    #    #  ActivityMigrator.new.migrate
    #    #}.to change(Events::GREENPLUM_INSTANCE_CREATED, :count).by(3)
    #
    #    event = Events::GREENPLUM_INSTANCE_CREATED.find(event_id_for('10036'))
    #
    #    event.workspace.should be_blank
    #    event.actor.should be_instance_of(User)
    #    event.greenplum_instance.should be_instance_of(Instance)
    #  end
    #
    #  it "copies INSTANCE CREATED (hadoop) data fields from the legacy activity" do
    #    #expect {
    #    #  ActivityMigrator.new.migrate
    #    #}.to change(Events::HADOOP_INSTANCE_CREATED, :count).by(2)
    #
    #    event = Events::HADOOP_INSTANCE_CREATED.find(event_id_for('10006'))
    #
    #    event.workspace.should be_blank
    #    event.actor.should be_instance_of(User)
    #    event.hadoop_instance.should be_instance_of(HadoopInstance)
    #  end
    #
    #  it "copies USER ADDED data fields from the legacy activity" do
    #    #expect {
    #    #  ActivityMigrator.new.migrate
    #    #}.to change(Events::USER_ADDED, :count).by(7)
    #
    #    event = Events::USER_ADDED.find(event_id_for('10195'))
    #
    #    event.actor.should be_instance_of(User)
    #    event.new_user.should be_instance_of(User)
    #  end
    #
    #  it "copies MEMBERS ADDED data fields from the legacy activity" do
    #    #expect {
    #    #  ActivityMigrator.new.migrate
    #    #}.to change(Events::MEMBERS_ADDED, :count).by(4)
    #
    #    event = Events::MEMBERS_ADDED.find(event_id_for('10261'))
    #
    #    event.actor.should be_instance_of(User)
    #    event.member.should be_instance_of(User)
    #    event.workspace.should be_instance_of(Workspace)
    #    event.num_added.should == "2"
    #  end
    #end
    #
    #context "foreign key" do
    #  #before(:each) do
    #  #  Legacy.connection.column_exists?(:edc_activity_stream, :chorus_rails_event_id).should be_false
    #  #  ActivityMigrator.new.migrate
    #  #end
    #
    #  it "adds the new foreign key column to legacy table" do
    #    Legacy.connection.column_exists?(:edc_activity_stream, :chorus_rails_event_id).should be_true
    #  end
    #
    #  it "sets the Event id when successfully imported" do
    #    count = Legacy.connection.exec_query("SELECT COUNT(1) FROM edc_activity_stream WHERE chorus_rails_event_id IS NOT NULL")
    #    count[0]['count'].to_i.should > 0
    #  end
    #end
  end

  def event_id_for(id)
    activity_stream = Legacy.connection.exec_query("SELECT chorus_rails_event_id FROM edc_activity_stream WHERE id = '#{id}'")
    activity_stream[0]['chorus_rails_event_id']
  end
end
