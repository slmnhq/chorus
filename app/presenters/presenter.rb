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
    ResponseWrapper.new(new(model))
  end

  def self.present_collection(collection)
    ResponseWrapper.new(collection.map { |model| new(model) })
  end

  def initialize(model)
    @model = model
  end

  attr_reader :model
end