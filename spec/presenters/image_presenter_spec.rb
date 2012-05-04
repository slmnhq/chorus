require 'spec_helper'

describe ImagePresenter, :type => :view do
  before(:each) do
    @user = FactoryGirl.build :user
    @user.image = Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/small1.gif", Rails.root), "image/gif")
    @presenter = ImagePresenter.new(@user.image, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the original image url" do
      @hash[:original].should == @user.image.url(:original)
    end

    it "includes the icon url" do
      @hash[:icon].should == @user.image.url(:icon)
    end
  end
end
