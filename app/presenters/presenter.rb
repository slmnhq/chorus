class Presenter
  def initialize(model)
    @model = model
  end

  def to_json(hash)
    hash.to_json
  end

  def to_hash
    @model.as_json
  end

  def model
    @model
  end

  def present
    self.to_json({ :response => self.to_hash })
  end

  def self.present(model)
    self.new(model).present
  end
end