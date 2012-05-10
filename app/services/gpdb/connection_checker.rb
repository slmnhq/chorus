module Gpdb
  class ConnectionChecker
    def self.check!(instance, account)
      validate_model!(instance)
      validate_model!(account)

      ConnectionBuilder.connect!(instance, account)
      instance.state = "online"
      true
    rescue PG::Error => e
      errors = ApiValidationError.new
      errors.add(:connection, :generic, {:message => e.message})
      raise errors
    end

    def self.validate_model!(model)
      model.valid? || raise(ActiveRecord::RecordInvalid.new(model))
    end
  end
end
