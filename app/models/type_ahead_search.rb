class TypeAheadSearch
  attr_accessor :query
  attr_reader :current_user

  MODELS_TO_SEARCH = [User, GpdbInstance, HadoopInstance, Workspace, Workfile, Dataset, HdfsEntry]

  delegate :results, to: :search

  def initialize(current_user, params = {})
    @current_user = current_user
    self.query = params[:query] + "*"
  end

  def search
    return @search if @search

    build_search

    @search.execute
    @search
  end

  def build_search
    @search = Sunspot.new_search(MODELS_TO_SEARCH) do
      fulltext query, :highlight => true, :fields => [:name, :first_name, :last_name, :file_name]
      with :type_name, MODELS_TO_SEARCH.collect(&:name)
    end

    MODELS_TO_SEARCH.each do |model_to_search|
      model_to_search.add_search_permissions(current_user, @search) if model_to_search.respond_to? :add_search_permissions
    end
  end
end