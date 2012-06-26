class Search
  attr_reader :query

  def initialize(params = {})
    @query = params[:query]
  end

  def search
    @search ||= Sunspot.search(User, Instance) do
      fulltext query do
        highlight
      end
      facet :class
    end
  end

  def models
    return @models if @models
    @models = {}
    search.each_hit_with_result do |hit, result|
      result.highlighted_attributes = hit.highlights.inject({}) do |hsh, highlight|
        hsh[highlight.field_name] ||= []
        hsh[highlight.field_name] << highlight.format
        hsh
      end
      model_key = class_name_to_key(result.class.name)
      @models[model_key] ||= []
      @models[model_key] << result
    end
    @models
  end

  def users
    models[:users] || []
  end

  def instances
    models[:instances] || []
  end

  def num_found
    return @num_found if @num_found

    @num_found = {}
    search.facet(:class).rows.each do |facet|
      @num_found[class_name_to_key(facet.value.name)] = facet.count
    end
    @num_found
  end

  private

  def class_name_to_key(name)
    name.downcase.pluralize.to_sym
  end

end