class Presenter
  class ResponseWrapper
    def initialize(response)
      @response = response
    end

    def as_json(options = {})
      { :response => @response.as_json }
    end
  end

  def self.present(model)
    ResponseWrapper.new(new(model)).to_json
  end

  def self.present_collection(collection)
    ResponseWrapper.new(collection.map { |model| new(model) }).to_json
  end

  def initialize(model)
    @model = model
  end
  
  attr_reader :model

  def as_json(options = {})
    model.as_json
  end
end