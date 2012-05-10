SecurityTransgression = Class.new(RuntimeError)

class ApiValidationError < RuntimeError
  attr_reader :errors
  delegate :add, :to => :errors

  def initialize(*args)
    @errors = ActiveModel::Validations::UnlocalizedErrors.new(nil)
    add(*args) if args.any?
  end

  def record
    self
  end
end

