module ApiDocHelper
  def pagination(per_page = 50) 
    parameter :page, "The selected page number of a paginated list of elements.  Default is 1."
    parameter :per_page, "The number of elements to return per page.  Default is #{per_page}."
  end
end
