module Instances
  class SharingController < ApplicationController
    def create
      instance.shared = true
      instance.accounts.where("id != #{instance.owner_account.id}").destroy_all
      instance.save!
      present instance, :status => :created
    end

    def destroy
      instance.shared = false
      instance.save!
      present instance
    end

    private

    def instance
      @instance ||= Instance.owned_by(current_user).find(params[:instance_id])
    end
  end
end