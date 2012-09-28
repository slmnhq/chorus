require 'spec_helper'

describe WorkfileVersionPresenter, :type => :view do
  let(:workfile) { workfiles(:public) }
  let(:owner) { workfile.owner }
  let(:version) { workfile.latest_workfile_version }
  let(:presenter) { WorkfileVersionPresenter.new(version, view, options) }
  let(:options) { {} }

  before(:each) do
    stub(ActiveRecord::Base).current_user { owner }
  end

  describe "#to_hash" do
    let(:workfile_hash) { presenter.to_hash }
    let(:hash) { workfile_hash[:version_info] }

    it "includes the right keys" do
      hash.should have_key(:id)
      hash.should have_key(:version_num)
      hash.should have_key(:commit_message)
      hash.should have_key(:owner)
      hash.should have_key(:modifier)
      hash.should have_key(:created_at)
      hash.should have_key(:updated_at)
      workfile_hash.should have_key(:execution_schema)
    end

    it "uses the user presenter to serialize the owner and modifier" do
      hash[:owner].to_hash.should == UserPresenter.new(owner, view).presentation_hash
      hash[:modifier].to_hash.should == UserPresenter.new(owner, view).presentation_hash
    end

    it "sanitizes values" do
      bad_value = "<script>alert('got your cookie')</script>"

      workfile_version = FactoryGirl.build :workfile_version, :commit_message => bad_value
      workfile_version.contents = test_file('small1.gif')
      workfile_version.workfile = workfile

      json = WorkfileVersionPresenter.new(workfile_version, view).to_hash[:version_info]

      json[:commit_message].should_not match "<"
    end

    context "when not on the workfile page" do
      let(:workfile) { workfiles(:'text.txt') }

      it "should not include the :contents key" do
        hash[:content].should be_nil
      end
    end

    context "when rendering a single workfile version (the contents option is true)" do
      let(:options) { {contents: true} }

      context "when the file is an image" do
        let(:workfile) { workfiles(:'image.png') }

        it "includes the url of the original file" do
          hash[:content_url].should == version.contents.url
        end

        it "uses the thumbnail of the original file for the icon" do
          hash[:icon_url].should == version.contents.url(:icon)
        end

        it "does not include the file's content" do
          hash[:content].should be_nil
        end
      end

      context "when the file is binary" do
        let(:workfile) { workfiles(:'binary.tar.gz') }

        it "includes the url of the file" do
          hash[:content_url].should == version.contents.url
        end

        it "uses a static image for the icon (based on the filetype)" do
          hash[:icon_url].should be_nil
        end

        it "does not include the file's content" do
          hash[:content].should be_nil
        end
      end

      context "when the file is text" do
        let(:workfile) { workfiles(:'text.txt') }

        it "includes the url of the file" do
          hash[:content_url].should == version.contents.url
        end

        it "uses a static image for the icon (based on the filetype)" do
          hash[:icon_url].should be_nil
        end

        it "includes the text of the file" do
          hash[:content].should == File.read(version.contents.path)
        end
      end

      context "when the file is sql" do
        let(:workfile) { workfiles(:'sql.sql') }

        it "includes the url of the file" do
          hash[:content_url].should == version.contents.url
        end

        it "uses a static image for the icon (based on the filetype)" do
          hash[:icon_url].should be_nil
        end

        it "includes the text of the file" do
          hash[:content].should == File.read(version.contents.path)
        end
      end
    end


    context "when rendering the activity stream" do
      let(:options) { {:activity_stream => true} }

      it "does not render the owner or modifier" do
        hash[:owner][:id].should == owner.id
        hash[:modifier][:id].should == owner.id
        hash[:owner].keys.size.should == 1
        hash[:modifier].keys.size.should == 1
      end
    end
  end

  describe "complete_json?" do
    context "when rendering activities" do
      let(:options) { {:activity_stream => true, :contents => true} }
      it "is not true" do
        presenter.complete_json?.should_not be_true
      end
    end

    context "when not including the contents" do
      it "is not true" do
        presenter.complete_json?.should_not be_true
      end
    end

    context "when not rendering activities and including the contents" do
      let(:options) { {:contents => true} }
      it "is true" do
        presenter.complete_json?.should be_true
      end
    end
  end
end
