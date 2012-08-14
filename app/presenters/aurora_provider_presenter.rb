class AuroraProviderPresenter < Presenter
  delegate :valid?, :templates, to: :model

  def to_hash
    {
        :install_succeed => valid?,
        :templates => present(templates)
    }
  end
end
