module Aurora
  class Template
    attr_accessor :name, :memory_size, :vcpu_number

    def initialize(java_template=nil)
      @name = java_template.try(:name)
      @memory_size = java_template.try(:memory_in_mb)
      @vcpu_number = java_template.try(:getvCPUNumber)
    end
  end
end