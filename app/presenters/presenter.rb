class Presenter
  class ResponseWrapper
    def initialize(response, pagination=nil)
      @response = response
      @pagination = pagination
    end

    def as_json(options = {})
      result = { :response => @response.as_json }
      result[:pagination] = @pagination if @pagination
      result
    end
  end

  def self.present(model, view_context)
    ResponseWrapper.new(new(model, view_context))
  end

  def self.present_collection(collection, view_context)
    ResponseWrapper.new(collection.map { |model| new(model, view_context) },
                        (collection.respond_to?(:current_page) ? {
                          :page => collection.current_page,
                          :per_page => collection.per_page,
                          :total => collection.total_entries
                        } : nil))
  end

  def initialize(model, view_context)
    @model = model
    @view_context = view_context
  end

  delegate :h, :to => :@view_context

  attr_reader :model
end