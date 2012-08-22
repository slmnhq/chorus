class Sunspot::Query::Dismax

  alias_method :the_old_to_params, :to_params
  alias_method :the_old_to_subquery, :to_subquery

  def to_params
    params = the_old_to_params
    params[:defType] = 'edismax'
    params
  end

  def to_subquery
    query = the_old_to_subquery
    query.sub '{!dismax', '{!edismax'
  end
end