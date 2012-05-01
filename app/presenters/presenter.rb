class Presenter
  class ResponseWrapper
    def initialize(response)
      @response = response
    end

    def as_json(options = {})
      { :response => @response.as_json }
    end
  end

  def self.present(model, view_context)
    ResponseWrapper.new(new(model, view_context))
  end

  def self.present_collection(collection, view_context)
    ResponseWrapper.new(collection.map { |model| new(model, view_context) })
  end

  def initialize(model, view_context)
    @model = model
    @view_context = view_context
  end

  delegate :h, :to => :@view_context

  attr_reader :model
end