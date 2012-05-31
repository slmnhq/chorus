require "spec_helper" 

describe WorkfileVersion do
  let(:version) { version = FactoryGirl.build(:workfile_version) }
  subject { version }

  describe "methods relating to file type" do
    before do
      version.contents = test_file(filename)
    end

    context "with a gif" do
      let(:filename) { "small1.gif" }
      its(:file_type) { should == "image" }
      its(:image?) { should be_true }
      its(:text?) { should be_false }
    end

    context "with a c++ file" do
      let(:filename) { "code.cpp" }
      its(:file_type) { should == "code" }
      its(:image?) { should be_false }
      its(:text?) { should be_true }
    end

    context "with a text file with the '.txt' extension" do
      let(:filename) { "multiple_extensions.png.xls.txt" }
      its(:file_type) { should == "text" }
      its(:image?) { should be_false }
      its(:text?) { should be_true }
    end

    context "with a sql file" do
      let(:filename) { "workfile.sql" }
      its(:file_type) { should == "sql" }
      its(:image?) { should be_false }
      its(:text?) { should be_true }
    end

    context "with a text file with no extension" do
      let(:filename) { "no_extension" }
      its(:file_type) { should == "text" }
      its(:image?) { should be_false }
      its(:text?)  { should be_true }
    end

    context "with a binary file" do
      let(:filename) { "binary.tar.gz" }
      its(:file_type) { should == "other" }
      its(:image?) { should be_false }
      its(:text?)  { should be_false }
    end
  end

  describe "#Update_content" do

    before do
      version.contents = test_file("workfile.sql")
      version.save
    end

    context "Updating the content of workfile" do
      it "changes the content " do
        version.update_content("this is new content")
        File.read(version.contents.path).should == "this is new content"
      end
    end
  end
end
