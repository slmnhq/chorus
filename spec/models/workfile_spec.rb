require 'spec_helper'

describe Workfile do
  describe "validations" do
    context "file name with valid characters" do
      it "is valid" do
        workfile = Workfile.new :file_name => 'work_(-file).sql'

        workfile.should be_valid
      end
    end

    context "file name with question mark" do
      it "is not valid" do
        workfile = Workfile.new :file_name => 'workfile?.sql'


        workfile.should_not be_valid
        workfile.errors[:file_name].should_not be_empty
      end
    end
  end

  describe "#create_new_version" do

    let(:user) { FactoryGirl.create(:user) }
    let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
    let(:workfile) { FactoryGirl.create(:workfile, :workspace => workspace, :file_name => 'workfile.sql') }

    context "when there is a previous version" do
      let(:workfile_version) { FactoryGirl.build(:workfile_version, :workfile => workfile) }

      before do
        workfile_version.contents = test_file('workfile.sql')
        workfile_version.save
      end

      it "creates a new version with version number increased by 1 " do
        workfile_version = workfile.create_new_version(user, test_file('workfile.sql'), "commit Message")
        workfile_version.version_num.should == 2
        workfile_version.commit_message.should == "commit Message"
        workfile_version.should be_persisted
      end
    end

    context "creating the first version" do
      it "create a version with version number as 1" do
        workfile_version = workfile.create_new_version(user, test_file('workfile.sql'), "commit Message")
        workfile_version.version_num.should == 1
        workfile_version.commit_message.should == "commit Message"
        workfile_version.should be_persisted
      end
    end
  end
  
  describe ".by_type" do
    let(:user) { FactoryGirl.create(:user) }
    let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
    let!(:workfile1) { FactoryGirl.create(:workfile, :file_name => "small1.gif",:workspace => workspace) }
    let!(:workfile2) { FactoryGirl.create(:workfile, :file_name => "some.txt",:workspace => workspace) }
    let!(:workfile3) { FactoryGirl.create(:workfile, :file_name => "workfile.sql",:workspace => workspace) }
    let!(:workfile4) { FactoryGirl.create(:workfile, :file_name => "binary.tar.gz",:workspace => workspace) }
    let!(:workfile5) { FactoryGirl.create(:workfile, :file_name => "code.cpp",:workspace => workspace) }

    before do
      file1 = test_file("small1.gif", "image/gif")
      file2 = test_file("some.txt", "text/plain")
      file3 = test_file("workfile.sql", "text/sql")
      file4 = test_file("binary.tar.gz", "application/octet-stream")
      file5 = test_file("code.cpp", "text/plain")

      FactoryGirl.create(:workfile_version, :workfile => workfile1, :contents => file1)
      FactoryGirl.create(:workfile_version, :workfile => workfile2, :contents => file2)
      FactoryGirl.create(:workfile_version, :workfile => workfile3, :contents => file3)
      FactoryGirl.create(:workfile_version, :workfile => workfile4, :contents => file4)
      FactoryGirl.create(:workfile_version, :workfile => workfile5, :contents => file5)
    end

    it "returns workfiles with text file type" do
      workfiles = Workfile.by_type("text")
      workfiles.should have(1).files  # TODO: is code also text?
      workfiles[0].file_name.should == "some.txt"
    end

    it "returns workfiles with sql file type" do
      workfiles = Workfile.by_type("SQL")
      workfiles.should have(1).files
      workfiles[0].file_name.should == "workfile.sql"
    end

    it "returns workfiles with image file type" do
      workfiles = Workfile.by_type("image")
      workfiles.should have(1).files
      workfiles[0].file_name.should == "small1.gif"
    end

    it "returns workfiles with code file type" do
      workfiles = Workfile.by_type("code")
      workfiles.should have(1).files
      workfiles[0].file_name.should == "code.cpp"
    end

    it "returns workfiles with other file type" do
      workfiles = Workfile.by_type("other")
      workfiles.should have(1).files
      workfiles[0].file_name.should == "binary.tar.gz"
    end
  end
end