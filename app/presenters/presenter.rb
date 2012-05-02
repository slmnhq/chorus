class Presenter
  def self.present(model_or_collection, view_context)
    if model_or_collection.is_a?(ActiveRecord::Relation) || model_or_collection.is_a?(Enumerable)
      exemplary_model = model_or_collection.to_a.first
      return [] unless exemplary_model.present?
      model_class = exemplary_model.class
      presentation_method = :present_collection
    else
      model_class = model_or_collection.class
      presentation_method = :present_model
    end

    presenter_class = "#{model_class}Presenter".constantize
    presenter_class.send(presentation_method, model_or_collection, view_context)
  end

  def self.present_model(model, view_context)
    new(model, view_context)
  end

  def self.present_collection(collection, view_context)
    collection.map { |model| new(model, view_context) }
  end

  def present(model)
    self.class.present(model, @view_context)
  end

  def initialize(model, view_context)
    @model = model
    @view_context = view_context
  end

  delegate :h, :to => :@view_context

  attr_reader :model
end