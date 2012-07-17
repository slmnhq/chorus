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

    context "normalize the file name" do
      let!(:another_workfile) { FactoryGirl.create(:workfile, :file_name => 'workfile.sql') }

      context "first conflict" do
        it "renames and turns the workfile valid" do
          workfile = Workfile.new :file_name => 'workfile.sql'
          workfile.workspace = another_workfile.workspace
          workfile.owner = another_workfile.owner

          workfile.save
          workfile.should be_valid
          workfile.file_name.should == 'workfile_1.sql'
        end
      end

      context "multiple conflicts" do
        let(:workspace) { FactoryGirl.create(:workspace) }
        let!(:another_workfile_1) { FactoryGirl.create(:workfile, :workspace => workspace, :file_name => 'workfile.sql') }
        let!(:another_workfile_2) { FactoryGirl.create(:workfile, :workspace => workspace, :file_name => 'workfile.sql') }

        it "increases the version number" do
          workfile = Workfile.new :file_name => 'workfile.sql'
          workfile.workspace = workspace
          workfile.owner = another_workfile_1.owner

          workfile.save
          workfile.should be_valid
          workfile.file_name.should == 'workfile_2.sql'
        end
      end
    end
  end

  describe ".create_from_file_upload" do
    let(:user) { users(:admin) }
    let(:workspace) { workspaces(:alice_public)}


    shared_examples "file upload" do
      it "creates a workfile in the database" do
        subject.should be_valid
        subject.should be_persisted
      end

      it "creates a workfile version in the database" do
        subject.versions.should have(1).version

        version = subject.versions.first
        version.should be_valid
        version.should be_persisted
      end

      it "sets the attributes of the workfile" do
        subject.owner.should == user
        subject.file_name.should == 'workfile.sql'
      end

      it "sets the modifier of the first, recently created version" do
        subject.versions.first.modifier.should == user
      end

      it "sets the attributes of the workfile version" do
        version = subject.versions.first

        version.contents.should be_present
        version.version_num.should == 1
      end
    end

    context "with versions" do
      let(:attributes) do
        {
          :versions_attributes => [{
            :contents => test_file('workfile.sql')
          }]
        }
      end

      subject { described_class.create_from_file_upload(attributes, workspace, user) }

      it_behaves_like "file upload"

      it "sets the content of the workfile" do
        subject.versions.first.contents.size.should > 0
      end
    end

    context "without a version" do
      subject { described_class.create_from_file_upload({:file_name => 'workfile.sql'}, workspace, user) }

      it_behaves_like "file upload"

      it "sets the file as blank" do
        subject.versions.first.contents.size.should == 0
      end
    end
  end

  describe "#build_new_version" do

    let(:user) { FactoryGirl.create(:user) }
    let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
    let(:workfile) { FactoryGirl.create(:workfile, :workspace => workspace, :file_name => 'workfile.sql') }

    context "when there is a previous version" do
      let(:workfile_version) { FactoryGirl.build(:workfile_version, :workfile => workfile) }

      before do
        workfile_version.contents = test_file('workfile.sql')
        workfile_version.save
      end

      it "build a new version with version number increased by 1 " do
        workfile_version = workfile.build_new_version(user, test_file('workfile.sql'), "commit Message")
        workfile_version.version_num.should == 2
        workfile_version.commit_message.should == "commit Message"
        workfile_version.should_not be_persisted
      end
    end

    context "creating the first version" do
      it "build a version with version number as 1" do
        workfile_version = workfile.build_new_version(user, test_file('workfile.sql'), "commit Message")
        workfile_version.version_num.should == 1
        workfile_version.commit_message.should == "commit Message"
        workfile_version.should_not be_persisted
      end
    end
  end

  describe ".by_type" do
    let(:user) { users(:admin) }
    let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
    let!(:workfile1) { FactoryGirl.create(:workfile, :file_name => "small1.gif", :workspace => workspace) }
    let!(:workfile2) { FactoryGirl.create(:workfile, :file_name => "some.txt", :workspace => workspace) }
    let!(:workfile3) { FactoryGirl.create(:workfile, :file_name => "binary.tar.gz", :workspace => workspace) }
    let!(:workfile4) { FactoryGirl.create(:workfile, :file_name => "code.cpp", :workspace => workspace) }

    before do
      file1 = test_file("small1.gif", "image/gif")
      file2 = test_file("some.txt", "text/plain")
      file3 = test_file("binary.tar.gz", "application/octet-stream")
      file4 = test_file("code.cpp", "text/plain")

      FactoryGirl.create(:workfile_version, :workfile => workfile1, :contents => file1)
      FactoryGirl.create(:workfile_version, :workfile => workfile2, :contents => file2)
      FactoryGirl.create(:workfile_version, :workfile => workfile3, :contents => file3)
      FactoryGirl.create(:workfile_version, :workfile => workfile4, :contents => file4)
    end

    it "returns workfiles with text file type" do
      workfiles = Workfile.by_type("text")
      workfiles.should have(1).files # TODO: is code also text?
      workfiles[0].file_name.should == "some.txt"
    end

    it "returns workfiles with sql file type" do
      # We get SQL data from the fixtures

      workfiles = Workfile.by_type("SQL")
      workfiles.should have(3).files
      workfiles[0].file_name.should == "Alice Private"
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
      workfiles.size.should == Workfile.all.count { |w| w.last_version.file_type == 'other' }
    end
  end

  describe "#has_draft" do
    let(:user) { FactoryGirl.create(:user) }
    let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
    let!(:workfile1) { FactoryGirl.create(:workfile, :file_name => "some.txt", :workspace => workspace) }
    let!(:workfile2) { FactoryGirl.create(:workfile, :file_name => "workfile.sql", :workspace => workspace) }
    let!(:draft) { FactoryGirl.create(:workfile_draft, :workfile_id => workfile1.id, :owner_id => user.id) }

    it "has_draft return true for workfile1" do
      workfile1.has_draft(user).should == true
    end

    it "has_draft return false for workfile2" do
      workfile2.has_draft(user).should == false
    end
  end

  describe "associations" do
    it { should belong_to :owner }
    it { should have_many :activities }
    it { should have_many :events }
  end

  describe "search fields" do
    it "indexes text fields" do
      Workfile.should have_searchable_field :file_name
      Workfile.should have_searchable_field :description
    end
  end
end
