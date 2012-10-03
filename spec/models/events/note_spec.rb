# encoding: utf-8
require "spec_helper"
require_relative "helpers"

describe Events::Note do
  extend EventHelpers

  let(:actor) { users(:not_a_member) }
  let(:greenplum_instance) { gpdb_instances(:default) }
  let(:hadoop_instance) { hadoop_instances(:hadoop) }
  let(:workspace) { workspaces(:private_with_no_collaborators) }
  let(:workfile) { workfiles(:public)}
  let(:dataset) { datasets(:table) }
  let(:hdfs_entry) do
    hadoop_instance.hdfs_entries.create!(:path => '/data/test.csv',
                                         :modified_at => "2010-10-24 22:00:00")
  end

  describe "associations" do
    it { should belong_to(:promoted_by).class_name('User') }
  end

  it "requires an actor" do
    note = Events::Note.new
    note.valid?
    note.errors.messages[:actor_id].length.should == 1
  end

  describe "NoteOnGreenplumInstance" do
    subject do
      Events::NoteOnGreenplumInstance.add(
          :actor => actor,
          :greenplum_instance => greenplum_instance,
          :body => "This is the body"
      )
    end

    its(:greenplum_instance) { should == greenplum_instance }
    its(:targets) { should == {:greenplum_instance => greenplum_instance} }
    its(:additional_data) { should == {'body' => "This is the body"} }

    it_creates_activities_for { [actor, greenplum_instance] }
    it_creates_a_global_activity
  end

  describe "NoteOnHadoopInstance" do
    subject do
      Events::NoteOnHadoopInstance.add(
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

  describe "NoteOnHdfsFile" do
    subject do
      Events::NoteOnHdfsFile.add(
          :actor => actor,
          :hdfs_file => hdfs_entry,
          :body => "This is the text of the note"
      )
    end

    its(:hdfs_file) { should == hdfs_entry }
    its(:targets) { should == {:hdfs_file => hdfs_entry} }
    its(:additional_data) { should == {'body' => "This is the text of the note"} }

    it_creates_activities_for { [actor, hdfs_entry] }
    it_creates_a_global_activity
  end

  describe "NoteOnWorkspace" do
    subject do
      Events::NoteOnWorkspace.add(
        :actor => actor,
        :workspace => workspace,
        :body => "This is the text of the note on the workspace"
      )
    end

    its(:workspace) { should == workspace }
    its(:targets) { should == {:workspace => workspace} }
    its(:additional_data) { should == {'body' => "This is the text of the note on the workspace"} }

    it_creates_activities_for { [actor, workspace] }
    it_does_not_create_a_global_activity
    it_behaves_like 'event associated with a workspace'

    it "can not be created on an archived workspace" do
      note = Events::NoteOnWorkspace.new(:workspace => workspaces(:archived), :actor => actor, :body => 'WOO!')
      note.valid?
      note.should have_at_least(1).errors_on(:workspace)
    end

    it "is valid if the workspace later becomes archived" do
      subject
      workspace.archived = 'true'
      workspace.archiver = actor
      workspace.save!
      subject.reload
      subject.should be_valid
    end
  end

  describe "NoteOnWorkfile" do
    subject do
      Events::NoteOnWorkfile.add(
        :actor => actor,
        :workfile => workfile,
        :workspace => workspace,
        :body => "This is the text’s of the note on the workfile"
      )
    end

    its(:workfile) { should == workfile }
    its(:targets) { should == {:workfile => workfile} }
    its(:additional_data) { should == {'body' => "This is the text’s of the note on the workfile"} }

    it_creates_activities_for { [actor, workfile, workspace] }
    it_does_not_create_a_global_activity
    it_behaves_like 'event associated with a workspace'

    it "can access associated workfiles when they are deleted" do
      subject
      workfile.destroy
      subject.reload.workfile.should == workfile
      subject.workfile.should be_deleted
    end
  end

  describe "NoteOnDataset" do
    subject do
      Events::NoteOnDataset.add(
        :actor => actor,
        :dataset => dataset,
        :body => "<3 <3 <3"
      )
    end

    its(:dataset) { should == dataset }
    its(:targets) { should == {:dataset => dataset} }
    its(:additional_data) { should == { 'body' => "<3 <3 <3" } }

    it_creates_activities_for { [actor, dataset] }
    it_creates_a_global_activity
  end

  describe "NoteOnWorkspaceDataset" do
    subject do
      Events::NoteOnWorkspaceDataset.add(
        :actor => actor,
        :dataset => dataset,
        :workspace => workspace,
        :body => "<3 <3 <3"
      )
    end

    its(:dataset) { should == dataset }
    its(:targets) { should == {:dataset => dataset, :workspace => workspace} }
    its(:additional_data) { should == { 'body' => "<3 <3 <3" } }

    it_creates_activities_for { [actor, dataset, workspace] }
    it_does_not_create_a_global_activity
  end

  describe "search" do
    it "indexes text fields" do
      Events::Note.should have_searchable_field :body
    end

    describe "with a target" do
      let(:workfile) { workfiles(:public) }
      let(:workspace) { workfile.workspace }

      let(:subclass1) do
        Class.new(Events::Note) { has_targets :workspace, :workfile }
      end
      let(:note) { subclass1.new(:workspace => workspace, :workfile => workfile) }

      it "groups with its first 'target'" do
        note.grouping_id.should == workspace.grouping_id
        note.grouping_id.should_not be_blank
        note.type_name.should == workspace.type_name
        note.type_name.should_not be_blank
      end
    end

    describe "#search_body" do
      it "removes tags from the body" do
        note = Events::Note.first
        note.body = 'this<div>is text</div>'
        note.search_body.should == 'this is text'
      end
    end
  end

  describe "#promote_to_insight" do
    let(:actor) { users(:owner) }
    let(:event) {
      Events::NoteOnGreenplumInstance.add(
          :actor => actor,
          :greenplum_instance => greenplum_instance,
          :body => "This is the body"
      )
    }

    subject { event.promote_to_insight(actor) }
    it { should be_true }

    it "saves the note" do
      expect {
        event.promote_to_insight(actor)
      }.to change(event, :updated_at)
    end

    describe "it saves a note after promoting it to an insight" do
      subject do
        event.promote_to_insight(actor)
        event.reload
      end

      it { should be_insight }
      its(:promoted_by) { should == actor }
      its(:promotion_time) { should be_within(1.minute).of(Time.now) }
    end
  end

  describe "#create_from_params(entity_type, entity_id, body, creator)" do
    let(:user) { users(:owner) }

    it "creates a note on a greenplum instance" do
      greenplum_instance = gpdb_instances(:default)
      Events::Note.create_from_params({
        :entity_type => "greenplum_instance",
        :entity_id => greenplum_instance.id,
        :body => "Some crazy content",
      }, user)

      last_note = Events::Note.first
      last_note.action.should == "NoteOnGreenplumInstance"
      last_note.greenplum_instance.should == greenplum_instance
      last_note.body.should == "Some crazy content"
      last_note.actor.should == user
    end

    it "creates a note on a hadoop instance" do
      hadoop_instance = hadoop_instances(:hadoop)
      Events::Note.create_from_params({
        :entity_type => "hadoop_instance",
        :entity_id => hadoop_instance.id,
        :body => "Some crazy content",
      }, user)

      last_note = Events::Note.first
      last_note.hadoop_instance.should == hadoop_instance
      last_note.action.should == "NoteOnHadoopInstance"
      last_note.body.should == "Some crazy content"
      last_note.actor.should == user
    end

    it "creates a note on an hdfs file" do
      Events::Note.create_from_params({
        :entity_type => "hdfs_file",
        :entity_id => hdfs_entry.id,
        :body => "Some crazy content",
      }, user)

      last_note = Events::Note.first
      last_note.action.should == "NoteOnHdfsFile"
      last_note.actor.should == user
      last_note.hdfs_file.hadoop_instance.should == hadoop_instance
      last_note.hdfs_file.path.should == "/data/test.csv"
      last_note.body.should == "Some crazy content"
    end

    context "workspace not archived" do
      it "creates a note on a workspace" do
        Events::Note.create_from_params({
          :entity_type => "workspace",
          :entity_id => workspace.id,
          :body => "More crazy content",
        }, user)

        last_note = Events::Note.first
        last_note.action.should == "NoteOnWorkspace"
        last_note.actor.should == user
        last_note.workspace.should == workspace
        last_note.body.should == "More crazy content"
      end
    end

    context "workspace is archived" do
      it "does not create a note on a workspace" do
        workspace.archived_at = DateTime.now
        workspace.archiver = user
        workspace.save!
        expect {
          Events::Note.create_from_params({
            :entity_type => "workspace",
            :entity_id => workspace.id,
            :body => "More crazy content",
          }, user)
        }.to raise_error
      end
    end

    it "creates a note on a workfile" do
      Events::Note.create_from_params({
        :entity_type => "workfile",
        :entity_id => workfile.id,
        :body => "Workfile content",
        :workspace_id => workspace.id
      }, user)

      last_note = Events::Note.first
      last_note.action.should == "NoteOnWorkfile"
      last_note.actor.should == user
      last_note.workfile.should == workfile
      last_note.workspace.should == workspace
      last_note.body.should == "Workfile content"
    end

    it "creates a note on a dataset" do
      Events::Note.create_from_params({
        :entity_type => "dataset",
        :entity_id => dataset.id,
        :body => "Crazy dataset content",
      }, user)

      last_note = Events::Note.first
      last_note.action.should == "NoteOnDataset"
      last_note.actor.should == user
      last_note.dataset.should == dataset
      last_note.body.should == "Crazy dataset content"
    end

    it "creates a note on a dataset in a workspace" do
      Events::Note.create_from_params({
        :entity_type => "dataset",
        :entity_id => dataset.id,
        :body => "Crazy workspace dataset content",
        :workspace_id => workspace.id
      }, user)

      last_note = Events::Note.first
      last_note.action.should == "NoteOnWorkspaceDataset"
      last_note.actor.should == user
      last_note.dataset == dataset
      last_note.workspace == workspace
      last_note.body.should == "Crazy workspace dataset content"
    end

    it "doesn't always create insights" do
      Events::Note.create_from_params({
        :entity_type => "dataset",
        :entity_id => dataset.id,
        :body => "Crazy workspace dataset content",
        :workspace_id => workspace.id
      }, user)

      last_note = Events::Note.first
      last_note.insight.should_not == true
      last_note.promoted_by.should == nil
      last_note.promotion_time.should == nil
    end

    it "creates an insight" do
      Events::Note.create_from_params({
        :entity_type => "dataset",
        :entity_id => dataset.id,
        :body => "Crazy workspace dataset content",
        :workspace_id => workspace.id,
        :is_insight => true,
      }, user)

      last_note = Events::Note.first
      last_note.insight.should == true
      last_note.promoted_by.should == user
      last_note.promotion_time.should_not == nil
    end

    it "raises an exception if the entity type is unknown" do
      expect {
        Events::Note.create_from_params({
          :entity_type => "bogus",
          :entity_id => "wrong",
          :body => "invalid"
        }, user)
      }.to raise_error(ModelMap::UnknownEntityType)
    end

    it "raises an exception if there is no model with the given entity id" do
      expect {
        Events::Note.create_from_params({
          :entity_type => "dataset",
          :entity_id => "-1",
          :body => "ok wow"
        }, user)
      }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
