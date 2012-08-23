require 'legacy_migration_spec_helper'

describe ActivityMigrator do
  describe ".migrate" do
    before :all do
      any_instance_of(WorkfileMigrator::LegacyFilePath) do |p|
        # Stub everything with a PNG so paperclip doesn't blow up
        stub(p).path { File.join(Rails.root, "spec/fixtures/small2.png") }
      end

      ActivityMigrator.migrate
    end

    context "migrating activities that reference datasets" do
      it "copies SOURCE TABLE CREATED data fields from the legacy activity" do
        Events::SourceTableCreated.count.should == 12
        event = Events::SourceTableCreated.find_by_legacy_id('10002')
        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
        event.dataset.should be_a(Dataset)
        event.created_at.to_s.should == "2012-03-07 17:59:20 UTC"
      end

      #it "copies WORKSPACE_ADD_HDFS_AS_EXT_TABLE fields from the legacy activity" do
      #  #expect {
      #  #  ActivityMigrator.migrate
      #  #}.to change(Events::WorkspaceAddHdfsAsExtTable, :count).by(1)
      #
      #  event = Events::WorkspaceAddHdfsAsExtTable.find(event_id_for('10718'))
      #  event.workspace.should be_instance_of(Workspace)
      #  event.actor.should be_instance_of(User)
      #  event.dataset.should be_a(Dataset)
      #  event.hdfs_file.should be_a(HdfsEntry)
      #  event.hdfs_file.hadoop_instance_id.should_not be_nil
      #  event.hdfs_file.path.should == "/data/Top_1_000_Songs_To_Hear_Before_You_Die.csv"
      #end

      it "copies FILE IMPORT SUCCESS activities" do
        Events::FileImportSuccess.count.should == 5
        event = Events::FileImportSuccess.find_by_legacy_id('10177')
        event.workspace.should be_a(Workspace)
        event.workspace.name.should == "ws"
        event.actor.should be_a(User)
        event.actor.username.should == "edcadmin"
        event.dataset.should be_a(Dataset)
        event.dataset.name.should == "sixrows33columns"
        event.additional_data['filename'].should == "sixrows33columns.csv"
        event.additional_data['import_type'].should == "file"
      end

      it "copies FILE IMPORT FAILED activities" do
        Events::FileImportFailed.count.should == 7
        event = Events::FileImportFailed.find_by_legacy_id('10368')
        event.workspace.should be_a(Workspace)
        event.workspace.name.should == "active_public"
        event.actor.should be_a(User)
        event.actor.username.should == "edcadmin"
        event.additional_data['filename'].should == "SFO 2011 Annual Survey.csv"
        event.additional_data['import_type'].should == "file"
        event.additional_data['destination_table'].should == "sfo_2011_annual_survey"
        event.additional_data['error_message'].should == "[ERROR: invalid input syntax for type double precision: \"1,909.00\"\n  Where: COPY sfo_2011_annual_survey, line 3851, column runid]"
      end

      it "copies DATASET IMPORT SUCCESS activities" do
        Events::DatasetImportSuccess.count.should == 96
        event = Events::DatasetImportSuccess.find_by_legacy_id('10308')
        event.workspace.should be_a(Workspace)
        event.workspace.name.should == "New And Improved Title"
        event.actor.should be_a(User)
        event.actor.username.should == "notadmin"
        event.dataset.should be_a(Dataset)
        event.additional_data['source_dataset_id'].should_not be_nil
      end

      it "copies DATASET IMPORT FAILED activities" do
        Events::DatasetImportFailed.count.should == 20
        event = Events::DatasetImportFailed.find_by_legacy_id('10336')
        event.workspace.should be_a(Workspace)
        event.workspace.name.should == "New And Improved Title"
        event.actor.should be_a(User)
        event.actor.username.should == "notadmin"
        event.additional_data['destination_table'].should == "import_try_2"
        event.additional_data['source_dataset_id'].should_not be_nil
        event.additional_data['error_message'].should include("ERROR: duplicate key violates unique constraint \"pg_type_typname_nsp_index\"")

        event = Events::DatasetImportFailed.find_by_legacy_id('10174')
        event.additional_data['error_message'].should == ''
      end
    end

    context "migrating activities that do not reference datasets" do
      it "copies PUBLIC WORKSPACE CREATED data fields from the legacy activity" do
        Events::PublicWorkspaceCreated.count.should == 70

        event = Events::PublicWorkspaceCreated.find_by_legacy_id('10158')
        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
      end

      it "copies PRIVATE WORKSPACE CREATED data fields from the legacy activity" do
        Events::PrivateWorkspaceCreated.count.should == 3

        event = Events::PrivateWorkspaceCreated.find_by_legacy_id('10401')
        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
      end

      it "copied WORKSPACE_ARCHIVED data fields from the legacy activity" do
        Events::WorkspaceArchived.count.should == 4

        event = Events::WorkspaceArchived.find_by_legacy_id('10304')
        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
      end

      it "copied WORKSPACE_UNARCHIVED data fields from the legacy activity" do
        Events::WorkspaceUnarchived.count.should == 1

        event = Events::WorkspaceUnarchived.find_by_legacy_id('10721')
        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
      end

      it "copies WORKSPACE MAKE PUBLIC data fields from the legacy activity" do
        Events::WorkspaceMakePublic.count.should == 1

        event = Events::WorkspaceMakePublic.find_by_legacy_id('10719')
        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
      end

      it "copies WORKSPACE MAKE PRIVATE data fields from the legacy activity" do
        Events::WorkspaceMakePrivate.count.should == 1

        event = Events::WorkspaceMakePrivate.find_by_legacy_id('10720')
        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
      end

      it "copies WORKFILE CREATED data fields from the legacy activity" do
        Events::WorkfileCreated.count.should == 36

        event = Events::WorkfileCreated.find_by_legacy_id('10010')
        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
        event.workfile.should be_instance_of(Workfile)
      end

      it "copies INSTANCE CREATED (greenplum) data fields from the legacy activity" do
        Events::GreenplumInstanceCreated.count.should == 3

        event = Events::GreenplumInstanceCreated.find_by_legacy_id('10036')

        event.workspace.should be_blank
        event.actor.should be_instance_of(User)
        event.greenplum_instance.should be_instance_of(Instance)
      end

      it "copies INSTANCE CREATED (hadoop) data fields from the legacy activity" do
        Events::HadoopInstanceCreated.count.should == 2

        event = Events::HadoopInstanceCreated.find_by_legacy_id('10006')

        event.workspace.should be_blank
        event.actor.should be_instance_of(User)
        event.hadoop_instance.should be_instance_of(HadoopInstance)
      end

      it "copies USER ADDED data fields from the legacy activity" do
        Events::UserAdded.count.should == 7

        event = Events::UserAdded.find_by_legacy_id('10195')

        event.actor.should be_instance_of(User)
        event.new_user.should be_instance_of(User)
      end

      it "copies MEMBERS ADDED data fields from the legacy activity" do
        Events::MembersAdded.count.should == 4

        event = Events::MembersAdded.find_by_legacy_id('10261')

        event.actor.should be_instance_of(User)
        event.member.should be_instance_of(User)
        event.workspace.should be_instance_of(Workspace)
        event.num_added.should == "2"
      end

      it "copies PROVISIONING_FAIL from legacy activity" do
        Events::ProvisioningFail.count.should == 1

        event = Events::ProvisioningFail.find_by_legacy_id('10723')

        event.workspace.should be_blank
        event.actor.should be_instance_of(User)
        event.greenplum_instance.should be_instance_of(Instance)
        event.additional_data['error_message'].should == nil
      end


      it "copies PROVISIONING_SUCCESS from legacy activity" do
        Events::ProvisioningSuccess.count.should == 1

        event = Events::ProvisioningSuccess.find_by_legacy_id('10722')

        event.workspace.should be_blank
        event.actor.should be_instance_of(User)
        event.greenplum_instance.should be_instance_of(Instance)
      end

      it "copies WORKFILE UPGRADED VERSION from legacy activity" do
        Events::WorkfileUpgradedVersion.count.should == 8

        event = Events::WorkfileUpgradedVersion.find_by_legacy_id('10611')

        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
        event.workfile.should be_instance_of(Workfile)
        event.additional_data['version_num'].should == "2"
        event.additional_data['commit_message'].should == "j"
      end
    end
    #
  end
end
