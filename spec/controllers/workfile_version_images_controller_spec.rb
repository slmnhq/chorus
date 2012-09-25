require 'spec_helper'

describe WorkfileVersionImagesController do
  ignore_authorization!
  let(:user) { users(:owner) }
  let(:workfile) { workfiles(:public) }
  let!(:version) { FactoryGirl.create(:workfile_version, :workfile => workfile) }

  before do
    log_in user
  end

  describe "#show" do
    it "returns the file" do
      version.contents = test_file('small1.gif')
      version.save
      get :show, :workfile_version_id => version.id

      response.content_type.should == "image/gif"
    end
  end
end