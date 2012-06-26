class Search
  attr_accessor :models_to_search, :minimum_results_for_each_type, :query, :page, :per_page

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
    @models = Hash.new() {|hsh, key| hsh[key] = [] }
    search.each_hit_with_result do |hit, result|
      result.highlighted_attributes = hit.highlights.inject({}) do |hsh, highlight|
        hsh[highlight.field_name] ||= []
        hsh[highlight.field_name] << highlight.format
        hsh
      end
      model_key = class_name_to_key(result.class.name)
      @models[model_key] << result
    end

    populate_missing_records

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

    @num_found = Hash.new(0)
    search.facet(:class).rows.each do |facet|
      @num_found[class_name_to_key(facet.value.name)] = facet.count
    end
    @num_found
  end

  private

  def class_name_to_key(name)
    name.downcase.pluralize.to_sym
  end

  def populate_missing_records
    return unless minimum_results_for_each_type
    models_to_search.each do |model|
      model_key = class_name_to_key(model.name)
      found_count = models[:model_key].length
      if(found_count < minimum_results_for_each_type && found_count < num_found[model_key])
        model_search = Search.new(:query => query, :per_page => minimum_results_for_each_type)
        model_search.models_to_search = [model]
        models[model_key] = model_search.models[model_key]
      end
    end
  end

end