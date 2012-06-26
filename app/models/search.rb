class Search
  attr_accessor :models_to_search, :query, :page, :per_page

  def initialize(params = {})
    self.models_to_search = [User, Instance]
    self.query = params[:query]
    self.page = params[:page] || 1
    self.per_page = params[:per_page] || 100
  end

  def search
    @search ||= Sunspot.search(*models_to_search) do
      fulltext query, :highlight => true
      paginate :page => page, :per_page => per_page

      if(models_to_search.length > 1)
        facet :class
      end
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