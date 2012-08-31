class Presenter
  def self.present(model_or_collection, view_context, options={})
    if model_or_collection.is_a?(ActiveRecord::Relation) || model_or_collection.is_a?(Enumerable)
      present_collection(model_or_collection, view_context, options)
    else
      present_model(model_or_collection, view_context, options)
    end
  end

  def self.present_model(model, view_context, options)
    presenter_class = get_presenter_class(model)
    presenter_class.new(model, view_context, options).to_hash
  end

  def self.present_collection(collection, view_context, options)
    collection.map { |model| present_model(model, view_context, options) }
  end

  def present(model, options={})
    self.class.present(model, @view_context, options)
  end

  def initialize(model, view_context, options={})
    @options = options
    @model = model
    @view_context = view_context
  end

  delegate :h, :sanitize, :to => :@view_context

  attr_reader :model, :options

  private

  def self.get_presenter_class(model)
    case model
    when Paperclip::Attachment
      ImagePresenter
    when Events::Base
      EventPresenter
    else
      "#{model.class.name}Presenter".constantize
    end
  end

  def rendering_activities?
    @options[:activity_stream]
  end
end
