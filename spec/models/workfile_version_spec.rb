require "spec_helper" 

describe WorkfileVersion do
  let!(:workfile) { workfile = FactoryGirl.create(:workfile)}
  let!(:version) { version = FactoryGirl.create(:workfile_version, :workfile => workfile) }
  let!(:version2) { version = FactoryGirl.create(:workfile_version, :workfile => workfile, :version_num => "2") }

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

  describe "validations" do
    # Workaround for paperclip's lack of proper I18n in error messages
    context "when content has error message with exception message" do
      let(:user) { FactoryGirl.create(:user) }

      it "cleans the message" do
        workfile_version = described_class.new({
          :contents => test_file('not_an_image.jpg'),
          :owner => user,
          :modifier => user
        })

        workfile_version.should_not be_valid

        flattened_messages = workfile_version.errors[:contents].flatten

        flattened_messages.should include(:invalid)
        flattened_messages.join.should_not match(/not recognized by the 'identify' command/)
      end
    end
  end

  describe "#Update_content" do
    context "when the version is the latest version" do
      before do
        version2.contents = test_file("workfile.sql")
        version2.save
      end

      context "Updating the content of workfile" do
        it "changes the content " do
          version2.update_content("this is new content")
          File.read(version2.contents.path).should == "this is new content"
        end
      end
    end

    context "when the version is not the latest version" do
      before do
        version.contents = test_file("workfile.sql")
        version.save
      end

      context "Updating the content of workfile" do
        it "raise an error " do
          expect { version.update_content("this is new content") }.to raise_error(ActiveRecord::RecordInvalid)
        end
      end
    end
  end
end
