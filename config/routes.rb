Chorus::Application.routes.draw do
  resource :sessions, :only => [:create, :destroy, :show]
  resource :config, :only => [:show], :controller => 'configurations'
  resources :activities, :only => [:index], :controller => 'activities'

  resources :users, :only => [:index, :show, :create, :update, :destroy] do
    collection do
      get :ldap
    end
    resource :image, :only => [:update], :controller => :user_images
    resources :activities, :only => [:index], :controller => 'activities'
  end

  resources :hadoop_instances, :only => [:create, :index, :show, :update] do
    scope :module => 'hdfs' do
      resources :files, :only => [:show, :index], :constraints => {:id => /.*/}
      resources :contents, :only => :show, :constraints => {:id => /.*/}
    end

    resources :activities, :only => [:index], :controller => 'activities'
  end

  resources :instances, :only => [:index, :show, :create, :update] do
    resources :databases, :only => [:index], :controller => 'instance_databases'
    resources :activities, :only => [:index], :controller => 'activities'

    scope :module => 'instances' do
      resource :owner, :only => [:update], :controller => 'owner'
      resource :sharing, :only => [:create, :destroy], :controller => 'sharing'
      resource :account, :only => [:show, :create, :update, :destroy], :controller => 'account'
      resources :members, :only => [:index, :create, :update, :destroy]
    end
  end

  resources :databases, :only => [:show], :controller => 'instance_databases' do
    resources :schemas, :only => [:index]
  end

  resources :schemas, :only => [:show] do
    resources :database_objects, :only => [:index]
  end

  resources :tables, :only => [] do
    resource :analyze, :only => [:create], :controller => 'analyze'
  end

  resources :database_objects, :only => [:show] do
    resources :columns, :only => [:index], :controller => 'column'
    resources :previews, :only => [:create, :destroy], :constraints => {:id => /.*/}
    resource :statistics, :only => :show
  end

  resources :workspaces, :only => [:index, :create, :show, :update] do
    resources :members, :only => [:index, :create]
    resource :image, :only => [:update], :controller => :workspace_images
    resources :workfiles, :only => [:create, :index]
    resource :quickstart, :only => [:destroy], :controller => "workspace_quickstart"
  end

  resources :workfiles, :only => [:show, :destroy] do
    resource :draft, :only => [:show, :update, :create, :destroy], :controller => :workfile_draft
    resources :versions, :only => [:update, :create], :controller => 'workfile_versions'
    resource :copy, :only => [:create], :controller => 'workfile_copy'
  end

  match "/" => "root#index"
  match "VERSION" => "configurations#version"

  # TODO: Remove this when it's no longer needed
  match '*not_found' => 'root#not_found'
end
