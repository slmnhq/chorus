module Aurora
  class TemplatePresenter < Presenter
    delegate :name, :memory_size, :vcpu_number, to: :model

    def to_hash
      {
          :name => name,
          :memory_size_in_mb => memory_size,
          :vcpu_number => vcpu_number
      }
    end
  end
end
