class Search
  attr_accessor :query, :page, :per_page
  attr_reader :models_to_search, :per_type, :current_user

  def initialize(current_user, params = {})
    @current_user = current_user
    @models_to_search = [User, Instance, Workspace]
    self.query = params[:query]
    self.per_type = params[:per_type]
    if per_type
      self.per_page = 100
    else
      self.page = params[:page] || 1
      self.per_page = params[:per_page] || 50
    end
    self.entity_type = params[:entity_type]
  end

  def search
    return @search if @search
    @search = Sunspot.new_search(*(models_to_search + [Events::Note])) do
      group :grouping_id do
        limit 3
        truncate
      end
      fulltext query, :highlight => true
      paginate :page => page, :per_page => per_page

      if models_to_search.length > 1
        facet :type_name
      end

      with :type_name, models_to_search.collect(&:name)
    end
    models_to_search.each do |model_to_search|
      model_to_search.search_permissions(current_user, @search) if model_to_search.respond_to? :search_permissions
    end

    @search.execute
    @search
  end

  def models
    return @models if @models
    @models = Hash.new() { |hsh, key| hsh[key] = [] }

    search.associate_grouped_comments_with_primary_records

    search.each_hit_with_result do |hit, result|
      result.highlighted_attributes = hit.highlights_hash
      model_key = class_name_to_key(result.class.name)
      @models[model_key] << result unless per_type && @models[model_key].length >= per_type
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

  def workspaces
    models[:workspaces] || []
  end

  def num_found
    return @num_found if @num_found

    @num_found = Hash.new(0)
    if models_to_search.length > 1
      search.facet(:type_name).rows.each do |facet|
        @num_found[class_name_to_key(facet.value)] = facet.count
      end
    else
      @num_found[class_name_to_key(models_to_search.first.name)] = search.group(:grouping_id).total
    end

    @num_found
  end

  def per_type=(new_type)
    new_type_as_int = new_type.to_i
    if new_type_as_int > 0
      @per_type = new_type_as_int
    end
  end

  def entity_type=(new_type)
    return unless new_type
    models_to_search.select! do |model|
      class_name_to_key(model.name) == class_name_to_key(new_type)
    end
  end

  private

  def class_name_to_key(name)
    name.to_s.downcase.pluralize.to_sym
  end

  def populate_missing_records
    return unless per_type
    models_to_search.each do |model|
      model_key = class_name_to_key(model.name)
      found_count = models[model_key].length
      if (found_count < per_type && found_count < num_found[model_key])
        model_search = Search.new(current_user, :query => query, :per_page => per_type, :entity_type => model.name)
        models[model_key] = model_search.models[model_key]
      end
    end
  end

end