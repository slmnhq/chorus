require 'legacy_migration_spec_helper'

describe CommentMigrator do
  before :all do
    any_instance_of(WorkfileMigrator::LegacyFilePath) do |p|
      # Stub everything with a PNG so paperclip doesn't blow up
      stub(p).path { File.join(Rails.root, "spec/fixtures/small2.png") }
    end

    CommentMigrator.migrate('workfile_path' => SPEC_WORKFILE_PATH)
  end

  describe ".migrate" do
    it "migrates comments on notes" do
      count = 0
      Legacy.connection.select_all("
        SELECT ec.*
        FROM edc_comment ec
          INNER JOIN edc_user eu
            ON ec.author_name = eu.user_name
        WHERE entity_type = 'comment'
      ").each do |legacy_comment|
        count += 1
        comment = Comment.find_with_destroyed(:first, :conditions => { :legacy_id => legacy_comment["id"]} )
        comment.text.should == legacy_comment["body"]
        comment.event_id.should == Events::Base.find_with_destroyed(:first, :conditions => { :legacy_id => legacy_comment["entity_id"], :legacy_type => "edc_comment" }).id
        comment.author_id.should == User.find_with_destroyed(:first, :conditions => {:username => legacy_comment["author_name"]}).id
        comment.created_at.should == legacy_comment["created_stamp"]
        comment.updated_at.should == legacy_comment["last_updated_stamp"]
        comment.deleted_at.should == legacy_comment["last_updated_stamp"] if legacy_comment["is_deleted"] == 't'
      end
      count.should > 0
    end

    it "migrates comments on system generated activities" do
      count = 0
      Legacy.connection.select_all("
        SELECT ec.*
        FROM edc_comment ec
          INNER JOIN edc_user eu
            ON ec.author_name = eu.user_name
        WHERE entity_type = 'activitystream'
      ").each do |legacy_comment|
        count += 1
        comment = Comment.find_with_destroyed(:first, :conditions => {:legacy_id => legacy_comment["id"]})
        comment.text.should == legacy_comment["body"]
        comment.event_id.should == Events::Base.find_with_destroyed(:first, :conditions => { :legacy_id => legacy_comment["entity_id"], :legacy_type => "edc_activity_stream" }).id
        comment.author_id.should == User.find_with_destroyed(:first, :conditions => {:username => legacy_comment["author_name"]}).id
        comment.created_at.should == legacy_comment["created_stamp"]
        comment.updated_at.should == legacy_comment["last_updated_stamp"]
        comment.deleted_at.should == legacy_comment["last_updated_stamp"] if legacy_comment["is_deleted"] == 't'
      end
      count.should > 0
    end

    it "has all the comments" do
      count = 0
      Legacy.connection.select_all("
      SELECT *
        FROM edc_comment
        WHERE entity_type = 'comment'
        OR entity_type = 'activitystream'
      ").each do |legacy_comment|
        count += 1
      end
      Comment.find_with_destroyed(:all).count.should == count
    end

    it "is idempotent" do
      count = Comment.unscoped.count
      CommentMigrator.migrate('workfile_path' => SPEC_WORKFILE_PATH)
      Comment.unscoped.count.should == count
    end
  end
end

