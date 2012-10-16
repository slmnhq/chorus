require 'spec_helper'

describe HadoopInstancePresenter, :type => :view do
  let(:hadoop_instance) { hadoop_instances(:hadoop) }
  let(:user) { hadoop_instance.owner }
  let(:presenter) { HadoopInstancePresenter.new(hadoop_instance, view, options) }
  let(:options) { {} }

  before do
    stub(ActiveRecord::Base).current_user { user }
  end

  describe "#to_hash" do
    let(:hash) { presenter.to_hash }

    it "should have the correct keys" do
      hash.should have_key(:name)
      hash.should have_key(:host)
      hash.should have_key(:port)
      hash.should have_key(:id)
      hash.should have_key(:owner)
      hash.should have_key(:state)
      hash.should have_key(:description)
      hash.should have_key(:version)
      hash.should have_key(:username)
      hash.should have_key(:group_list)
      hash[:entity_type].should == 'hadoop_instance'
    end

    it "should use ownerPresenter Hash method for owner" do
      owner = hash[:owner]
      owner.to_hash.should == (UserPresenter.new(user, view).presentation_hash)
    end

    it_behaves_like "sanitized presenter", :hadoop_instance, :name
    it_behaves_like "sanitized presenter", :hadoop_instance, :host
  end
end