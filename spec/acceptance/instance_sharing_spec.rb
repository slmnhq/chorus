require 'spec_helper'

resource "Greenplum DB account sharing" do
  let!(:owner) { FactoryGirl.create :user }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => instance, :owner => owner)}
  let!(:instance) { FactoryGirl.create(:instance, :owner => owner, :shared => shared) }
  let(:instance_id) { instance.to_param }

  before do
    log_in owner
  end

  post "/instances/:instance_id/sharing" do
    let(:shared) { false }

    example_request "Make instance shared" do
      status.should == 201
    end
  end

  delete "/instances/:instance_id/sharing" do
    let(:shared) { true }

    example_request "Require individual accounts" do
      status.should == 200
    end
  end
end