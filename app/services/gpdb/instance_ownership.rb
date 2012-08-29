module Gpdb
  InvalidOwnerError = Class.new(RuntimeError)

  module InstanceOwnership
    class << self

      def change(updater, gpdb_instance, new_owner)
        if gpdb_instance.shared?
          change_owner_of_shared(gpdb_instance, new_owner)
        else
          change_owner_of_unshared(gpdb_instance, new_owner)
        end

        Events::GreenplumInstanceChangedOwner.by(updater).add(
          :greenplum_instance => gpdb_instance,
          :new_owner => new_owner
        )
      end

      private

      def change_owner_of_shared(gpdb_instance, new_owner)
        ActiveRecord::Base.transaction do
          owner_account = gpdb_instance.owner_account
          owner_account.owner = new_owner
          owner_account.save!
          gpdb_instance.owner = new_owner
          gpdb_instance.save!
        end
      end

      def change_owner_of_unshared(gpdb_instance, new_owner)
        ensure_user_has_account(gpdb_instance, new_owner)
        gpdb_instance.owner = new_owner
        gpdb_instance.save!
      end

      def ensure_user_has_account(gpdb_instance, new_owner)
        gpdb_instance.account_for_user!(new_owner)
      end

    end
  end
end
