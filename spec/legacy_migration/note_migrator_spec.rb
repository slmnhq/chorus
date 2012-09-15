require 'legacy_migration_spec_helper'

describe NoteMigrator do
  before :all do
    any_instance_of(WorkfileMigrator::LegacyFilePath) do |p|
      # Stub everything with a PNG so paperclip doesn't blow up
      stub(p).path { File.join(Rails.root, "spec/fixtures/small2.png") }
    end

    NoteMigrator.migrate('workfile_path' => SPEC_WORKFILE_PATH)
  end

  describe ".migrate" do
    it "should migrate the Notes on Greenplum Instance to the new database" do
      count = 0
      Legacy.connection.select_all("
        SELECT ec.*
        FROM edc_comment ec
          INNER JOIN edc_instance
            ON edc_instance.id = ec.entity_id AND edc_instance.instance_provider = 'Greenplum Database'
          INNER JOIN edc_user eu
            ON ec.author_name = eu.user_name
        WHERE entity_type = 'instance'
      ").each do |legacy_comment|
        count += 1
        note = Events::NoteOnGreenplumInstance.find_with_destroyed(:first, :conditions => {:legacy_id => legacy_comment["id"]})
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(:first, :conditions => {:username => legacy_comment["author_name"]}).id
        note.greenplum_instance.legacy_id.should == legacy_comment["entity_id"]
        note.deleted_at.should == legacy_comment["last_updated_stamp"] if legacy_comment["is_deleted"] == 't'
      end
      count.should > 0
      Events::NoteOnGreenplumInstance.find_with_destroyed(:all).count.should == count
    end

    it "should migrate the Notes on Hadoop Instance to the new database" do
      count = 0
      Legacy.connection.select_all("
        SELECT ec.*
        FROM edc_comment ec
          INNER JOIN edc_instance
            ON edc_instance.id = ec.entity_id AND edc_instance.instance_provider = 'Hadoop'
          INNER JOIN edc_user eu
            ON ec.author_name = eu.user_name
        WHERE entity_type = 'instance'
      ").each do |legacy_comment|
        count += 1
        note = Events::NoteOnHadoopInstance.find_with_destroyed(:first, :conditions => {:legacy_id => legacy_comment["id"]})
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(:first, :conditions => {:username => legacy_comment["author_name"]}).id
        note.hadoop_instance.legacy_id.should == legacy_comment["entity_id"]
        note.deleted_at.should == legacy_comment["last_updated_stamp"] if legacy_comment["is_deleted"] == 't'
      end
      count.should > 0
      Events::NoteOnHadoopInstance.find_with_destroyed(:all).count.should == count
    end

    it "should migrate the Notes on HDFS files to the new database" do
      count = 0
      Legacy.connection.select_all("
        SELECT ec.*
        FROM edc_comment ec,
          edc_user eu
        WHERE entity_type = 'hdfs'
          AND ec.author_name = eu.user_name
      ").each do |legacy_comment|
        count += 1
        note = Events::NoteOnHdfsFile.find_with_destroyed(:first, :conditions => {:legacy_id => legacy_comment["id"]})
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(:first, :conditions => {:username => legacy_comment["author_name"]}).id
        "#{note.hdfs_file.hadoop_instance.legacy_id}|#{note.hdfs_file.path}".should == legacy_comment["entity_id"]
        note.deleted_at.should == legacy_comment["last_updated_stamp"] if legacy_comment["is_deleted"] == 't'
      end
      count.should > 0
      Events::NoteOnHdfsFile.find_with_destroyed(:all).count.should == count
    end


    it "should migrate the Notes on Workspaces to the new database" do
      count = 0
      Legacy.connection.select_all("
        SELECT ec.*
        FROM edc_comment ec,edc_user eu
        WHERE entity_type = 'workspace' and ec.author_name = eu.user_name
      ").each do |legacy_comment|
        count += 1
        note = Events::NoteOnWorkspace.find_with_destroyed(:first, :conditions => {:legacy_id => legacy_comment["id"]})
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(:first, :conditions => {:username => legacy_comment["author_name"]}).id
        Workspace.unscoped.find(note.workspace_id).legacy_id.should == legacy_comment["entity_id"]
        note.deleted_at.should == legacy_comment["last_updated_stamp"] if legacy_comment["is_deleted"] == 't'
      end
      count.should > 0
      Events::NoteOnWorkspace.find_with_destroyed(:all).count.should == count
    end

    it "should migrate the Notes on Workfiles to the new database" do
      count = 0
      Legacy.connection.select_all("
        SELECT ec.*
        FROM edc_comment ec,edc_user eu
        WHERE entity_type = 'workfile' and ec.author_name = eu.user_name
      ").each do |legacy_comment|
        count += 1
        note = Events::NoteOnWorkfile.find_with_destroyed(:first, :conditions => {:legacy_id => legacy_comment["id"]})
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(:first, :conditions => {:username => legacy_comment["author_name"]}).id
        note.workfile.legacy_id.should == legacy_comment["entity_id"]
        note.deleted_at.should == legacy_comment["last_updated_stamp"] if legacy_comment["is_deleted"] == 't'
      end
      count.should > 0
      Events::NoteOnWorkfile.find_with_destroyed(:all).count.should == count
    end

    it "should migrate the Notes on Workspace Dataset" do
      count = 0
      Legacy.connection.select_all("
        SELECT ec.*
        FROM edc_comment ec, edc_user eu
        WHERE entity_type = 'databaseObject' and ec.author_name = eu.user_name AND ec.workspace_id IS NOT NULL
      ").each do |legacy_comment|
        count += 1
        note = Events::NoteOnWorkspaceDataset.find_with_destroyed(:first, :conditions => {:legacy_id => legacy_comment["id"]})
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(:first, :conditions => {:username => legacy_comment["author_name"]}).id
        note.workspace.legacy_id.should == legacy_comment["workspace_id"]
        note.dataset.legacy_id.should == legacy_comment["entity_id"].gsub('"', "")
        note.deleted_at.should == legacy_comment["last_updated_stamp"] if legacy_comment["is_deleted"] == 't'
      end
      count.should > 0
      Events::NoteOnWorkspaceDataset.find_with_destroyed(:all).count.should == count
    end

    it "should migrate the Notes on Dataset" do
      count = 0
      Legacy.connection.select_all("
        SELECT ec.*
        FROM edc_comment ec, edc_user eu
        WHERE entity_type = 'databaseObject' and ec.author_name = eu.user_name AND ec.workspace_id IS NULL
      ").each do |legacy_comment|
        count += 1
        note = Events::NoteOnDataset.find_with_destroyed(:first, :conditions => {:legacy_id => legacy_comment["id"]})
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(:first, :conditions => {:username => legacy_comment["author_name"]}).id
        note.dataset.legacy_id.should == legacy_comment["entity_id"].gsub('"', "")
        note.deleted_at.should == legacy_comment["last_updated_stamp"] if legacy_comment["is_deleted"] == 't'
      end
      count.should > 0
      Events::NoteOnDataset.find_with_destroyed(:all).count.should == count
    end

    it "is idempotent" do
      count = Events::Note.unscoped.count
      NoteMigrator.migrate('workfile_path' => SPEC_WORKFILE_PATH)
      Events::Note.unscoped.count.should == count
    end

    it "migrates all the notes" do
      Legacy.connection.select_all("
        SELECT count(*) as count
        FROM edc_comment
        WHERE entity_type NOT IN ('comment', 'activitystream')
      ").first["count"].should == Events::Note.unscoped.count
    end
  end
end
