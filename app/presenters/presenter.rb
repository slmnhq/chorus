class Presenter
  PRESENTER_NAME_MAP = {
    ::Paperclip::Attachment => "Image"
  }

  def self.present(model_or_collection, view_context)
    if model_or_collection.is_a?(ActiveRecord::Relation) || model_or_collection.is_a?(Enumerable)
      present_collection(model_or_collection, view_context)
    else
      present_model(model_or_collection, view_context)
    end
  end

  def self.present_model(model, view_context)
    model_class = model.class

    class_name = PRESENTER_NAME_MAP[model_class] || model_class.name

    presenter_class = "#{class_name}Presenter".constantize
    presenter_class.new(model, view_context).to_hash
  end

  def self.present_collection(collection, view_context)
    collection.map { |model| present_model(model, view_context) }
  end

  def present(model)
    self.class.present(model, @view_context)
  end

  def initialize(model, view_context)
    @model = model
    @view_context = view_context
  end

  delegate :h, :sanitize, :to => :@view_context

  attr_reader :model
end
