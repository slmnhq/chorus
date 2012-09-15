SecurityTransgression = Class.new(RuntimeError)

class ApiValidationError < RuntimeError
  attr_reader :errors
  delegate :add, :to => :errors

  def initialize(*args)
    if args[0].instance_of? ActiveModel::Validations::UnlocalizedErrors
      @errors = args[0]
    else
      @errors = ActiveModel::Validations::UnlocalizedErrors.new(nil)
      add(*args) if args.any?
    end
  end

  def record
    self
  end
end
