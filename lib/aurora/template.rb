module Aurora
  class Template
    attr_accessor :name, :memory_size, :vcpu_number

    def initialize(java_template)
      @name = java_template.name
      @memory_size = java_template.memory_in_mb
      @vcpu_number = java_template.getvCPUNumber
    end
  end
end