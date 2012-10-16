require 'spec_helper'

describe GnipInstancePresenter, :type => :view do
  let(:gnip_instance) { gnip_instances(:default) }
  let(:user) { gnip_instance.owner }
  let(:presenter) { GnipInstancePresenter.new(gnip_instance, view, options) }
  let(:options) { {} }

  describe "#to_hash" do
    let(:hash) { presenter.to_hash }

    it "includes the right keys" do
      hash.should have_key(:name)
      hash.should have_key(:stream_url)
      hash.should have_key(:id)
      hash.should have_key(:owner)
      hash.should have_key(:description)
      hash.should have_key(:username)
      hash.should have_key(:state)
      hash[:entity_type].should == "gnip_instance"
    end

    it "should not present the password" do
      hash.should_not have_key(:password)
    end
  end
end
