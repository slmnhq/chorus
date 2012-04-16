class Presenter
  def self.present(model)
    new(model).present
  end

  def initialize(model)
    @model = model
  end
  
  attr_reader :model

  def present
    to_json({ :response => to_hash })
  end

  def to_json(hash)
    hash.to_json
  end

  def to_hash
    model.as_json
  end
end