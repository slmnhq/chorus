module CleditorHelpers
  def set_cleditor_value(name, value)
    wait_until { page.find("textarea[name=#{name}]") }
    page.execute_script("$('textarea[name=#{name}]').val('#{value}');")
    page.execute_script("$('textarea[name=#{name}]').cleditor()[0].updateFrame();")
  end
end
