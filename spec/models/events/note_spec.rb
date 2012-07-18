require "spec_helper"
require_relative "helpers"

describe "Notes" do
  extend EventHelpers

  let(:actor) { FactoryGirl.create(:user) }
  let(:greenplum_instance) { FactoryGirl.create(:instance) }
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance) }
  let(:workspace) { FactoryGirl.create(:workspace) }
  let(:hdfs_file_reference) do
    HdfsFileReference.create({'path' => '/data/test.csv',
                              'hadoop_instance_id' => 1234})
  end

  it "requires an actor" do
    note = Events::Note.new
    note.valid?
    note.errors.messages[:actor_id].length.should == 1
  end

  describe "NOTE_ON_GREENPLUM_INSTANCE" do
    subject do
      Events::NOTE_ON_GREENPLUM_INSTANCE.add(
          :actor => actor,
          :greenplum_instance => greenplum_instance,
          :body => "This is the body"
      )
    end

    its(:greenplum_instance) { should == greenplum_instance }
    its(:targets) { should == {:greenplum_instance => greenplum_instance} }
    its(:additional_data) { should == {:body => "This is the body"} }

    it_creates_activities_for { [actor, greenplum_instance] }
    it_creates_a_global_activity
  end

  describe "NOTE_ON_HADOOP_INSTANCE" do
    subject do
      Events::NOTE_ON_HADOOP_INSTANCE.add(
          :actor => actor,
          :hadoop_instance => hadoop_instance,
          :body => "This is the body"
      )
    end

    it "sets the instance set correctly" do
      subject.hadoop_instance.should == hadoop_instance
    end

    it "sets the instance as the target" do
      subject.targets.should == {:hadoop_instance => hadoop_instance}
    end

    it "sets the body" do
      subject.body.should == "This is the body"
    end

    it_creates_activities_for { [actor, hadoop_instance] }
    it_creates_a_global_activity
  end

  describe "NOTE_ON_HDFS_FILE" do
    subject do
      Events::NOTE_ON_HDFS_FILE.add(
          :actor => actor,
          :hdfs_file => hdfs_file_reference,
          :body => "This is the text of the note"
      )
    end

    its(:hdfs_file) { should == hdfs_file_reference }
    its(:targets) { should == {:hdfs_file => hdfs_file_reference} }
    its(:additional_data) { should == {:body => "This is the text of the note"} }

    it_creates_activities_for { [actor, hdfs_file_reference] }
    it_creates_a_global_activity
  end

  describe "NOTE_ON_WORKSPACE" do
    subject do
      Events::NOTE_ON_WORKSPACE.add(
        :actor => actor,
        :workspace => workspace,
        :body => "This is the text of the note on the workspace"
      )
    end

    its(:workspace) { should == workspace }
    its(:targets) { should == {:workspace => workspace} }
    its(:additional_data) { should == {:body => "This is the text of the note on the workspace"} }

    it_creates_activities_for { [actor, workspace] }
    it_creates_a_global_activity
  end

  describe "search" do
    it "indexes text fields" do
      Events::Note.should have_searchable_field :body
    end

    describe "with a target" do
      before do
        @note = Events::Note.new(:target1 => actor)
      end

      it "returns the grouping_id of target1" do
        @note.grouping_id.should == @note.target1.grouping_id
      end

      it "returns the type_name of target1" do
        @note.type_name.should == @note.target1.type_name
      end
    end
  end

  describe "#create_for_entity(entity_type, entity_id, body, creator)" do
    let(:user) { FactoryGirl.create(:user) }

    it "creates a note on a greenplum instance" do
      greenplum_instance = FactoryGirl.create(:greenplum_instance)
      Events::Note.create_for_entity("greenplum_instance", greenplum_instance.id, "Some crazy content", user)

      last_note = Events::Note.first
      last_note.action.should == "NOTE_ON_GREENPLUM_INSTANCE"
      last_note.body.should == "Some crazy content"
      last_note.actor.should == user
    end

    it "creates a note on a hadoop instance" do
      hadoop_instance = FactoryGirl.create(:hadoop_instance)
      Events::Note.create_for_entity("hadoop_instance", hadoop_instance.id, "Some crazy content", user)

      last_note = Events::Note.first
      last_note.action.should == "NOTE_ON_HADOOP_INSTANCE"
      last_note.body.should == "Some crazy content"
      last_note.actor.should == user
    end

    it "creates a note on an hdfs file" do
      Events::Note.create_for_entity("hdfs", "1234|/data/test.csv", "Some crazy content", user)

      last_note = Events::Note.first
      last_note.action.should == "NOTE_ON_HDFS_FILE"
      last_note.actor.should == user
      last_note.hdfs_file.hadoop_instance_id == 1234
      last_note.hdfs_file.path.should == "/data/test.csv"
      last_note.body.should == "Some crazy content"
    end

    context "workspace not archived" do
      it "creates a note on a workspace" do
        Events::Note.create_for_entity("workspace", workspace.id, "More crazy content", user)

        last_note = Events::Note.first
        last_note.action.should == "NOTE_ON_WORKSPACE"
        last_note.actor.should == user
        last_note.workspace.id == workspace.id
        last_note.body.should == "More crazy content"
      end
    end

    context "workspace is archived" do
      it "does not create a note on a workspace" do
        workspace.archived_at = DateTime.now
        workspace.save!
        expect {
          Events::Note.create_for_entity("workspace", workspace.id, "More crazy content", user)
        }.to raise_error
      end
    end

    it "raises an exception if the entity type is unknown" do
      expect { Events::Note.create_for_entity("bogus", "wrong", "invalid", user) }.to raise_error
    end
  end
end
