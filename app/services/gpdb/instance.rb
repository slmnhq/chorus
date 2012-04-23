module Gpdb
  class Instance
    def self.create(instance_config, owner)
      cached_instance = owner.instances.build(instance_config)
      check_connection(cached_instance)

      cached_instance.save!
    end

    def self.check_connection(cached_instance)
      return unless cached_instance.valid?

      connection = Connection.new(cached_instance.attributes)

      unless connection.valid?
        # TODO: this feels intrusive... maybe there's a way to create our own object,
        # with it's own validations and exception raising mechanism.
        cached_instance.errors.add(:connection, :invalid)
        raise ActiveRecord::RecordInvalid.new(cached_instance)
      end
    end
  end
end