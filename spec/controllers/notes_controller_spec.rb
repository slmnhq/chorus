require "spec_helper"

describe NotesController do
  describe "#create" do
    before do
      @user = FactoryGirl.create(:user)
      log_in @user
    end
    
    it "creates a note on a greenplum instance" do
      greenplum_instance = FactoryGirl.create(:greenplum_instance)
      post :create, :note => {:entity_type => "greenplum_instance", :entity_id => greenplum_instance.id, :body => "Some crazy content"}
      response.code.should == "201"

      Events::Note.last.action == Events::NOTE_ON_GREENPLUM_INSTANCE
      Events::Note.last.body.should == "Some crazy content"
    end

    it "creates a note on a hadoop instance" do
      hadoop_instance = FactoryGirl.create(:hadoop_instance)
      post :create, :note => {:entity_type => "hadoop_instance", :entity_id => hadoop_instance .id, :body => "Some crazy content"}
      response.code.should == "201"

      Events::Note.last.action == Events::NOTE_ON_HADOOP_INSTANCE
      Events::Note.last.body.should == "Some crazy content"
    end

    it "creates a note on an hdfs file" do
      post :create, :note => {:entity_type => "hdfs", :entity_id => "1234|/data/test.csv", :body => "Note on hdfs file"}
      response.code.should == "201"

      Events::Note.last.action == Events::NOTE_ON_HDFS_FILE
      Events::Note.last.actor.should == @user
      Events::Note.last.hdfs_file.hadoop_instance_id == 1234
      Events::Note.last.hdfs_file.path.should == "/data/test.csv"
      Events::Note.last.body.should == "Note on hdfs file"
    end
  end

  describe "#update" do
    context "as the note owner" do
      let(:note) { FactoryGirl.create(:note_on_greenplum_instance_event) }
      before do
        log_in note.actor
      end

      it "update the note on an instance" do
        post :update, :id => note.id, :note => {:body => "Some crazy content"}
        response.code.should == "200"

        Events::Note.last.body.should == "Some crazy content"
      end
    end

    context "not as the note owner" do
      let(:note) { FactoryGirl.create(:note_on_greenplum_instance_event) }
      let(:other_user) { FactoryGirl.create(:user) }
      before do
        log_in other_user
      end

      it "update the note on an instance" do
        post :update, :id => note.id, :note => {:body => "Some crazy content"}
        response.code.should == "403"

        Events::Note.last.body.should_not == "Some crazy content"
      end
    end

  end
end
