require 'spec_helper'

resource "Greenplum DB ownership" do
  let!(:owner) { FactoryGirl.create :user }
  let(:owned_instance) { FactoryGirl.create(:instance, :owner => owner, :shared => true) }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => owned_instance, :owner => owner)}
  let!(:new_owner) { FactoryGirl.create(:user) }

  before do
    log_in owner
  end

  put "/instances/:instance_id/owner" do
    parameter :instance_id, "The id of the Greenplum instance"
    parameter :id, "The new owner's user id"

    required_parameters :instance_id, :id
    scope_parameters :owner, :all

    let(:instance_id) { owned_instance.to_param }
    let(:id) { new_owner.to_param }

    example_request "Change the owner of an instance" do
      status.should == 200
    end
  end
end