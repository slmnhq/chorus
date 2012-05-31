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
end