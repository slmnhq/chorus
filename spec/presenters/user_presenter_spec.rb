require 'spec_helper'

describe UserPresenter, :type => :view do
  before(:each) do
    @user = FactoryGirl.build :user
    @presenter = UserPresenter.new(@user, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:username)
      @hash.should have_key(:id)
      @hash.should have_key(:first_name)
      @hash.should have_key(:last_name)
    end

    it "uses the image presenter to serialize the image urls" do
      @hash[:image].to_hash.should == (ImagePresenter.new(@user.image, view).to_hash)
    end

    it "does not include unwanted keys" do
      @hash.should_not have_key(:password_digest)
    end

    [:username, :first_name, :last_name, :email, :title, :dept, :notes].each do |attribute|
      it_behaves_like "sanitized presenter", :user, attribute
    end
  end
end
