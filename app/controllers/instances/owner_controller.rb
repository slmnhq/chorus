module Instances
  class OwnerController < ApplicationController
    def update
      if instance.shared?
        update_shared_owner
      else
        update_unshared_owner
      end

      present instance
    end

    private

    def update_shared_owner
      ActiveRecord::Base.transaction do
        owner_account = instance.owner_account
        owner_account.owner = new_owner
        owner_account.save!
        instance.owner = new_owner
        instance.save!
      end
    end

    def update_unshared_owner
      instance.account_for_user!(new_owner) # Ensure new owner already has an unshared account
      instance.owner = new_owner
      instance.save!
    end

    def new_owner
      @new_owner ||= User.find(params[:owner][:id])
    end

    def instance
      @instance ||= Instance.owned_by(current_user).find(params[:instance_id])
    end
  end
end