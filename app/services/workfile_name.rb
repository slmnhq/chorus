class WorkfileName
  def self.resolve_name_for!(workfile)
    if Workfile.exists?(:file_name => workfile.file_name, :workspace_id => workfile.workspace_id)
      index = workfile.file_name.rindex(".")
      length = workfile.file_name.length
      base_file_name = workfile.file_name[0..(index - 1)]
      extension = workfile.file_name[(index +1), length]
      workfile_names = Workfile.where("file_name LIKE '#{base_file_name}%#{extension}' ").pluck(:file_name)

      n = 1
      while workfile_names.include?("#{base_file_name}_#{n}.#{extension}") do
        n += 1
      end

      workfile.file_name = "#{base_file_name}_#{n}.#{extension}"
    end
  end
end