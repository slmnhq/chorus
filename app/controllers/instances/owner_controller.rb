module Instances
  class OwnerController < ApplicationController
    def update
      authorize! :edit, instance
      Gpdb::InstanceOwnership.change(instance, new_owner)
      present instance
    end

    private

    def new_owner
      User.find(params[:owner][:id])
    end

    def instance
      @instance ||= Instance.owned_by(current_user).find(params[:instance_id])
    end
  end
end
