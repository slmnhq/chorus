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

    it "includes the original image url" do
      @hash[:image][:original].should == @user.image.url(:original)
    end

    it "includes the icon url" do
      @hash[:image][:icon].should == @user.image.url(:icon)
    end

    it "does not include unwanted keys" do
      @hash.should_not have_key(:password_digest)
    end

    it "sanitizes values" do
      bad_value = "<script>alert('got your cookie')</script>"
      fields_to_sanitize = [:username, :first_name, :last_name, :email, :title, :dept, :notes]

      dangerous_params = fields_to_sanitize.inject({}) { |params, field| params.merge(field => bad_value)  }

      user = FactoryGirl.build :user, dangerous_params
      json = UserPresenter.new(user, view).to_hash

      fields_to_sanitize.each do |sanitized_field|
        json[sanitized_field].should_not match "<"
      end
    end
  end
end
