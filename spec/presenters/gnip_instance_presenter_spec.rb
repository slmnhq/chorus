require 'spec_helper'

describe GpdbInstancePresenter, :type => :view do
  let(:gnip_instance) { gnip_instances(:gnip) }
  let(:user) { gnip_instance.owner }
  let(:presenter) { GnipInstancePresenter.new(gnip_instance, view, options) }
  let(:options) { {} }

  describe "#to_hash" do
    let(:hash) { presenter.to_hash }

    it "includes the right keys" do
      hash.should have_key(:name)
      hash.should have_key(:host)
      hash.should have_key(:port)
      hash.should have_key(:id)
      hash.should have_key(:owner)
      hash.should have_key(:description)
      hash.should have_key(:username)
      hash.should have_key(:password)
    end
  end
end
