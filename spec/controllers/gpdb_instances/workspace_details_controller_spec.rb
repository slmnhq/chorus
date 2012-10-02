require 'spec_helper'

describe GpdbInstances::WorkspaceDetailsController do
  ignore_authorization!

  let(:user) { users(:owner) }

  before do
    log_in user
    any_instance_of(GpdbSchema) do |schema|
      stub(schema).disk_space_used(anything) { 100000000 }
    end
  end

  describe "#show" do
    let(:gpdb_instance) { gpdb_instances(:owners) }

    context "with a valid instance id" do
      it "does not require authorization" do
        dont_allow(subject).authorize!.with_any_args
        get :show, :gpdb_instance_id => gpdb_instance.to_param
        response.should be_success
      end

      it "presents the gpdb instance workspace details" do
        mock.proxy(GpdbInstanceWorkspaceDetailPresenter).new(gpdb_instance, anything, {})
        get :show, :gpdb_instance_id => gpdb_instance.to_param
      end

      generate_fixture "instanceDetails.json" do
        get :show, :gpdb_instance_id => gpdb_instance.to_param
      end
    end

    context "with an invalid gpdb instance id" do
      it "returns not found" do
        get :show, :gpdb_instance_id => 'invalid'
        response.should be_not_found
      end
    end

    context "when the user does not have access to the instance" do
      let(:user) { users(:not_a_member) }
      generate_fixture "instanceDetailsWithoutPermission.json" do
        get :show, :gpdb_instance_id => gpdb_instance.to_param
      end
    end
  end
end
