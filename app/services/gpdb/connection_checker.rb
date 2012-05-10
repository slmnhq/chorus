module Gpdb
  class ConnectionChecker
    def self.check!(instance, account)
      validate_model!(instance)
      validate_model!(account)

      ConnectionBuilder.connect!(instance, account)
      true
    rescue PG::Error => e
      raise ApiValidationError.new(:connection, :generic, {:message => e.message})
    end

    def self.validate_model!(model)
      model.valid? || raise(ActiveRecord::RecordInvalid.new(model))
    end
  end
end
