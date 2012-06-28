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

  describe "GREENPLUM_INSTANCE_CREATED" do
    subject do
      Events::GREENPLUM_INSTANCE_CREATED.add(
        :actor => actor,
        :greenplum_instance => greenplum_instance,
      )
    end

    its(:action)  { should == "GREENPLUM_INSTANCE_CREATED" }
    its(:greenplum_instance) { should == greenplum_instance }
    its(:targets) { should == { :greenplum_instance => greenplum_instance } }

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

    its(:action)  { should == "HADOOP_INSTANCE_CREATED" }
    its(:hadoop_instance) { should == hadoop_instance }
    its(:targets) { should == { :hadoop_instance => hadoop_instance } }

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
    its(:targets) { should == { :greenplum_instance => greenplum_instance, :new_owner => user } }

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

    its(:targets) { should == { :greenplum_instance => greenplum_instance } }
    its(:additional_data) { should == { :old_name => "brent", :new_name => "brenda" } }

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

    its(:targets) { should == { :hadoop_instance => hadoop_instance } }
    its(:additional_data) { should == { :old_name => "brent", :new_name => "brenda" } }

    it_creates_activities_for { [actor, hadoop_instance] }
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

    its(:targets) { should == { :workfile => workfile, :workspace => workspace } }

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
    its(:targets) { should == { :dataset => dataset, :workspace => workspace } }

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
    its(:targets) { should == { :new_user => user } }

    it_creates_activities_for { [actor, user] }
    it_creates_a_global_activity
  end
end
