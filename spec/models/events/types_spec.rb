require "spec_helper"

require_relative "helpers"

describe "Event types" do
  extend EventHelpers

  let(:actor) { FactoryGirl.create(:user) }
  let(:greenplum_instance) { FactoryGirl.create(:instance) }
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance) }
  let(:user) { FactoryGirl.create(:user) }
  let(:workfile) { FactoryGirl.create(:workfile) }
  let(:workspace) { workfile.workspace }
  let(:dataset) { FactoryGirl.create(:gpdb_table) }
  let(:hdfs_file) { HdfsFileReference.create({hadoop_instance_id: hadoop_instance.id,
                                              path: "/any/path/should/work.csv"}) }

  describe "GREENPLUM_INSTANCE_CREATED" do
    subject do
      Events::GREENPLUM_INSTANCE_CREATED.add(
          :actor => actor,
          :greenplum_instance => greenplum_instance,
      )
    end

    its(:action) { should == "GREENPLUM_INSTANCE_CREATED" }
    its(:greenplum_instance) { should == greenplum_instance }
    its(:targets) { should == {:greenplum_instance => greenplum_instance} }

    it_creates_activities_for { [actor, greenplum_instance] }
    it_creates_a_global_activity
  end

  describe "HADOOP_INSTANCE_CREATED" do
    subject do
      Events::HADOOP_INSTANCE_CREATED.add(
          :actor => actor,
          :hadoop_instance => hadoop_instance,
      )
    end

    its(:action) { should == "HADOOP_INSTANCE_CREATED" }
    its(:hadoop_instance) { should == hadoop_instance }
    its(:targets) { should == {:hadoop_instance => hadoop_instance} }

    it_creates_activities_for { [actor, hadoop_instance] }
    it_creates_a_global_activity
  end

  describe "GREENPLUM_INSTANCE_CHANGED_OWNER" do
    subject do
      Events::GREENPLUM_INSTANCE_CHANGED_OWNER.add(
          :actor => actor,
          :greenplum_instance => greenplum_instance,
          :new_owner => user
      )
    end

    its(:greenplum_instance) { should == greenplum_instance }
    its(:new_owner) { should == user }
    its(:targets) { should == {:greenplum_instance => greenplum_instance, :new_owner => user} }

    it_creates_activities_for { [user, greenplum_instance] }
    it_creates_a_global_activity
  end

  describe "GREENPLUM_INSTANCE_CHANGED_NAME" do
    subject do
      Events::GREENPLUM_INSTANCE_CHANGED_NAME.add(
          :actor => actor,
          :greenplum_instance => greenplum_instance,
          :old_name => "brent",
          :new_name => "brenda"
      )
    end

    its(:greenplum_instance) { should == greenplum_instance }
    its(:old_name) { should == "brent" }
    its(:new_name) { should == "brenda" }

    its(:targets) { should == {:greenplum_instance => greenplum_instance} }
    its(:additional_data) { should == {:old_name => "brent", :new_name => "brenda"} }

    it_creates_activities_for { [actor, greenplum_instance] }
    it_creates_a_global_activity
  end

  describe "HADOOP_INSTANCE_CHANGED_NAME" do
    subject do
      Events::HADOOP_INSTANCE_CHANGED_NAME.add(
          :actor => actor,
          :hadoop_instance => hadoop_instance,
          :old_name => "brent",
          :new_name => "brenda"
      )
    end

    its(:hadoop_instance) { should == hadoop_instance }
    its(:old_name) { should == "brent" }
    its(:new_name) { should == "brenda" }

    its(:targets) { should == {:hadoop_instance => hadoop_instance} }
    its(:additional_data) { should == {:old_name => "brent", :new_name => "brenda"} }

    it_creates_activities_for { [actor, hadoop_instance] }
    it_creates_a_global_activity
  end

  describe "WORKSPACE_CREATED" do
    context "public workspace" do
      before do
        workspace.public = true
      end

      subject do
        Events::PUBLIC_WORKSPACE_CREATED.add(
          :actor => actor,
          :workspace => workspace
        )
      end

      its(:workspace) { should == workspace }

      its(:targets) { should == { :workspace => workspace } }

      it_creates_activities_for { [actor, workspace] }
      it_creates_a_global_activity
    end

    context "private workspace" do
      before do
        workspace.public = false
      end

      subject do
        Events::PRIVATE_WORKSPACE_CREATED.add(
          :actor => actor,
          :workspace => workspace
        )
      end

      its(:workspace) { should == workspace }

      its(:targets) { should == { :workspace => workspace } }

      it_creates_activities_for { [actor, workspace] }
      it_does_not_create_a_global_activity
    end
  end

  describe "WORKSPACE_MAKE_PUBLIC" do
    before do
      workspace.public = false
    end

    subject do
      Events::WORKSPACE_MAKE_PUBLIC.add(
        :actor => actor,
        :workspace => workspace
      )
    end

    its(:workspace) { should == workspace }

    its(:targets) { should == { :workspace => workspace } }

    it_creates_activities_for { [actor, workspace] }
    it_creates_a_global_activity
  end

  describe "WORKSPACE_MAKE_PRIVATE" do
    before do
      workspace.public = true
    end

    subject do
      Events::WORKSPACE_MAKE_PRIVATE.add(
        :actor => actor,
        :workspace => workspace
      )
    end

    its(:workspace) { should == workspace }

    its(:targets) { should == { :workspace => workspace } }

    it_creates_activities_for { [actor, workspace] }
    it_does_not_create_a_global_activity
  end

  describe "WORKSPACE_ARCHIVED" do
    subject do
      Events::WORKSPACE_ARCHIVED.add(
          :actor => actor,
          :workspace => workspace
      )
    end

    its(:workspace) { should == workspace }

    its(:targets) { should == { :workspace => workspace } }

    it_creates_activities_for { [actor, workspace] }
    it_creates_a_global_activity
  end

  describe "WORKSPACE_UNARCHIVED" do
    subject do
      Events::WORKSPACE_UNARCHIVED.add(
          :actor => actor,
          :workspace => workspace
      )
    end

    its(:workspace) { should == workspace }

    its(:targets) { should == { :workspace => workspace } }

    it_creates_activities_for { [actor, workspace] }
    it_creates_a_global_activity
  end

  describe "WORKFILE_CREATED" do
    subject do
      Events::WORKFILE_CREATED.add(
          :actor => actor,
          :workfile => workfile,
          :workspace => workspace
      )
    end

    its(:workfile) { should == workfile }
    its(:workspace) { should == workspace }

    its(:targets) { should == {:workfile => workfile, :workspace => workspace} }

    it_creates_activities_for { [actor, workfile, workspace] }
    it_does_not_create_a_global_activity
  end

  describe "SOURCE_TABLE_CREATED" do
    subject do
      Events::SOURCE_TABLE_CREATED.add(
          :actor => actor,
          :dataset => dataset,
          :workspace => workspace
      )
    end

    its(:dataset) { should == dataset }
    its(:targets) { should == {:dataset => dataset, :workspace => workspace} }

    it_creates_activities_for { [actor, dataset, workspace] }
    it_creates_a_global_activity
  end

  describe "USER_ADDED" do
    subject do
      Events::USER_ADDED.add(
          :actor => actor,
          :new_user => user
      )
    end

    its(:new_user) { should == user }
    its(:targets) { should == {:new_user => user} }

    it_creates_activities_for { [actor, user] }
    it_creates_a_global_activity
  end

  describe "WORKSPACE_ADD_SANDBOX" do
    subject do
      Events::WORKSPACE_ADD_SANDBOX.add(
          :actor => actor,
          :workspace => workspace
      )
    end

    its(:targets) { should == {:workspace => workspace} }

    it_creates_activities_for { [actor, workspace] }
    it_creates_a_global_activity
  end

  describe "WORKSPACE_ADD_HDFS_AS_EXT_TABLE" do
    subject do
      Events::WORKSPACE_ADD_HDFS_AS_EXT_TABLE.add(
          :actor => actor,
          :workspace => workspace,
          :hdfs_file => hdfs_file,
          :dataset => dataset
      )
    end

    its(:dataset) { should == dataset }
    its(:hdfs_file) { should == hdfs_file }

    its(:targets) { should == {:dataset => dataset, :hdfs_file => hdfs_file, :workspace => workspace} }

    it_creates_activities_for { [actor, dataset, workspace, hdfs_file] }
    it_creates_a_global_activity
  end

  describe "FILE_IMPORT_SUCCESS" do
    subject do
      Events::FILE_IMPORT_SUCCESS.add(
          :actor => actor,
          :dataset => dataset,
          :file_name => 'import.csv',
          :import_type => 'file',
          :workspace => workspace
      )
    end

    its(:dataset) { should == dataset }
    its(:targets) { should == {:workspace => workspace, :dataset => dataset} }
    its(:additional_data) { should == {:file_name => "import.csv", :import_type => "file"} }

    it_creates_activities_for { [actor, workspace, dataset] }
    it_does_not_create_a_global_activity
  end

  describe "DATASET_IMPORT_SUCCESS" do
    let(:source_dataset) {datasets(:bobs_table)}
    subject do
      Events::DATASET_IMPORT_SUCCESS.add(
          :actor => actor,
          :dataset => dataset,
          :source_id => source_dataset.id,
          :workspace => workspace
      )
    end

    its(:dataset) { should == dataset }
    its(:targets) { should == {:workspace => workspace, :dataset => dataset} }
    its(:additional_data) { should == {:source_id => source_dataset.id} }

    it_creates_activities_for { [actor, workspace, dataset] }
    it_does_not_create_a_global_activity

  end

  describe "FILE_IMPORT_FAILED" do
    subject do
      Events::FILE_IMPORT_FAILED.add(
          :actor => actor,
          :file_name => 'import.csv',
          :import_type => 'file',
          :destination_table => 'test',
          :workspace => workspace,
          :error_message => 'Flying Monkey Attack'
      )
    end

    its(:targets) { should == {:workspace => workspace} }
    its(:additional_data) { should == {:file_name => "import.csv", :import_type => "file", :destination_table => 'test', :error_message => 'Flying Monkey Attack'} }

    it_creates_activities_for { [actor, workspace] }
    it_does_not_create_a_global_activity
  end

  describe "DATASET_IMPORT_FAILED" do
    let(:source_dataset) {datasets(:bobs_table)}
    subject do
      Events::DATASET_IMPORT_FAILED.add(
          :actor => actor,
          :source_id => source_dataset.id,
          :destination_table => 'test',
          :workspace => workspace,
          :error_message => 'Flying Monkey Attack again'
      )
    end

    its(:targets) { should == {:workspace => workspace} }
    its(:additional_data) { should == {:source_id => source_dataset.id, :destination_table => 'test', :error_message => 'Flying Monkey Attack again'} }

    it_creates_activities_for { [actor, workspace] }
    it_does_not_create_a_global_activity
  end

  describe "MEMBERS_ADDED" do
    subject do
      Events::MEMBERS_ADDED.add(
          :actor => actor,
          :member => user,
          :workspace => workspace,
          :num_added => 3
      )
    end

    its(:member) { should == user }
    its(:targets) { should == {:member => user, :workspace => workspace} }
    its(:additional_data) { should == {:num_added => 3} }

    it_creates_activities_for { [actor, workspace] }
    it_does_not_create_a_global_activity
  end
end
