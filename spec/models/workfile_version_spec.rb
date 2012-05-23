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
      its(:extension) { should == "GIF" }
      its(:image?) { should be_true }
      its(:text?) { should be_false }
    end

    context "with a text file with the '.txt' extension" do
      let(:filename) { "multiple_extensions.png.xls.txt" }
      its(:extension) { should == "TXT" }
      its(:image?) { should be_false }
      its(:text?) { should be_true }
    end

    context "with a text file with no extension" do
      let(:filename) { "no_extension" }
      its(:extension) { should be_nil }
      its(:image?) { should be_false }
      its(:text?)  { should be_true }
    end

    context "with a binary file" do
      let(:filename) { "binary.tar.gz" }
      its(:extension) { should == "GZ" }
      its(:image?) { should be_false }
      its(:text?)  { should be_false }
    end
  end
end
