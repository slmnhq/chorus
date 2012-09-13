require 'legacy_migration_spec_helper'

describe ActivityMigrator do
  describe ".migrate" do
    before :all do
      any_instance_of(WorkfileMigrator::LegacyFilePath) do |p|
        # Stub everything with a PNG so paperclip doesn't blow up
        stub(p).path { File.join(Rails.root, "spec/fixtures/small2.png") }
      end

      ActivityMigrator.migrate('workfile_path' => SPEC_WORKFILE_PATH)
    end

    context "migrating activities that reference datasets" do
      it "copies SOURCE TABLE CREATED data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT * from legacy_migrate.edc_activity_stream ed where type = 'SOURCE_TABLE_CREATED'").each do |row|
          count +=1
          event = Events::SourceTableCreated.find_by_legacy_id!(row["id"])
          event.workspace.should be_instance_of(Workspace)
          event.actor.should be_instance_of(User)
          event.dataset.should be_a(Dataset)
          event.created_at.should == row["created_tx_stamp"]
        end
        count.should > 0
        Events::SourceTableCreated.count.should == count
      end

      # ones that come from datasets
      #select eas.* from legacy_migrate.edc_activity_stream eas inner join legacy_migrate.edc_activity_stream_object easo on eas.id = easo.activity_stream_id where type = 'CHORUS_VIEW_CREATED' AND object_id LIKE '%|%' AND easo.entity_type = 'sourceObject';

      # ones that come from workfiles
      #select eas.* from legacy_migrate.edc_activity_stream eas inner join legacy_migrate.edc_activity_stream_object easo on eas.id = easo.activity_stream_id where type = 'CHORUS_VIEW_CREATED' AND object_id NOT LIKE '%|%' AND easo.entity_type = 'sourceObject';

      it "copies CHORUS VIEW CREATED data fields from the legacy activity, for chorus views created from workfiles" do
        count = 0
        Legacy.connection.select_all("
          SELECT eas.*, easo.object_id AS workfile_id FROM legacy_migrate.edc_activity_stream eas
          INNER JOIN legacy_migrate.edc_activity_stream_object easo
            ON eas.id = easo.activity_stream_id
          WHERE type = 'CHORUS_VIEW_CREATED'
          AND object_id NOT LIKE '%|%'
          AND easo.entity_type = 'sourceObject';
          ").each do |row|
          count +=1
          event = Events::ChorusViewCreated.find_by_legacy_id!(row["id"])
          event.workspace.should be_instance_of(Workspace)
          event.actor.should be_instance_of(User)
          event.dataset.should be_a(Dataset)
          event.source_object.should == Workfile.find_by_legacy_id(row['workfile_id'])
          event.created_at.should == row["created_tx_stamp"]
        end
        count.should > 0
        Events::ChorusViewCreated.where(:target2_type => 'Workfile').count.should == 2
      end

      it "copies CHORUS VIEW CREATED data fields from the legacy activity, for chorus views created from datasets" do
        count = 0
        Legacy.connection.select_all("
          SELECT eas.* FROM legacy_migrate.edc_activity_stream eas
          INNER JOIN legacy_migrate.edc_activity_stream_object easo
            ON eas.id = easo.activity_stream_id
          WHERE type = 'CHORUS_VIEW_CREATED'
          AND object_id LIKE '%|%'
          AND easo.entity_type = 'sourceObject';
          ").each do |row|
          count +=1
          event = Events::ChorusViewCreated.find_by_legacy_id!(row["id"])
          event.workspace.should be_instance_of(Workspace)
          event.actor.should be_instance_of(User)
          event.dataset.should be_a(Dataset)
          event.source_object.should be_a(Dataset)
          event.created_at.should == row["created_tx_stamp"]
        end
        count.should > 0
        Events::ChorusViewCreated.where(:target2_type => 'Dataset').count.should == count
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

      it "copies FILE IMPORT CREATED events" do
        count = 0
        Legacy.connection.select_all("SELECT ed.*, aso.object_name as table_name, aso.object_id  from legacy_migrate.edc_activity_stream ed INNER JOIN
          legacy_migrate.edc_activity_stream_object as aso  ON ed.id = aso.activity_stream_id and aso.entity_type = 'table' where
          type = 'IMPORT_CREATED' and indirect_verb = 'of file';").each do |row|
          count +=1

          event = Events::FileImportCreated.find_by_legacy_id(row["id"])
          event.workspace.legacy_id.should == row["workspace_id"]
          event.actor.username.should == row["author"]
          event.dataset.name.should == row["table_name"]
          event.additional_data['filename'].should == row["entity_name"]
          event.additional_data['import_type'].should == "file"
          event.additional_data['destination_table'].should == row["table_name"]
        end
        count.should > 0
        Events::FileImportCreated.count.should == count
      end

      it "copies FILE IMPORT SUCCESS events" do
        count = 0
        Legacy.connection.select_all("SELECT ed.*, aso.object_name as table_name, aso.object_id  from legacy_migrate.edc_activity_stream ed INNER JOIN
          legacy_migrate.edc_activity_stream_object as aso  ON ed.id = aso.activity_stream_id and aso.entity_type = 'table' where
          type = 'IMPORT_SUCCESS' and indirect_verb = 'of file';").each do |row|
          count += 1
          event = Events::FileImportSuccess.find_by_legacy_id(row['id'])
          event.workspace.legacy_id.should == row["workspace_id"]
          event.actor.username.should == row["author"]
          event.dataset.name.should == row["table_name"]
          event.additional_data['filename'].should == row["entity_name"]
          event.additional_data['import_type'].should == "file"
        end
        count.should > 0
        Events::FileImportSuccess.count.should == count
      end

      it "copies FILE IMPORT FAILED events" do
        count = 0
        Legacy.connection.select_all("SELECT ed.*, aso.object_name as table_name, aso.object_id, et.result as result  from legacy_migrate.edc_activity_stream ed INNER JOIN
          legacy_migrate.edc_activity_stream_object as aso  ON ed.id = aso.activity_stream_id and aso.entity_type = 'table'
          INNER JOIN legacy_migrate.edc_activity_stream_object aso2 ON aso2.activity_stream_id = aso.activity_stream_id AND aso2.entity_type = 'task'
          INNER JOIN legacy_migrate.edc_task et ON et.id = aso2.object_id where
          type = 'IMPORT_FAILED' and indirect_verb = 'of file';").each do |row|
          count += 1
          event = Events::FileImportFailed.find_by_legacy_id(row['id'])
          event.workspace.legacy_id.should == row["workspace_id"]
          event.actor.username.should == row["author"]
          event.additional_data['filename'].should == row["entity_name"]
          event.additional_data['import_type'].should == "file"
          event.additional_data['destination_table'].should == row["table_name"]
          event.additional_data['error_message'].should == row["result"]
        end
        count.should > 0
        Events::FileImportFailed.count.should == count
      end

      it "copies DATASET IMPORT CREATED events" do
        count = 0
        Legacy.connection.select_all("SELECT ed.*, aso.object_name as table_name, aso.object_id from legacy_migrate.edc_activity_stream ed INNER JOIN
          legacy_migrate.edc_activity_stream_object as aso  ON ed.id = aso.activity_stream_id and aso.entity_type = 'table' where
          type = 'IMPORT_CREATED' and indirect_verb = 'of dataset';").each do |row|
          count += 1
          event = Events::DatasetImportCreated.find_by_legacy_id(row['id'])
          event.workspace.legacy_id.should == row["workspace_id"]
          event.actor.username.should == row["author"]
          event.additional_data['source_dataset_id'].should_not be_nil
          event.additional_data['destination_table'].should == row["table_name"]
        end
        count.should > 0
        Events::DatasetImportCreated.count.should == count
      end

      it "copies DATASET IMPORT SUCCESS events" do
        count = 0
        Legacy.connection.select_all("SELECT ed.*, aso.object_name as table_name, aso.object_id from legacy_migrate.edc_activity_stream ed INNER JOIN
          legacy_migrate.edc_activity_stream_object as aso  ON ed.id = aso.activity_stream_id and aso.entity_type = 'table' where
          type = 'IMPORT_SUCCESS' and indirect_verb = 'of dataset';").each do |row|
          count += 1
          event = Events::DatasetImportSuccess.find_by_legacy_id(row['id'])
          event.workspace.legacy_id.should == row["workspace_id"]
          event.actor.username.should == row["author"]
          event.additional_data['source_dataset_id'].should_not be_nil
        end
        count.should > 0
        Events::DatasetImportSuccess.count.should == count
      end

      it "copies DATASET IMPORT FAILED events" do
        count = 0
        Legacy.connection.select_all("SELECT ed.*, aso.object_name as table_name, aso.object_id, et.result as result from legacy_migrate.edc_activity_stream ed INNER JOIN
          legacy_migrate.edc_activity_stream_object as aso  ON ed.id = aso.activity_stream_id and aso.entity_type = 'table'
          INNER JOIN legacy_migrate.edc_activity_stream_object aso2 ON aso2.activity_stream_id = aso.activity_stream_id AND aso2.entity_type = 'task'
          INNER JOIN legacy_migrate.edc_task et ON et.id = aso2.object_id where
          type = 'IMPORT_FAILED' and indirect_verb = 'of dataset';").each do |row|
          count += 1
          event = Events::DatasetImportFailed.find_by_legacy_id(row['id'])
          event.workspace.legacy_id.should == row["workspace_id"]
          event.actor.username.should == row["author"]
          event.additional_data['destination_table'].should == row["table_name"]
          event.additional_data['error_message'].should == row["result"]
        end
        count.should > 0
        Events::DatasetImportFailed.count.should == count
      end
    end

    context "migrating events that do not reference datasets" do
      it "copies PUBLIC WORKSPACE CREATED data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.* from legacy_migrate.edc_activity_stream ed INNER JOIN
        legacy_migrate.edc_workspace as ew  ON ew.id = ed.entity_id and ew.is_public = true where
        type = 'WORKSPACE_CREATED' ;").each do |row|
          count += 1
          event = Events::PublicWorkspaceCreated.find_by_legacy_id(row['id'])
          Workspace.unscoped.find(event.workspace_id).legacy_id.should == row['workspace_id']
          event.actor.username.should == row["author"]
        end
        count.should > 0
        Events::PublicWorkspaceCreated.count.should == count
      end

      it "copies PRIVATE WORKSPACE CREATED data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.* from legacy_migrate.edc_activity_stream ed INNER JOIN
        legacy_migrate.edc_workspace as ew  ON ew.id = ed.entity_id and ew.is_public = false where
        type = 'WORKSPACE_CREATED' ;").each do |row|
          count += 1
          event = Events::PrivateWorkspaceCreated.find_by_legacy_id(row['id'])
          Workspace.unscoped.find(event.workspace_id).legacy_id.should == row['workspace_id']
          event.actor.username.should == row["author"]
        end
        count.should > 0
        Events::PrivateWorkspaceCreated.count.should == count
      end

      it "copied WORKSPACE_ARCHIVED data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.* from legacy_migrate.edc_activity_stream ed  where
        type = 'WORKSPACE_ARCHIVED' ;").each do |row|
          count += 1

          event = Events::WorkspaceArchived.find_by_legacy_id(row['id'])
          Workspace.unscoped.find(event.workspace_id).legacy_id.should == row['workspace_id']
          event.actor.username.should == row["author"]
        end
        count.should > 0
        Events::WorkspaceArchived.count.should == count
      end

      it "copied WORKSPACE_UNARCHIVED data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.* from legacy_migrate.edc_activity_stream ed  where
        type = 'WORKSPACE_UNARCHIVED' ;").each do |row|
          count += 1

          event = Events::WorkspaceUnarchived.find_by_legacy_id(row['id'])
          Workspace.unscoped.find(event.workspace_id).legacy_id.should == row['workspace_id']
          event.actor.username.should == row["author"]
        end
        count.should > 0
        Events::WorkspaceUnarchived.count.should == count
      end

      it "copies WORKSPACE MAKE PUBLIC data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.* from legacy_migrate.edc_activity_stream ed  where
        type = 'WORKSPACE_MAKE_PUBLIC' ;").each do |row|
          count += 1

          event = Events::WorkspaceMakePublic.find_by_legacy_id(row['id'])
          Workspace.unscoped.find(event.workspace_id).legacy_id.should == row['workspace_id']
          event.actor.username.should == row["author"]
        end
        count.should > 0
        Events::WorkspaceMakePublic.count.should == count
      end

      it "copies WORKSPACE MAKE PRIVATE data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.* from legacy_migrate.edc_activity_stream ed  where
        type = 'WORKSPACE_MAKE_PRIVATE' ;").each do |row|
          count += 1

          event = Events::WorkspaceMakePrivate.find_by_legacy_id(row['id'])
          Workspace.unscoped.find(event.workspace_id).legacy_id.should == row['workspace_id']
          event.actor.username.should == row["author"]
        end
        count.should > 0
        Events::WorkspaceMakePrivate.count.should == count
      end

      it "copies WORKFILE CREATED data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.*, aso.object_id as workfile_id from legacy_migrate.edc_activity_stream ed INNER JOIN
        legacy_migrate.edc_activity_stream_object as aso  ON aso.activity_stream_id = ed.id and aso.entity_type = 'workfile' where
        type = 'WORKFILE_CREATED' ;").each do |row|
          count += 1
          event = Events::WorkfileCreated.find_by_legacy_id(row['id'])
          Workspace.unscoped.find(event.workspace_id).legacy_id.should == row['workspace_id']
          event.actor.username.should == row["author"]
          Workfile.unscoped.find_by_id(event.target1_id).legacy_id.should == row['workfile_id']
        end
        count.should > 0
        Events::WorkfileCreated.count.should == count
      end

      it "copies INSTANCE CREATED (greenplum) data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.* from legacy_migrate.edc_activity_stream ed
        INNER JOIN legacy_migrate.edc_instance ei ON ei.id = ed.entity_id and ei.instance_provider = 'Greenplum Database'
        where  type = 'INSTANCE_CREATED' ;").each do |row|
          count += 1

          event = Events::GreenplumInstanceCreated.find_by_legacy_id(row['id'])
          event.workspace.should be_blank
          event.actor.username.should == row["author"]
          event.greenplum_instance.legacy_id.should == row['entity_id']
        end
        count.should > 0
        Events::GreenplumInstanceCreated.count.should == count
      end

      it "copies INSTANCE CREATED (hadoop) data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.* from legacy_migrate.edc_activity_stream ed
        INNER JOIN legacy_migrate.edc_instance ei ON ei.id = ed.entity_id and ei.instance_provider = 'Hadoop'
        where  type = 'INSTANCE_CREATED' ;").each do |row|
          count += 1

          event = Events::HadoopInstanceCreated.find_by_legacy_id(row['id'])

          event.workspace.should be_blank
          event.actor.username.should == row["author"]
          event.hadoop_instance.legacy_id.should == row['entity_id']
        end
        count.should > 0
        Events::HadoopInstanceCreated.count.should == count
      end

      it "copies USER ADDED data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.* from legacy_migrate.edc_activity_stream ed
         where  type = 'USER_ADDED';").each do |row|
          count += 1
          event = Events::UserAdded.find_by_legacy_id(row['id'])
          event.actor.username.should == row["author"]
          event.new_user.legacy_id.should == row['entity_id']
        end
        count.should > 0
        Events::UserAdded.count.should == count
      end

      it "copies MEMBERS ADDED data fields from the legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.*, count(aso) AS count from legacy_migrate.edc_activity_stream ed
        INNER JOIN legacy_migrate.edc_activity_stream_object aso ON aso.activity_stream_id = ed.id and aso.object_type = 'object'
         where  type = 'MEMBERS_ADDED' GROUP BY ed.id;").each do |row|
          count += 1
          event = Events::MembersAdded.find_by_legacy_id(row['id'])
          event.actor.username.should == row["author"]
          event.num_added.should == row['count'].to_s
        end
        count.should > 0
        Events::MembersAdded.count.should == count
      end

      it "copies PROVISIONING_FAIL from legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.* from legacy_migrate.edc_activity_stream ed
          where  type = 'PROVISIONING_FAIL';").each do |row|
          count += 1
          event = Events::ProvisioningFail.find_by_legacy_id(row['id'])
          event.actor.username.should == row["author"]
          event.workspace.should be_blank
          event.greenplum_instance.legacy_id.should == row['entity_id']
          event.additional_data['error_message'].should == nil
        end
        count.should > 0
        Events::ProvisioningFail.count.should == count
      end


      it "copies PROVISIONING_SUCCESS from legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.* from legacy_migrate.edc_activity_stream ed
          where  type = 'PROVISIONING_SUCCESS';").each do |row|
          count += 1
          event = Events::ProvisioningSuccess.find_by_legacy_id(row['id'])
          event.actor.username.should == row["author"]
          event.workspace.should be_blank
          event.greenplum_instance.legacy_id.should == row['entity_id']
          event.additional_data['error_message'].should == nil
        end
        count.should > 0
        Events::ProvisioningSuccess.count.should == count
      end

      it "copies WORKFILE UPGRADED VERSION from legacy activity" do
        count = 0
        Legacy.connection.select_all("SELECT ed.*, aso.object_id as version_num, aso2.object_id as workfile_id, ewv.commit_message as commit_message from legacy_migrate.edc_activity_stream ed
          INNER JOIN legacy_migrate.edc_activity_stream_object aso ON aso.activity_stream_id = ed.id AND aso.entity_type = 'version'
          INNER JOIN legacy_migrate.edc_activity_stream_object aso2 ON aso2.activity_stream_id = ed.id AND aso2.entity_type = 'workfile'
          INNER JOIN legacy_migrate.edc_workfile_version ewv ON ewv.workfile_id = aso2.object_id AND ewv.version_num =aso.object_id ::integer
          where  type = 'WORKFILE_UPGRADED_VERSION';").each do |row|
          count += 1

          event = Events::WorkfileUpgradedVersion.find_by_legacy_id(row["id"])

          Workspace.unscoped.find(event.workspace_id).legacy_id.should == row['workspace_id']
          event.actor.username.should == row["author"]
          Workfile.unscoped.find_by_id(event.target1_id).legacy_id.should == row['workfile_id']
          event.additional_data['version_num'].should == row['version_num']
          event.additional_data['commit_message'].should == row['commit_message']
        end
        count.should > 0
        Events::WorkfileUpgradedVersion.count.should == count
      end
    end

    it "should create activities" do
      Activity.count.should > 0
    end
  end
end
