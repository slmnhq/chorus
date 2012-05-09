SecurityTransgression = Class.new(RuntimeError)

class ApiValidationError < RuntimeError
  attr_reader :errors
  delegate :add, :to => :errors

  def initialize
    @errors = ActiveModel::Validations::UnlocalizedErrors.new(nil)
  end

  def record
    self
  end
end

