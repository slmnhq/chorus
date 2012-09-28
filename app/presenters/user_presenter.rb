class UserPresenter < Presenter
  delegate :id, :username, :first_name, :last_name, :email, :title, :dept, :notes, :admin?, :image, to: :model

  def to_hash
    if rendering_activities?
      {
          :id => id,
          :username => h(username),
          :first_name => h(first_name),
          :last_name => h(last_name),
          :image => present(image)
      }
    else
      {
          :id => id,
          :username => h(username),
          :first_name => h(first_name),
          :last_name => h(last_name),
          :email => h(email),
          :title => h(title),
          :dept => h(dept),
          :notes => h(notes),
          :admin => admin?,
          :image => present(image)
      }
    end
  end

  def complete_json?
    !rendering_activities?
  end
end
