require 'spec_helper'

describe WorkfileVersionPresenter, :type => :view do
  before(:each) do
    @owner = FactoryGirl.create :user
    workfile = FactoryGirl.create :workfile, :owner => @owner

    @version = FactoryGirl.build(:workfile_version, :workfile => workfile, :owner => @owner, :modifier => @owner)
    @version.contents = test_file(file_name, mime_type)
    @version.save!
    @presenter = WorkfileVersionPresenter.new(@version, view)
  end


  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    let(:file_name) { "small1.gif" }
    let(:mime_type) { "image/gif" }

    it "includes the right keys" do
      @hash.should have_key(:id)
      @hash.should have_key(:version_num)
      @hash.should have_key(:commit_message)
      @hash.should have_key(:owner)
      @hash.should have_key(:modifier)
      @hash.should have_key(:created_at)
      @hash.should have_key(:updated_at)
    end

    it "uses the user presenter to serialize the owner and modifier" do
      @hash[:owner].to_hash.should == UserPresenter.new(@owner, view).to_hash
      @hash[:modifier].to_hash.should == UserPresenter.new(@owner, view).to_hash
    end

    it "sanitizes values" do
      bad_value = "<script>alert('got your cookie')</script>"
      fields_to_sanitize = [:commit_message]

      dangerous_params = fields_to_sanitize.inject({}) { |params, field| params.merge(field => bad_value) }

      workfile_version = FactoryGirl.build :workfile_version, dangerous_params
      json = WorkfileVersionPresenter.new(workfile_version, view).to_hash

      fields_to_sanitize.each do |sanitized_field|
        json[sanitized_field].should_not match "<"
      end
    end

    context "when the file is an image" do
      it "includes the url of the original file" do
        @hash[:content_url].should == @version.contents.url
      end

      it "uses the thumbnail of the original file for the icon" do
        @hash[:icon_url].should == @version.contents.url(:icon)
      end

      it "does not include the file's content" do
        @hash[:content].should be_nil
      end
    end

    context "when the file is binary" do
      let(:file_name) { "binary.tar.gz" }
      let(:mime_type) { "application/octet-stream" }

      it "includes the url of the file" do
        @hash[:content_url].should == @version.contents.url
      end

      it "uses a static image for the icon (based on the filetype)" do
        @hash[:icon_url].should be_nil
      end

      it "does not include the file's content" do
        @hash[:content].should be_nil
      end
    end

    context "when the file is text" do
      let(:file_name) { "workfile.sql" }
      let(:mime_type) { "text/plain" }

      it "includes the url of the file" do
        @hash[:content_url].should == @version.contents.url
      end

      it "uses a static image for the icon (based on the filetype)" do
        @hash[:icon_url].should be_nil
      end

      it "includes the text of the file" do
        @hash[:content].should == File.read(@version.contents.path)
      end
    end
  end
end
