require "spec_helper"

require_relative "helpers"

describe "Event types" do
  extend EventHelpers

  let(:actor) { FactoryGirl.create(:user) }
  let(:greenplum_instance) { FactoryGirl.create(:gpdb_instance) }
  let(:aurora_instance) { gpdb_instances(:aurora) }
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance) }
  let(:user) { FactoryGirl.create(:user) }
  let(:workfile) { FactoryGirl.create(:workfile) }
  let(:workspace) { workfile.workspace }
  let(:dataset) { FactoryGirl.create(:gpdb_table) }
  let(:hdfs_entry) { hadoop_instance.hdfs_entries.create!(:path => "/any/path/should/work.csv")}

  describe "GreenplumInstanceCreated" do
    subject do
      Events::GreenplumInstanceCreated.add(
          :actor => actor,
          :greenplum_instance => greenplum_instance,
      )
    end

    its(:action) { should == "GreenplumInstanceCreated" }
    its(:greenplum_instance) { should == greenplum_instance }
    its(:targets) { should == {:greenplum_instance => greenplum_instance} }

    it_creates_activities_for { [actor, greenplum_instance] }
    it_creates_a_global_activity
  end

  describe "HadoopInstanceCreated" do
    subject do
      Events::HadoopInstanceCreated.add(
          :actor => actor,
          :hadoop_instance => hadoop_instance,
      )
    end

    its(:action) { should == "HadoopInstanceCreated" }
    its(:hadoop_instance) { should == hadoop_instance }
    its(:targets) { should == {:hadoop_instance => hadoop_instance} }

    it_creates_activities_for { [actor, hadoop_instance] }
    it_creates_a_global_activity
  end

  describe "GreenplumInstanceChangedOwner" do
    subject do
      Events::GreenplumInstanceChangedOwner.add(
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

  describe "GreenplumInstanceChangedName" do
    subject do
      Events::GreenplumInstanceChangedName.add(
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
    its(:additional_data) { should == {'old_name' => "brent", 'new_name' => "brenda"} }

    it_creates_activities_for { [actor, greenplum_instance] }
    it_creates_a_global_activity
  end

  describe "HadoopInstanceChangedName" do
    subject do
      Events::HadoopInstanceChangedName.add(
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
    its(:additional_data) { should == {'old_name' => "brent", 'new_name' => "brenda"} }

    it_creates_activities_for { [actor, hadoop_instance] }
    it_creates_a_global_activity
  end

  describe "ProvisioningSuccess" do
    subject do
      Events::ProvisioningSuccess.add(
          :actor => actor,
          :greenplum_instance => aurora_instance,
      )
    end

    its(:action) { should == "ProvisioningSuccess" }
    its(:greenplum_instance) { should == aurora_instance }
    its(:targets) { should == {:greenplum_instance => aurora_instance} }

    it_creates_activities_for { [actor, aurora_instance] }
    it_creates_a_global_activity
  end

  describe "ProvisioningFail" do
    subject do
      Events::ProvisioningFail.add(
          :actor => actor,
          :greenplum_instance => aurora_instance,
          :error_message => "provisioning has failed"
      )
    end

    its(:action) { should == "ProvisioningFail" }
    its(:greenplum_instance) { should == aurora_instance }
    its(:targets) { should == {:greenplum_instance => aurora_instance} }
    its(:additional_data) { should == {'error_message' => "provisioning has failed"} }

    it_creates_activities_for { [actor, aurora_instance] }
    it_creates_a_global_activity
  end

  describe "WORKSPACE_CREATED" do
    context "public workspace" do
      before do
        workspace.public = true
      end

      subject do
        Events::PublicWorkspaceCreated.add(
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
        Events::PrivateWorkspaceCreated.add(
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

  describe "WorkspaceMakePublic" do
    before do
      workspace.public = false
    end

    subject do
      Events::WorkspaceMakePublic.add(
        :actor => actor,
        :workspace => workspace
      )
    end

    its(:workspace) { should == workspace }

    its(:targets) { should == { :workspace => workspace } }

    it_creates_activities_for { [actor, workspace] }
    it_creates_a_global_activity
  end

  describe "WorkspaceMakePrivate" do
    before do
      workspace.public = true
    end

    subject do
      Events::WorkspaceMakePrivate.add(
        :actor => actor,
        :workspace => workspace
      )
    end

    its(:workspace) { should == workspace }

    its(:targets) { should == { :workspace => workspace } }

    it_creates_activities_for { [actor, workspace] }
    it_does_not_create_a_global_activity
  end

  describe "WorkspaceArchived" do
    subject do
      Events::WorkspaceArchived.add(
          :actor => actor,
          :workspace => workspace
      )
    end

    its(:workspace) { should == workspace }

    its(:targets) { should == { :workspace => workspace } }

    it_creates_activities_for { [actor, workspace] }
    it_creates_a_global_activity
  end

  describe "WorkspaceUnarchived" do
    subject do
      Events::WorkspaceUnarchived.add(
          :actor => actor,
          :workspace => workspace
      )
    end

    its(:workspace) { should == workspace }

    its(:targets) { should == { :workspace => workspace } }

    it_creates_activities_for { [actor, workspace] }
    it_creates_a_global_activity
  end

  describe "WorkfileCreated" do
    subject do
      Events::WorkfileCreated.add(
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

  describe "SourceTableCreated" do
    subject do
      Events::SourceTableCreated.add(
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

  describe "UserAdded" do
    subject do
      Events::UserAdded.add(
          :actor => actor,
          :new_user => user
      )
    end

    its(:new_user) { should == user }
    its(:targets) { should == {:new_user => user} }

    it_creates_activities_for { [actor, user] }
    it_creates_a_global_activity
  end

  describe "WorkspaceAddSandbox" do
    subject do
      Events::WorkspaceAddSandbox.add(
          :actor => actor,
          :workspace => workspace
      )
    end

    its(:targets) { should == {:workspace => workspace} }

    it_creates_activities_for { [actor, workspace] }
    it_creates_a_global_activity
  end

  describe "WorkspaceAddHdfsAsExtTable" do
    subject do
      Events::WorkspaceAddHdfsAsExtTable.add(
          :actor => actor,
          :workspace => workspace,
          :hdfs_file => hdfs_entry,
          :dataset => dataset
      )
    end

    its(:dataset) { should == dataset }
    its(:hdfs_file) { should == hdfs_entry }

    its(:targets) { should == {:dataset => dataset, :hdfs_file => hdfs_entry, :workspace => workspace} }

    it_creates_activities_for { [actor, dataset, workspace, hdfs_entry] }
    it_creates_a_global_activity
  end

  describe "FileImportCreated" do
    subject do
      Events::FileImportCreated.add(
          :actor => actor,
          :dataset => dataset,
          :file_name => 'import.csv',
          :import_type => 'file',
          :workspace => workspace,
          :destination_table => dataset.name
      )
    end

    its(:dataset) { should == dataset }
    its(:targets) { should == {:workspace => workspace, :dataset => dataset} }
    its(:additional_data) { should == {'file_name' => "import.csv", 'import_type' => "file", 'destination_table' => dataset.name } }

    it_creates_activities_for { [actor, workspace, dataset] }
    it_does_not_create_a_global_activity
  end

  describe "FILE_IMPORT_SUCCESS" do
    subject do
      Events::FileImportSuccess.add(
          :actor => actor,
          :dataset => dataset,
          :file_name => 'import.csv',
          :import_type => 'file',
          :workspace => workspace
      )
    end

    its(:dataset) { should == dataset }
    its(:targets) { should == {:workspace => workspace, :dataset => dataset} }
    its(:additional_data) { should == {'file_name' => "import.csv", 'import_type' => "file"} }

    it_creates_activities_for { [actor, workspace, dataset] }
    it_does_not_create_a_global_activity
  end

  describe "DatasetImportCreated" do
    let(:source_dataset) { datasets(:bobs_table) }
    let!(:workspace_association) { workspace.bound_datasets << source_dataset }
    subject do
      Events::DatasetImportCreated.add(
          :actor => actor,
          :dataset => dataset,
          :source_dataset => source_dataset,
          :workspace => workspace,
          :destination_table => dataset.name
      )
    end

    its(:dataset) { should == dataset }
    its(:targets) { should == {:workspace => workspace, :dataset => dataset} }
    its(:additional_data) { should == { 'source_dataset_id' => source_dataset.id, 'destination_table' => dataset.name } }

    it_creates_activities_for { [actor, workspace, dataset] }
    it_does_not_create_a_global_activity
  end

  describe "DatasetImportSuccess" do
    let(:source_dataset) { datasets(:bobs_table) }
    let!(:workspace_association) { workspace.bound_datasets << source_dataset }
    subject do
      Events::DatasetImportSuccess.add(
          :actor => actor,
          :dataset => dataset,
          :source_dataset => source_dataset,
          :workspace => workspace
      )
    end

    its(:dataset) { should == dataset }
    its(:targets) { should == {:workspace => workspace, :dataset => dataset} }
    its(:additional_data) { should == { 'source_dataset_id' => source_dataset.id} }

    it "has a workspace in the source_dataset" do
      subject.source_dataset.bound_workspaces.should include(workspace)
    end

    it_creates_activities_for { [actor, workspace, dataset, source_dataset] }
    it_does_not_create_a_global_activity

  end

  describe "FileImportFailed" do
    subject do
      Events::FileImportFailed.add(
          :actor => actor,
          :file_name => 'import.csv',
          :import_type => 'file',
          :destination_table => 'test',
          :workspace => workspace,
          :error_message => 'Flying Monkey Attack'
      )
    end

    its(:targets) { should == {:workspace => workspace} }
    its(:additional_data) { should == {'file_name' => "import.csv", 'import_type' => "file", 'destination_table' => 'test', 'error_message' => 'Flying Monkey Attack'} }

    it_creates_activities_for { [actor, workspace] }
    it_does_not_create_a_global_activity
  end

  describe "DatasetImportFailed" do
    let(:source_dataset) {datasets(:bobs_table)}
    let!(:workspace_association) { workspace.bound_datasets << source_dataset }
    subject do
      Events::DatasetImportFailed.add(
          :actor => actor,
          :source_dataset => source_dataset,
          :destination_table => 'test',
          :workspace => workspace,
          :error_message => 'Flying Monkey Attack again'
      )
    end

    its(:targets) { should == {:workspace => workspace, :source_dataset => source_dataset} }
    its(:additional_data) { should == {'destination_table' => 'test', 'error_message' => 'Flying Monkey Attack again'} }

    it "has a workspace in the source_dataset" do
      subject.source_dataset.bound_workspaces.should include(workspace)
    end

    it_creates_activities_for { [actor, workspace, source_dataset] }
    it_does_not_create_a_global_activity
  end

  describe "MembersAdded" do
    subject do
      Events::MembersAdded.add(
          :actor => actor,
          :member => user,
          :workspace => workspace,
          :num_added => 3
      )
    end

    its(:member) { should == user }
    its(:targets) { should == {:member => user, :workspace => workspace} }
    its(:additional_data) { should == {'num_added' => 3} }

    it_creates_activities_for { [actor, workspace] }
    it_does_not_create_a_global_activity
  end

  describe "WorkfileUpgradedVersion" do
    subject do
      Events::WorkfileUpgradedVersion.add(
          :actor => actor,
          :workfile => workfile,
          :workspace => workspace,
          :version_num => 2,
          :commit_message => "a nice commit message",
          :version_id => 10
      )
    end

    its(:workfile) { should == workfile }
    its(:workspace) { should == workspace }

    its(:targets) { should == {:workfile => workfile, :workspace => workspace} }
    its(:additional_data) { should == {'version_num' => 2, 'commit_message' => "a nice commit message", 'version_id' => 10} }

    it_creates_activities_for { [actor, workfile, workspace] }
    it_does_not_create_a_global_activity
  end
end
