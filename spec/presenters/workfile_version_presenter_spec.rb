require 'spec_helper'

describe WorkfileVersionPresenter, :type => :view do
  before(:each) do
    @owner = FactoryGirl.build :user
    stub(view).current_user { @owner }
    @workspace = FactoryGirl.build :workspace
    @workfile = FactoryGirl.build :workfile, :workspace => @workspace, :owner => @owner
    @presenter = WorkfileVersionPresenter.new(@workfile.versions.first, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:id)
      @hash.should have_key(:version_num)
      @hash.should have_key(:commit_message)
      @hash.should have_key(:owner)
      @hash.should have_key(:modifier)
      @hash.should have_key(:contents)
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
  end
end
