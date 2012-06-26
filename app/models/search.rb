class Search
  attr_reader :query

  def initialize(params = {})
    @query = params[:query]
  end

  def results
    search.results
  end

  def search
    @search ||= User.search do
      fulltext query do
        highlight
      end
    end
  end

  def users
    return @users if @users

    @users = []
    search.each_hit_with_result do |hit, result|
      result.highlighted_attributes = hit.highlights.inject({}) do |hsh, highlight|
        hsh[highlight.field_name] ||= []
        hsh[highlight.field_name] << highlight.format
        hsh
      end
      @users << result
    end
    @users
  end

  def num_found
    {
        :users => search.total
    }
  end
end