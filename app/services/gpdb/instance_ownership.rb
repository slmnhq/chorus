module Gpdb
  InvalidOwnerError = Class.new(RuntimeError)

  module InstanceOwnership
    class << self

      def change(instance, new_owner)
        if instance.shared?
          change_owner_of_shared(instance, new_owner)
        else
          change_owner_of_unshared(instance, new_owner)
        end
      end

      private

      def change_owner_of_shared(instance, new_owner)
        ActiveRecord::Base.transaction do
          owner_account = instance.owner_account
          owner_account.owner = new_owner
          owner_account.save!
          instance.owner = new_owner
          instance.save!
        end
      end

      def change_owner_of_unshared(instance, new_owner)
        ensure_user_has_account(instance, new_owner)
        instance.owner = new_owner
        instance.save!
      end

      def ensure_user_has_account(instance, new_owner)
        instance.account_for_user!(new_owner)
      end

    end
  end
end
