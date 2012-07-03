require "spec_helper"

describe NotesController do
  before do
    @user = FactoryGirl.create(:user)
    log_in @user
  end

  describe "#create" do
    it "creates a note on an instance" do
      instance = FactoryGirl.create(:instance)
      post :create, :note => {:entity_type => "instance", :entity_id => instance.id, :body => "Some crazy content"}
      response.code.should == "201"

      Events::Note.last.action == Events::NOTE_ON_GREENPLUM_INSTANCE
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
end
